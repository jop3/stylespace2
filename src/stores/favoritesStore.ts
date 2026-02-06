import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  // Favorite item IDs
  favoriteItemIds: Set<string>;

  // Actions
  addFavorite: (itemId: string) => void;
  removeFavorite: (itemId: string) => void;
  toggleFavorite: (itemId: string) => void;
  isFavorite: (itemId: string) => boolean;
  clearFavorites: () => void;

  // Get all favorite IDs as array
  getFavoriteIds: () => string[];
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favoriteItemIds: new Set<string>(),

      addFavorite: (itemId) =>
        set((state) => ({
          favoriteItemIds: new Set([...state.favoriteItemIds, itemId]),
        })),

      removeFavorite: (itemId) =>
        set((state) => {
          const newSet = new Set(state.favoriteItemIds);
          newSet.delete(itemId);
          return { favoriteItemIds: newSet };
        }),

      toggleFavorite: (itemId) => {
        const state = get();
        if (state.favoriteItemIds.has(itemId)) {
          state.removeFavorite(itemId);
        } else {
          state.addFavorite(itemId);
        }
      },

      isFavorite: (itemId) => get().favoriteItemIds.has(itemId),

      clearFavorites: () => set({ favoriteItemIds: new Set() }),

      getFavoriteIds: () => Array.from(get().favoriteItemIds),
    }),
    {
      name: 'stylespace-favorites',
      // Convert Set to Array for storage
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              favoriteItemIds: new Set(parsed.state.favoriteItemIds || []),
            },
          };
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              favoriteItemIds: Array.from(value.state.favoriteItemIds || []),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useFavoritesStore;
