import type { JobStatus } from '../../../hooks/useAIAsset';

interface GenerationStatusProps {
  status: JobStatus;
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}

export function GenerationStatus({ status, error, onCancel, onRetry }: GenerationStatusProps) {
  const statusConfig: Record<JobStatus, { label: string; color: string; icon: string }> = {
    queued: {
      label: 'Queued',
      color: 'text-yellow-400',
      icon: '...'
    },
    processing: {
      label: 'Generating',
      color: 'text-blue-400',
      icon: ''
    },
    done: {
      label: 'Complete',
      color: 'text-green-400',
      icon: ''
    },
    error: {
      label: 'Error',
      color: 'text-red-400',
      icon: ''
    }
  };

  const config = statusConfig[status];

  return (
    <div className="p-4 bg-gray-800 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xl ${config.color}`}>{config.icon}</span>
          <span className={`font-medium ${config.color}`}>{config.label}</span>
        </div>

        {(status === 'queued' || status === 'processing') && onCancel && (
          <button
            onClick={onCancel}
            className="text-sm text-gray-400 hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress animation for processing */}
      {status === 'processing' && (
        <div className="w-full h-2 bg-gray-700 rounded overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse" style={{ width: '100%' }} />
        </div>
      )}

      {/* Error message */}
      {status === 'error' && error && (
        <div className="mt-2">
          <p className="text-sm text-red-400 mb-2">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 rounded"
            >
              Retry
            </button>
          )}
        </div>
      )}

      {/* Success message */}
      {status === 'done' && (
        <p className="text-sm text-gray-400 mt-2">
          Generation complete! Preview your result below.
        </p>
      )}
    </div>
  );
}
