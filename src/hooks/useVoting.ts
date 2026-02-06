import { useState, useCallback, useRef } from 'react';
import { useGalleryStore } from '../stores/galleryStore';

interface UseVotingOptions {
  // Rate limit in milliseconds (default: 500ms)
  rateLimit?: number;
  // Callback when vote is successful
  onVoteSuccess?: (postId: string) => void;
  // Callback when rate limited
  onRateLimited?: () => void;
}

/**
 * Hook for managing votes with rate limiting
 * Prevents spam voting and provides animation state
 */
export function useVoting(options: UseVotingOptions = {}) {
  const { rateLimit = 500, onVoteSuccess, onRateLimited } = options;
  const { voteForPost, hasVoted } = useGalleryStore();

  // Track recently voted posts for animation
  const [recentlyVoted, setRecentlyVoted] = useState<Set<string>>(new Set());
  const lastVoteTime = useRef<number>(0);

  const vote = useCallback(
    (postId: string): boolean => {
      // Check if already voted
      if (hasVoted(postId)) {
        return false;
      }

      // Rate limit check
      const now = Date.now();
      if (now - lastVoteTime.current < rateLimit) {
        onRateLimited?.();
        return false;
      }

      // Perform vote
      const success = voteForPost(postId);
      if (success) {
        lastVoteTime.current = now;
        onVoteSuccess?.(postId);

        // Track for animation
        setRecentlyVoted((prev) => new Set([...prev, postId]));

        // Clear animation state after a short delay
        setTimeout(() => {
          setRecentlyVoted((prev) => {
            const next = new Set(prev);
            next.delete(postId);
            return next;
          });
        }, 1000);
      }

      return success;
    },
    [hasVoted, voteForPost, rateLimit, onVoteSuccess, onRateLimited]
  );

  const isAnimating = useCallback(
    (postId: string) => recentlyVoted.has(postId),
    [recentlyVoted]
  );

  return {
    vote,
    hasVoted,
    isAnimating
  };
}

export default useVoting;
