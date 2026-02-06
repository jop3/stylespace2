import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getDailyChallenge, type Challenge } from '../data/challenges';

interface ChallengeState {
  // Completed challenge IDs with completion date
  completedChallenges: Map<string, number>;

  // Current active challenge progress
  currentChallengeId: string | null;
  currentProgress: Map<string, boolean>; // requirement index -> completed

  // Actions
  startChallenge: (challengeId: string) => void;
  markRequirementComplete: (requirementIndex: number) => void;
  completeChallenge: (challengeId: string) => void;
  resetProgress: () => void;

  // Getters
  isCompleted: (challengeId: string) => boolean;
  isTodayCompleted: (challengeId: string) => boolean;
  getCompletedCount: () => number;
  getTodaysChallenge: () => Challenge;
}

export const useChallengeStore = create<ChallengeState>()(
  persist(
    (set, get) => ({
      completedChallenges: new Map(),
      currentChallengeId: null,
      currentProgress: new Map(),

      startChallenge: (challengeId) =>
        set({
          currentChallengeId: challengeId,
          currentProgress: new Map(),
        }),

      markRequirementComplete: (requirementIndex) =>
        set((state) => {
          const newProgress = new Map(state.currentProgress);
          newProgress.set(String(requirementIndex), true);
          return { currentProgress: newProgress };
        }),

      completeChallenge: (challengeId) =>
        set((state) => {
          const newCompleted = new Map(state.completedChallenges);
          newCompleted.set(challengeId, Date.now());
          return {
            completedChallenges: newCompleted,
            currentChallengeId: null,
            currentProgress: new Map(),
          };
        }),

      resetProgress: () =>
        set({
          currentChallengeId: null,
          currentProgress: new Map(),
        }),

      isCompleted: (challengeId) => get().completedChallenges.has(challengeId),

      isTodayCompleted: (challengeId) => {
        const completedAt = get().completedChallenges.get(challengeId);
        if (!completedAt) return false;

        const today = new Date();
        const completedDate = new Date(completedAt);

        return (
          completedDate.getFullYear() === today.getFullYear() &&
          completedDate.getMonth() === today.getMonth() &&
          completedDate.getDate() === today.getDate()
        );
      },

      getCompletedCount: () => get().completedChallenges.size,

      getTodaysChallenge: () => getDailyChallenge(),
    }),
    {
      name: 'stylespace-challenges',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              completedChallenges: new Map(parsed.state.completedChallenges || []),
              currentProgress: new Map(parsed.state.currentProgress || []),
            },
          };
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              completedChallenges: Array.from(value.state.completedChallenges?.entries() || []),
              currentProgress: Array.from(value.state.currentProgress?.entries() || []),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useChallengeStore;
