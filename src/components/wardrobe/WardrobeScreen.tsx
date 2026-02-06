import React, { useState, useCallback } from 'react';
import { CategoryTabs, type ClothingCategory } from './CategoryTabs';
import { ClothingGrid } from './ClothingGrid';
import { type ClothingItem } from './ClothingCard';
import { useWardrobeStore } from '../../stores/wardrobeStore';
import { useFavoritesStore } from '../../stores/favoritesStore';
import { useAvatarStore } from '../../stores/avatarStore';
import { useMeshGroups } from '../../hooks/useMeshGroups';
import { useSmartMeshDetection } from '../../hooks/useSmartMeshDetection';
import { applyTextureToMeshes, createTextureFromImage } from '../../utils/textureUtils';

interface WardrobeScreenProps {
  onItemSelect?: (item: ClothingItem) => void;
}

/**
 * Full-screen wardrobe browser
 * Categories, favorites section, and clothing grid
 */
export function WardrobeScreen({ onItemSelect }: WardrobeScreenProps) {
  const [activeCategory, setActiveCategory] = useState<ClothingCategory>('tops');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Stores
  const {
    items,
    equippedItems,
    equipItem,
    unequipItem,
    getItemsByCategory,
    getCategoryCounts,
  } = useWardrobeStore();

  const { toggleFavorite, isFavorite, getFavoriteIds } = useFavoritesStore();
  const { currentVRM } = useAvatarStore();

  // Mesh selection for texture application
  const { meshGroups, getSelectedMeshes, setSelectedGroup } = useMeshGroups(currentVRM);
  const analyzeMeshTarget = useSmartMeshDetection(meshGroups);

  // State for texture application
  const [isApplying, setIsApplying] = useState(false);

  // Get items for current category
  const categoryItems = getItemsByCategory(activeCategory);

  // Apply favorites filter
  const favoriteIds = getFavoriteIds();
  const filteredItems = showFavoritesOnly
    ? categoryItems.filter((item) => favoriteIds.includes(item.id))
    : categoryItems;

  // Apply search filter
  const searchedItems = searchQuery
    ? filteredItems.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredItems;

  // Add isFavorite to items for display
  const displayItems = searchedItems.map((item) => ({
    ...item,
    isFavorite: isFavorite(item.id),
  }));

  // Get category counts
  const categoryCounts = getCategoryCounts();

  // Currently equipped item in this category
  const equippedItemId = equippedItems.get(activeCategory);

  // Map clothing category to mesh detection category
  const categoryToAssetCategory = (cat: ClothingCategory): string => {
    switch (cat) {
      case 'hair': return 'Hair';
      case 'accessories': return 'Eyes';
      default: return 'Clothes';
    }
  };

  // Handle item selection - equip and apply texture
  const handleSelectItem = useCallback(
    (item: ClothingItem) => {
      // Toggle equip if already equipped
      if (equippedItemId === item.id) {
        unequipItem(activeCategory);
        return;
      }

      // Equip the item in store
      equipItem(activeCategory, item.id);

      // Apply texture to VRM if available
      if (!currentVRM || !item.textureUrl) {
        onItemSelect?.(item);
        return;
      }

      setIsApplying(true);

      // Use smart detection to find best mesh for this item
      const assetCategory = categoryToAssetCategory(activeCategory);
      const detection = analyzeMeshTarget(item.name, assetCategory);

      if (detection.meshName) {
        setSelectedGroup(detection.meshName);
      }

      // Load and apply texture
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const texture = createTextureFromImage(img);
        const meshes = getSelectedMeshes();

        if (meshes.length > 0) {
          applyTextureToMeshes({
            texture,
            meshes,
            onComplete: () => {
              setIsApplying(false);
            },
          });
        } else {
          setIsApplying(false);
        }
      };

      img.onerror = () => {
        console.error('Failed to load texture:', item.textureUrl);
        setIsApplying(false);
      };

      img.src = item.textureUrl;

      // Notify parent
      onItemSelect?.(item);
    },
    [activeCategory, equippedItemId, equipItem, unequipItem, onItemSelect, currentVRM, analyzeMeshTarget, setSelectedGroup, getSelectedMeshes]
  );

  // Handle favorite toggle
  const handleFavoriteItem = useCallback(
    (item: ClothingItem) => {
      toggleFavorite(item.id);
    },
    [toggleFavorite]
  );

  // Count favorites in current category
  const favoritesInCategory = categoryItems.filter((item) =>
    favoriteIds.includes(item.id)
  ).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header with search */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto space-y-3">
          {/* Title and favorites toggle */}
          <div className="flex items-center justify-between">
            <h2 className="text-kid-xl font-bold text-gray-800">My Closet</h2>
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
              <span className="text-kid-sm font-medium">
                Favorites
                {favoritesInCategory > 0 && ` (${favoritesInCategory})`}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-10 pr-4 bg-gray-100 rounded-kid-lg text-kid-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          {/* Category tabs */}
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            itemCounts={categoryCounts}
          />
        </div>
      </div>

      {/* Clothing grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto">
          {/* No VRM warning */}
          {!currentVRM && (
            <div className="mb-4 p-3 bg-orange/10 border border-orange/30 rounded-kid text-kid-sm text-orange-dark">
              <div className="flex items-center gap-2">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Load an avatar in "Dress Up" to apply clothing!</span>
              </div>
            </div>
          )}

          <ClothingGrid
            items={displayItems}
            selectedItemId={equippedItemId}
            onSelectItem={handleSelectItem}
            onFavoriteItem={handleFavoriteItem}
            emptyMessage={
              showFavoritesOnly
                ? 'No favorites in this category yet'
                : searchQuery
                ? 'No items match your search'
                : 'No items in this category yet'
            }
          />
        </div>
      </div>

      {/* Quick actions footer */}
      {equippedItemId && (
        <div className="bg-white/95 backdrop-blur-sm border-t border-gray-200 px-4 py-3 safe-area-bottom">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="text-kid-sm text-gray-600">
              Wearing:{' '}
              <span className="font-semibold text-primary">
                {items.find((i) => i.id === equippedItemId)?.name}
              </span>
            </div>
            <button
              onClick={() => unequipItem(activeCategory)}
              className="px-4 py-2 text-kid-sm font-medium text-gray-600 hover:text-primary transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default WardrobeScreen;
