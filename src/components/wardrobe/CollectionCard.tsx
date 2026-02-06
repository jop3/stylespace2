import React from 'react';
import type { Collection } from '../../data/collections';

interface CollectionProgress {
  owned: number;
  total: number;
  percentage: number;
  isComplete: boolean;
  canClaimReward: boolean;
}

interface CollectionCardProps {
  collection: Collection;
  progress: CollectionProgress;
  onSelect: (collection: Collection) => void;
  onClaimReward?: (collection: Collection) => void;
}

/**
 * Collection preview card
 * Shows progress bar and completion status
 */
export function CollectionCard({
  collection,
  progress,
  onSelect,
  onClaimReward,
}: CollectionCardProps) {
  const handleClaimClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClaimReward?.(collection);
  };

  return (
    <button
      onClick={() => onSelect(collection)}
      className={`
        w-full text-left p-4 rounded-kid-lg
        transition-all duration-normal
        ${
          progress.isComplete
            ? 'bg-gradient-to-r from-white to-green-50 border-2 border-green-200'
            : 'bg-white border border-gray-200'
        }
        shadow-kid hover:shadow-kid-lg
        hover:-translate-y-0.5 active:scale-98
      `}
    >
      <div className="flex items-start gap-3">
        {/* Collection emoji */}
        <div
          className="w-12 h-12 rounded-kid flex items-center justify-center text-2xl"
          style={{ backgroundColor: `${collection.color}20` }}
        >
          {collection.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title with completion badge */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-kid-base font-bold text-gray-800 truncate">
              {collection.name}
            </h3>
            {progress.isComplete && (
              <span className="flex-shrink-0 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                Complete!
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-kid-xs text-gray-500 mb-2 truncate">
            {collection.description}
          </p>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>
                {progress.owned}/{progress.total} items
              </span>
              <span>{progress.percentage}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-slow"
                style={{
                  width: `${progress.percentage}%`,
                  backgroundColor: progress.isComplete ? '#10B981' : collection.color,
                }}
              />
            </div>
          </div>

          {/* Reward info or claim button */}
          {progress.canClaimReward ? (
            <button
              onClick={handleClaimClick}
              className="w-full py-2 bg-gradient-magic text-white text-kid-sm font-bold rounded-kid animate-pulse-glow"
            >
              Claim Reward! +{collection.rewardStars} Stars
            </button>
          ) : (
            <div className="flex items-center gap-2 text-kid-xs text-gray-500">
              <span>Reward:</span>
              <span className="font-semibold text-orange">
                {collection.rewardStars} Stars
              </span>
              {collection.rewardBadge && (
                <>
                  <span>+</span>
                  <span className="font-semibold text-purple">Badge</span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

export default CollectionCard;
