import React from 'react';
import type { Pose } from '../../data/poses';

interface PoseCardProps {
  pose: Pose;
  isSelected: boolean;
  onClick: () => void;
}

/**
 * Individual pose preview card
 */
export function PoseCard({ pose, isSelected, onClick }: PoseCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center p-3 rounded-kid transition-all
        ${isSelected
          ? 'bg-gradient-magic text-white shadow-glow-purple scale-105'
          : 'bg-white hover:bg-gray-50 shadow-kid hover:shadow-kid-md'
        }
      `}
    >
      <span className="text-3xl mb-1">{pose.emoji}</span>
      <span className={`text-kid-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
        {pose.name}
      </span>
    </button>
  );
}

export default PoseCard;
