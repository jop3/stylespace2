import type { ClothingCategory } from '../components/wardrobe/CategoryTabs';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  theme: string;
  emoji: string;
  color: string;
  requirements: ChallengeRequirement[];
  rewardStars: number;
  rewardXP: number;
  difficulty: 'easy' | 'medium' | 'hard';
  durationHours: number;
}

export interface ChallengeRequirement {
  type: 'category' | 'color' | 'item' | 'collection';
  category?: ClothingCategory;
  color?: string;
  itemId?: string;
  collectionId?: string;
  description: string;
}

/**
 * Daily challenge themes
 * Rotated based on date
 */
export const dailyChallenges: Challenge[] = [
  {
    id: 'beach-day',
    title: 'Beach Day',
    description: 'Create the perfect beach outfit!',
    theme: 'beach',
    emoji: '🏖️',
    color: '#3B82F6',
    requirements: [
      { type: 'category', category: 'accessories', description: 'Wear an accessory' },
    ],
    rewardStars: 25,
    rewardXP: 50,
    difficulty: 'easy',
    durationHours: 24,
  },
  {
    id: 'princess-party',
    title: 'Princess Party',
    description: 'Dress up for a royal celebration!',
    theme: 'royalty',
    emoji: '👑',
    color: '#FF6B9D',
    requirements: [
      { type: 'category', category: 'dresses', description: 'Wear a dress' },
      { type: 'category', category: 'accessories', description: 'Wear an accessory' },
    ],
    rewardStars: 35,
    rewardXP: 75,
    difficulty: 'medium',
    durationHours: 24,
  },
  {
    id: 'sports-star',
    title: 'Sports Star',
    description: 'Get ready for the big game!',
    theme: 'sports',
    emoji: '⚽',
    color: '#10B981',
    requirements: [
      { type: 'category', category: 'shoes', description: 'Wear athletic shoes' },
    ],
    rewardStars: 25,
    rewardXP: 50,
    difficulty: 'easy',
    durationHours: 24,
  },
  {
    id: 'cozy-night',
    title: 'Cozy Night',
    description: 'Snuggle up in comfy pajamas!',
    theme: 'cozy',
    emoji: '🌙',
    color: '#6366F1',
    requirements: [
      { type: 'category', category: 'tops', description: 'Wear a cozy top' },
      { type: 'category', category: 'bottoms', description: 'Wear comfy bottoms' },
    ],
    rewardStars: 30,
    rewardXP: 60,
    difficulty: 'medium',
    durationHours: 24,
  },
  {
    id: 'garden-party',
    title: 'Garden Party',
    description: 'Dress for a beautiful day outdoors!',
    theme: 'nature',
    emoji: '🌸',
    color: '#EC4899',
    requirements: [
      { type: 'category', category: 'dresses', description: 'Wear a floral dress' },
    ],
    rewardStars: 25,
    rewardXP: 50,
    difficulty: 'easy',
    durationHours: 24,
  },
  {
    id: 'school-style',
    title: 'School Style',
    description: 'Look sharp for class!',
    theme: 'school',
    emoji: '📚',
    color: '#F59E0B',
    requirements: [
      { type: 'category', category: 'tops', description: 'Wear a smart top' },
      { type: 'category', category: 'bottoms', description: 'Wear nice bottoms' },
      { type: 'category', category: 'shoes', description: 'Wear proper shoes' },
    ],
    rewardStars: 40,
    rewardXP: 100,
    difficulty: 'hard',
    durationHours: 24,
  },
  {
    id: 'fantasy-adventure',
    title: 'Fantasy Adventure',
    description: 'Prepare for an epic quest!',
    theme: 'fantasy',
    emoji: '🧙',
    color: '#7C3AED',
    requirements: [
      { type: 'category', category: 'accessories', description: 'Wear a magical accessory' },
    ],
    rewardStars: 30,
    rewardXP: 60,
    difficulty: 'medium',
    durationHours: 24,
  },
];

/**
 * Get the daily challenge based on current date
 * Uses a simple rotation based on day of year
 */
export function getDailyChallenge(): Challenge {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  const challengeIndex = dayOfYear % dailyChallenges.length;
  return dailyChallenges[challengeIndex];
}

/**
 * Get time remaining for current challenge
 */
export function getChallengeTimeRemaining(): { hours: number; minutes: number } {
  const now = new Date();
  const endOfDay = new Date(now);
  endOfDay.setHours(23, 59, 59, 999);

  const remaining = endOfDay.getTime() - now.getTime();
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  return { hours, minutes };
}

export default dailyChallenges;
