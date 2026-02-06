import { Router } from 'express';
import multer from 'multer';
import { createJob, getJob, getAllJobs } from '../services/jobManager.js';
import type { WorkflowType, GenerateResponse, StatusResponse } from '../types/index.js';

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * POST /api/generate
 * Submit a new generation job
 */
router.post('/generate', upload.single('inputImage'), async (req, res) => {
  try {
    const { workflow, prompt, negative_prompt, seed, steps, cfg } = req.body;

    // Validate required fields
    if (!workflow || !prompt) {
      return res.status(400).json({
        error: 'Missing required fields: workflow and prompt are required'
      });
    }

    // Validate workflow type
    const validWorkflows: WorkflowType[] = ['uv_texture', 'turnaround', 'depth', 'background'];
    if (!validWorkflows.includes(workflow)) {
      return res.status(400).json({
        error: `Invalid workflow type. Must be one of: ${validWorkflows.join(', ')}`
      });
    }

    // Check if input image is required (not needed for turnaround or background)
    if ((workflow === 'uv_texture' || workflow === 'depth') && !req.file) {
      return res.status(400).json({
        error: `Workflow "${workflow}" requires an input image`
      });
    }

    // Create the job
    const job = await createJob({
      workflow,
      prompt,
      negativePrompt: negative_prompt,
      seed: seed ? parseInt(seed, 10) : undefined,
      steps: steps ? parseInt(steps, 10) : undefined,
      cfg: cfg ? parseFloat(cfg) : undefined,
      inputImage: req.file ? {
        buffer: req.file.buffer,
        originalName: req.file.originalname
      } : undefined
    });

    const response: GenerateResponse = {
      jobId: job.id,
      status: job.status
    };

    res.status(201).json(response);
  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({
      error: 'Failed to create generation job',
      details: String(error)
    });
  }
});

/**
 * GET /api/status/:jobId
 * Get the status of a generation job
 */
router.get('/status/:jobId', (req, res) => {
  const { jobId } = req.params;

  const job = getJob(jobId);
  if (!job) {
    return res.status(404).json({
      error: 'Job not found'
    });
  }

  const response: StatusResponse = {
    jobId: job.id,
    status: job.status,
    outputUrl: job.outputUrl,
    outputFiles: job.outputFiles,
    error: job.error
  };

  res.json(response);
});

/**
 * GET /api/jobs
 * List all jobs (most recent first)
 */
router.get('/jobs', (_req, res) => {
  const jobs = getAllJobs();
  res.json(jobs);
});

export { router as generateRouter };
