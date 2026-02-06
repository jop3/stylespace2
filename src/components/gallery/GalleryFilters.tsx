import React from 'react';
import { useGalleryStore } from '../../stores/galleryStore';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', emoji: '🆕' },
  { value: 'popular', label: 'Popular', emoji: '🔥' },
  { value: 'featured', label: 'Featured', emoji: '⭐' }
] as const;

const TAG_OPTIONS = [
  { value: null, label: 'All' },
  { value: 'summer', label: 'Summer' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'elegant', label: 'Elegant' },
  { value: 'casual', label: 'Casual' },
  { value: 'sports', label: 'Sports' },
  { value: 'party', label: 'Party' }
];

interface GalleryFiltersProps {
  compact?: boolean;
}

/**
 * Filter and sort controls for gallery
 */
export function GalleryFilters({ compact = false }: GalleryFiltersProps) {
  const { sortBy, filterTag, setSortBy, setFilterTag } = useGalleryStore();

  if (compact) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => setSortBy(option.value)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-kid-xs font-semibold whitespace-nowrap transition-all ${
              sortBy === option.value
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <span>{option.emoji}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Sort options */}
      <div>
        <p className="text-kid-xs font-semibold text-gray-500 mb-2">Sort by</p>
        <div className="flex flex-wrap gap-2">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`flex items-center gap-1 px-3 py-2 rounded-kid text-kid-sm font-semibold transition-all ${
                sortBy === option.value
                  ? 'bg-primary text-white shadow-glow-pink'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{option.emoji}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tag filter */}
      <div>
        <p className="text-kid-xs font-semibold text-gray-500 mb-2">Filter by style</p>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((option) => (
            <button
              key={option.value ?? 'all'}
              onClick={() => setFilterTag(option.value)}
              className={`px-3 py-1.5 rounded-full text-kid-xs font-semibold transition-all ${
                filterTag === option.value
                  ? 'bg-purple text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default GalleryFilters;
