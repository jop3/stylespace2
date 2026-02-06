import React, { useCallback } from 'react';
import { CollectionCard } from './CollectionCard';
import { useCollectionStore } from '../../stores/collectionStore';
import { useWardrobeStore } from '../../stores/wardrobeStore';
import { useCelebration } from '../../hooks/useCelebration';
import type { Collection } from '../../data/collections';

interface CollectionsViewProps {
  onCollectionSelect?: (collection: Collection) => void;
}

/**
 * Collection browser grid
 * Shows all collections with progress
 */
export function CollectionsView({ onCollectionSelect }: CollectionsViewProps) {
  const { items } = useWardrobeStore();
  const { getAllProgress, claimReward } = useCollectionStore();
  const { triggerConfetti, triggerStars } = useCelebration();

  // Get owned item IDs
  const ownedItemIds = items.map((item) => item.id);

  // Get all collections with progress
  const collectionsWithProgress = getAllProgress(ownedItemIds);

  // Separate completed and in-progress
  const completed = collectionsWithProgress.filter((c) => c.progress.isComplete);
  const inProgress = collectionsWithProgress.filter((c) => !c.progress.isComplete);

  // Handle reward claim
  const handleClaimReward = useCallback(
    (collection: Collection) => {
      const stars = claimReward(collection.id);
      if (stars > 0) {
        triggerConfetti();
        // TODO: Add stars to player's balance
      }
    },
    [claimReward, triggerConfetti]
  );

  // Handle collection select
  const handleSelect = useCallback(
    (collection: Collection) => {
      onCollectionSelect?.(collection);
    },
    [onCollectionSelect]
  );

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-kid-2xl font-bold text-gray-800 mb-2">Collections</h2>
        <p className="text-kid-sm text-gray-600">
          Collect themed outfits to earn stars and badges!
        </p>
      </div>

      {/* Completed collections */}
      {completed.length > 0 && (
        <div>
          <h3 className="text-kid-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="text-xl" role="img" aria-label="trophy">
              🏆
            </span>
            Completed ({completed.length})
          </h3>
          <div className="space-y-3">
            {completed.map(({ collection, progress }) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                progress={progress}
                onSelect={handleSelect}
                onClaimReward={handleClaimReward}
              />
            ))}
          </div>
        </div>
      )}

      {/* In-progress collections */}
      <div>
        <h3 className="text-kid-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="sparkles">
            ✨
          </span>
          In Progress ({inProgress.length})
        </h3>
        {inProgress.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <span className="text-4xl mb-2 block" role="img" aria-label="party">
              🎉
            </span>
            <p className="text-kid-base">Amazing! You've completed all collections!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {inProgress.map(({ collection, progress }) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                progress={progress}
                onSelect={handleSelect}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CollectionsView;
