import React from 'react';
import { ClothingCard, type ClothingItem } from './ClothingCard';

interface ClothingGridProps {
  items: ClothingItem[];
  selectedItemId?: string | null;
  onSelectItem: (item: ClothingItem) => void;
  onFavoriteItem?: (item: ClothingItem) => void;
  emptyMessage?: string;
  showFavorites?: boolean;
}

/**
 * Grid layout for clothing items
 * Responsive columns based on screen size
 */
export function ClothingGrid({
  items,
  selectedItemId,
  onSelectItem,
  onFavoriteItem,
  emptyMessage = 'No items found',
  showFavorites = true,
}: ClothingGridProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="text-5xl mb-4" role="img" aria-label="empty closet">
          🪺
        </span>
        <p className="text-kid-base text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
      {items.map((item) => (
        <ClothingCard
          key={item.id}
          item={item}
          isSelected={item.id === selectedItemId}
          onSelect={onSelectItem}
          onFavorite={onFavoriteItem}
          showFavoriteButton={showFavorites}
        />
      ))}
    </div>
  );
}

export default ClothingGrid;
