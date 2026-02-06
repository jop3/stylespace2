import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { achievements, type Achievement, type AchievementTier } from '../data/achievements';

interface AchievementProgress {
  progress: number;
  unlockedTiers: AchievementTier[];
  claimedTiers: AchievementTier[];
}

interface AchievementState {
  // Progress for each achievement
  achievementProgress: Map<string, AchievementProgress>;

  // Actions
  incrementProgress: (achievementId: string, amount?: number) => void;
  setProgress: (achievementId: string, value: number) => void;
  claimTier: (achievementId: string, tier: AchievementTier) => number; // Returns stars earned

  // Getters
  getProgress: (achievementId: string) => AchievementProgress;
  getUnclaimedCount: () => number;
  hasUnclaimedRewards: () => boolean;
  getAllProgress: () => Array<{
    achievement: Achievement;
    progress: AchievementProgress;
    nextTier: AchievementTier | null;
    nextTierRequirement: number;
    canClaim: boolean;
  }>;
}

const defaultProgress: AchievementProgress = {
  progress: 0,
  unlockedTiers: [],
  claimedTiers: [],
};

function checkUnlockedTiers(achievement: Achievement, progress: number): AchievementTier[] {
  return achievement.tiers
    .filter((t) => progress >= t.requirement)
    .map((t) => t.tier);
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      achievementProgress: new Map(),

      incrementProgress: (achievementId, amount = 1) =>
        set((state) => {
          const achievement = achievements.find((a) => a.id === achievementId);
          if (!achievement) return state;

          const current = state.achievementProgress.get(achievementId) || { ...defaultProgress };
          const newProgress = current.progress + amount;
          const unlockedTiers = checkUnlockedTiers(achievement, newProgress);

          const newMap = new Map(state.achievementProgress);
          newMap.set(achievementId, {
            ...current,
            progress: newProgress,
            unlockedTiers,
          });

          return { achievementProgress: newMap };
        }),

      setProgress: (achievementId, value) =>
        set((state) => {
          const achievement = achievements.find((a) => a.id === achievementId);
          if (!achievement) return state;

          const current = state.achievementProgress.get(achievementId) || { ...defaultProgress };
          const unlockedTiers = checkUnlockedTiers(achievement, value);

          const newMap = new Map(state.achievementProgress);
          newMap.set(achievementId, {
            ...current,
            progress: value,
            unlockedTiers,
          });

          return { achievementProgress: newMap };
        }),

      claimTier: (achievementId, tier) => {
        const state = get();
        const achievement = achievements.find((a) => a.id === achievementId);
        if (!achievement) return 0;

        const current = state.achievementProgress.get(achievementId);
        if (!current) return 0;

        // Check if tier is unlocked and not claimed
        if (!current.unlockedTiers.includes(tier) || current.claimedTiers.includes(tier)) {
          return 0;
        }

        const tierConfig = achievement.tiers.find((t) => t.tier === tier);
        if (!tierConfig) return 0;

        set((state) => {
          const newMap = new Map(state.achievementProgress);
          const progress = newMap.get(achievementId)!;
          newMap.set(achievementId, {
            ...progress,
            claimedTiers: [...progress.claimedTiers, tier],
          });
          return { achievementProgress: newMap };
        });

        return tierConfig.rewardStars;
      },

      getProgress: (achievementId) => {
        return get().achievementProgress.get(achievementId) || { ...defaultProgress };
      },

      getUnclaimedCount: () => {
        const state = get();
        let count = 0;

        for (const [achievementId, progress] of state.achievementProgress) {
          const unclaimedTiers = progress.unlockedTiers.filter(
            (tier) => !progress.claimedTiers.includes(tier)
          );
          count += unclaimedTiers.length;
        }

        return count;
      },

      hasUnclaimedRewards: () => get().getUnclaimedCount() > 0,

      getAllProgress: () => {
        const state = get();
        return achievements.map((achievement) => {
          const progress = state.achievementProgress.get(achievement.id) || { ...defaultProgress };

          // Find next tier to unlock
          const nextTierConfig = achievement.tiers.find(
            (t) => !progress.unlockedTiers.includes(t.tier)
          );

          // Check if can claim any rewards
          const canClaim = progress.unlockedTiers.some(
            (tier) => !progress.claimedTiers.includes(tier)
          );

          return {
            achievement,
            progress,
            nextTier: nextTierConfig?.tier || null,
            nextTierRequirement: nextTierConfig?.requirement || 0,
            canClaim,
          };
        });
      },
    }),
    {
      name: 'stylespace-achievements',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              achievementProgress: new Map(parsed.state.achievementProgress || []),
            },
          };
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              achievementProgress: Array.from(value.state.achievementProgress?.entries() || []),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useAchievementStore;
