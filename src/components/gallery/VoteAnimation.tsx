import React, { useEffect, useState } from 'react';

interface VoteAnimationProps {
  isVisible: boolean;
  onComplete?: () => void;
}

/**
 * Celebration animation when voting
 * Shows floating hearts and +1 indicator
 */
export function VoteAnimation({ isVisible, onComplete }: VoteAnimationProps) {
  const [hearts, setHearts] = useState<{ id: number; x: number; delay: number }[]>([]);

  useEffect(() => {
    if (isVisible) {
      // Generate random hearts
      const newHearts = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        x: Math.random() * 80 + 10, // 10-90%
        delay: Math.random() * 0.3
      }));
      setHearts(newHearts);

      // Cleanup after animation
      const timer = setTimeout(() => {
        setHearts([]);
        onComplete?.();
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible && hearts.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Floating hearts */}
      {hearts.map((heart) => (
        <div
          key={heart.id}
          className="absolute animate-floatUp"
          style={{
            left: `${heart.x}%`,
            bottom: '20%',
            animationDelay: `${heart.delay}s`
          }}
        >
          <span className="text-2xl">❤️</span>
        </div>
      ))}

      {/* +1 indicator */}
      {isVisible && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl font-bold text-primary animate-bounceIn">
            +1 ❤️
          </span>
        </div>
      )}
    </div>
  );
}

export default VoteAnimation;
