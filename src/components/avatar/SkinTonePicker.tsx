import React from 'react';
import { SKIN_TONES } from '../../stores/avatarCustomizationStore';

interface SkinTonePickerProps {
  selectedColor: string;
  onSelect: (color: string) => void;
}

/**
 * Inclusive skin tone picker with diverse options
 */
export function SkinTonePicker({ selectedColor, onSelect }: SkinTonePickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-kid-sm font-semibold text-gray-700">Skin Tone</label>
      <div className="flex flex-wrap gap-2">
        {SKIN_TONES.map((tone) => (
          <button
            key={tone.id}
            onClick={() => onSelect(tone.color)}
            className={`
              w-10 h-10 rounded-full transition-all border-2
              ${selectedColor === tone.color
                ? 'border-primary scale-110 shadow-glow-pink'
                : 'border-transparent hover:scale-105'
              }
            `}
            style={{ backgroundColor: tone.color }}
            title={tone.name}
            aria-label={tone.name}
          />
        ))}
      </div>
    </div>
  );
}

export default SkinTonePicker;
