import React, { useState } from 'react';
import { useGalleryStore, GalleryPost } from '../../stores/galleryStore';
import { GalleryGrid } from './GalleryGrid';
import { GalleryFilters } from './GalleryFilters';
import { FeaturedSection } from './FeaturedSection';

interface GalleryScreenProps {
  onTryOn?: (post: GalleryPost) => void;
}

/**
 * Community gallery screen with featured outfits, filters, and voting
 * COPPA-compliant: No personal data, anonymous only
 */
export function GalleryScreen({ onTryOn }: GalleryScreenProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'mine'>('browse');
  const { getFilteredPosts, getMyPosts, getFeaturedPosts, incrementViewCount } = useGalleryStore();

  const posts = activeTab === 'browse' ? getFilteredPosts() : getMyPosts();
  const featured = getFeaturedPosts();

  const handleView = (post: GalleryPost) => {
    incrementViewCount(post.id);
    // Could open detail modal here
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-kid-xl font-bold text-gray-800">Community Gallery</h2>
          <p className="text-kid-sm text-gray-600">Discover amazing outfits from stylists everywhere!</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-3 text-kid-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'browse'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Browse All
          </button>
          <button
            onClick={() => setActiveTab('mine')}
            className={`flex-1 py-3 text-kid-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'mine'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            My Posts
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Featured section (only on browse tab) */}
          {activeTab === 'browse' && featured.length > 0 && (
            <FeaturedSection onTryOn={onTryOn} onView={handleView} />
          )}

          {/* Filters (only on browse tab) */}
          {activeTab === 'browse' && (
            <div className="bg-white rounded-kid-lg p-4 shadow-kid">
              <GalleryFilters />
            </div>
          )}

          {/* Grid */}
          <GalleryGrid
            posts={posts}
            onTryOn={onTryOn}
            onView={handleView}
            emptyMessage={
              activeTab === 'mine'
                ? "You haven't shared any outfits yet!"
                : 'No outfits match your filters.'
            }
          />
        </div>
      </div>
    </div>
  );
}

export default GalleryScreen;
