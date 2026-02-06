import React from 'react';
import { useProgressStore } from '../../stores/progressStore';

interface StarCounterProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const sizeClasses = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-3xl',
};

const textSizes = {
  sm: 'text-kid-sm',
  md: 'text-kid-base',
  lg: 'text-kid-lg',
};

/**
 * Star currency display
 */
export function StarCounter({ size = 'md', showLabel = false }: StarCounterProps) {
  const { stars } = useProgressStore();

  return (
    <div className="flex items-center gap-1">
      <span className={sizeClasses[size]} role="img" aria-label="stars">
        ⭐
      </span>
      <span className={`font-bold text-orange ${textSizes[size]}`}>
        {stars.toLocaleString()}
      </span>
      {showLabel && (
        <span className="text-kid-xs text-gray-500">Stars</span>
      )}
    </div>
  );
}

export default StarCounter;
