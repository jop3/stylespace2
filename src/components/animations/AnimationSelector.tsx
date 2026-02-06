import React from 'react';
import type { VRM } from '@pixiv/three-vrm';
import { IDLE_ANIMATIONS, IdleAnimation } from '../../data/animations';

interface AnimationSelectorProps {
  vrm: VRM | null;
  currentAnimationId: string | null;
  isPlaying: boolean;
  onSelectAnimation: (animation: IdleAnimation) => void;
  onStop: () => void;
  compact?: boolean;
}

/**
 * Animation selector UI component
 */
export function AnimationSelector({
  vrm,
  currentAnimationId,
  isPlaying,
  onSelectAnimation,
  onStop,
  compact = false
}: AnimationSelectorProps) {
  if (!vrm) {
    return (
      <div className="text-center py-4">
        <p className="text-kid-sm text-gray-500">Load an avatar to use animations</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {IDLE_ANIMATIONS.map((animation) => (
          <button
            key={animation.id}
            onClick={() => onSelectAnimation(animation)}
            className={`
              flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-kid transition-all
              ${currentAnimationId === animation.id && isPlaying
                ? 'bg-gradient-magic text-white shadow-glow-purple animate-pulse'
                : 'bg-gray-100 hover:bg-gray-200'
              }
            `}
            title={animation.name}
          >
            <span className="text-xl">{animation.emoji}</span>
          </button>
        ))}
        {isPlaying && (
          <button
            onClick={onStop}
            className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-kid bg-gray-200 hover:bg-gray-300 transition-all"
            title="Stop animation"
          >
            <span className="text-xl">⏹️</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-kid-sm font-bold text-gray-700">Idle Animations</h3>

      {/* Animation grid */}
      <div className="grid grid-cols-3 gap-2">
        {IDLE_ANIMATIONS.map((animation) => (
          <button
            key={animation.id}
            onClick={() => onSelectAnimation(animation)}
            className={`
              flex flex-col items-center p-3 rounded-kid transition-all
              ${currentAnimationId === animation.id && isPlaying
                ? 'bg-gradient-magic text-white shadow-glow-purple'
                : 'bg-white hover:bg-gray-50 shadow-kid'
              }
            `}
          >
            <span className={`text-2xl mb-1 ${isPlaying && currentAnimationId === animation.id ? 'animate-bounce' : ''}`}>
              {animation.emoji}
            </span>
            <span className={`text-kid-xs font-semibold ${
              currentAnimationId === animation.id && isPlaying ? 'text-white' : 'text-gray-700'
            }`}>
              {animation.name}
            </span>
          </button>
        ))}
      </div>

      {/* Stop button */}
      {isPlaying && (
        <button
          onClick={onStop}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-kid text-kid-sm font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <span>⏹️</span>
          <span>Stop Animation</span>
        </button>
      )}

      {/* Current animation info */}
      {currentAnimationId && isPlaying && (
        <div className="bg-purple/10 rounded-kid p-3 text-center">
          <p className="text-kid-xs text-purple font-medium">
            Now playing: {IDLE_ANIMATIONS.find((a) => a.id === currentAnimationId)?.name}
          </p>
        </div>
      )}
    </div>
  );
}

export default AnimationSelector;
