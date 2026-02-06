import React, { useState } from 'react';
import {
  downloadImage,
  copyImageToClipboard,
  shareImage,
  addWatermark,
  canShare,
  canCopyToClipboard
} from '../../utils/shareUtils';

interface ShareModalProps {
  imageDataUrl: string;
  outfitName: string;
  onClose: () => void;
  onShareToGallery?: (name: string) => void;
}

type ShareOption = 'download' | 'copy' | 'share' | 'gallery';

/**
 * Modal for sharing outfit images
 * COPPA-compliant: No external accounts, local sharing only
 */
export function ShareModal({
  imageDataUrl,
  outfitName,
  onClose,
  onShareToGallery
}: ShareModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [addBranding, setAddBranding] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleShare = async (option: ShareOption) => {
    setIsProcessing(true);
    setMessage(null);

    try {
      // Optionally add watermark
      const imageToShare = addBranding
        ? await addWatermark(imageDataUrl)
        : imageDataUrl;

      switch (option) {
        case 'download': {
          const filename = `${outfitName.replace(/[^a-z0-9]/gi, '_')}_stylespace.png`;
          await downloadImage(imageToShare, filename);
          setMessage({ type: 'success', text: 'Downloaded! Check your downloads folder.' });
          break;
        }

        case 'copy': {
          const success = await copyImageToClipboard(imageToShare);
          if (success) {
            setMessage({ type: 'success', text: 'Copied to clipboard!' });
          } else {
            setMessage({ type: 'error', text: 'Could not copy to clipboard.' });
          }
          break;
        }

        case 'share': {
          const success = await shareImage(imageToShare, outfitName);
          if (success) {
            setMessage({ type: 'success', text: 'Shared successfully!' });
          } else {
            setMessage({ type: 'error', text: 'Sharing not available on this device.' });
          }
          break;
        }

        case 'gallery': {
          if (onShareToGallery) {
            onShareToGallery(outfitName);
            setMessage({ type: 'success', text: 'Added to gallery!' });
          }
          break;
        }
      }
    } catch (error) {
      console.error('Share error:', error);
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-kid-xl w-full max-w-md shadow-kid-xl overflow-hidden animate-bounceIn">
        {/* Header */}
        <div className="bg-gradient-magic p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-kid-lg font-bold text-white">Share Your Look</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
              aria-label="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="p-4 border-b border-gray-100">
          <div className="aspect-square bg-gray-100 rounded-kid overflow-hidden">
            <img
              src={imageDataUrl}
              alt={outfitName}
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-kid-sm font-semibold text-gray-800 mt-2 text-center">
            {outfitName}
          </p>
        </div>

        {/* Branding toggle */}
        <div className="px-4 py-3 border-b border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={addBranding}
              onChange={(e) => setAddBranding(e.target.checked)}
              className="w-5 h-5 rounded-md border-2 border-purple text-purple focus:ring-purple"
            />
            <span className="text-kid-sm text-gray-700">
              Add "Made with StyleSpace" watermark
            </span>
          </label>
        </div>

        {/* Share options */}
        <div className="p-4 space-y-3">
          {/* Download */}
          <button
            onClick={() => handleShare('download')}
            disabled={isProcessing}
            className="w-full h-touch flex items-center gap-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-kid transition-colors disabled:opacity-50"
          >
            <span className="text-2xl">💾</span>
            <span className="text-kid-base font-semibold text-gray-800">Save to Device</span>
          </button>

          {/* Copy to clipboard */}
          {canCopyToClipboard() && (
            <button
              onClick={() => handleShare('copy')}
              disabled={isProcessing}
              className="w-full h-touch flex items-center gap-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-kid transition-colors disabled:opacity-50"
            >
              <span className="text-2xl">📋</span>
              <span className="text-kid-base font-semibold text-gray-800">Copy to Clipboard</span>
            </button>
          )}

          {/* Native share */}
          {canShare() && (
            <button
              onClick={() => handleShare('share')}
              disabled={isProcessing}
              className="w-full h-touch flex items-center gap-3 px-4 bg-purple/10 hover:bg-purple/20 rounded-kid transition-colors disabled:opacity-50"
            >
              <span className="text-2xl">📤</span>
              <span className="text-kid-base font-semibold text-purple">Share...</span>
            </button>
          )}

          {/* Share to gallery */}
          {onShareToGallery && (
            <button
              onClick={() => handleShare('gallery')}
              disabled={isProcessing}
              className="w-full h-touch flex items-center gap-3 px-4 bg-gradient-magic text-white rounded-kid transition-colors disabled:opacity-50"
            >
              <span className="text-2xl">🌟</span>
              <span className="text-kid-base font-semibold">Add to Community Gallery</span>
            </button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`px-4 pb-4`}>
            <div className={`p-3 rounded-kid text-kid-sm font-medium ${
              message.type === 'success'
                ? 'bg-mint/20 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {message.text}
            </div>
          </div>
        )}

        {/* Processing indicator */}
        {isProcessing && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
              <span className="text-kid-sm">Processing...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareModal;
