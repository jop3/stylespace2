import type { ClothingCategory } from '../components/wardrobe/CategoryTabs';

export interface Collection {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string;
  requiredItemIds: string[];
  rewardStars: number;
  rewardBadge?: string;
}

/**
 * Themed clothing collections
 * Users collect items to complete collections and earn rewards
 */
export const collections: Collection[] = [
  {
    id: 'princess-dreams',
    name: 'Princess Dreams',
    description: 'Elegant gowns and sparkling accessories fit for royalty',
    emoji: '👑',
    color: '#FF6B9D',
    requiredItemIds: [],
    rewardStars: 50,
    rewardBadge: 'royal-fashionista',
  },
  {
    id: 'sports-star',
    name: 'Sports Star',
    description: 'Athletic gear for the active fashionista',
    emoji: '⚽',
    color: '#10B981',
    requiredItemIds: [],
    rewardStars: 40,
    rewardBadge: 'athletic-ace',
  },
  {
    id: 'beach-day',
    name: 'Beach Day',
    description: 'Sun, sand, and stylish swimwear',
    emoji: '🏖️',
    color: '#3B82F6',
    requiredItemIds: [],
    rewardStars: 35,
  },
  {
    id: 'fantasy-adventure',
    name: 'Fantasy Adventure',
    description: 'Magical outfits for epic quests',
    emoji: '🧙',
    color: '#7C3AED',
    requiredItemIds: [],
    rewardStars: 60,
    rewardBadge: 'magical-maven',
  },
  {
    id: 'cozy-nights',
    name: 'Cozy Nights',
    description: 'Comfy pajamas and warm sweaters',
    emoji: '🌙',
    color: '#6366F1',
    requiredItemIds: [],
    rewardStars: 30,
  },
  {
    id: 'party-time',
    name: 'Party Time',
    description: 'Sparkly outfits for celebrations',
    emoji: '🎉',
    color: '#F59E0B',
    requiredItemIds: [],
    rewardStars: 45,
    rewardBadge: 'party-planner',
  },
  {
    id: 'school-days',
    name: 'School Days',
    description: 'Smart and stylish school outfits',
    emoji: '📚',
    color: '#EC4899',
    requiredItemIds: [],
    rewardStars: 35,
  },
  {
    id: 'nature-explorer',
    name: 'Nature Explorer',
    description: 'Outdoor gear for adventures in nature',
    emoji: '🌲',
    color: '#059669',
    requiredItemIds: [],
    rewardStars: 40,
    rewardBadge: 'wilderness-wanderer',
  },
];

/**
 * Get collection by ID
 */
export function getCollectionById(id: string): Collection | undefined {
  return collections.find((c) => c.id === id);
}

/**
 * Calculate collection progress
 */
export function getCollectionProgress(
  collectionId: string,
  ownedItemIds: string[]
): { owned: number; total: number; percentage: number } {
  const collection = getCollectionById(collectionId);
  if (!collection) {
    return { owned: 0, total: 0, percentage: 0 };
  }

  const total = collection.requiredItemIds.length;
  if (total === 0) {
    return { owned: 0, total: 0, percentage: 0 };
  }

  const owned = collection.requiredItemIds.filter((id) =>
    ownedItemIds.includes(id)
  ).length;

  return {
    owned,
    total,
    percentage: Math.round((owned / total) * 100),
  };
}

/**
 * Check if collection is complete
 */
export function isCollectionComplete(
  collectionId: string,
  ownedItemIds: string[]
): boolean {
  const progress = getCollectionProgress(collectionId, ownedItemIds);
  return progress.owned === progress.total && progress.total > 0;
}

export default collections;
