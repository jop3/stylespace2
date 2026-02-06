import { useState, useCallback } from 'react';
import type { CelebrationType } from '../components/effects/Celebrations';

interface UseCelebrationReturn {
  celebrationType: CelebrationType | null;
  trigger: (type: CelebrationType) => void;
  triggerConfetti: () => void;
  triggerSparkles: () => void;
  triggerStars: () => void;
  triggerHearts: () => void;
  triggerLevelUp: () => void;
  clear: () => void;
}

/**
 * Hook for triggering celebration effects
 * Provides easy access to different celebration types
 */
export function useCelebration(): UseCelebrationReturn {
  const [celebrationType, setCelebrationType] = useState<CelebrationType | null>(null);

  const trigger = useCallback((type: CelebrationType) => {
    setCelebrationType(type);
  }, []);

  const clear = useCallback(() => {
    setCelebrationType(null);
  }, []);

  const triggerConfetti = useCallback(() => trigger('confetti'), [trigger]);
  const triggerSparkles = useCallback(() => trigger('sparkles'), [trigger]);
  const triggerStars = useCallback(() => trigger('stars'), [trigger]);
  const triggerHearts = useCallback(() => trigger('hearts'), [trigger]);
  const triggerLevelUp = useCallback(() => trigger('levelUp'), [trigger]);

  return {
    celebrationType,
    trigger,
    triggerConfetti,
    triggerSparkles,
    triggerStars,
    triggerHearts,
    triggerLevelUp,
    clear,
  };
}

export default useCelebration;
