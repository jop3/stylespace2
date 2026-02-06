import React from 'react';
import { useProgressStore } from '../../stores/progressStore';

interface LevelBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showTitle?: boolean;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-kid-xs',
  md: 'w-12 h-12 text-kid-sm',
  lg: 'w-16 h-16 text-kid-lg',
};

/**
 * Player level badge
 * Shows current level number with styled background
 */
export function LevelBadge({ size = 'md', showTitle = false }: LevelBadgeProps) {
  const { getLevelInfo } = useProgressStore();
  const { current } = getLevelInfo();

  return (
    <div className="flex items-center gap-2">
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full bg-gradient-magic
          flex items-center justify-center
          font-bold text-white shadow-glow-purple
        `}
      >
        {current.level}
      </div>
      {showTitle && (
        <div>
          <p className="text-kid-sm font-bold text-gray-800">{current.title}</p>
          <p className="text-kid-xs text-gray-500">Level {current.level}</p>
        </div>
      )}
    </div>
  );
}

export default LevelBadge;
