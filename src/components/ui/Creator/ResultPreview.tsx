import { useState } from 'react';

interface ResultPreviewProps {
  outputUrl: string;
  outputFiles?: string[];
  onApplyToAvatar?: (url: string) => void;
  onApplyBackground?: (url: string) => void;
  isBackground?: boolean;
  getOutputUrl: (filename: string) => string;
}

export function ResultPreview({
  outputUrl,
  outputFiles,
  onApplyToAvatar,
  onApplyBackground,
  isBackground: _isBackground,
  getOutputUrl
}: ResultPreviewProps) {
  // _isBackground reserved for future conditional rendering
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  const files = outputFiles || [];
  const currentFile = files[selectedIndex];
  const currentUrl = currentFile ? getOutputUrl(currentFile) : outputUrl;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentUrl;
    link.download = currentFile || 'generated-texture.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Image Preview */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden">
        {imageError ? (
          <div className="flex items-center justify-center h-48 text-gray-500">
            Failed to load image
          </div>
        ) : (
          <img
            src={currentUrl}
            alt="Generated texture"
            className="w-full h-auto max-h-80 object-contain"
            onError={() => setImageError(true)}
          />
        )}
      </div>

      {/* Multiple file selector */}
      {files.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {files.map((file, index) => (
            <button
              key={file}
              onClick={() => {
                setSelectedIndex(index);
                setImageError(false);
              }}
              className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                index === selectedIndex
                  ? 'border-blue-500'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <img
                src={getOutputUrl(file)}
                alt={`Output ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {onApplyToAvatar && (
          <button
            onClick={() => onApplyToAvatar(currentUrl)}
            className="flex-1 py-2 bg-green-600 hover:bg-green-700 rounded font-medium transition-colors"
          >
            Apply to Avatar
          </button>
        )}
        {onApplyBackground && (
          <button
            onClick={() => onApplyBackground(currentUrl)}
            className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 rounded font-medium transition-colors"
          >
            Set as Background
          </button>
        )}
        <button
          onClick={handleDownload}
          className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded font-medium transition-colors"
        >
          Download
        </button>
      </div>

      {/* File info */}
      {currentFile && (
        <p className="text-xs text-gray-500 text-center truncate">
          {currentFile}
        </p>
      )}
    </div>
  );
}
