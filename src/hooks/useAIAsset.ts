import { useState, useCallback, useRef, useEffect } from 'react';

export type WorkflowType = 'uv_texture' | 'turnaround' | 'depth' | 'background';
export type JobStatus = 'queued' | 'processing' | 'done' | 'error';

export interface GenerateParams {
  workflow: WorkflowType;
  prompt: string;
  negativePrompt?: string;
  seed?: number;
  steps?: number;
  cfg?: number;
  inputImage?: File;
}

export interface JobState {
  jobId: string;
  status: JobStatus;
  outputUrl?: string;
  outputFiles?: string[];
  error?: string;
}

/**
 * API configuration from environment variables with fallbacks
 */
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';
const POLL_INTERVAL = Number(import.meta.env.VITE_POLL_INTERVAL) || 2000;
const MAX_POLL_ERRORS = Number(import.meta.env.VITE_MAX_POLL_ERRORS) || 5;

/**
 * Hook for communicating with the AI generation backend
 *
 * Provides functionality for:
 * - Submitting generation jobs
 * - Polling job status with automatic error recovery
 * - Cancelling jobs
 * - Getting output URLs
 *
 * @example
 * ```tsx
 * const { submitJob, isLoading, error, currentJob } = useAIAsset()
 *
 * const handleGenerate = async () => {
 *   try {
 *     await submitJob({ workflow: 'uv_texture', prompt: 'blue fabric' })
 *   } catch (err) {
 *     console.error('Generation failed:', err)
 *   }
 * }
 * ```
 */
export function useAIAsset() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentJob, setCurrentJob] = useState<JobState | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollErrorCountRef = useRef(0);

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    pollErrorCountRef.current = 0;
  }, []);

  const pollStatus = useCallback(async (jobId: string): Promise<JobState> => {
    const response = await fetch(`${API_BASE}/api/status/${jobId}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch job status`);
    }
    return response.json();
  }, []);

  const startPolling = useCallback((jobId: string) => {
    stopPolling();
    pollErrorCountRef.current = 0;

    pollingRef.current = setInterval(async () => {
      try {
        const status = await pollStatus(jobId);
        setCurrentJob(status);
        // Reset error count on successful poll
        pollErrorCountRef.current = 0;

        if (status.status === 'done' || status.status === 'error') {
          stopPolling();
          setIsLoading(false);

          if (status.status === 'error') {
            setError(status.error || 'Generation failed');
          }
        }
      } catch (err) {
        pollErrorCountRef.current++;
        console.error(`Polling error (${pollErrorCountRef.current}/${MAX_POLL_ERRORS}):`, err);

        // Stop polling after too many consecutive errors
        if (pollErrorCountRef.current >= MAX_POLL_ERRORS) {
          stopPolling();
          setIsLoading(false);
          setError(`Connection lost after ${MAX_POLL_ERRORS} failed attempts. Please check your network and try again.`);
          setCurrentJob((prev) =>
            prev ? { ...prev, status: 'error', error: 'Connection lost' } : null
          );
        }
      }
    }, POLL_INTERVAL);
  }, [pollStatus, stopPolling]);

  const submitJob = useCallback(async (params: GenerateParams): Promise<string> => {
    setIsLoading(true);
    setError(null);
    setCurrentJob(null);
    pollErrorCountRef.current = 0;

    try {
      const formData = new FormData();
      formData.append('workflow', params.workflow);
      formData.append('prompt', params.prompt);

      if (params.negativePrompt) {
        formData.append('negative_prompt', params.negativePrompt);
      }
      if (params.seed !== undefined) {
        formData.append('seed', String(params.seed));
      }
      if (params.steps !== undefined) {
        formData.append('steps', String(params.steps));
      }
      if (params.cfg !== undefined) {
        formData.append('cfg', String(params.cfg));
      }
      if (params.inputImage) {
        formData.append('inputImage', params.inputImage);
      }

      const response = await fetch(`${API_BASE}/api/generate`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: Failed to submit job`);
      }

      const data = await response.json();
      const jobId = data.jobId;

      setCurrentJob({
        jobId,
        status: 'queued'
      });

      // Start polling for status
      startPolling(jobId);

      return jobId;
    } catch (err) {
      setIsLoading(false);
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      throw err;
    }
  }, [startPolling]);

  const cancelJob = useCallback(() => {
    stopPolling();
    setIsLoading(false);
    setCurrentJob(null);
    setError(null);
  }, [stopPolling]);

  const getOutputUrl = useCallback((filename: string): string => {
    return `${API_BASE}/output/${filename}`;
  }, []);

  /**
   * Clears any existing error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    submitJob,
    pollStatus,
    cancelJob,
    getOutputUrl,
    clearError,
    isLoading,
    error,
    currentJob,
    /** The base API URL being used */
    apiBase: API_BASE,
  };
}
