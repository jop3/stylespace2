import React, { useState, useEffect, useCallback } from 'react';
import type { VRM } from '@pixiv/three-vrm';

interface RunwayModeProps {
  vrm: VRM | null;
  onClose: () => void;
  onScreenshot?: () => void;
}

type RunwayStage = 'entrance' | 'walk' | 'pose' | 'exit';

/**
 * Runway mode - catwalk presentation for outfits
 */
export function RunwayMode({ vrm, onClose, onScreenshot }: RunwayModeProps) {
  const [stage, setStage] = useState<RunwayStage>('entrance');
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // Stage durations in milliseconds
  const stageDurations: Record<RunwayStage, number> = {
    entrance: 2000,
    walk: 4000,
    pose: 3000,
    exit: 2000
  };

  // Auto-progress through stages
  useEffect(() => {
    if (isPaused || !vrm) return;

    const duration = stageDurations[stage];
    const interval = 50; // Update every 50ms
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        if (next >= 100) {
          // Move to next stage
          const stages: RunwayStage[] = ['entrance', 'walk', 'pose', 'exit'];
          const currentIndex = stages.indexOf(stage);
          if (currentIndex < stages.length - 1) {
            setStage(stages[currentIndex + 1]);
            return 0;
          } else {
            // Loop back or end
            setStage('entrance');
            return 0;
          }
        }
        return next;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [stage, isPaused, vrm]);

  // Hide controls after inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
  }, []);

  const getStageEmoji = (s: RunwayStage) => {
    switch (s) {
      case 'entrance': return '🚶';
      case 'walk': return '💃';
      case 'pose': return '📸';
      case 'exit': return '👋';
    }
  };

  const getStageLabel = (s: RunwayStage) => {
    switch (s) {
      case 'entrance': return 'Entering';
      case 'walk': return 'Walking';
      case 'pose': return 'Strike a Pose!';
      case 'exit': return 'Exit';
    }
  };

  if (!vrm) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="text-center text-white">
          <span className="text-6xl mb-4 block">👗</span>
          <p className="text-kid-lg">Load an avatar to start the runway show!</p>
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 bg-white/20 hover:bg-white/30 rounded-kid transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-gradient-to-b from-purple-900 via-black to-purple-900"
      onMouseMove={handleMouseMove}
    >
      {/* Stage lighting effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Spotlight */}
        <div
          className="absolute w-96 h-96 rounded-full bg-gradient-radial from-white/20 to-transparent"
          style={{
            left: '50%',
            top: '30%',
            transform: 'translate(-50%, -50%)'
          }}
        />
        {/* Floor reflection */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/5 to-transparent" />
      </div>

      {/* Stage indicator */}
      <div className={`absolute top-4 left-1/2 -translate-x-1/2 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-6 py-3 flex items-center gap-3">
          <span className="text-2xl">{getStageEmoji(stage)}</span>
          <span className="text-white font-bold text-kid-base">{getStageLabel(stage)}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className={`absolute bottom-24 left-1/2 -translate-x-1/2 w-64 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-magic transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Stage dots */}
        <div className="flex justify-between mt-2">
          {(['entrance', 'walk', 'pose', 'exit'] as RunwayStage[]).map((s) => (
            <div
              key={s}
              className={`w-3 h-3 rounded-full transition-all ${
                s === stage
                  ? 'bg-primary scale-125'
                  : ['entrance', 'walk', 'pose', 'exit'].indexOf(s) < ['entrance', 'walk', 'pose', 'exit'].indexOf(stage)
                  ? 'bg-white/60'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className={`absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 transition-opacity duration-500 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Pause/Play */}
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <span className="text-xl">{isPaused ? '▶️' : '⏸️'}</span>
        </button>

        {/* Screenshot (during pose stage) */}
        {stage === 'pose' && onScreenshot && (
          <button
            onClick={onScreenshot}
            className="h-12 px-4 flex items-center gap-2 rounded-full bg-gradient-magic text-white font-bold transition-transform hover:scale-105"
          >
            <span className="text-xl">📸</span>
            <span>Snap!</span>
          </button>
        )}

        {/* Close */}
        <button
          onClick={onClose}
          className="w-12 h-12 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
        >
          <span className="text-xl">✕</span>
        </button>
      </div>

      {/* Instructions */}
      {isPaused && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="text-center text-white">
            <span className="text-4xl mb-4 block">⏸️</span>
            <p className="text-kid-lg font-bold">Paused</p>
            <p className="text-kid-sm text-white/70 mt-2">Click play to continue</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default RunwayMode;
