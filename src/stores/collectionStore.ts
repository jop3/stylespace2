import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { collections, getCollectionProgress, isCollectionComplete } from '../data/collections';

interface CollectionState {
  // Completed collection IDs
  completedCollections: Set<string>;

  // Claimed rewards (collection IDs where reward was claimed)
  claimedRewards: Set<string>;

  // Actions
  markCompleted: (collectionId: string) => void;
  claimReward: (collectionId: string) => number; // Returns stars earned
  hasClaimedReward: (collectionId: string) => boolean;

  // Progress tracking
  getProgress: (collectionId: string, ownedItemIds: string[]) => {
    owned: number;
    total: number;
    percentage: number;
    isComplete: boolean;
    canClaimReward: boolean;
  };

  // Get all collections with progress
  getAllProgress: (ownedItemIds: string[]) => Array<{
    collection: typeof collections[0];
    progress: {
      owned: number;
      total: number;
      percentage: number;
      isComplete: boolean;
      canClaimReward: boolean;
    };
  }>;
}

export const useCollectionStore = create<CollectionState>()(
  persist(
    (set, get) => ({
      completedCollections: new Set(),
      claimedRewards: new Set(),

      markCompleted: (collectionId) =>
        set((state) => ({
          completedCollections: new Set([...state.completedCollections, collectionId]),
        })),

      claimReward: (collectionId) => {
        const state = get();
        const collection = collections.find((c) => c.id === collectionId);

        if (!collection || state.claimedRewards.has(collectionId)) {
          return 0;
        }

        set((state) => ({
          claimedRewards: new Set([...state.claimedRewards, collectionId]),
        }));

        return collection.rewardStars;
      },

      hasClaimedReward: (collectionId) => get().claimedRewards.has(collectionId),

      getProgress: (collectionId, ownedItemIds) => {
        const state = get();
        const progress = getCollectionProgress(collectionId, ownedItemIds);
        const isComplete = isCollectionComplete(collectionId, ownedItemIds);
        const canClaimReward = isComplete && !state.claimedRewards.has(collectionId);

        return {
          ...progress,
          isComplete,
          canClaimReward,
        };
      },

      getAllProgress: (ownedItemIds) => {
        const state = get();
        return collections.map((collection) => {
          const progress = getCollectionProgress(collection.id, ownedItemIds);
          const isComplete = isCollectionComplete(collection.id, ownedItemIds);
          const canClaimReward = isComplete && !state.claimedRewards.has(collection.id);

          return {
            collection,
            progress: {
              ...progress,
              isComplete,
              canClaimReward,
            },
          };
        });
      },
    }),
    {
      name: 'stylespace-collections',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              completedCollections: new Set(parsed.state.completedCollections || []),
              claimedRewards: new Set(parsed.state.claimedRewards || []),
            },
          };
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              completedCollections: Array.from(value.state.completedCollections || []),
              claimedRewards: Array.from(value.state.claimedRewards || []),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useCollectionStore;
