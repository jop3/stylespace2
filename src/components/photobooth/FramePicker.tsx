import React from 'react';
import { FRAMES, Frame, getFrameStyles } from '../../data/frames';

interface FramePickerProps {
  selectedId: string;
  onSelect: (frame: Frame) => void;
  compact?: boolean;
}

/**
 * Frame selector for photo booth
 */
export function FramePicker({ selectedId, onSelect, compact = false }: FramePickerProps) {
  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {FRAMES.slice(0, 6).map((frame) => (
          <button
            key={frame.id}
            onClick={() => onSelect(frame)}
            className={`
              flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-kid transition-all
              ${selectedId === frame.id
                ? 'bg-gradient-magic text-white shadow-glow-purple'
                : 'bg-gray-100 hover:bg-gray-200'
              }
            `}
            title={frame.name}
          >
            <span className="text-xl">{frame.emoji}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-5 gap-2">
      {FRAMES.map((frame) => (
        <button
          key={frame.id}
          onClick={() => onSelect(frame)}
          className={`
            flex flex-col items-center p-2 rounded-kid transition-all
            ${selectedId === frame.id
              ? 'bg-gradient-magic text-white shadow-glow-purple'
              : 'bg-gray-100 hover:bg-gray-200'
            }
          `}
        >
          {/* Frame preview */}
          <div
            className="w-8 h-8 bg-white mb-1"
            style={{
              ...getFrameStyles(frame),
              transform: 'scale(0.5)',
              transformOrigin: 'center'
            }}
          />
          <span className={`text-kid-xs font-semibold truncate w-full text-center ${
            selectedId === frame.id ? 'text-white' : 'text-gray-700'
          }`}>
            {frame.name}
          </span>
        </button>
      ))}
    </div>
  );
}

export default FramePicker;
