import React, { useRef } from 'react';
import { useGalleryStore } from '../../stores/galleryStore';
import { FeaturedCard } from './FeaturedCard';
import type { GalleryPost } from '../../stores/galleryStore';

interface FeaturedSectionProps {
  onTryOn?: (post: GalleryPost) => void;
  onView?: (post: GalleryPost) => void;
}

/**
 * Horizontal carousel of featured outfits
 */
export function FeaturedSection({ onTryOn, onView }: FeaturedSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { getFeaturedPosts } = useGalleryStore();
  const featured = getFeaturedPosts();

  if (featured.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-kid-lg font-bold text-gray-800">
          ⭐ Featured Outfits
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Scroll left"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Scroll right"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {featured.map((post) => (
          <div key={post.id} className="flex-shrink-0 w-64 snap-start">
            <FeaturedCard
              post={post}
              onTryOn={onTryOn}
              onView={onView}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default FeaturedSection;
