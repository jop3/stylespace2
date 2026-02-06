import { useCallback, useEffect, useRef, useState } from 'react';
import { soundDefinitions } from '../data/soundEffects';
import type { SoundName } from '../data/soundEffects';

// Storage key for mute preference
const MUTE_STORAGE_KEY = 'stylespace-sound-muted';

// Global audio cache
const audioCache = new Map<string, HTMLAudioElement>();

/**
 * Preload audio files for instant playback
 */
function preloadAudio(url: string): Promise<HTMLAudioElement> {
  return new Promise((resolve, reject) => {
    if (audioCache.has(url)) {
      resolve(audioCache.get(url)!);
      return;
    }

    const audio = new Audio(url);
    audio.preload = 'auto';

    audio.addEventListener('canplaythrough', () => {
      audioCache.set(url, audio);
      resolve(audio);
    });

    audio.addEventListener('error', () => {
      // Silently fail for missing audio files
      console.warn(`Failed to load audio: ${url}`);
      resolve(audio);
    });

    audio.load();
  });
}

interface UseSoundReturn {
  play: (name: SoundName) => void;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
  volume: number;
  setVolume: (volume: number) => void;
}

/**
 * Sound effects hook with mute support
 * Manages audio playback with kid-friendly volume levels
 */
export function useSound(): UseSoundReturn {
  const [muted, setMutedState] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(MUTE_STORAGE_KEY) === 'true';
  });

  const [volume, setVolumeState] = useState(1);
  const lastPlayedRef = useRef<Map<string, number>>(new Map());

  // Preload essential sounds on mount
  useEffect(() => {
    Object.entries(soundDefinitions).forEach(([_, definition]) => {
      if (definition.preload) {
        preloadAudio(definition.url).catch(() => {});
      }
    });
  }, []);

  // Persist mute preference
  const setMuted = useCallback((value: boolean) => {
    setMutedState(value);
    localStorage.setItem(MUTE_STORAGE_KEY, String(value));
  }, []);

  const toggleMute = useCallback(() => {
    setMuted(!muted);
  }, [muted, setMuted]);

  const setVolume = useCallback((value: number) => {
    setVolumeState(Math.max(0, Math.min(1, value)));
  }, []);

  const play = useCallback(
    (name: SoundName) => {
      if (muted) return;

      const definition = soundDefinitions[name];
      if (!definition) {
        console.warn(`Unknown sound: ${name}`);
        return;
      }

      // Debounce rapid plays of the same sound (50ms)
      const now = Date.now();
      const lastPlayed = lastPlayedRef.current.get(name) || 0;
      if (now - lastPlayed < 50) return;
      lastPlayedRef.current.set(name, now);

      // Try to use cached audio, otherwise create new
      const cached = audioCache.get(definition.url);
      if (cached) {
        // Clone for overlapping playback
        const audio = cached.cloneNode() as HTMLAudioElement;
        audio.volume = definition.volume * volume;
        audio.play().catch(() => {});
      } else {
        // Create and play new audio
        const audio = new Audio(definition.url);
        audio.volume = definition.volume * volume;
        audio.play().catch(() => {});

        // Cache for future use
        audioCache.set(definition.url, audio);
      }
    },
    [muted, volume]
  );

  return {
    play,
    muted,
    setMuted,
    toggleMute,
    volume,
    setVolume,
  };
}

/**
 * Global sound instance for use outside of React components
 */
let globalMuted = false;
let globalVolume = 1;

export function playSound(name: SoundName): void {
  if (globalMuted) return;

  const definition = soundDefinitions[name];
  if (!definition) return;

  const cached = audioCache.get(definition.url);
  if (cached) {
    const audio = cached.cloneNode() as HTMLAudioElement;
    audio.volume = definition.volume * globalVolume;
    audio.play().catch(() => {});
  } else {
    const audio = new Audio(definition.url);
    audio.volume = definition.volume * globalVolume;
    audio.play().catch(() => {});
    audioCache.set(definition.url, audio);
  }
}

export function setGlobalMuted(muted: boolean): void {
  globalMuted = muted;
}

export function setGlobalVolume(volume: number): void {
  globalVolume = Math.max(0, Math.min(1, volume));
}

export default useSound;
