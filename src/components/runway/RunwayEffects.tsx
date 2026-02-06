import React, { useMemo } from 'react';

interface RunwayEffectsProps {
  isActive: boolean;
  stage: 'entrance' | 'walk' | 'pose' | 'exit';
}

/**
 * Visual effects for runway mode
 * Includes particles, lights, and sparkles
 */
export function RunwayEffects({ isActive, stage }: RunwayEffectsProps) {
  // Generate random sparkles
  const sparkles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 2,
      size: 4 + Math.random() * 8
    }));
  }, []);

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Sparkles during pose stage */}
      {stage === 'pose' && sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className="absolute animate-sparkle"
          style={{
            left: `${sparkle.left}%`,
            top: `${sparkle.top}%`,
            width: sparkle.size,
            height: sparkle.size,
            animationDelay: `${sparkle.delay}s`
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
            <path
              d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z"
              fill="white"
              opacity={0.8}
            />
          </svg>
        </div>
      ))}

      {/* Light beams during walk */}
      {(stage === 'walk' || stage === 'entrance') && (
        <>
          <div
            className="absolute top-0 left-1/4 w-1 h-full bg-gradient-to-b from-white/20 via-transparent to-transparent animate-pulse"
            style={{ animationDuration: '2s' }}
          />
          <div
            className="absolute top-0 right-1/4 w-1 h-full bg-gradient-to-b from-white/20 via-transparent to-transparent animate-pulse"
            style={{ animationDuration: '2s', animationDelay: '0.5s' }}
          />
        </>
      )}

      {/* Camera flash effect during pose */}
      {stage === 'pose' && (
        <div className="absolute inset-0 bg-white/10 animate-pulse" style={{ animationDuration: '0.5s' }} />
      )}

      {/* Runway floor glow */}
      <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </div>
  );
}

export default RunwayEffects;
