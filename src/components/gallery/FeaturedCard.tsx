import React from 'react';
import type { GalleryPost } from '../../stores/galleryStore';
import { useGalleryStore } from '../../stores/galleryStore';

interface FeaturedCardProps {
  post: GalleryPost;
  onTryOn?: (post: GalleryPost) => void;
  onView?: (post: GalleryPost) => void;
}

/**
 * Featured outfit card for carousel
 */
export function FeaturedCard({ post, onTryOn, onView }: FeaturedCardProps) {
  const { voteForPost, hasVoted } = useGalleryStore();
  const alreadyVoted = hasVoted(post.id);

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!alreadyVoted) {
      voteForPost(post.id);
    }
  };

  return (
    <div
      className="bg-white rounded-kid-lg shadow-kid-lg overflow-hidden cursor-pointer group"
      onClick={() => onView?.(post)}
    >
      {/* Image with gradient overlay */}
      <div className="aspect-[4/3] bg-gradient-to-br from-purple/20 to-primary/20 relative overflow-hidden">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-6xl">👗</span>
          </div>
        )}

        {/* Featured badge */}
        <div className="absolute top-2 left-2 bg-gradient-magic text-white text-kid-xs font-bold px-2 py-1 rounded-full shadow-glow-purple flex items-center gap-1">
          <span>⭐</span>
          <span>Featured</span>
        </div>

        {/* Gradient overlay for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Info overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-kid-base font-bold text-white truncate">
            {post.name}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-kid-xs text-white/80">
              ❤️ {post.votes}
            </span>
            <span className="text-kid-xs text-white/80">
              👁️ {post.viewCount}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 flex items-center justify-between">
        <button
          onClick={handleVote}
          disabled={alreadyVoted}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-kid transition-all ${
            alreadyVoted
              ? 'text-primary bg-primary/10'
              : 'text-gray-500 hover:text-primary hover:bg-primary/10'
          }`}
        >
          <span className="text-lg">{alreadyVoted ? '❤️' : '🤍'}</span>
          <span className="text-kid-sm font-semibold">
            {alreadyVoted ? 'Voted' : 'Vote'}
          </span>
        </button>

        {onTryOn && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTryOn(post);
            }}
            className="flex items-center gap-1.5 py-1.5 px-3 bg-gradient-magic text-white rounded-kid text-kid-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <span>👗</span>
            <span>Try On</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default FeaturedCard;
