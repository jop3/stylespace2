import React, { useState, useEffect } from 'react';
import { ChallengeCard } from './ChallengeCard';
import { useChallengeStore } from '../../stores/challengeStore';
import { getChallengeTimeRemaining } from '../../data/challenges';
import { useCelebration } from '../../hooks/useCelebration';

/**
 * Challenge hub screen
 * Shows daily challenge and challenge history
 */
export function ChallengeScreen() {
  const { getTodaysChallenge, isTodayCompleted, completeChallenge, getCompletedCount } =
    useChallengeStore();
  const { triggerConfetti } = useCelebration();

  const [timeRemaining, setTimeRemaining] = useState(getChallengeTimeRemaining());

  // Update time remaining every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeRemaining(getChallengeTimeRemaining());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const todaysChallenge = getTodaysChallenge();
  const isCompleted = isTodayCompleted(todaysChallenge.id);
  const totalCompleted = getCompletedCount();

  const handleStartChallenge = () => {
    // For now, immediately complete (simplified for demo)
    // In full implementation, this would track actual outfit requirements
    completeChallenge(todaysChallenge.id);
    triggerConfetti();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gradient-magic text-white px-4 py-6">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-kid-2xl font-bold mb-2">Daily Challenges</h2>
          <p className="text-white/80 text-kid-sm">
            Complete challenges to earn stars and XP!
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏆</span>
            <div>
              <p className="text-kid-xs text-gray-500">Total Completed</p>
              <p className="text-kid-lg font-bold text-gray-800">{totalCompleted}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <div>
              <p className="text-kid-xs text-gray-500">Streak</p>
              <p className="text-kid-lg font-bold text-orange">
                {/* TODO: Implement streak tracking */}
                {isCompleted ? '1 day' : '0 days'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Today's Challenge */}
          <div>
            <h3 className="text-kid-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="text-xl">📅</span>
              Today's Challenge
            </h3>
            <ChallengeCard
              challenge={todaysChallenge}
              isCompleted={isCompleted}
              onStart={handleStartChallenge}
              timeRemaining={timeRemaining}
            />
          </div>

          {/* Coming soon hint */}
          <div className="bg-purple/10 border border-purple/30 rounded-kid-lg p-4 text-center">
            <span className="text-2xl mb-2 block">🎯</span>
            <p className="text-kid-sm text-purple font-medium">
              More challenges coming soon!
            </p>
            <p className="text-kid-xs text-gray-500 mt-1">
              Weekly challenges, special events, and themed competitions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChallengeScreen;
