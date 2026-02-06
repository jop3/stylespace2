import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import type { Job, WorkflowType } from '../types/index.js';
import { checkProgress, getOutputImage, uploadImage, loadWorkflow, injectParams, queuePrompt } from '../controllers/comfyBridge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory job storage
const jobs = new Map<string, Job>();

// Polling interval for checking ComfyUI progress
const POLL_INTERVAL = 2000;

// Active polling intervals
const pollingIntervals = new Map<string, NodeJS.Timeout>();

interface CreateJobParams {
  workflow: WorkflowType;
  prompt: string;
  negativePrompt?: string;
  seed?: number;
  steps?: number;
  cfg?: number;
  inputImage?: {
    buffer: Buffer;
    originalName: string;
  };
}

/**
 * Create a new generation job
 */
export async function createJob(params: CreateJobParams): Promise<Job> {
  const jobId = uuidv4();
  const seed = params.seed ?? Math.floor(Math.random() * 2147483647);

  const job: Job = {
    id: jobId,
    status: 'queued',
    workflow: params.workflow,
    prompt: params.prompt,
    negativePrompt: params.negativePrompt,
    seed,
    steps: params.steps ?? 20,
    cfg: params.cfg ?? 7.5,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  jobs.set(jobId, job);

  // Process job asynchronously
  processJob(job, params.inputImage).catch(error => {
    console.error(`Error processing job ${jobId}:`, error);
    updateJobStatus(jobId, 'error', undefined, String(error));
  });

  return job;
}

/**
 * Get a job by ID
 */
export function getJob(jobId: string): Job | undefined {
  return jobs.get(jobId);
}

/**
 * Get all jobs
 */
export function getAllJobs(): Job[] {
  return Array.from(jobs.values()).sort((a, b) =>
    b.createdAt.getTime() - a.createdAt.getTime()
  );
}

/**
 * Update job status
 */
function updateJobStatus(
  jobId: string,
  status: Job['status'],
  outputFiles?: string[],
  error?: string
): void {
  const job = jobs.get(jobId);
  if (!job) return;

  job.status = status;
  job.updatedAt = new Date();

  if (outputFiles) {
    job.outputFiles = outputFiles;
    // Set the primary output URL
    if (outputFiles.length > 0) {
      job.outputUrl = `/output/${outputFiles[0]}`;
    }
  }

  if (error) {
    job.error = error;
  }

  jobs.set(jobId, job);
}

/**
 * Process a job - upload images, queue workflow, poll for completion
 */
async function processJob(
  job: Job,
  inputImage?: { buffer: Buffer; originalName: string }
): Promise<void> {
  try {
    // Upload input image if provided
    let inputImageName: string | undefined;
    if (inputImage) {
      const ext = path.extname(inputImage.originalName) || '.png';
      const fileName = `${job.id}_input${ext}`;
      inputImageName = await uploadImage(inputImage.buffer, fileName);
      job.inputImage = inputImageName;
    }

    // Load and modify workflow
    const workflow = await loadWorkflow(job.workflow);
    const modifiedWorkflow = injectParams(workflow, {
      jobId: job.id,
      prompt: job.prompt,
      negativePrompt: job.negativePrompt,
      seed: job.seed,
      steps: job.steps,
      cfg: job.cfg,
      inputImageName
    });

    // Queue the prompt
    const promptId = await queuePrompt(modifiedWorkflow);
    job.promptId = promptId;
    updateJobStatus(job.id, 'processing');

    // Start polling for completion
    startPolling(job.id, promptId);
  } catch (error) {
    console.error(`Failed to process job ${job.id}:`, error);
    updateJobStatus(job.id, 'error', undefined, String(error));
  }
}

/**
 * Start polling ComfyUI for job completion
 */
function startPolling(jobId: string, promptId: string): void {
  const interval = setInterval(async () => {
    try {
      const progress = await checkProgress(promptId);

      if (progress.completed) {
        stopPolling(jobId);

        if (progress.error) {
          updateJobStatus(jobId, 'error', undefined, progress.error);
        } else {
          // Copy output files to our storage
          const outputDir = path.resolve(__dirname, '../..', process.env.OUTPUT_DIR || './storage/output');
          const savedFiles: string[] = [];

          for (const filename of progress.outputs) {
            try {
              const imageBuffer = await getOutputImage(filename);
              const localPath = path.join(outputDir, filename);
              await fs.writeFile(localPath, imageBuffer);
              savedFiles.push(filename);
            } catch (err) {
              console.error(`Failed to save output ${filename}:`, err);
            }
          }

          updateJobStatus(jobId, 'done', savedFiles);
        }
      }
    } catch (error) {
      console.error(`Polling error for job ${jobId}:`, error);
    }
  }, POLL_INTERVAL);

  pollingIntervals.set(jobId, interval);

  // Auto-stop polling after 10 minutes (timeout)
  setTimeout(() => {
    if (pollingIntervals.has(jobId)) {
      stopPolling(jobId);
      const job = jobs.get(jobId);
      if (job && job.status === 'processing') {
        updateJobStatus(jobId, 'error', undefined, 'Generation timed out');
      }
    }
  }, 10 * 60 * 1000);
}

/**
 * Stop polling for a job
 */
function stopPolling(jobId: string): void {
  const interval = pollingIntervals.get(jobId);
  if (interval) {
    clearInterval(interval);
    pollingIntervals.delete(jobId);
  }
}

/**
 * Clean up old jobs (call periodically if needed)
 */
export function cleanupOldJobs(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
  const now = Date.now();
  let cleaned = 0;

  for (const [jobId, job] of jobs.entries()) {
    if (now - job.createdAt.getTime() > maxAgeMs) {
      stopPolling(jobId);
      jobs.delete(jobId);
      cleaned++;
    }
  }

  return cleaned;
}
