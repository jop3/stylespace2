import React from 'react';
import { type Achievement, type AchievementTier, getTierColor } from '../../data/achievements';

interface AchievementProgress {
  progress: number;
  unlockedTiers: AchievementTier[];
  claimedTiers: AchievementTier[];
}

interface AchievementCardProps {
  achievement: Achievement;
  progress: AchievementProgress;
  nextTier: AchievementTier | null;
  nextTierRequirement: number;
  canClaim: boolean;
  onClaim: (tier: AchievementTier) => void;
}

/**
 * Achievement card with progress bar and tier badges
 */
export function AchievementCard({
  achievement,
  progress,
  nextTier,
  nextTierRequirement,
  canClaim,
  onClaim,
}: AchievementCardProps) {
  const currentTierIndex = achievement.tiers.findIndex(
    (t) => !progress.unlockedTiers.includes(t.tier)
  );
  const isMaxed = currentTierIndex === -1;

  // Calculate progress percentage
  const progressPercent = isMaxed
    ? 100
    : Math.min(100, (progress.progress / nextTierRequirement) * 100);

  // Find tier that can be claimed
  const claimableTier = progress.unlockedTiers.find(
    (tier) => !progress.claimedTiers.includes(tier)
  );

  return (
    <div
      className={`
        bg-white rounded-kid-lg p-4 shadow-kid
        transition-all duration-normal
        ${canClaim ? 'ring-2 ring-orange animate-pulse-glow' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Achievement icon */}
        <div className="w-14 h-14 rounded-kid bg-gray-100 flex items-center justify-center text-3xl relative">
          {achievement.emoji}

          {/* Highest unlocked tier badge */}
          {progress.unlockedTiers.length > 0 && (
            <div
              className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
              style={{
                backgroundColor: getTierColor(
                  progress.unlockedTiers[progress.unlockedTiers.length - 1]
                ),
              }}
            >
              <span className="text-white text-xs font-bold">
                {progress.unlockedTiers.length}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="text-kid-base font-bold text-gray-800">{achievement.name}</h4>
          <p className="text-kid-xs text-gray-500 mb-2">
            {achievement.description}
          </p>

          {/* Progress bar */}
          <div className="mb-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{progress.progress} / {isMaxed ? progress.progress : nextTierRequirement}</span>
              {!isMaxed && nextTier && (
                <span
                  className="font-semibold"
                  style={{ color: getTierColor(nextTier) }}
                >
                  {nextTier.charAt(0).toUpperCase() + nextTier.slice(1)}
                </span>
              )}
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-slow"
                style={{
                  width: `${progressPercent}%`,
                  backgroundColor: isMaxed ? '#10B981' : getTierColor(nextTier || 'bronze'),
                }}
              />
            </div>
          </div>

          {/* Tier indicators */}
          <div className="flex gap-1">
            {achievement.tiers.map((tier) => {
              const isUnlocked = progress.unlockedTiers.includes(tier.tier);
              const isClaimed = progress.claimedTiers.includes(tier.tier);

              return (
                <div
                  key={tier.tier}
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center
                    border-2 transition-all
                    ${isUnlocked ? 'border-transparent' : 'border-gray-200 bg-gray-50'}
                  `}
                  style={{
                    backgroundColor: isUnlocked ? getTierColor(tier.tier) : undefined,
                  }}
                  title={`${tier.tier}: ${tier.requirement} - ${tier.rewardStars} stars`}
                >
                  {isClaimed && (
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="white"
                    >
                      <polyline points="20 6 9 17 4 12" fill="none" stroke="white" strokeWidth="3" />
                    </svg>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Claim button */}
        {canClaim && claimableTier && (
          <button
            onClick={() => onClaim(claimableTier)}
            className="px-3 py-2 bg-gradient-magic text-white text-kid-xs font-bold rounded-kid shadow-kid"
          >
            Claim!
          </button>
        )}
      </div>
    </div>
  );
}

export default AchievementCard;
