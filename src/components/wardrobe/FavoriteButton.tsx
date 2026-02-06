import React, { useState } from 'react';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onToggle: () => void;
  size?: 'sm' | 'md' | 'lg';
  showAnimation?: boolean;
}

const sizes = {
  sm: { button: 'w-8 h-8', icon: 16 },
  md: { button: 'w-10 h-10', icon: 20 },
  lg: { button: 'w-12 h-12', icon: 24 },
};

/**
 * Animated heart favorite button
 * Includes pop animation when toggled
 */
export function FavoriteButton({
  isFavorite,
  onToggle,
  size = 'md',
  showAnimation = true,
}: FavoriteButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (showAnimation && !isFavorite) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 300);
    }
    onToggle();
  };

  const { button, icon } = sizes[size];

  return (
    <button
      onClick={handleClick}
      className={`
        ${button}
        flex items-center justify-center
        rounded-full bg-white/90 backdrop-blur-sm
        shadow-kid
        transition-all duration-normal
        hover:scale-110 active:scale-90
        ${isAnimating ? 'animate-heart-pop' : ''}
      `}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      aria-pressed={isFavorite}
    >
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 24 24"
        fill={isFavorite ? '#FF6B9D' : 'none'}
        stroke={isFavorite ? '#FF6B9D' : '#9CA3AF'}
        strokeWidth="2"
        className="transition-all duration-normal"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>

      {/* Floating hearts animation */}
      {isAnimating && (
        <div className="absolute pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <span
              key={i}
              className="absolute animate-heart-float"
              style={{
                left: `${-10 + i * 10}px`,
                animationDelay: `${i * 100}ms`,
              }}
            >
              <svg
                width={12}
                height={12}
                viewBox="0 0 24 24"
                fill="#FF6B9D"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </span>
          ))}
        </div>
      )}
    </button>
  );
}

export default FavoriteButton;
