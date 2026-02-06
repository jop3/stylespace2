import React, { useState, useCallback } from 'react';
import { KidButton } from '../ui/KidButton';

interface SaveOutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  thumbnailUrl?: string | null;
}

/**
 * Modal for naming and saving an outfit
 */
export function SaveOutfitModal({
  isOpen,
  onClose,
  onSave,
  thumbnailUrl,
}: SaveOutfitModalProps) {
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!name.trim()) return;

    setIsSaving(true);
    try {
      await onSave(name.trim());
      setName('');
      onClose();
    } finally {
      setIsSaving(false);
    }
  }, [name, onSave, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-kid-xl shadow-kid-xl w-full max-w-sm animate-pop-in">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-kid-xl font-bold text-gray-800 text-center">
            Save Outfit
          </h2>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Thumbnail preview */}
          {thumbnailUrl && (
            <div className="flex justify-center">
              <div className="w-32 h-32 rounded-kid-lg overflow-hidden bg-gray-100 shadow-kid">
                <img
                  src={thumbnailUrl}
                  alt="Outfit preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Name input */}
          <div>
            <label
              htmlFor="outfit-name"
              className="block text-kid-sm font-semibold text-gray-700 mb-2"
            >
              Give your outfit a name
            </label>
            <input
              id="outfit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g., Party Princess"
              maxLength={30}
              className="w-full h-12 px-4 bg-gray-100 rounded-kid-lg text-kid-base text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoFocus
            />
            <p className="mt-1 text-kid-xs text-gray-400 text-right">
              {name.length}/30
            </p>
          </div>

          {/* Suggested names */}
          <div>
            <p className="text-kid-xs text-gray-500 mb-2">Quick ideas:</p>
            <div className="flex flex-wrap gap-2">
              {['Casual Day', 'Party Look', 'School Style', 'Adventure Time'].map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setName(suggestion)}
                    className="px-3 py-1 bg-gray-100 text-gray-600 text-kid-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex gap-3">
          <KidButton
            variant="secondary"
            size="md"
            onClick={onClose}
            fullWidth
            disabled={isSaving}
          >
            Cancel
          </KidButton>
          <KidButton
            variant="primary"
            size="md"
            onClick={handleSave}
            fullWidth
            disabled={!name.trim() || isSaving}
            loading={isSaving}
          >
            Save
          </KidButton>
        </div>
      </div>
    </div>
  );
}

export default SaveOutfitModal;
