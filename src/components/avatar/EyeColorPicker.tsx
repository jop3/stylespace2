import React from 'react';
import { EYE_COLORS } from '../../stores/avatarCustomizationStore';

interface EyeColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

/**
 * Eye color picker with natural and fantasy options
 */
export function EyeColorPicker({ selectedColor, onSelect }: EyeColorPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-kid-sm font-semibold text-gray-700">Eye Color</label>
      <div className="flex flex-wrap gap-2">
        {EYE_COLORS.map((color) => (
          <button
            key={color.id}
            onClick={() => onSelect(color.color)}
            className={`
              w-8 h-8 rounded-full transition-all border-2 relative
              ${selectedColor === color.color
                ? 'border-primary scale-110 shadow-glow-pink'
                : 'border-gray-200 hover:scale-105'
              }
            `}
            style={{ backgroundColor: color.color }}
            title={color.name}
            aria-label={color.name}
          >
            {/* Pupil effect */}
            <span
              className="absolute inset-1.5 rounded-full bg-black/30"
              style={{ pointerEvents: 'none' }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default EyeColorPicker;
