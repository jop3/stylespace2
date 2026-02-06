import React from 'react';
import type { VRM } from '@pixiv/three-vrm';
import { SkinTonePicker } from './SkinTonePicker';
import { HairColorPicker } from './HairColorPicker';
import { EyeColorPicker } from './EyeColorPicker';
import { useAvatarCustomizationStore } from '../../stores/avatarCustomizationStore';

interface AvatarCustomizerProps {
  vrm: VRM | null;
  onClose: () => void;
}

/**
 * Avatar customization screen
 * Allows customizing skin tone, hair color, eye color, and scale
 */
export function AvatarCustomizer({ vrm, onClose }: AvatarCustomizerProps) {
  const {
    customization,
    setSkinTone,
    setHairColor,
    setEyeColor,
    setScale,
    resetCustomization
  } = useAvatarCustomizationStore();

  if (!vrm) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-white rounded-kid-xl p-6 text-center max-w-sm w-full">
          <span className="text-6xl mb-4 block">👤</span>
          <h2 className="text-kid-lg font-bold text-gray-800 mb-2">Avatar Customization</h2>
          <p className="text-kid-sm text-gray-600 mb-4">Load an avatar first to customize it!</p>
          <button onClick={onClose} className="btn-primary w-full">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-kid-xl sm:rounded-kid-xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="bg-gradient-magic p-4 flex items-center justify-between">
          <h2 className="text-kid-lg font-bold text-white">Customize Avatar</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Note about customization */}
          <div className="bg-purple/10 rounded-kid p-3">
            <p className="text-kid-xs text-purple">
              Note: Customization support depends on your VRM model. Some models may not support all customization options.
            </p>
          </div>

          {/* Skin Tone */}
          <SkinTonePicker
            selectedColor={customization.skinTone}
            onSelect={setSkinTone}
          />

          {/* Hair Color */}
          <HairColorPicker
            selectedColor={customization.hairColor}
            onSelect={setHairColor}
          />

          {/* Eye Color */}
          <EyeColorPicker
            selectedColor={customization.eyeColor}
            onSelect={setEyeColor}
          />

          {/* Scale/Height */}
          <div className="space-y-2">
            <label className="text-kid-sm font-semibold text-gray-700">
              Size: {Math.round(customization.scale * 100)}%
            </label>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.05"
              value={customization.scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-kid-xs text-gray-400">
              <span>Smaller</span>
              <span>Bigger</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <button
            onClick={resetCustomization}
            className="flex-1 h-touch bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-kid font-semibold transition-colors"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 h-touch bg-gradient-magic text-white rounded-kid font-bold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

export default AvatarCustomizer;
