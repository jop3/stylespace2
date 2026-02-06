import React from 'react';
import { useProgressStore } from '../../stores/progressStore';

interface XPBarProps {
  showLabels?: boolean;
  compact?: boolean;
}

/**
 * XP progress bar showing progress to next level
 */
export function XPBar({ showLabels = true, compact = false }: XPBarProps) {
  const { xp, getLevelInfo } = useProgressStore();
  const { current, next, progress } = getLevelInfo();

  return (
    <div className={compact ? 'space-y-1' : 'space-y-2'}>
      {showLabels && (
        <div className="flex justify-between items-center">
          <span className="text-kid-sm font-semibold text-gray-700">
            {current.title}
          </span>
          {next && (
            <span className="text-kid-xs text-gray-500">
              {xp} / {next.minXP} XP
            </span>
          )}
        </div>
      )}

      <div className={`bg-gray-200 rounded-full overflow-hidden ${compact ? 'h-2' : 'h-3'}`}>
        <div
          className="h-full bg-gradient-magic rounded-full transition-all duration-slow"
          style={{ width: `${progress}%` }}
        />
      </div>

      {showLabels && next && (
        <p className="text-kid-xs text-gray-500 text-right">
          {next.minXP - xp} XP to <span className="font-semibold">{next.title}</span>
        </p>
      )}
    </div>
  );
}

export default XPBar;
