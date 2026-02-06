/**
 * Stickers for photo booth
 */

export interface Sticker {
  id: string;
  name: string;
  emoji: string;
  category: 'fun' | 'cute' | 'nature' | 'fashion' | 'celebration';
}

export const STICKERS: Sticker[] = [
  // Fun
  { id: 'star', name: 'Star', emoji: '⭐', category: 'fun' },
  { id: 'sparkles', name: 'Sparkles', emoji: '✨', category: 'fun' },
  { id: 'rainbow', name: 'Rainbow', emoji: '🌈', category: 'fun' },
  { id: 'fire', name: 'Fire', emoji: '🔥', category: 'fun' },
  { id: 'lightning', name: 'Lightning', emoji: '⚡', category: 'fun' },
  { id: 'explosion', name: 'Explosion', emoji: '💥', category: 'fun' },

  // Cute
  { id: 'heart', name: 'Heart', emoji: '❤️', category: 'cute' },
  { id: 'pink-heart', name: 'Pink Heart', emoji: '💕', category: 'cute' },
  { id: 'kiss', name: 'Kiss', emoji: '💋', category: 'cute' },
  { id: 'butterfly', name: 'Butterfly', emoji: '🦋', category: 'cute' },
  { id: 'cat', name: 'Cat', emoji: '😸', category: 'cute' },
  { id: 'bunny', name: 'Bunny', emoji: '🐰', category: 'cute' },
  { id: 'bear', name: 'Bear', emoji: '🧸', category: 'cute' },

  // Nature
  { id: 'flower', name: 'Flower', emoji: '🌸', category: 'nature' },
  { id: 'sunflower', name: 'Sunflower', emoji: '🌻', category: 'nature' },
  { id: 'rose', name: 'Rose', emoji: '🌹', category: 'nature' },
  { id: 'tulip', name: 'Tulip', emoji: '🌷', category: 'nature' },
  { id: 'leaf', name: 'Leaf', emoji: '🍃', category: 'nature' },
  { id: 'sun', name: 'Sun', emoji: '☀️', category: 'nature' },
  { id: 'moon', name: 'Moon', emoji: '🌙', category: 'nature' },
  { id: 'cloud', name: 'Cloud', emoji: '☁️', category: 'nature' },

  // Fashion
  { id: 'crown', name: 'Crown', emoji: '👑', category: 'fashion' },
  { id: 'tiara', name: 'Tiara', emoji: '👸', category: 'fashion' },
  { id: 'sunglasses', name: 'Sunglasses', emoji: '😎', category: 'fashion' },
  { id: 'lipstick', name: 'Lipstick', emoji: '💄', category: 'fashion' },
  { id: 'nail-polish', name: 'Nail Polish', emoji: '💅', category: 'fashion' },
  { id: 'ring', name: 'Ring', emoji: '💍', category: 'fashion' },
  { id: 'gem', name: 'Gem', emoji: '💎', category: 'fashion' },
  { id: 'handbag', name: 'Handbag', emoji: '👜', category: 'fashion' },

  // Celebration
  { id: 'party', name: 'Party', emoji: '🎉', category: 'celebration' },
  { id: 'confetti', name: 'Confetti', emoji: '🎊', category: 'celebration' },
  { id: 'balloon', name: 'Balloon', emoji: '🎈', category: 'celebration' },
  { id: 'gift', name: 'Gift', emoji: '🎁', category: 'celebration' },
  { id: 'cake', name: 'Cake', emoji: '🎂', category: 'celebration' },
  { id: 'trophy', name: 'Trophy', emoji: '🏆', category: 'celebration' },
  { id: 'medal', name: 'Medal', emoji: '🏅', category: 'celebration' }
];

export function getStickersByCategory(category: Sticker['category']): Sticker[] {
  return STICKERS.filter((s) => s.category === category);
}

export function getStickerById(id: string): Sticker | undefined {
  return STICKERS.find((s) => s.id === id);
}

export function getStickerCategories(): Sticker['category'][] {
  return ['fun', 'cute', 'nature', 'fashion', 'celebration'];
}

export function getCategoryLabel(category: Sticker['category']): string {
  const labels: Record<Sticker['category'], string> = {
    fun: 'Fun',
    cute: 'Cute',
    nature: 'Nature',
    fashion: 'Fashion',
    celebration: 'Celebration'
  };
  return labels[category];
}
