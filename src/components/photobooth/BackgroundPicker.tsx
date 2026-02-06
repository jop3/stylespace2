import React, { useState } from 'react';
import { BACKGROUNDS, getBackgroundsByCategory, getBackgroundCategories, getCategoryLabel, Background } from '../../data/backgrounds';

interface BackgroundPickerProps {
  selectedId: string;
  onSelect: (background: Background) => void;
  compact?: boolean;
}

/**
 * Background selector for photo booth
 */
export function BackgroundPicker({ selectedId, onSelect, compact = false }: BackgroundPickerProps) {
  const [activeCategory, setActiveCategory] = useState<Background['category']>('basic');
  const categories = getBackgroundCategories();
  const backgrounds = getBackgroundsByCategory(activeCategory);

  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {BACKGROUNDS.slice(0, 8).map((bg) => (
          <button
            key={bg.id}
            onClick={() => onSelect(bg)}
            className={`
              flex-shrink-0 w-10 h-10 rounded-kid transition-all
              ${selectedId === bg.id ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''}
            `}
            style={{
              background: bg.type === 'solid' ? bg.value : bg.value,
              border: bg.id === 'white' ? '1px solid #e5e7eb' : 'none'
            }}
            title={bg.name}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`
              px-3 py-1.5 rounded-full text-kid-xs font-semibold whitespace-nowrap transition-all
              ${activeCategory === category
                ? 'bg-purple text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {getCategoryLabel(category)}
          </button>
        ))}
      </div>

      {/* Background grid */}
      <div className="grid grid-cols-4 gap-2">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => onSelect(bg)}
            className={`
              aspect-square rounded-kid overflow-hidden transition-all
              ${selectedId === bg.id ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'hover:scale-105'}
            `}
            style={{
              background: bg.type === 'solid' ? bg.value : bg.value,
              border: bg.id === 'white' ? '1px solid #e5e7eb' : 'none'
            }}
            title={bg.name}
          >
            <span className="text-2xl">{bg.emoji}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default BackgroundPicker;
