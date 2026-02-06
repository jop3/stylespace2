import React, { useEffect, useRef, useState } from 'react';
import { addWatermark, resizeImage } from '../../utils/shareUtils';

interface SharePreviewProps {
  imageDataUrl: string;
  outfitName: string;
  showWatermark?: boolean;
  maxSize?: number;
}

/**
 * Preview component for outfit sharing
 * Shows the image as it will appear when shared
 */
export function SharePreview({
  imageDataUrl,
  outfitName,
  showWatermark = true,
  maxSize = 1024
}: SharePreviewProps) {
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function processImage() {
      setIsLoading(true);
      try {
        // First resize
        let processed = await resizeImage(imageDataUrl, maxSize, maxSize);

        // Then add watermark if requested
        if (showWatermark) {
          processed = await addWatermark(processed);
        }

        setProcessedImage(processed);
      } catch (error) {
        console.error('Error processing image:', error);
        setProcessedImage(imageDataUrl);
      } finally {
        setIsLoading(false);
      }
    }

    processImage();
  }, [imageDataUrl, showWatermark, maxSize]);

  return (
    <div className="relative">
      {/* Image container */}
      <div className="aspect-square bg-gray-100 rounded-kid-lg overflow-hidden shadow-kid">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-purple/30 border-t-purple rounded-full animate-spin" />
          </div>
        ) : (
          <img
            src={processedImage || imageDataUrl}
            alt={outfitName}
            className="w-full h-full object-contain"
          />
        )}
      </div>

      {/* Outfit name badge */}
      <div className="absolute bottom-2 left-2 right-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-kid px-3 py-2 shadow-kid">
          <p className="text-kid-sm font-bold text-gray-800 truncate">{outfitName}</p>
        </div>
      </div>
    </div>
  );
}

export default SharePreview;
