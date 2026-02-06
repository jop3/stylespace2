import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  // Sound
  soundEnabled: boolean;
  soundVolume: number;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  toggleSound: () => void;

  // Music
  musicEnabled: boolean;
  musicVolume: number;
  setMusicEnabled: (enabled: boolean) => void;
  setMusicVolume: (volume: number) => void;
  toggleMusic: () => void;

  // Visual effects
  celebrationsEnabled: boolean;
  setCelebrationsEnabled: (enabled: boolean) => void;

  // Accessibility
  reduceMotion: boolean;
  setReduceMotion: (reduce: boolean) => void;

  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;

  // Display
  showHints: boolean;
  setShowHints: (show: boolean) => void;

  // First-time user
  hasSeenTutorial: boolean;
  setHasSeenTutorial: (seen: boolean) => void;

  hasSeenWelcome: boolean;
  setHasSeenWelcome: (seen: boolean) => void;

  // Reset
  resetSettings: () => void;
}

const defaultSettings = {
  soundEnabled: true,
  soundVolume: 0.7,
  musicEnabled: true,
  musicVolume: 0.5,
  celebrationsEnabled: true,
  reduceMotion: false,
  highContrast: false,
  showHints: true,
  hasSeenTutorial: false,
  hasSeenWelcome: false,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      // Sound
      soundEnabled: defaultSettings.soundEnabled,
      soundVolume: defaultSettings.soundVolume,
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setSoundVolume: (volume) => set({ soundVolume: Math.max(0, Math.min(1, volume)) }),
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      // Music
      musicEnabled: defaultSettings.musicEnabled,
      musicVolume: defaultSettings.musicVolume,
      setMusicEnabled: (enabled) => set({ musicEnabled: enabled }),
      setMusicVolume: (volume) => set({ musicVolume: Math.max(0, Math.min(1, volume)) }),
      toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),

      // Visual effects
      celebrationsEnabled: defaultSettings.celebrationsEnabled,
      setCelebrationsEnabled: (enabled) => set({ celebrationsEnabled: enabled }),

      // Accessibility
      reduceMotion: defaultSettings.reduceMotion,
      setReduceMotion: (reduce) => set({ reduceMotion: reduce }),

      highContrast: defaultSettings.highContrast,
      setHighContrast: (enabled) => set({ highContrast: enabled }),

      // Display
      showHints: defaultSettings.showHints,
      setShowHints: (show) => set({ showHints: show }),

      // First-time user
      hasSeenTutorial: defaultSettings.hasSeenTutorial,
      setHasSeenTutorial: (seen) => set({ hasSeenTutorial: seen }),

      hasSeenWelcome: defaultSettings.hasSeenWelcome,
      setHasSeenWelcome: (seen) => set({ hasSeenWelcome: seen }),

      // Reset
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'stylespace-settings',
    }
  )
);

export default useSettingsStore;
