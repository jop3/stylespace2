/**
 * Photo booth backgrounds
 */

export interface Background {
  id: string;
  name: string;
  emoji: string;
  type: 'solid' | 'gradient' | 'pattern' | 'image';
  value: string; // CSS value or image URL
  category: 'basic' | 'nature' | 'fantasy' | 'studio';
}

export const BACKGROUNDS: Background[] = [
  // Basic solid colors
  {
    id: 'white',
    name: 'White',
    emoji: '⬜',
    type: 'solid',
    value: '#ffffff',
    category: 'basic'
  },
  {
    id: 'pink',
    name: 'Pink',
    emoji: '🩷',
    type: 'solid',
    value: '#FFE4EC',
    category: 'basic'
  },
  {
    id: 'purple',
    name: 'Purple',
    emoji: '💜',
    type: 'solid',
    value: '#E9D5FF',
    category: 'basic'
  },
  {
    id: 'mint',
    name: 'Mint',
    emoji: '🌿',
    type: 'solid',
    value: '#D1FAE5',
    category: 'basic'
  },
  {
    id: 'blue',
    name: 'Blue',
    emoji: '💙',
    type: 'solid',
    value: '#DBEAFE',
    category: 'basic'
  },
  {
    id: 'orange',
    name: 'Orange',
    emoji: '🧡',
    type: 'solid',
    value: '#FED7AA',
    category: 'basic'
  },

  // Gradients
  {
    id: 'sunset',
    name: 'Sunset',
    emoji: '🌅',
    type: 'gradient',
    value: 'linear-gradient(180deg, #FF6B9D 0%, #FFB347 50%, #FF6B9D 100%)',
    category: 'nature'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    emoji: '🌊',
    type: 'gradient',
    value: 'linear-gradient(180deg, #87CEEB 0%, #4682B4 100%)',
    category: 'nature'
  },
  {
    id: 'forest',
    name: 'Forest',
    emoji: '🌲',
    type: 'gradient',
    value: 'linear-gradient(180deg, #228B22 0%, #006400 100%)',
    category: 'nature'
  },
  {
    id: 'sky',
    name: 'Sky',
    emoji: '☁️',
    type: 'gradient',
    value: 'linear-gradient(180deg, #87CEEB 0%, #F0F8FF 100%)',
    category: 'nature'
  },

  // Fantasy
  {
    id: 'magic',
    name: 'Magic',
    emoji: '✨',
    type: 'gradient',
    value: 'linear-gradient(135deg, #FF6B9D 0%, #7C3AED 50%, #3B82F6 100%)',
    category: 'fantasy'
  },
  {
    id: 'aurora',
    name: 'Aurora',
    emoji: '🌌',
    type: 'gradient',
    value: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #53d2dc 100%)',
    category: 'fantasy'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    emoji: '🌈',
    type: 'gradient',
    value: 'linear-gradient(180deg, #FF6B6B 0%, #FFD93D 20%, #6BCB77 40%, #4D96FF 60%, #7B68EE 80%, #FF6B9D 100%)',
    category: 'fantasy'
  },
  {
    id: 'galaxy',
    name: 'Galaxy',
    emoji: '🌟',
    type: 'gradient',
    value: 'linear-gradient(180deg, #0d0221 0%, #0d1137 25%, #240046 50%, #3c096c 75%, #5a189a 100%)',
    category: 'fantasy'
  },

  // Studio
  {
    id: 'studio-grey',
    name: 'Studio Grey',
    emoji: '📷',
    type: 'gradient',
    value: 'radial-gradient(circle at 50% 30%, #999999 0%, #555555 100%)',
    category: 'studio'
  },
  {
    id: 'spotlight',
    name: 'Spotlight',
    emoji: '💡',
    type: 'gradient',
    value: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.8) 0%, #1a1a1a 70%)',
    category: 'studio'
  },
  {
    id: 'runway',
    name: 'Runway',
    emoji: '👠',
    type: 'gradient',
    value: 'linear-gradient(180deg, #1a1a1a 0%, #333333 50%, #1a1a1a 100%)',
    category: 'studio'
  }
];

export function getBackgroundsByCategory(category: Background['category']): Background[] {
  return BACKGROUNDS.filter((b) => b.category === category);
}

export function getBackgroundById(id: string): Background | undefined {
  return BACKGROUNDS.find((b) => b.id === id);
}

export function getBackgroundCategories(): Background['category'][] {
  return ['basic', 'nature', 'fantasy', 'studio'];
}

export function getCategoryLabel(category: Background['category']): string {
  const labels: Record<Background['category'], string> = {
    basic: 'Basic Colors',
    nature: 'Nature',
    fantasy: 'Fantasy',
    studio: 'Studio'
  };
  return labels[category];
}
