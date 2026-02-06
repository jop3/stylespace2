import { useEffect } from 'react';
import { useWardrobeStore } from '../stores/wardrobeStore';
import type { ClothingCategory } from '../components/wardrobe/CategoryTabs';
import type { ClothingItem } from '../components/wardrobe/ClothingCard';

interface ManifestAsset {
  id: string;
  name: string;
  path: string;
  category: string;
}

/**
 * Maps manifest categories to wardrobe clothing categories
 * Uses filename hints to determine specific category
 */
function mapToClothingCategory(asset: ManifestAsset): ClothingCategory | null {
  const nameLower = asset.name.toLowerCase();
  const pathLower = asset.path.toLowerCase();

  // Skip models - they're not clothing
  if (asset.category === 'Models') return null;

  // Hair category
  if (asset.category === 'Hair' || pathLower.includes('/hair/')) {
    return 'hair';
  }

  // Eyes go to accessories
  if (asset.category === 'Eyes' || pathLower.includes('/eyes/')) {
    return 'accessories';
  }

  // Clothes category - try to determine specific type from filename
  if (asset.category === 'Clothes' || asset.category === 'Textures') {
    // Check for specific clothing types in name
    if (nameLower.includes('dress') || nameLower.includes('gown')) {
      return 'dresses';
    }
    if (nameLower.includes('skirt') || nameLower.includes('pant') || nameLower.includes('short') || nameLower.includes('jean') || nameLower.includes('bottom')) {
      return 'bottoms';
    }
    if (nameLower.includes('shoe') || nameLower.includes('boot') || nameLower.includes('heel') || nameLower.includes('pump') || nameLower.includes('sandal') || nameLower.includes('sneaker')) {
      return 'shoes';
    }
    if (nameLower.includes('hat') || nameLower.includes('glass') || nameLower.includes('jewel') || nameLower.includes('necklace') || nameLower.includes('earring') || nameLower.includes('accessory') || nameLower.includes('bag') || nameLower.includes('belt')) {
      return 'accessories';
    }
    // Default clothes to tops
    return 'tops';
  }

  return null;
}

/**
 * Hook to initialize wardrobe store from manifest.json
 * Runs once on app startup
 */
export function useWardrobeInit() {
  const { items, setItems } = useWardrobeStore();

  useEffect(() => {
    // Only initialize if wardrobe is empty
    if (items.length > 0) return;

    async function loadManifest() {
      try {
        const response = await fetch('/downloads/manifest.json');
        if (!response.ok) return;

        const assets: ManifestAsset[] = await response.json();

        const clothingItems: ClothingItem[] = [];

        for (const asset of assets) {
          const category = mapToClothingCategory(asset);
          if (!category) continue;

          clothingItems.push({
            id: asset.id,
            name: asset.name,
            category,
            thumbnailUrl: asset.path,
            textureUrl: asset.path,
            rarity: 'common',
          });
        }

        if (clothingItems.length > 0) {
          setItems(clothingItems);
          console.log(`Loaded ${clothingItems.length} items into wardrobe`);
        }
      } catch (error) {
        console.error('Failed to load wardrobe manifest:', error);
      }
    }

    loadManifest();
  }, [items.length, setItems]);
}

export default useWardrobeInit;
