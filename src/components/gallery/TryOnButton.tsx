import React from 'react';

interface TryOnButtonProps {
  onClick: () => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
}

const sizeClasses = {
  sm: 'py-1.5 px-3 text-kid-xs',
  md: 'py-2 px-4 text-kid-sm',
  lg: 'py-3 px-6 text-kid-base'
};

/**
 * Button to try on a shared outfit
 */
export function TryOnButton({
  onClick,
  disabled = false,
  size = 'md',
  variant = 'primary'
}: TryOnButtonProps) {
  const baseClasses = sizeClasses[size];

  const variantClasses = variant === 'primary'
    ? 'bg-gradient-magic text-white shadow-glow-purple hover:opacity-90'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center gap-1.5 rounded-kid font-bold transition-all
        ${baseClasses}
        ${variantClasses}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <span>👗</span>
      <span>Try On</span>
    </button>
  );
}

export default TryOnButton;
