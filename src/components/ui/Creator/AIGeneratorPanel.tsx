import { useState, useCallback } from 'react';
import { useAIAsset, type WorkflowType } from '../../../hooks/useAIAsset';
import { PromptInput } from './PromptInput';
import { GenerationStatus } from './GenerationStatus';
import { ResultPreview } from './ResultPreview';

interface AIGeneratorPanelProps {
  onApplyTexture?: (textureUrl: string) => void;
  onApplyBackground?: (backgroundUrl: string) => void;
}

export function AIGeneratorPanel({ onApplyTexture, onApplyBackground }: AIGeneratorPanelProps) {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowType>('uv_texture');
  const [isExpanded, setIsExpanded] = useState(true);
  const [lastParams, setLastParams] = useState<{
    prompt: string;
    negativePrompt?: string;
    seed?: number;
    steps: number;
    cfg: number;
    inputImage?: File;
  } | null>(null);

  const {
    submitJob,
    cancelJob,
    getOutputUrl,
    isLoading,
    error,
    currentJob
  } = useAIAsset();

  const workflows: { type: WorkflowType; label: string }[] = [
    { type: 'uv_texture', label: 'UV Texture' },
    { type: 'turnaround', label: 'Turnaround' },
    { type: 'depth', label: 'Depth Mod' },
    { type: 'background', label: 'Background' }
  ];

  const handleSubmit = useCallback(async (params: {
    prompt: string;
    negativePrompt?: string;
    seed?: number;
    steps: number;
    cfg: number;
    inputImage?: File;
  }) => {
    setLastParams(params);

    try {
      await submitJob({
        workflow: selectedWorkflow,
        ...params
      });
    } catch (err) {
      console.error('Generation failed:', err);
    }
  }, [selectedWorkflow, submitJob]);

  const handleRetry = useCallback(() => {
    if (lastParams) {
      handleSubmit(lastParams);
    }
  }, [lastParams, handleSubmit]);

  const showForm = !currentJob || currentJob.status === 'done' || currentJob.status === 'error';
  const showStatus = currentJob && (currentJob.status === 'queued' || currentJob.status === 'processing');
  const showResult = currentJob?.status === 'done' && currentJob.outputUrl;

  return (
    <div className="bg-gray-800 rounded-lg">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-700 hover:bg-gray-600 transition-colors rounded-t-lg"
      >
        <span className="font-medium">AI Generator</span>
        <span className="text-gray-400">{isExpanded ? '−' : '+'}</span>
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Workflow Tabs */}
          <div className="flex gap-1 bg-gray-900 p-1 rounded">
            {workflows.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => setSelectedWorkflow(type)}
                disabled={isLoading}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  selectedWorkflow === type
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Status (when generating) */}
          {showStatus && (
            <GenerationStatus
              status={currentJob.status}
              error={currentJob.error}
              onCancel={cancelJob}
            />
          )}

          {/* Error status (can show alongside form for retry) */}
          {currentJob?.status === 'error' && (
            <GenerationStatus
              status="error"
              error={error || currentJob.error}
              onRetry={handleRetry}
            />
          )}

          {/* Result Preview */}
          {showResult && (
            <ResultPreview
              outputUrl={currentJob.outputUrl!}
              outputFiles={currentJob.outputFiles}
              getOutputUrl={getOutputUrl}
              onApplyToAvatar={selectedWorkflow === 'background' ? undefined : onApplyTexture}
              onApplyBackground={selectedWorkflow === 'background' ? onApplyBackground : undefined}
              isBackground={selectedWorkflow === 'background'}
            />
          )}

          {/* Input Form */}
          {showForm && (
            <PromptInput
              workflow={selectedWorkflow}
              onSubmit={handleSubmit}
              disabled={isLoading}
            />
          )}
        </div>
      )}
    </div>
  );
}

// Default export for compatibility
export default AIGeneratorPanel;
