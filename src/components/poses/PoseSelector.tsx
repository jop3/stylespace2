import React, { useState } from 'react';
import type { VRM } from '@pixiv/three-vrm';
import { POSES, getPosesByCategory, getPoseCategories, getCategoryLabel, getCategoryEmoji, Pose } from '../../data/poses';
import { PoseCard } from './PoseCard';

interface PoseSelectorProps {
  vrm: VRM | null;
  currentPoseId: string | null;
  isTransitioning: boolean;
  onSelectPose: (pose: Pose) => void;
  onReset: () => void;
  compact?: boolean;
}

/**
 * Pose selector UI component
 */
export function PoseSelector({
  vrm,
  currentPoseId,
  isTransitioning,
  onSelectPose,
  onReset,
  compact = false
}: PoseSelectorProps) {
  const [activeCategory, setActiveCategory] = useState<Pose['category']>('basic');
  const categories = getPoseCategories();
  const poses = getPosesByCategory(activeCategory);

  if (!vrm) {
    return (
      <div className="text-center py-4">
        <p className="text-kid-sm text-gray-500">Load an avatar to use poses</p>
      </div>
    );
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {/* Compact pose grid */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {POSES.slice(0, 6).map((pose) => (
            <button
              key={pose.id}
              onClick={() => onSelectPose(pose)}
              disabled={isTransitioning}
              className={`
                flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-kid transition-all
                ${currentPoseId === pose.id
                  ? 'bg-gradient-magic text-white shadow-glow-purple'
                  : 'bg-gray-100 hover:bg-gray-200'
                }
                ${isTransitioning ? 'opacity-50' : ''}
              `}
              title={pose.name}
            >
              <span className="text-xl">{pose.emoji}</span>
            </button>
          ))}
          {currentPoseId && (
            <button
              onClick={onReset}
              disabled={isTransitioning}
              className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-kid bg-gray-200 hover:bg-gray-300 transition-all"
              title="Reset pose"
            >
              <span className="text-xl">↺</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-kid text-kid-sm font-semibold whitespace-nowrap transition-all
              ${activeCategory === category
                ? 'bg-purple text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            <span>{getCategoryEmoji(category)}</span>
            <span>{getCategoryLabel(category)}</span>
          </button>
        ))}
      </div>

      {/* Pose grid */}
      <div className="grid grid-cols-4 gap-2">
        {poses.map((pose) => (
          <PoseCard
            key={pose.id}
            pose={pose}
            isSelected={currentPoseId === pose.id}
            onClick={() => !isTransitioning && onSelectPose(pose)}
          />
        ))}
      </div>

      {/* Reset button */}
      {currentPoseId && (
        <button
          onClick={onReset}
          disabled={isTransitioning}
          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-kid text-kid-sm font-semibold transition-colors disabled:opacity-50"
        >
          ↺ Reset to Default Pose
        </button>
      )}

      {/* Transitioning indicator */}
      {isTransitioning && (
        <div className="text-center">
          <span className="text-kid-xs text-gray-500">Changing pose...</span>
        </div>
      )}
    </div>
  );
}

export default PoseSelector;
