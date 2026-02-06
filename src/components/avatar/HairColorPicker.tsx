import React from 'react';
import { HAIR_COLORS } from '../../stores/avatarCustomizationStore';

interface HairColorPickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

/**
 * Hair color picker with natural and fun fantasy colors
 */
export function HairColorPicker({ selectedColor, onSelect }: HairColorPickerProps) {
  // Split into natural and fantasy colors
  const naturalColors = HAIR_COLORS.slice(0, 8);
  const fantasyColors = HAIR_COLORS.slice(8);

  return (
    <div className="space-y-3">
      <label className="text-kid-sm font-semibold text-gray-700">Hair Color</label>

      {/* Natural colors */}
      <div>
        <p className="text-kid-xs text-gray-500 mb-1">Natural</p>
        <div className="flex flex-wrap gap-2">
          {naturalColors.map((color) => (
            <button
              key={color.id}
              onClick={() => onSelect(color.color)}
              className={`
                w-8 h-8 rounded-full transition-all border-2
                ${selectedColor === color.color
                  ? 'border-primary scale-110 shadow-glow-pink'
                  : 'border-gray-200 hover:scale-105'
                }
              `}
              style={{ backgroundColor: color.color }}
              title={color.name}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>

      {/* Fantasy colors */}
      <div>
        <p className="text-kid-xs text-gray-500 mb-1">Fantasy</p>
        <div className="flex flex-wrap gap-2">
          {fantasyColors.map((color) => (
            <button
              key={color.id}
              onClick={() => onSelect(color.color)}
              className={`
                w-8 h-8 rounded-full transition-all border-2
                ${selectedColor === color.color
                  ? 'border-primary scale-110 shadow-glow-pink'
                  : 'border-gray-200 hover:scale-105'
                }
              `}
              style={{ backgroundColor: color.color }}
              title={color.name}
              aria-label={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default HairColorPicker;
