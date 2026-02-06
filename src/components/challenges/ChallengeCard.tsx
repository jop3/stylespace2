import React from 'react';
import type { Challenge } from '../../data/challenges';

interface ChallengeCardProps {
  challenge: Challenge;
  isCompleted: boolean;
  onStart: () => void;
  timeRemaining?: { hours: number; minutes: number };
}

const difficultyLabels = {
  easy: { label: 'Easy', color: 'bg-green-100 text-green-700' },
  medium: { label: 'Medium', color: 'bg-orange-100 text-orange-700' },
  hard: { label: 'Hard', color: 'bg-red-100 text-red-700' },
};

/**
 * Daily challenge card
 * Shows challenge info, requirements, and rewards
 */
export function ChallengeCard({
  challenge,
  isCompleted,
  onStart,
  timeRemaining,
}: ChallengeCardProps) {
  const difficulty = difficultyLabels[challenge.difficulty];

  return (
    <div
      className={`
        bg-white rounded-kid-xl overflow-hidden shadow-kid
        ${isCompleted ? 'ring-2 ring-green-400' : ''}
      `}
    >
      {/* Header with gradient */}
      <div
        className="p-4 text-white relative overflow-hidden"
        style={{ backgroundColor: challenge.color }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-20"
          style={{ backgroundColor: 'white' }}
        />
        <div
          className="absolute -right-8 bottom-0 w-16 h-16 rounded-full opacity-10"
          style={{ backgroundColor: 'white' }}
        />

        <div className="relative">
          <div className="flex items-start justify-between mb-2">
            <span className="text-4xl">{challenge.emoji}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${difficulty.color}`}>
              {difficulty.label}
            </span>
          </div>
          <h3 className="text-kid-xl font-bold">{challenge.title}</h3>
          <p className="text-white/80 text-kid-sm mt-1">{challenge.description}</p>
        </div>
      </div>

      {/* Requirements */}
      <div className="p-4">
        <h4 className="text-kid-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
        <ul className="space-y-2">
          {challenge.requirements.map((req, index) => (
            <li key={index} className="flex items-center gap-2 text-kid-sm text-gray-600">
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  isCompleted ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </span>
              {req.description}
            </li>
          ))}
        </ul>
      </div>

      {/* Rewards and action */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <span className="text-xl">⭐</span>
              <span className="text-kid-sm font-bold text-orange">{challenge.rewardStars}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl">✨</span>
              <span className="text-kid-sm font-bold text-purple">{challenge.rewardXP} XP</span>
            </div>
          </div>

          {timeRemaining && !isCompleted && (
            <div className="text-kid-xs text-gray-500">
              {timeRemaining.hours}h {timeRemaining.minutes}m left
            </div>
          )}
        </div>

        {isCompleted ? (
          <div className="w-full py-3 bg-green-100 text-green-700 text-center rounded-kid-lg font-bold text-kid-sm">
            Completed! 🎉
          </div>
        ) : (
          <button
            onClick={onStart}
            className="w-full py-3 bg-gradient-magic text-white rounded-kid-lg font-bold text-kid-sm shadow-kid hover:shadow-kid-lg transition-all active:scale-98"
          >
            Start Challenge
          </button>
        )}
      </div>
    </div>
  );
}

export default ChallengeCard;
