import React from 'react';
import { FILTERS, Filter } from '../../data/filters';

interface FilterPickerProps {
  selectedId: string;
  onSelect: (filter: Filter) => void;
  compact?: boolean;
}

/**
 * Filter selector for photo booth
 */
export function FilterPicker({ selectedId, onSelect, compact = false }: FilterPickerProps) {
  if (compact) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {FILTERS.slice(0, 6).map((filter) => (
          <button
            key={filter.id}
            onClick={() => onSelect(filter)}
            className={`
              flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-kid transition-all
              ${selectedId === filter.id
                ? 'bg-gradient-magic text-white shadow-glow-purple'
                : 'bg-gray-100 hover:bg-gray-200'
              }
            `}
            title={filter.name}
          >
            <span className="text-xl">{filter.emoji}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onSelect(filter)}
          className={`
            flex flex-col items-center p-2 rounded-kid transition-all
            ${selectedId === filter.id
              ? 'bg-gradient-magic text-white shadow-glow-purple'
              : 'bg-gray-100 hover:bg-gray-200'
            }
          `}
        >
          <span className="text-xl mb-1">{filter.emoji}</span>
          <span className={`text-kid-xs font-semibold ${selectedId === filter.id ? 'text-white' : 'text-gray-700'}`}>
            {filter.name}
          </span>
        </button>
      ))}
    </div>
  );
}

export default FilterPicker;
