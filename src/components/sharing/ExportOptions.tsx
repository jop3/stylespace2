import React from 'react';
import { downloadImage, canShare, shareImage, canCopyToClipboard, copyImageToClipboard } from '../../utils/shareUtils';

interface ExportOptionsProps {
  imageDataUrl: string;
  filename: string;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
  compact?: boolean;
}

/**
 * Export options buttons for saving/sharing images
 */
export function ExportOptions({
  imageDataUrl,
  filename,
  onSuccess,
  onError,
  compact = false
}: ExportOptionsProps) {
  const handleDownload = async () => {
    try {
      await downloadImage(imageDataUrl, filename);
      onSuccess?.('Saved to your device!');
    } catch {
      onError?.('Could not save image.');
    }
  };

  const handleCopy = async () => {
    try {
      const success = await copyImageToClipboard(imageDataUrl);
      if (success) {
        onSuccess?.('Copied!');
      } else {
        onError?.('Could not copy.');
      }
    } catch {
      onError?.('Could not copy.');
    }
  };

  const handleShare = async () => {
    try {
      const success = await shareImage(imageDataUrl, filename.replace('.png', ''));
      if (success) {
        onSuccess?.('Shared!');
      } else {
        onError?.('Sharing not available.');
      }
    } catch {
      onError?.('Could not share.');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Download"
          title="Download"
        >
          <span className="text-lg">💾</span>
        </button>

        {canCopyToClipboard() && (
          <button
            onClick={handleCopy}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Copy"
            title="Copy to clipboard"
          >
            <span className="text-lg">📋</span>
          </button>
        )}

        {canShare() && (
          <button
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-purple/10 hover:bg-purple/20 transition-colors"
            aria-label="Share"
            title="Share"
          >
            <span className="text-lg">📤</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleDownload}
        className="w-full h-touch flex items-center gap-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-kid transition-colors"
      >
        <span className="text-2xl">💾</span>
        <div className="text-left">
          <p className="text-kid-sm font-semibold text-gray-800">Save to Device</p>
          <p className="text-kid-xs text-gray-500">Download to your photos</p>
        </div>
      </button>

      {canCopyToClipboard() && (
        <button
          onClick={handleCopy}
          className="w-full h-touch flex items-center gap-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-kid transition-colors"
        >
          <span className="text-2xl">📋</span>
          <div className="text-left">
            <p className="text-kid-sm font-semibold text-gray-800">Copy to Clipboard</p>
            <p className="text-kid-xs text-gray-500">Paste into other apps</p>
          </div>
        </button>
      )}

      {canShare() && (
        <button
          onClick={handleShare}
          className="w-full h-touch flex items-center gap-3 px-4 bg-purple/10 hover:bg-purple/20 rounded-kid transition-colors"
        >
          <span className="text-2xl">📤</span>
          <div className="text-left">
            <p className="text-kid-sm font-semibold text-purple">Share</p>
            <p className="text-kid-xs text-purple/70">Send to friends or apps</p>
          </div>
        </button>
      )}
    </div>
  );
}

export default ExportOptions;
