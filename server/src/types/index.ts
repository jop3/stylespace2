export type WorkflowType = 'uv_texture' | 'turnaround' | 'depth' | 'background';

export type JobStatus = 'queued' | 'processing' | 'done' | 'error';

export interface Job {
  id: string;
  status: JobStatus;
  workflow: WorkflowType;
  prompt: string;
  negativePrompt?: string;
  seed: number;
  steps: number;
  cfg: number;
  inputImage?: string;
  promptId?: string;
  outputUrl?: string;
  outputFiles?: string[];
  createdAt: Date;
  updatedAt: Date;
  error?: string;
}

export interface GenerateRequest {
  workflow: WorkflowType;
  prompt: string;
  negative_prompt?: string;
  seed?: number;
  steps?: number;
  cfg?: number;
}

export interface GenerateResponse {
  jobId: string;
  status: JobStatus;
}

export interface StatusResponse {
  jobId: string;
  status: JobStatus;
  outputUrl?: string;
  outputFiles?: string[];
  error?: string;
}

export interface ComfyPromptResponse {
  prompt_id: string;
  number: number;
  node_errors: Record<string, unknown>;
}

export interface ComfyHistoryResponse {
  [promptId: string]: {
    prompt: unknown[];
    outputs: {
      [nodeId: string]: {
        images?: Array<{
          filename: string;
          subfolder: string;
          type: string;
        }>;
      };
    };
    status: {
      status_str: string;
      completed: boolean;
      messages: unknown[];
    };
  };
}

export interface WorkflowNode {
  id: number;
  type: string;
  pos: [number, number];
  size: [number, number];
  flags: Record<string, unknown>;
  order: number;
  mode: number;
  inputs?: Array<{
    name: string;
    type: string;
    link: number | null;
  }>;
  outputs?: Array<{
    name: string;
    type: string;
    links: number[];
  }>;
  properties: Record<string, unknown>;
  widgets_values?: unknown[];
}

export interface Workflow {
  last_node_id: number;
  last_link_id: number;
  nodes: WorkflowNode[];
  links: unknown[];
  groups: unknown[];
  config: Record<string, unknown>;
  extra: Record<string, unknown>;
  version: number;
}
