import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AvatarCustomization {
  // Skin tone
  skinTone: string;
  // Hair color (if supported by model)
  hairColor: string;
  // Eye color (if supported by model)
  eyeColor: string;
  // Scale/height
  scale: number;
}

interface AvatarCustomizationStore {
  customization: AvatarCustomization;

  // Actions
  setSkinTone: (color: string) => void;
  setHairColor: (color: string) => void;
  setEyeColor: (color: string) => void;
  setScale: (scale: number) => void;
  resetCustomization: () => void;
}

const defaultCustomization: AvatarCustomization = {
  skinTone: '#F5D0C5', // Light warm
  hairColor: '#3D2314', // Dark brown
  eyeColor: '#6B4423', // Brown
  scale: 1.0
};

// Skin tone presets
export const SKIN_TONES = [
  { id: 'fair-light', name: 'Fair Light', color: '#FDEEE0' },
  { id: 'fair', name: 'Fair', color: '#F5D0C5' },
  { id: 'light', name: 'Light', color: '#E8BEAC' },
  { id: 'medium-light', name: 'Medium Light', color: '#D4A78C' },
  { id: 'medium', name: 'Medium', color: '#C68863' },
  { id: 'medium-dark', name: 'Medium Dark', color: '#A56B43' },
  { id: 'dark', name: 'Dark', color: '#8B5A2B' },
  { id: 'deep', name: 'Deep', color: '#5C3317' }
];

// Hair color presets
export const HAIR_COLORS = [
  { id: 'black', name: 'Black', color: '#1C1C1C' },
  { id: 'dark-brown', name: 'Dark Brown', color: '#3D2314' },
  { id: 'brown', name: 'Brown', color: '#6B4423' },
  { id: 'light-brown', name: 'Light Brown', color: '#A67B5B' },
  { id: 'blonde', name: 'Blonde', color: '#E6C36A' },
  { id: 'platinum', name: 'Platinum', color: '#E8E4C9' },
  { id: 'ginger', name: 'Ginger', color: '#B55239' },
  { id: 'red', name: 'Red', color: '#922B21' },
  { id: 'pink', name: 'Pink', color: '#FF91A4' },
  { id: 'purple', name: 'Purple', color: '#9B59B6' },
  { id: 'blue', name: 'Blue', color: '#5DADE2' },
  { id: 'green', name: 'Green', color: '#58D68D' }
];

// Eye color presets
export const EYE_COLORS = [
  { id: 'brown', name: 'Brown', color: '#6B4423' },
  { id: 'dark-brown', name: 'Dark Brown', color: '#3D2314' },
  { id: 'hazel', name: 'Hazel', color: '#8E7618' },
  { id: 'amber', name: 'Amber', color: '#C17F35' },
  { id: 'green', name: 'Green', color: '#4A7023' },
  { id: 'blue-green', name: 'Blue-Green', color: '#2E8B8B' },
  { id: 'blue', name: 'Blue', color: '#4A90D9' },
  { id: 'gray', name: 'Gray', color: '#7C8A9A' },
  { id: 'violet', name: 'Violet', color: '#7B68EE' },
  { id: 'pink', name: 'Pink', color: '#FF69B4' }
];

export const useAvatarCustomizationStore = create<AvatarCustomizationStore>()(
  persist(
    (set) => ({
      customization: defaultCustomization,

      setSkinTone: (color) =>
        set((state) => ({
          customization: { ...state.customization, skinTone: color }
        })),

      setHairColor: (color) =>
        set((state) => ({
          customization: { ...state.customization, hairColor: color }
        })),

      setEyeColor: (color) =>
        set((state) => ({
          customization: { ...state.customization, eyeColor: color }
        })),

      setScale: (scale) =>
        set((state) => ({
          customization: { ...state.customization, scale }
        })),

      resetCustomization: () => set({ customization: defaultCustomization })
    }),
    {
      name: 'stylespace-avatar-customization'
    }
  )
);
