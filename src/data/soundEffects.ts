/**
 * Sound effect definitions for StyleSpace
 * Simple, satisfying audio feedback for kid-friendly interactions
 */

export type SoundName =
  | 'click'
  | 'success'
  | 'error'
  | 'achievement'
  | 'levelUp'
  | 'reward'
  | 'equip'
  | 'unequip'
  | 'favorite'
  | 'unfavorite'
  | 'screenshot'
  | 'whoosh'
  | 'pop'
  | 'sparkle'
  | 'coin';

interface SoundDefinition {
  url: string;
  volume: number;
  preload?: boolean;
}

/**
 * Sound definitions with relative URLs and default volumes
 * In production, replace with actual audio file URLs
 */
export const soundDefinitions: Record<SoundName, SoundDefinition> = {
  click: {
    url: '/sounds/click.mp3',
    volume: 0.5,
    preload: true,
  },
  success: {
    url: '/sounds/success.mp3',
    volume: 0.6,
    preload: true,
  },
  error: {
    url: '/sounds/error.mp3',
    volume: 0.4,
  },
  achievement: {
    url: '/sounds/achievement.mp3',
    volume: 0.7,
  },
  levelUp: {
    url: '/sounds/level-up.mp3',
    volume: 0.8,
  },
  reward: {
    url: '/sounds/reward.mp3',
    volume: 0.6,
  },
  equip: {
    url: '/sounds/equip.mp3',
    volume: 0.5,
    preload: true,
  },
  unequip: {
    url: '/sounds/unequip.mp3',
    volume: 0.4,
  },
  favorite: {
    url: '/sounds/favorite.mp3',
    volume: 0.5,
  },
  unfavorite: {
    url: '/sounds/unfavorite.mp3',
    volume: 0.3,
  },
  screenshot: {
    url: '/sounds/screenshot.mp3',
    volume: 0.6,
  },
  whoosh: {
    url: '/sounds/whoosh.mp3',
    volume: 0.4,
  },
  pop: {
    url: '/sounds/pop.mp3',
    volume: 0.5,
    preload: true,
  },
  sparkle: {
    url: '/sounds/sparkle.mp3',
    volume: 0.5,
  },
  coin: {
    url: '/sounds/coin.mp3',
    volume: 0.5,
  },
};

export default soundDefinitions;
