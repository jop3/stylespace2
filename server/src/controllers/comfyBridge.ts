import axios from 'axios';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import FormData from 'form-data';
import type { WorkflowType, ComfyPromptResponse, ComfyHistoryResponse } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COMFY_URL = process.env.COMFY_API_URL || 'http://127.0.0.1:8188';

/**
 * Upload an image to ComfyUI's input folder
 */
export async function uploadImage(fileBuffer: Buffer, fileName: string): Promise<string> {
  const formData = new FormData();
  formData.append('image', fileBuffer, fileName);
  formData.append('type', 'input');
  formData.append('overwrite', 'true');

  const response = await axios.post(`${COMFY_URL}/upload/image`, formData, {
    headers: formData.getHeaders()
  });

  return response.data.name;
}

/**
 * Load a workflow template from the workflows directory
 * Workflows are now stored in API format directly
 */
export async function loadWorkflow(workflowType: WorkflowType): Promise<Record<string, any>> {
  const workflowPath = path.join(__dirname, '..', 'workflows', `${workflowType}.json`);
  const content = await fs.readFile(workflowPath, 'utf-8');
  return JSON.parse(content);
}

interface InjectParams {
  jobId: string;
  prompt: string;
  negativePrompt?: string;
  seed: number;
  steps?: number;
  cfg?: number;
  inputImageName?: string;
}

/**
 * Inject parameters into a workflow (API format)
 * Updated for Z-Image GGUF workflow structure:
 * - Node 6 = Positive prompt (CLIPTextEncode)
 * - Node 7 = Negative prompt (CLIPTextEncode)
 * - Node 3 = KSampler (seed, steps, cfg)
 * - Node 9 = SaveImage (filename_prefix)
 */
export function injectParams(workflow: Record<string, any>, params: InjectParams): Record<string, any> {
  const modified = JSON.parse(JSON.stringify(workflow));

  for (const nodeId in modified) {
    const node = modified[nodeId];

    // CLIPTextEncode - positive prompt (node 6 in Z-Image workflow)
    if (node.class_type === 'CLIPTextEncode' && nodeId === '6') {
      node.inputs.text = params.prompt;
    }

    // CLIPTextEncode - negative prompt (node 7 in Z-Image workflow)
    if (node.class_type === 'CLIPTextEncode' && nodeId === '7') {
      node.inputs.text = params.negativePrompt || '';
    }

    // KSampler - set seed, steps, cfg
    if (node.class_type === 'KSampler') {
      node.inputs.seed = params.seed;
      if (params.steps !== undefined) {
        node.inputs.steps = params.steps;
      }
      if (params.cfg !== undefined) {
        node.inputs.cfg = params.cfg;
      }
    }

    // SaveImage - set output prefix with jobId
    if (node.class_type === 'SaveImage') {
      node.inputs.filename_prefix = `${params.jobId}_output`;
    }

    // LoadImage - set input image
    if (node.class_type === 'LoadImage' && params.inputImageName) {
      node.inputs.image = params.inputImageName;
    }
  }

  return modified;
}

/**
 * Queue a workflow for execution in ComfyUI
 */
export async function queuePrompt(workflow: Record<string, any>): Promise<string> {
  const response = await axios.post<ComfyPromptResponse>(`${COMFY_URL}/prompt`, {
    prompt: workflow
  });

  return response.data.prompt_id;
}

/**
 * Check the progress/status of a queued prompt
 */
export async function checkProgress(promptId: string): Promise<{
  completed: boolean;
  outputs: string[];
  error?: string;
}> {
  try {
    const response = await axios.get<ComfyHistoryResponse>(`${COMFY_URL}/history/${promptId}`);

    const history = response.data[promptId];
    if (!history) {
      return { completed: false, outputs: [] };
    }

    const status = history.status;
    if (status.status_str === 'error') {
      return {
        completed: true,
        outputs: [],
        error: 'ComfyUI execution error'
      };
    }

    if (!status.completed) {
      return { completed: false, outputs: [] };
    }

    // Collect output images
    const outputs: string[] = [];
    for (const nodeId in history.outputs) {
      const nodeOutput = history.outputs[nodeId];
      if (nodeOutput.images) {
        for (const img of nodeOutput.images) {
          outputs.push(img.filename);
        }
      }
    }

    return { completed: true, outputs };
  } catch (error) {
    // Prompt not in history yet
    return { completed: false, outputs: [] };
  }
}

/**
 * Get the ComfyUI output directory for fetching generated images
 */
export async function getOutputImage(filename: string): Promise<Buffer> {
  const response = await axios.get(`${COMFY_URL}/view`, {
    params: {
      filename,
      type: 'output'
    },
    responseType: 'arraybuffer'
  });

  return Buffer.from(response.data);
}
