import React, { useState } from 'react';
import type { ClothingCategory } from './CategoryTabs';

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  thumbnailUrl: string;
  textureUrl: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  isNew?: boolean;
  isFavorite?: boolean;
  collectionId?: string;
}

interface ClothingCardProps {
  item: ClothingItem;
  isSelected?: boolean;
  onSelect: (item: ClothingItem) => void;
  onFavorite?: (item: ClothingItem) => void;
  showFavoriteButton?: boolean;
}

const rarityColors = {
  common: 'border-gray-200',
  rare: 'border-sky',
  epic: 'border-purple',
  legendary: 'border-orange',
};

const rarityGlows = {
  common: '',
  rare: 'hover:shadow-glow-purple',
  epic: 'hover:shadow-glow-purple',
  legendary: 'hover:shadow-glow-orange',
};

/**
 * Individual clothing item card
 * Shows thumbnail, name, rarity, and favorite button
 */
export function ClothingCard({
  item,
  isSelected = false,
  onSelect,
  onFavorite,
  showFavoriteButton = true,
}: ClothingCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const rarity = item.rarity || 'common';

  return (
    <button
      onClick={() => onSelect(item)}
      className={`
        relative bg-white rounded-kid-lg overflow-hidden
        border-2 transition-all duration-normal
        ${rarityColors[rarity]}
        ${rarityGlows[rarity]}
        ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'hover:scale-102'}
        active:scale-95
      `}
    >
      {/* New badge */}
      {item.isNew && (
        <div className="absolute top-1 left-1 z-10">
          <span className="bg-primary text-white text-xs font-bold px-2 py-0.5 rounded-full">
            NEW
          </span>
        </div>
      )}

      {/* Favorite button */}
      {showFavoriteButton && onFavorite && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(item);
          }}
          className="absolute top-1 right-1 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm transition-all hover:scale-110 active:scale-90"
          aria-label={item.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={item.isFavorite ? '#FF6B9D' : 'none'}
            stroke={item.isFavorite ? '#FF6B9D' : '#9CA3AF'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      )}

      {/* Thumbnail */}
      <div className="aspect-square bg-gray-100 relative">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}

        {imageError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <span className="text-3xl" role="img" aria-label="clothing">
              👕
            </span>
          </div>
        ) : (
          <img
            src={item.thumbnailUrl}
            alt={item.name}
            className={`w-full h-full object-cover transition-opacity ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        )}
      </div>

      {/* Name */}
      <div className="p-2">
        <p className="text-kid-xs font-semibold text-gray-700 truncate">{item.name}</p>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute inset-0 bg-primary/10 pointer-events-none">
          <div className="absolute bottom-2 right-2">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="3"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </button>
  );
}

export default ClothingCard;
