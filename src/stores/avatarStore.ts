import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VRM } from '@pixiv/three-vrm';

interface EquippedItem {
  id: string;
  meshName: string;
  textureUrl: string;
  appliedAt: number;
}

interface AvatarCustomization {
  skinTone: string;
  hairColor: string;
  eyeColor: string;
}

interface AvatarState {
  // VRM Model
  vrmUrl: string | null;
  vrmFileName: string | null;
  currentVRM: VRM | null;

  // Actions for VRM
  setVRM: (url: string | null, fileName: string | null) => void;
  setCurrentVRM: (vrm: VRM | null) => void;
  clearVRM: () => void;

  // Equipped items (textures applied to meshes)
  equippedItems: EquippedItem[];
  equipItem: (item: Omit<EquippedItem, 'appliedAt'>) => void;
  unequipItem: (meshName: string) => void;
  clearEquipped: () => void;

  // Avatar customization (persisted)
  customization: AvatarCustomization;
  setCustomization: (customization: Partial<AvatarCustomization>) => void;

  // Background
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;

  // Pose
  currentPose: string | null;
  setCurrentPose: (pose: string | null) => void;

  // Animation
  currentAnimation: string | null;
  setCurrentAnimation: (animation: string | null) => void;
}

// Default customization values
const defaultCustomization: AvatarCustomization = {
  skinTone: '#f5d0c5',
  hairColor: '#3d2314',
  eyeColor: '#5c3317',
};

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      // VRM Model (not persisted - blob URLs don't survive refresh)
      vrmUrl: null,
      vrmFileName: null,
      currentVRM: null,

      setVRM: (url, fileName) =>
        set({
          vrmUrl: url,
          vrmFileName: fileName,
          equippedItems: [], // Clear equipped items when changing model
        }),

      setCurrentVRM: (vrm) => set({ currentVRM: vrm }),

      clearVRM: () =>
        set({
          vrmUrl: null,
          vrmFileName: null,
          currentVRM: null,
          equippedItems: [],
        }),

      // Equipped items
      equippedItems: [],

      equipItem: (item) =>
        set((state) => {
          // Remove existing item on same mesh
          const filtered = state.equippedItems.filter(
            (i) => i.meshName !== item.meshName
          );
          return {
            equippedItems: [
              ...filtered,
              { ...item, appliedAt: Date.now() },
            ],
          };
        }),

      unequipItem: (meshName) =>
        set((state) => ({
          equippedItems: state.equippedItems.filter(
            (i) => i.meshName !== meshName
          ),
        })),

      clearEquipped: () => set({ equippedItems: [] }),

      // Customization (persisted)
      customization: defaultCustomization,
      setCustomization: (partial) =>
        set((state) => ({
          customization: { ...state.customization, ...partial },
        })),

      // Background
      backgroundColor: '#FFF8F0',
      setBackgroundColor: (color) => set({ backgroundColor: color }),

      // Pose
      currentPose: null,
      setCurrentPose: (pose) => set({ currentPose: pose }),

      // Animation
      currentAnimation: null,
      setCurrentAnimation: (animation) => set({ currentAnimation: animation }),
    }),
    {
      name: 'stylespace-avatar',
      // Only persist customization and background color
      partialize: (state) => ({
        customization: state.customization,
        backgroundColor: state.backgroundColor,
      }),
    }
  )
);

export default useAvatarStore;
