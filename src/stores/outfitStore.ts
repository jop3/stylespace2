import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClothingCategory } from '../components/wardrobe/CategoryTabs';

export interface SavedOutfit {
  id: string;
  name: string;
  thumbnailUrl: string | null;
  equippedItems: Record<ClothingCategory, string | null>;
  backgroundColor: string;
  createdAt: number;
  isFavorite: boolean;
}

interface OutfitState {
  // Saved outfits
  outfits: SavedOutfit[];

  // Actions
  saveOutfit: (outfit: Omit<SavedOutfit, 'id' | 'createdAt'>) => string;
  deleteOutfit: (outfitId: string) => void;
  updateOutfit: (outfitId: string, updates: Partial<SavedOutfit>) => void;
  toggleOutfitFavorite: (outfitId: string) => void;

  // Getters
  getOutfitById: (outfitId: string) => SavedOutfit | undefined;
  getFavoriteOutfits: () => SavedOutfit[];
  getRecentOutfits: (limit?: number) => SavedOutfit[];
}

let outfitIdCounter = 0;

export const useOutfitStore = create<OutfitState>()(
  persist(
    (set, get) => ({
      outfits: [],

      saveOutfit: (outfit) => {
        const id = `outfit-${Date.now()}-${++outfitIdCounter}`;
        const newOutfit: SavedOutfit = {
          ...outfit,
          id,
          createdAt: Date.now(),
        };

        set((state) => ({
          outfits: [newOutfit, ...state.outfits],
        }));

        return id;
      },

      deleteOutfit: (outfitId) =>
        set((state) => ({
          outfits: state.outfits.filter((o) => o.id !== outfitId),
        })),

      updateOutfit: (outfitId, updates) =>
        set((state) => ({
          outfits: state.outfits.map((o) =>
            o.id === outfitId ? { ...o, ...updates } : o
          ),
        })),

      toggleOutfitFavorite: (outfitId) =>
        set((state) => ({
          outfits: state.outfits.map((o) =>
            o.id === outfitId ? { ...o, isFavorite: !o.isFavorite } : o
          ),
        })),

      getOutfitById: (outfitId) => get().outfits.find((o) => o.id === outfitId),

      getFavoriteOutfits: () => get().outfits.filter((o) => o.isFavorite),

      getRecentOutfits: (limit = 10) =>
        get()
          .outfits.sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, limit),
    }),
    {
      name: 'stylespace-outfits',
    }
  )
);

export default useOutfitStore;
