import React from 'react';
import type { GalleryPost as GalleryPostType } from '../../stores/galleryStore';
import { useGalleryStore } from '../../stores/galleryStore';
import { formatDistanceToNow } from 'date-fns';

interface GalleryPostProps {
  post: GalleryPostType;
  onTryOn?: (post: GalleryPostType) => void;
  onView?: (post: GalleryPostType) => void;
}

/**
 * Individual gallery post card
 */
export function GalleryPost({ post, onTryOn, onView }: GalleryPostProps) {
  const { voteForPost, hasVoted, myPosts } = useGalleryStore();
  const isOwn = myPosts.has(post.id);
  const alreadyVoted = hasVoted(post.id);

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!alreadyVoted && !isOwn) {
      voteForPost(post.id);
    }
  };

  const handleTryOn = (e: React.MouseEvent) => {
    e.stopPropagation();
    onTryOn?.(post);
  };

  const timeAgo = formatDistanceToNow(post.createdAt, { addSuffix: true });

  return (
    <div
      className="group bg-white rounded-kid-lg shadow-kid overflow-hidden cursor-pointer hover:shadow-kid-lg transition-shadow"
      onClick={() => onView?.(post)}
    >
      {/* Thumbnail */}
      <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
        {post.thumbnail ? (
          <img
            src={post.thumbnail}
            alt={post.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl">👗</span>
          </div>
        )}

        {/* Featured badge */}
        {post.isFeatured && (
          <div className="absolute top-2 left-2 bg-gradient-magic text-white text-kid-xs font-bold px-2 py-1 rounded-full shadow-glow-purple">
            ⭐ Featured
          </div>
        )}

        {/* Own badge */}
        {isOwn && (
          <div className="absolute top-2 right-2 bg-mint text-white text-kid-xs font-bold px-2 py-1 rounded-full">
            Mine
          </div>
        )}

        {/* Hover overlay with try-on button */}
        {onTryOn && (
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={handleTryOn}
              className="bg-white text-primary font-bold py-2 px-4 rounded-kid transform scale-90 group-hover:scale-100 transition-transform"
            >
              Try On
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-kid-sm font-bold text-gray-800 truncate">
          {post.name}
        </h3>
        <p className="text-kid-xs text-gray-500">{timeAgo}</p>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {post.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-kid-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
          {/* Vote button */}
          <button
            onClick={handleVote}
            disabled={alreadyVoted || isOwn}
            className={`flex items-center gap-1 py-1 px-2 rounded-kid transition-all ${
              alreadyVoted
                ? 'text-primary'
                : isOwn
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-500 hover:text-primary hover:bg-primary/10'
            }`}
          >
            <span className={`text-lg transition-transform ${alreadyVoted ? 'scale-110' : ''}`}>
              {alreadyVoted ? '❤️' : '🤍'}
            </span>
            <span className="text-kid-sm font-semibold">{post.votes}</span>
          </button>

          {/* View count */}
          <div className="flex items-center gap-1 text-gray-400">
            <span className="text-lg">👁️</span>
            <span className="text-kid-xs">{post.viewCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GalleryPost;
