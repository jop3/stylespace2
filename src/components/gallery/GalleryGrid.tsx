import React from 'react';
import { GalleryPost } from './GalleryPost';
import type { GalleryPost as GalleryPostType } from '../../stores/galleryStore';

interface GalleryGridProps {
  posts: GalleryPostType[];
  onTryOn?: (post: GalleryPostType) => void;
  onView?: (post: GalleryPostType) => void;
  emptyMessage?: string;
}

/**
 * Grid layout for gallery posts
 */
export function GalleryGrid({
  posts,
  onTryOn,
  onView,
  emptyMessage = 'No outfits yet!'
}: GalleryGridProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <span className="text-6xl mb-4 block">🌟</span>
        <p className="text-kid-base text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      {posts.map((post) => (
        <GalleryPost
          key={post.id}
          post={post}
          onTryOn={onTryOn}
          onView={onView}
        />
      ))}
    </div>
  );
}

export default GalleryGrid;
