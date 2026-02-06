import React from 'react';
import { LevelBadge } from './LevelBadge';
import { XPBar } from './XPBar';
import { StarCounter } from './StarCounter';
import { useProgressStore } from '../../stores/progressStore';

/**
 * Player profile card showing level, XP, and stats
 */
export function ProfileCard() {
  const {
    outfitsCreated,
    texturesApplied,
    screenshotsTaken,
    challengesCompleted,
  } = useProgressStore();

  const stats = [
    { label: 'Outfits', value: outfitsCreated, emoji: '👗' },
    { label: 'Textures', value: texturesApplied, emoji: '🎨' },
    { label: 'Photos', value: screenshotsTaken, emoji: '📸' },
    { label: 'Challenges', value: challengesCompleted, emoji: '🏆' },
  ];

  return (
    <div className="bg-white rounded-kid-xl shadow-kid-lg overflow-hidden">
      {/* Header with gradient */}
      <div className="bg-gradient-magic p-4">
        <div className="flex items-center gap-4">
          <LevelBadge size="lg" />
          <div className="flex-1">
            <LevelBadge showTitle />
          </div>
          <StarCounter size="md" />
        </div>
      </div>

      {/* XP Progress */}
      <div className="p-4 border-b border-gray-100">
        <XPBar />
      </div>

      {/* Stats grid */}
      <div className="p-4">
        <h4 className="text-kid-sm font-semibold text-gray-700 mb-3">Your Stats</h4>
        <div className="grid grid-cols-4 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="text-center p-2 bg-gray-50 rounded-kid"
            >
              <span className="text-xl mb-1 block">{stat.emoji}</span>
              <p className="text-kid-lg font-bold text-gray-800">{stat.value}</p>
              <p className="text-kid-xs text-gray-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProfileCard;
