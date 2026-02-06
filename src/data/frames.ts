/**
 * Photo frames for photo booth
 */

export interface Frame {
  id: string;
  name: string;
  emoji: string;
  // Frame styling
  borderWidth: number;
  borderStyle: string;
  borderColor: string;
  borderRadius: number;
  padding: number;
  // Optional decorations
  shadow?: string;
  gradient?: string;
}

export const FRAMES: Frame[] = [
  {
    id: 'none',
    name: 'None',
    emoji: '❌',
    borderWidth: 0,
    borderStyle: 'none',
    borderColor: 'transparent',
    borderRadius: 0,
    padding: 0
  },
  {
    id: 'simple-white',
    name: 'Simple White',
    emoji: '⬜',
    borderWidth: 16,
    borderStyle: 'solid',
    borderColor: '#ffffff',
    borderRadius: 8,
    padding: 8,
    shadow: '0 4px 20px rgba(0,0,0,0.2)'
  },
  {
    id: 'polaroid',
    name: 'Polaroid',
    emoji: '📸',
    borderWidth: 12,
    borderStyle: 'solid',
    borderColor: '#ffffff',
    borderRadius: 4,
    padding: 40, // Extra padding at bottom for polaroid look
    shadow: '0 4px 15px rgba(0,0,0,0.25)'
  },
  {
    id: 'gold',
    name: 'Gold Frame',
    emoji: '🏆',
    borderWidth: 12,
    borderStyle: 'double',
    borderColor: '#D4AF37',
    borderRadius: 4,
    padding: 4,
    shadow: '0 2px 10px rgba(212,175,55,0.5), inset 0 0 20px rgba(212,175,55,0.2)'
  },
  {
    id: 'pink-hearts',
    name: 'Pink Hearts',
    emoji: '💕',
    borderWidth: 16,
    borderStyle: 'solid',
    borderColor: '#FF6B9D',
    borderRadius: 24,
    padding: 8,
    shadow: '0 0 15px rgba(255,107,157,0.5)'
  },
  {
    id: 'rainbow',
    name: 'Rainbow',
    emoji: '🌈',
    borderWidth: 8,
    borderStyle: 'solid',
    borderColor: '#FF6B6B',
    borderRadius: 16,
    padding: 8,
    gradient: 'linear-gradient(90deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #7B68EE, #FF6B9D)'
  },
  {
    id: 'sparkle',
    name: 'Sparkle',
    emoji: '✨',
    borderWidth: 4,
    borderStyle: 'solid',
    borderColor: '#7C3AED',
    borderRadius: 20,
    padding: 12,
    shadow: '0 0 30px rgba(124,58,237,0.5), 0 0 60px rgba(124,58,237,0.3)'
  },
  {
    id: 'vintage',
    name: 'Vintage',
    emoji: '📜',
    borderWidth: 12,
    borderStyle: 'ridge',
    borderColor: '#8B4513',
    borderRadius: 8,
    padding: 8,
    shadow: '0 4px 15px rgba(0,0,0,0.3)'
  },
  {
    id: 'neon',
    name: 'Neon',
    emoji: '💜',
    borderWidth: 4,
    borderStyle: 'solid',
    borderColor: '#FF00FF',
    borderRadius: 12,
    padding: 8,
    shadow: '0 0 10px #FF00FF, 0 0 20px #FF00FF, 0 0 30px #FF00FF'
  },
  {
    id: 'cloud',
    name: 'Cloud',
    emoji: '☁️',
    borderWidth: 20,
    borderStyle: 'solid',
    borderColor: '#F0F8FF',
    borderRadius: 40,
    padding: 12,
    shadow: '0 8px 30px rgba(0,0,0,0.1)'
  }
];

export function getFrameById(id: string): Frame | undefined {
  return FRAMES.find((f) => f.id === id);
}

/**
 * Generate CSS styles for a frame
 */
export function getFrameStyles(frame: Frame): React.CSSProperties {
  const styles: React.CSSProperties = {
    border: `${frame.borderWidth}px ${frame.borderStyle} ${frame.borderColor}`,
    borderRadius: frame.borderRadius,
    padding: frame.padding,
    boxShadow: frame.shadow
  };

  if (frame.gradient) {
    styles.borderImage = `${frame.gradient} 1`;
  }

  return styles;
}
