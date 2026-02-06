import React from 'react';

type Direction = 'left' | 'right';

interface RotateButtonProps {
  direction: Direction;
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
};

const iconSizes = {
  sm: 24,
  md: 28,
  lg: 32,
};

/**
 * Large rotation button for kid-friendly 3D control
 * Simple left/right arrows for rotating the avatar
 */
export function RotateButton({
  direction,
  onClick,
  disabled = false,
  size = 'md',
}: RotateButtonProps) {
  const iconSize = iconSizes[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={`Rotate ${direction}`}
      className={`
        ${sizeClasses[size]}
        inline-flex items-center justify-center
        bg-white/90 backdrop-blur-sm
        rounded-full shadow-kid
        border-2 border-gray-200
        text-gray-600
        transition-all duration-normal
        hover:bg-white hover:border-primary hover:text-primary hover:shadow-glow-pink
        active:scale-90
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={direction === 'left' ? '' : 'rotate-180'}
      >
        {/* Curved rotation arrow */}
        <path d="M3 12a9 9 0 1 0 9-9" />
        <polyline points="3 3 3 12 12 12" transform={direction === 'left' ? '' : 'scale(-1, 1) translate(-24, 0)'} />
      </svg>
    </button>
  );
}

export default RotateButton;
