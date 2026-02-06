import React, { useState, useCallback } from 'react';
import { AchievementCard } from './AchievementCard';
import { useAchievementStore } from '../../stores/achievementStore';
import { type AchievementCategory, type AchievementTier } from '../../data/achievements';
import { useCelebration } from '../../hooks/useCelebration';

const categories: { id: AchievementCategory | 'all'; label: string; emoji: string }[] = [
  { id: 'all', label: 'All', emoji: '🏆' },
  { id: 'wardrobe', label: 'Wardrobe', emoji: '👗' },
  { id: 'challenges', label: 'Challenges', emoji: '🎯' },
  { id: 'social', label: 'Social', emoji: '❤️' },
  { id: 'exploration', label: 'Explore', emoji: '🧭' },
  { id: 'creativity', label: 'Creativity', emoji: '🎨' },
];

/**
 * Achievement gallery screen
 */
export function AchievementsScreen() {
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');
  const { getAllProgress, claimTier, getUnclaimedCount } = useAchievementStore();
  const { triggerStars, triggerConfetti } = useCelebration();

  const allAchievements = getAllProgress();
  const unclaimedCount = getUnclaimedCount();

  // Filter by category
  const filteredAchievements =
    activeCategory === 'all'
      ? allAchievements
      : allAchievements.filter((a) => a.achievement.category === activeCategory);

  // Handle claim
  const handleClaim = useCallback(
    (achievementId: string, tier: AchievementTier) => {
      const stars = claimTier(achievementId, tier);
      if (stars > 0) {
        triggerStars();
        // TODO: Add stars to player's balance
      }
    },
    [claimTier, triggerStars]
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-kid-xl font-bold text-gray-800">Achievements</h2>
            {unclaimedCount > 0 && (
              <span className="px-3 py-1 bg-orange/10 text-orange text-kid-sm font-bold rounded-full">
                {unclaimedCount} to claim!
              </span>
            )}
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
            {categories.map((cat) => {
              const count =
                cat.id === 'all'
                  ? allAchievements.length
                  : allAchievements.filter((a) => a.achievement.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`
                    flex items-center gap-1 px-3 py-2 rounded-kid whitespace-nowrap
                    transition-all duration-normal text-kid-sm font-medium
                    ${
                      activeCategory === cat.id
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                  <span className="opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Achievement list */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-3">
          {filteredAchievements.map(({ achievement, progress, nextTier, nextTierRequirement, canClaim }) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              progress={progress}
              nextTier={nextTier}
              nextTierRequirement={nextTierRequirement}
              canClaim={canClaim}
              onClaim={(tier) => handleClaim(achievement.id, tier)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default AchievementsScreen;
