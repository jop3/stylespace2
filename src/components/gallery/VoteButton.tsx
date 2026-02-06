import React, { useState } from 'react';

interface VoteButtonProps {
  votes: number;
  hasVoted: boolean;
  disabled?: boolean;
  onVote: () => boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: {
    button: 'py-1 px-2',
    icon: 'text-lg',
    text: 'text-kid-xs'
  },
  md: {
    button: 'py-2 px-3',
    icon: 'text-xl',
    text: 'text-kid-sm'
  },
  lg: {
    button: 'py-3 px-4',
    icon: 'text-2xl',
    text: 'text-kid-base'
  }
};

/**
 * Animated vote button (kid-safe, positive only)
 */
export function VoteButton({
  votes,
  hasVoted,
  disabled = false,
  onVote,
  size = 'md'
}: VoteButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const classes = sizeClasses[size];

  const handleClick = () => {
    if (disabled || hasVoted) return;

    const success = onVote();
    if (success) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || hasVoted}
      className={`
        flex items-center gap-1.5 ${classes.button} rounded-kid transition-all
        ${hasVoted
          ? 'text-primary bg-primary/10'
          : disabled
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-500 hover:text-primary hover:bg-primary/10 active:scale-95'
        }
      `}
      aria-label={hasVoted ? 'Already voted' : 'Vote for this outfit'}
    >
      <span
        className={`${classes.icon} transition-transform ${
          isAnimating ? 'animate-heartBeat' : ''
        } ${hasVoted ? 'scale-110' : ''}`}
      >
        {hasVoted ? '❤️' : '🤍'}
      </span>
      <span className={`${classes.text} font-bold`}>
        {votes}
      </span>
    </button>
  );
}

export default VoteButton;
