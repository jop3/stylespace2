import React from 'react';

export type NavIconType = 'closet' | 'sparkle' | 'star' | 'heart';

interface NavIconProps {
  type: NavIconType;
  size?: number;
  className?: string;
}

/**
 * Kid-friendly navigation icons
 * Simple, recognizable SVG icons with thick strokes
 */
export function NavIcon({ type, size = 24, className = '' }: NavIconProps) {
  const iconProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className,
  };

  switch (type) {
    case 'closet':
      // Wardrobe/Closet icon - simplified cabinet with hanger
      return (
        <svg {...iconProps}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="12" y1="3" x2="12" y2="21" />
          <path d="M8 8l2-2 2 2" />
          <line x1="10" y1="6" x2="10" y2="10" />
        </svg>
      );

    case 'sparkle':
      // Sparkle/Magic wand icon - dress up
      return (
        <svg {...iconProps}>
          <path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" fill="currentColor" />
          <circle cx="19" cy="5" r="1.5" fill="currentColor" />
          <circle cx="5" cy="19" r="1.5" fill="currentColor" />
          <circle cx="20" cy="17" r="1" fill="currentColor" />
        </svg>
      );

    case 'star':
      // Star icon - play/challenges
      return (
        <svg {...iconProps}>
          <polygon
            points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
            fill="currentColor"
          />
        </svg>
      );

    case 'heart':
      // Heart icon - favorites/gallery
      return (
        <svg {...iconProps}>
          <path
            d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            fill="currentColor"
          />
        </svg>
      );

    default:
      return null;
  }
}

export default NavIcon;
