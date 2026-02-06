export type AchievementTier = 'bronze' | 'silver' | 'gold';
export type AchievementCategory = 'wardrobe' | 'challenges' | 'social' | 'exploration' | 'creativity';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  emoji: string;
  tiers: AchievementTierConfig[];
}

export interface AchievementTierConfig {
  tier: AchievementTier;
  requirement: number;
  rewardStars: number;
  rewardXP: number;
}

const tierColors: Record<AchievementTier, string> = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
};

/**
 * All available achievements
 */
export const achievements: Achievement[] = [
  // Wardrobe achievements
  {
    id: 'fashionista',
    name: 'Fashionista',
    description: 'Create outfits',
    category: 'wardrobe',
    emoji: '👗',
    tiers: [
      { tier: 'bronze', requirement: 5, rewardStars: 10, rewardXP: 25 },
      { tier: 'silver', requirement: 25, rewardStars: 25, rewardXP: 75 },
      { tier: 'gold', requirement: 100, rewardStars: 50, rewardXP: 200 },
    ],
  },
  {
    id: 'style-collector',
    name: 'Style Collector',
    description: 'Collect clothing items',
    category: 'wardrobe',
    emoji: '🛍️',
    tiers: [
      { tier: 'bronze', requirement: 10, rewardStars: 15, rewardXP: 30 },
      { tier: 'silver', requirement: 50, rewardStars: 40, rewardXP: 100 },
      { tier: 'gold', requirement: 200, rewardStars: 100, rewardXP: 300 },
    ],
  },
  {
    id: 'favorite-finder',
    name: 'Favorite Finder',
    description: 'Add items to favorites',
    category: 'wardrobe',
    emoji: '💖',
    tiers: [
      { tier: 'bronze', requirement: 5, rewardStars: 10, rewardXP: 20 },
      { tier: 'silver', requirement: 20, rewardStars: 25, rewardXP: 50 },
      { tier: 'gold', requirement: 50, rewardStars: 50, rewardXP: 100 },
    ],
  },

  // Challenge achievements
  {
    id: 'challenge-champion',
    name: 'Challenge Champion',
    description: 'Complete daily challenges',
    category: 'challenges',
    emoji: '🏆',
    tiers: [
      { tier: 'bronze', requirement: 3, rewardStars: 20, rewardXP: 40 },
      { tier: 'silver', requirement: 10, rewardStars: 50, rewardXP: 100 },
      { tier: 'gold', requirement: 30, rewardStars: 100, rewardXP: 250 },
    ],
  },
  {
    id: 'streak-keeper',
    name: 'Streak Keeper',
    description: 'Maintain a daily streak',
    category: 'challenges',
    emoji: '🔥',
    tiers: [
      { tier: 'bronze', requirement: 3, rewardStars: 15, rewardXP: 30 },
      { tier: 'silver', requirement: 7, rewardStars: 40, rewardXP: 80 },
      { tier: 'gold', requirement: 30, rewardStars: 100, rewardXP: 200 },
    ],
  },

  // Social achievements
  {
    id: 'outfit-sharer',
    name: 'Outfit Sharer',
    description: 'Share outfits',
    category: 'social',
    emoji: '📤',
    tiers: [
      { tier: 'bronze', requirement: 1, rewardStars: 10, rewardXP: 20 },
      { tier: 'silver', requirement: 10, rewardStars: 30, rewardXP: 60 },
      { tier: 'gold', requirement: 50, rewardStars: 75, rewardXP: 150 },
    ],
  },
  {
    id: 'heart-giver',
    name: 'Heart Giver',
    description: 'Like outfits in the gallery',
    category: 'social',
    emoji: '❤️',
    tiers: [
      { tier: 'bronze', requirement: 10, rewardStars: 10, rewardXP: 20 },
      { tier: 'silver', requirement: 50, rewardStars: 25, rewardXP: 50 },
      { tier: 'gold', requirement: 200, rewardStars: 50, rewardXP: 100 },
    ],
  },

  // Exploration achievements
  {
    id: 'collection-hunter',
    name: 'Collection Hunter',
    description: 'Complete collections',
    category: 'exploration',
    emoji: '🎯',
    tiers: [
      { tier: 'bronze', requirement: 1, rewardStars: 25, rewardXP: 50 },
      { tier: 'silver', requirement: 3, rewardStars: 75, rewardXP: 150 },
      { tier: 'gold', requirement: 8, rewardStars: 200, rewardXP: 400 },
    ],
  },
  {
    id: 'category-explorer',
    name: 'Category Explorer',
    description: 'Use items from all categories',
    category: 'exploration',
    emoji: '🧭',
    tiers: [
      { tier: 'bronze', requirement: 3, rewardStars: 15, rewardXP: 30 },
      { tier: 'silver', requirement: 5, rewardStars: 35, rewardXP: 70 },
      { tier: 'gold', requirement: 6, rewardStars: 50, rewardXP: 100 },
    ],
  },

  // Creativity achievements
  {
    id: 'photo-enthusiast',
    name: 'Photo Enthusiast',
    description: 'Take outfit screenshots',
    category: 'creativity',
    emoji: '📸',
    tiers: [
      { tier: 'bronze', requirement: 5, rewardStars: 10, rewardXP: 20 },
      { tier: 'silver', requirement: 25, rewardStars: 30, rewardXP: 60 },
      { tier: 'gold', requirement: 100, rewardStars: 75, rewardXP: 150 },
    ],
  },
  {
    id: 'texture-artist',
    name: 'Texture Artist',
    description: 'Apply custom textures',
    category: 'creativity',
    emoji: '🎨',
    tiers: [
      { tier: 'bronze', requirement: 3, rewardStars: 15, rewardXP: 30 },
      { tier: 'silver', requirement: 15, rewardStars: 40, rewardXP: 80 },
      { tier: 'gold', requirement: 50, rewardStars: 100, rewardXP: 200 },
    ],
  },
];

/**
 * Get achievement by ID
 */
export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): Achievement[] {
  return achievements.filter((a) => a.category === category);
}

/**
 * Get tier color
 */
export function getTierColor(tier: AchievementTier): string {
  return tierColors[tier];
}

export default achievements;
