import React, { useState, useCallback, useRef } from 'react';
import type { VRM } from '@pixiv/three-vrm';
import { BackgroundPicker } from './BackgroundPicker';
import { FilterPicker } from './FilterPicker';
import { FramePicker } from './FramePicker';
import { StickerPlacer, PlacedSticker } from './StickerPlacer';
import { getBackgroundById, Background } from '../../data/backgrounds';
import { getFilterById, Filter } from '../../data/filters';
import { getFrameById, getFrameStyles, Frame } from '../../data/frames';
import { getStickerById, Sticker } from '../../data/stickers';
import { downloadImage, shareImage, canShare } from '../../utils/shareUtils';

type Tab = 'background' | 'filter' | 'frame' | 'stickers';

interface PhotoBoothProps {
  vrm: VRM | null;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onClose: () => void;
}

/**
 * Enhanced photo booth with backgrounds, filters, frames, and stickers
 */
export function PhotoBooth({ vrm, canvasRef, onClose }: PhotoBoothProps) {
  const [activeTab, setActiveTab] = useState<Tab>('background');
  const [selectedBackground, setSelectedBackground] = useState<string>('white');
  const [selectedFilter, setSelectedFilter] = useState<string>('none');
  const [selectedFrame, setSelectedFrame] = useState<string>('simple-white');
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const background = getBackgroundById(selectedBackground);
  const filter = getFilterById(selectedFilter);
  const frame = getFrameById(selectedFrame);

  const handleAddSticker = useCallback((sticker: Sticker, x: number, y: number) => {
    const newSticker: PlacedSticker = {
      id: `${sticker.id}-${Date.now()}`,
      stickerId: sticker.id,
      x,
      y,
      scale: 1,
      rotation: 0
    };
    setPlacedStickers((prev) => [...prev, newSticker]);
  }, []);

  const handleRemoveSticker = useCallback((id: string) => {
    setPlacedStickers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleUpdateSticker = useCallback((id: string, updates: Partial<PlacedSticker>) => {
    setPlacedStickers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const handleClearStickers = useCallback(() => {
    setPlacedStickers([]);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!canvasRef.current || !previewRef.current) return;

    setIsCapturing(true);

    try {
      // Create a composite canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const sourceCanvas = canvasRef.current;
      const size = Math.max(sourceCanvas.width, sourceCanvas.height);
      canvas.width = size;
      canvas.height = size;

      // Draw background
      if (background) {
        if (background.type === 'solid') {
          ctx.fillStyle = background.value;
          ctx.fillRect(0, 0, size, size);
        } else {
          // For gradients, use solid fallback
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);
        }
      }

      // Draw the 3D canvas centered
      const offsetX = (size - sourceCanvas.width) / 2;
      const offsetY = (size - sourceCanvas.height) / 2;
      ctx.drawImage(sourceCanvas, offsetX, offsetY);

      // Apply filter if any (simplified - just affects brightness/contrast)
      if (filter && filter.id !== 'none') {
        ctx.filter = filter.css;
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
      }

      // Draw stickers
      for (const placed of placedStickers) {
        const sticker = getStickerById(placed.stickerId);
        if (sticker) {
          const x = (placed.x / 100) * size;
          const y = (placed.y / 100) * size;
          ctx.font = `${48 * placed.scale}px serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((placed.rotation * Math.PI) / 180);
          ctx.fillText(sticker.emoji, 0, 0);
          ctx.restore();
        }
      }

      // Get data URL and download
      const dataUrl = canvas.toDataURL('image/png');
      const filename = `stylespace_photo_${Date.now()}.png`;
      await downloadImage(dataUrl, filename);
    } catch (error) {
      console.error('Failed to capture photo:', error);
    } finally {
      setIsCapturing(false);
    }
  }, [canvasRef, background, filter, placedStickers]);

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: 'background', label: 'BG', emoji: '🎨' },
    { id: 'filter', label: 'Filter', emoji: '✨' },
    { id: 'frame', label: 'Frame', emoji: '🖼️' },
    { id: 'stickers', label: 'Stickers', emoji: '⭐' }
  ];

  if (!vrm) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-kid-xl p-6 text-center">
          <span className="text-6xl mb-4 block">📸</span>
          <p className="text-kid-base text-gray-600 mb-4">Load an avatar to use the photo booth!</p>
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm p-4 flex items-center justify-between">
        <h2 className="text-kid-lg font-bold text-white">📸 Photo Booth</h2>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <div
          ref={previewRef}
          className="relative max-w-md w-full aspect-square"
          style={{
            background: background?.value || '#ffffff',
            filter: filter?.css || 'none',
            ...(frame ? getFrameStyles(frame) : {})
          }}
        >
          {/* 3D canvas will be displayed here by the parent */}
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-kid-sm">Avatar preview</span>
          </div>

          {/* Placed stickers */}
          {placedStickers.map((placed) => {
            const sticker = getStickerById(placed.stickerId);
            if (!sticker) return null;
            return (
              <div
                key={placed.id}
                className="absolute cursor-move"
                style={{
                  left: `${placed.x}%`,
                  top: `${placed.y}%`,
                  transform: `translate(-50%, -50%) scale(${placed.scale}) rotate(${placed.rotation}deg)`
                }}
                onClick={() => handleRemoveSticker(placed.id)}
              >
                <span className="text-4xl">{sticker.emoji}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Controls panel */}
      <div className="bg-white rounded-t-kid-xl p-4 safe-area-bottom">
        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 py-2 px-3 rounded-kid text-kid-sm font-semibold transition-all
                ${activeTab === tab.id
                  ? 'bg-gradient-magic text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
              `}
            >
              <span className="mr-1">{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="h-32 overflow-y-auto mb-4">
          {activeTab === 'background' && (
            <BackgroundPicker
              selectedId={selectedBackground}
              onSelect={(bg) => setSelectedBackground(bg.id)}
            />
          )}
          {activeTab === 'filter' && (
            <FilterPicker
              selectedId={selectedFilter}
              onSelect={(f) => setSelectedFilter(f.id)}
            />
          )}
          {activeTab === 'frame' && (
            <FramePicker
              selectedId={selectedFrame}
              onSelect={(f) => setSelectedFrame(f.id)}
            />
          )}
          {activeTab === 'stickers' && (
            <StickerPlacer
              placedStickers={placedStickers}
              onAddSticker={handleAddSticker}
              onRemoveSticker={handleRemoveSticker}
              onUpdateSticker={handleUpdateSticker}
              onClearAll={handleClearStickers}
            />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <button
            onClick={capturePhoto}
            disabled={isCapturing}
            className="flex-1 h-touch flex items-center justify-center gap-2 bg-gradient-magic text-white rounded-kid font-bold disabled:opacity-50"
          >
            <span className="text-xl">📷</span>
            <span>{isCapturing ? 'Saving...' : 'Take Photo'}</span>
          </button>
          {canShare() && (
            <button
              onClick={capturePhoto}
              disabled={isCapturing}
              className="h-touch px-4 flex items-center justify-center bg-purple text-white rounded-kid font-bold disabled:opacity-50"
            >
              <span className="text-xl">📤</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PhotoBooth;
