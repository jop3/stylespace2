import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LevelInfo {
  level: number;
  title: string;
  minXP: number;
  maxXP: number;
}

/**
 * Level thresholds and titles
 */
const levels: LevelInfo[] = [
  { level: 1, title: 'Style Rookie', minXP: 0, maxXP: 100 },
  { level: 2, title: 'Fashion Learner', minXP: 100, maxXP: 250 },
  { level: 3, title: 'Outfit Maker', minXP: 250, maxXP: 450 },
  { level: 4, title: 'Style Scout', minXP: 450, maxXP: 700 },
  { level: 5, title: 'Fashion Friend', minXP: 700, maxXP: 1000 },
  { level: 6, title: 'Trend Spotter', minXP: 1000, maxXP: 1400 },
  { level: 7, title: 'Style Expert', minXP: 1400, maxXP: 1900 },
  { level: 8, title: 'Fashion Guru', minXP: 1900, maxXP: 2500 },
  { level: 9, title: 'Design Star', minXP: 2500, maxXP: 3200 },
  { level: 10, title: 'Trendsetter', minXP: 3200, maxXP: 4000 },
  { level: 15, title: 'Style Icon', minXP: 4000, maxXP: 6000 },
  { level: 20, title: 'Fashion Master', minXP: 6000, maxXP: 9000 },
  { level: 30, title: 'Design Legend', minXP: 9000, maxXP: 15000 },
  { level: 50, title: 'Style Legend', minXP: 15000, maxXP: Infinity },
];

function getLevelInfo(xp: number): { current: LevelInfo; next: LevelInfo | null; progress: number } {
  let current = levels[0];
  let next: LevelInfo | null = levels[1];

  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i].minXP) {
      current = levels[i];
      next = levels[i + 1] || null;
    } else {
      break;
    }
  }

  const progress = next
    ? ((xp - current.minXP) / (next.minXP - current.minXP)) * 100
    : 100;

  return { current, next, progress: Math.min(100, Math.max(0, progress)) };
}

interface ProgressState {
  // Currency
  stars: number;
  totalStarsEarned: number;

  // Experience
  xp: number;
  totalXPEarned: number;

  // Stats
  outfitsCreated: number;
  texturesApplied: number;
  screenshotsTaken: number;
  challengesCompleted: number;

  // Actions
  addStars: (amount: number) => void;
  spendStars: (amount: number) => boolean;
  addXP: (amount: number) => { leveledUp: boolean; newLevel: number };

  // Stat incrementers
  incrementOutfitsCreated: () => void;
  incrementTexturesApplied: () => void;
  incrementScreenshotsTaken: () => void;
  incrementChallengesCompleted: () => void;

  // Getters
  getLevelInfo: () => { current: LevelInfo; next: LevelInfo | null; progress: number };
  getCurrentLevel: () => number;
  getCurrentTitle: () => string;
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      stars: 0,
      totalStarsEarned: 0,
      xp: 0,
      totalXPEarned: 0,
      outfitsCreated: 0,
      texturesApplied: 0,
      screenshotsTaken: 0,
      challengesCompleted: 0,

      addStars: (amount) =>
        set((state) => ({
          stars: state.stars + amount,
          totalStarsEarned: state.totalStarsEarned + amount,
        })),

      spendStars: (amount) => {
        const state = get();
        if (state.stars < amount) return false;

        set({ stars: state.stars - amount });
        return true;
      },

      addXP: (amount) => {
        const state = get();
        const oldLevel = getLevelInfo(state.xp).current.level;
        const newXP = state.xp + amount;
        const newLevel = getLevelInfo(newXP).current.level;

        set({
          xp: newXP,
          totalXPEarned: state.totalXPEarned + amount,
        });

        return {
          leveledUp: newLevel > oldLevel,
          newLevel,
        };
      },

      incrementOutfitsCreated: () =>
        set((state) => ({ outfitsCreated: state.outfitsCreated + 1 })),

      incrementTexturesApplied: () =>
        set((state) => ({ texturesApplied: state.texturesApplied + 1 })),

      incrementScreenshotsTaken: () =>
        set((state) => ({ screenshotsTaken: state.screenshotsTaken + 1 })),

      incrementChallengesCompleted: () =>
        set((state) => ({ challengesCompleted: state.challengesCompleted + 1 })),

      getLevelInfo: () => getLevelInfo(get().xp),
      getCurrentLevel: () => getLevelInfo(get().xp).current.level,
      getCurrentTitle: () => getLevelInfo(get().xp).current.title,
    }),
    {
      name: 'stylespace-progress',
    }
  )
);

export default useProgressStore;
