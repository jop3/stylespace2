/**
 * Photo filters for photo booth
 */

export interface Filter {
  id: string;
  name: string;
  emoji: string;
  css: string; // CSS filter property value
}

export const FILTERS: Filter[] = [
  {
    id: 'none',
    name: 'None',
    emoji: '📷',
    css: 'none'
  },
  {
    id: 'bright',
    name: 'Bright',
    emoji: '☀️',
    css: 'brightness(1.2) contrast(1.1)'
  },
  {
    id: 'warm',
    name: 'Warm',
    emoji: '🌅',
    css: 'sepia(0.3) saturate(1.2)'
  },
  {
    id: 'cool',
    name: 'Cool',
    emoji: '❄️',
    css: 'hue-rotate(-15deg) saturate(1.1)'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    emoji: '📼',
    css: 'sepia(0.5) contrast(1.1) brightness(0.9)'
  },
  {
    id: 'dramatic',
    name: 'Dramatic',
    emoji: '🎭',
    css: 'contrast(1.4) saturate(1.3)'
  },
  {
    id: 'soft',
    name: 'Soft',
    emoji: '🌸',
    css: 'brightness(1.1) contrast(0.9) saturate(0.9)'
  },
  {
    id: 'vivid',
    name: 'Vivid',
    emoji: '🌈',
    css: 'saturate(1.5) brightness(1.05)'
  },
  {
    id: 'noir',
    name: 'Noir',
    emoji: '🖤',
    css: 'grayscale(1) contrast(1.2)'
  },
  {
    id: 'dreamy',
    name: 'Dreamy',
    emoji: '💭',
    css: 'brightness(1.1) blur(0.5px) saturate(1.2)'
  },
  {
    id: 'fairy',
    name: 'Fairy',
    emoji: '🧚',
    css: 'brightness(1.15) hue-rotate(10deg) saturate(1.3)'
  },
  {
    id: 'princess',
    name: 'Princess',
    emoji: '👑',
    css: 'brightness(1.1) saturate(1.2) contrast(1.05) hue-rotate(-5deg)'
  }
];

export function getFilterById(id: string): Filter | undefined {
  return FILTERS.find((f) => f.id === id);
}
