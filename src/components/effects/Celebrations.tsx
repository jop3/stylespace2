import React from 'react';
import { Confetti } from './Confetti';
import { Sparkles } from './Sparkles';

export type CelebrationType = 'confetti' | 'sparkles' | 'stars' | 'hearts' | 'levelUp';

interface CelebrationsProps {
  type: CelebrationType | null;
  onComplete?: () => void;
}

const CELEBRATION_COLORS = {
  confetti: ['#FF6B9D', '#7C3AED', '#10B981', '#F59E0B', '#3B82F6', '#FFB4CC'],
  sparkles: ['#FFD700', '#FFF8DC', '#FFFACD', '#F0E68C', '#FFE4B5'],
  stars: ['#FFD700', '#FFA500', '#FFFF00'],
  hearts: ['#FF6B9D', '#FFB4CC', '#E54C7B', '#FF1493'],
  levelUp: ['#7C3AED', '#A78BFA', '#FFD700', '#FF6B9D'],
};

/**
 * Celebration effects controller
 * Manages different types of celebration animations
 */
export function Celebrations({ type, onComplete }: CelebrationsProps) {
  if (!type) return null;

  switch (type) {
    case 'confetti':
      return (
        <Confetti
          active
          pieceCount={150}
          duration={3000}
          colors={CELEBRATION_COLORS.confetti}
          onComplete={onComplete}
        />
      );

    case 'sparkles':
      return (
        <Sparkles
          active
          count={30}
          duration={2000}
          colors={CELEBRATION_COLORS.sparkles}
          spread="full"
          onComplete={onComplete}
        />
      );

    case 'stars':
      return (
        <Sparkles
          active
          count={25}
          duration={2500}
          colors={CELEBRATION_COLORS.stars}
          spread="center"
          onComplete={onComplete}
        />
      );

    case 'hearts':
      return (
        <>
          <Confetti
            active
            pieceCount={50}
            duration={2500}
            colors={CELEBRATION_COLORS.hearts}
            onComplete={onComplete}
          />
        </>
      );

    case 'levelUp':
      return (
        <>
          <Confetti
            active
            pieceCount={200}
            duration={4000}
            colors={CELEBRATION_COLORS.levelUp}
          />
          <Sparkles
            active
            count={40}
            duration={4000}
            colors={CELEBRATION_COLORS.levelUp}
            spread="center"
            onComplete={onComplete}
          />
        </>
      );

    default:
      return null;
  }
}

export default Celebrations;
