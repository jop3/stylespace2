import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ClothingItem } from '../components/wardrobe/ClothingCard';
import type { ClothingCategory } from '../components/wardrobe/CategoryTabs';

interface WardrobeState {
  // All available clothing items
  items: ClothingItem[];

  // Currently selected items (one per category max)
  equippedItems: Map<ClothingCategory, string>;

  // Actions
  setItems: (items: ClothingItem[]) => void;
  addItem: (item: ClothingItem) => void;
  removeItem: (itemId: string) => void;

  // Equip/unequip
  equipItem: (category: ClothingCategory, itemId: string) => void;
  unequipItem: (category: ClothingCategory) => void;
  unequipAll: () => void;

  // Getters
  getItemById: (itemId: string) => ClothingItem | undefined;
  getItemsByCategory: (category: ClothingCategory) => ClothingItem[];
  getEquippedItem: (category: ClothingCategory) => ClothingItem | undefined;
  getAllEquippedItems: () => ClothingItem[];

  // Item counts
  getCategoryCounts: () => Record<ClothingCategory, number>;
}

export const useWardrobeStore = create<WardrobeState>()(
  persist(
    (set, get) => ({
      items: [],
      equippedItems: new Map(),

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => ({
          items: [...state.items, item],
        })),

      removeItem: (itemId) =>
        set((state) => {
          // Also unequip if equipped
          const newEquipped = new Map(state.equippedItems);
          for (const [category, id] of newEquipped.entries()) {
            if (id === itemId) {
              newEquipped.delete(category);
            }
          }
          return {
            items: state.items.filter((i) => i.id !== itemId),
            equippedItems: newEquipped,
          };
        }),

      equipItem: (category, itemId) =>
        set((state) => {
          const newEquipped = new Map(state.equippedItems);

          // Handle dress special case - removes tops and bottoms
          if (category === 'dresses') {
            newEquipped.delete('tops');
            newEquipped.delete('bottoms');
          }
          // Tops or bottoms removes dress
          else if (category === 'tops' || category === 'bottoms') {
            newEquipped.delete('dresses');
          }

          newEquipped.set(category, itemId);
          return { equippedItems: newEquipped };
        }),

      unequipItem: (category) =>
        set((state) => {
          const newEquipped = new Map(state.equippedItems);
          newEquipped.delete(category);
          return { equippedItems: newEquipped };
        }),

      unequipAll: () => set({ equippedItems: new Map() }),

      getItemById: (itemId) => get().items.find((i) => i.id === itemId),

      getItemsByCategory: (category) =>
        get().items.filter((i) => i.category === category),

      getEquippedItem: (category) => {
        const itemId = get().equippedItems.get(category);
        if (!itemId) return undefined;
        return get().items.find((i) => i.id === itemId);
      },

      getAllEquippedItems: () => {
        const state = get();
        const items: ClothingItem[] = [];
        for (const itemId of state.equippedItems.values()) {
          const item = state.items.find((i) => i.id === itemId);
          if (item) items.push(item);
        }
        return items;
      },

      getCategoryCounts: () => {
        const items = get().items;
        const counts: Record<ClothingCategory, number> = {
          tops: 0,
          bottoms: 0,
          dresses: 0,
          shoes: 0,
          accessories: 0,
          hair: 0,
        };
        for (const item of items) {
          counts[item.category]++;
        }
        return counts;
      },
    }),
    {
      name: 'stylespace-wardrobe',
      // Convert Map to array for storage
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const parsed = JSON.parse(str);
          return {
            ...parsed,
            state: {
              ...parsed.state,
              equippedItems: new Map(parsed.state.equippedItems || []),
            },
          };
        },
        setItem: (name, value) => {
          const toStore = {
            ...value,
            state: {
              ...value.state,
              equippedItems: Array.from(value.state.equippedItems?.entries() || []),
            },
          };
          localStorage.setItem(name, JSON.stringify(toStore));
        },
        removeItem: (name) => localStorage.removeItem(name),
      },
    }
  )
);

export default useWardrobeStore;
