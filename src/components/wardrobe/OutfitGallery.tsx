import React, { useState } from 'react';
import { useOutfitStore, type SavedOutfit } from '../../stores/outfitStore';
import { formatDistanceToNow } from 'date-fns';

interface OutfitGalleryProps {
  onOutfitSelect?: (outfit: SavedOutfit) => void;
  onOutfitWear?: (outfit: SavedOutfit) => void;
}

/**
 * Grid of saved outfits
 */
export function OutfitGallery({ onOutfitSelect, onOutfitWear }: OutfitGalleryProps) {
  const {
    outfits,
    deleteOutfit,
    toggleOutfitFavorite,
    getFavoriteOutfits,
  } = useOutfitStore();

  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const displayOutfits = showFavoritesOnly ? getFavoriteOutfits() : outfits;

  const handleDelete = (outfitId: string) => {
    if (confirmDelete === outfitId) {
      deleteOutfit(outfitId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(outfitId);
      // Auto-reset after 3 seconds
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  if (outfits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-6xl mb-4" role="img" aria-label="camera">
          📸
        </span>
        <h3 className="text-kid-xl font-bold text-gray-800 mb-2">
          No Saved Outfits Yet
        </h3>
        <p className="text-kid-sm text-gray-600 max-w-xs">
          Create your first look in "Dress Up" and save it to your gallery!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-kid-lg font-bold text-gray-700">
          {displayOutfits.length} Outfit{displayOutfits.length !== 1 ? 's' : ''}
        </h3>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-kid
            transition-all duration-normal
            ${
              showFavoritesOnly
                ? 'bg-primary/10 text-primary'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }
          `}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={showFavoritesOnly ? '#FF6B9D' : 'none'}
            stroke={showFavoritesOnly ? '#FF6B9D' : 'currentColor'}
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span className="text-kid-sm font-medium">Favorites</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {displayOutfits.map((outfit) => (
          <div
            key={outfit.id}
            className="bg-white rounded-kid-lg overflow-hidden shadow-kid hover:shadow-kid-lg transition-all group"
          >
            {/* Thumbnail */}
            <div
              className="aspect-square relative cursor-pointer"
              onClick={() => onOutfitSelect?.(outfit)}
            >
              {outfit.thumbnailUrl ? (
                <img
                  src={outfit.thumbnailUrl}
                  alt={outfit.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: outfit.backgroundColor }}
                >
                  <span className="text-4xl" role="img" aria-label="outfit">
                    👗
                  </span>
                </div>
              )}

              {/* Favorite button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleOutfitFavorite(outfit.id);
                }}
                className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-kid opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill={outfit.isFavorite ? '#FF6B9D' : 'none'}
                  stroke={outfit.isFavorite ? '#FF6B9D' : '#9CA3AF'}
                  strokeWidth="2"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>

              {/* Wear button overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onOutfitWear?.(outfit);
                  }}
                  className="px-4 py-2 bg-white text-gray-800 font-semibold rounded-kid shadow-kid hover:scale-105 transition-transform"
                >
                  Wear This
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-3">
              <h4 className="text-kid-sm font-semibold text-gray-800 truncate">
                {outfit.name}
              </h4>
              <div className="flex items-center justify-between mt-1">
                <p className="text-kid-xs text-gray-500">
                  {formatDistanceToNow(outfit.createdAt, { addSuffix: true })}
                </p>
                <button
                  onClick={() => handleDelete(outfit.id)}
                  className={`text-kid-xs transition-colors ${
                    confirmDelete === outfit.id
                      ? 'text-red-500 font-semibold'
                      : 'text-gray-400 hover:text-red-500'
                  }`}
                >
                  {confirmDelete === outfit.id ? 'Confirm?' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showFavoritesOnly && displayOutfits.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-kid-sm">No favorite outfits yet</p>
          <p className="text-kid-xs mt-1">
            Tap the heart on an outfit to add it to favorites
          </p>
        </div>
      )}
    </div>
  );
}

export default OutfitGallery;
