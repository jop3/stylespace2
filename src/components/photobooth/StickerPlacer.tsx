import React, { useState, useRef } from 'react';
import { STICKERS, getStickersByCategory, getStickerCategories, getCategoryLabel, Sticker } from '../../data/stickers';

export interface PlacedSticker {
  id: string;
  stickerId: string;
  x: number; // percentage
  y: number; // percentage
  scale: number;
  rotation: number;
}

interface StickerPlacerProps {
  placedStickers: PlacedSticker[];
  onAddSticker: (sticker: Sticker, x: number, y: number) => void;
  onRemoveSticker: (id: string) => void;
  onUpdateSticker: (id: string, updates: Partial<PlacedSticker>) => void;
  onClearAll: () => void;
  compact?: boolean;
}

/**
 * Sticker selector and placer for photo booth
 */
export function StickerPlacer({
  placedStickers,
  onAddSticker,
  onRemoveSticker,
  onUpdateSticker,
  onClearAll,
  compact = false
}: StickerPlacerProps) {
  const [activeCategory, setActiveCategory] = useState<Sticker['category']>('fun');
  const [selectedSticker, setSelectedSticker] = useState<Sticker | null>(null);
  const categories = getStickerCategories();
  const stickers = getStickersByCategory(activeCategory);

  const handleStickerClick = (sticker: Sticker) => {
    setSelectedSticker(sticker);
    // Place in center by default
    onAddSticker(sticker, 50, 50);
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {STICKERS.slice(0, 10).map((sticker) => (
            <button
              key={sticker.id}
              onClick={() => handleStickerClick(sticker)}
              className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-kid bg-gray-100 hover:bg-gray-200 transition-all hover:scale-110"
              title={sticker.name}
            >
              <span className="text-xl">{sticker.emoji}</span>
            </button>
          ))}
        </div>
        {placedStickers.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-kid-xs text-gray-500 hover:text-red-500"
          >
            Clear all stickers
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              px-3 py-1.5 rounded-full text-kid-xs font-semibold whitespace-nowrap transition-all
              ${activeCategory === category
                ? 'bg-purple text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Sticker grid */}
      <div className="grid grid-cols-6 gap-2">
        {stickers.map((sticker) => (
          <button
            key={sticker.id}
            onClick={() => handleStickerClick(sticker)}
            className="aspect-square flex items-center justify-center rounded-kid bg-gray-100 hover:bg-gray-200 transition-all hover:scale-110"
            title={sticker.name}
          >
            <span className="text-2xl">{sticker.emoji}</span>
          </button>
        ))}
      </div>

      {/* Placed stickers info */}
      {placedStickers.length > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <span className="text-kid-xs text-gray-500">
            {placedStickers.length} sticker{placedStickers.length !== 1 ? 's' : ''} placed
          </span>
          <button
            onClick={onClearAll}
            className="text-kid-xs text-gray-500 hover:text-red-500 transition-colors"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Instructions */}
      <p className="text-kid-xs text-gray-400 text-center">
        Tap a sticker to add it to your photo
      </p>
    </div>
  );
}

export default StickerPlacer;
