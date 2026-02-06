import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ShareableOutfit } from '../utils/shareUtils';

export interface GalleryPost extends ShareableOutfit {
  isFeatured?: boolean;
  viewCount: number;
}

interface GalleryStore {
  // Gallery posts
  posts: GalleryPost[];

  // User's own posts
  myPosts: Set<string>;

  // Voted posts (to prevent double voting)
  votedPosts: Set<string>;

  // Filters
  sortBy: 'newest' | 'popular' | 'featured';
  filterTag: string | null;

  // Actions
  addPost: (post: ShareableOutfit) => void;
  removePost: (postId: string) => void;
  voteForPost: (postId: string) => boolean;
  hasVoted: (postId: string) => boolean;
  incrementViewCount: (postId: string) => void;
  setFeatured: (postId: string, featured: boolean) => void;
  setSortBy: (sort: 'newest' | 'popular' | 'featured') => void;
  setFilterTag: (tag: string | null) => void;

  // Getters
  getFilteredPosts: () => GalleryPost[];
  getFeaturedPosts: () => GalleryPost[];
  getMyPosts: () => GalleryPost[];
  getPostById: (id: string) => GalleryPost | undefined;
}

// Sample posts for initial gallery
const samplePosts: GalleryPost[] = [
  {
    id: 'sample1',
    name: 'Beach Day Vibes',
    thumbnail: '',
    createdAt: Date.now() - 86400000 * 2,
    votes: 42,
    tags: ['summer', 'casual'],
    isFeatured: true,
    viewCount: 156
  },
  {
    id: 'sample2',
    name: 'Princess Dreams',
    thumbnail: '',
    createdAt: Date.now() - 86400000 * 1,
    votes: 38,
    tags: ['fantasy', 'elegant'],
    isFeatured: true,
    viewCount: 128
  },
  {
    id: 'sample3',
    name: 'Sporty Style',
    thumbnail: '',
    createdAt: Date.now() - 86400000 * 3,
    votes: 25,
    tags: ['sports', 'active'],
    isFeatured: false,
    viewCount: 89
  }
];

export const useGalleryStore = create<GalleryStore>()(
  persist(
    (set, get) => ({
      posts: samplePosts,
      myPosts: new Set(),
      votedPosts: new Set(),
      sortBy: 'newest',
      filterTag: null,

      addPost: (post) => {
        const newPost: GalleryPost = {
          ...post,
          viewCount: 0,
          isFeatured: false
        };
        set((state) => ({
          posts: [newPost, ...state.posts],
          myPosts: new Set([...state.myPosts, post.id])
        }));
      },

      removePost: (postId) => {
        set((state) => {
          const newMyPosts = new Set(state.myPosts);
          newMyPosts.delete(postId);
          return {
            posts: state.posts.filter((p) => p.id !== postId),
            myPosts: newMyPosts
          };
        });
      },

      voteForPost: (postId) => {
        const { votedPosts } = get();
        if (votedPosts.has(postId)) {
          return false;
        }
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, votes: p.votes + 1 } : p
          ),
          votedPosts: new Set([...state.votedPosts, postId])
        }));
        return true;
      },

      hasVoted: (postId) => get().votedPosts.has(postId),

      incrementViewCount: (postId) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, viewCount: p.viewCount + 1 } : p
          )
        }));
      },

      setFeatured: (postId, featured) => {
        set((state) => ({
          posts: state.posts.map((p) =>
            p.id === postId ? { ...p, isFeatured: featured } : p
          )
        }));
      },

      setSortBy: (sort) => set({ sortBy: sort }),

      setFilterTag: (tag) => set({ filterTag: tag }),

      getFilteredPosts: () => {
        const { posts, sortBy, filterTag } = get();
        let filtered = [...posts];

        // Apply tag filter
        if (filterTag) {
          filtered = filtered.filter((p) => p.tags.includes(filterTag));
        }

        // Apply sort
        switch (sortBy) {
          case 'newest':
            filtered.sort((a, b) => b.createdAt - a.createdAt);
            break;
          case 'popular':
            filtered.sort((a, b) => b.votes - a.votes);
            break;
          case 'featured':
            filtered = filtered.filter((p) => p.isFeatured);
            filtered.sort((a, b) => b.votes - a.votes);
            break;
        }

        return filtered;
      },

      getFeaturedPosts: () => {
        return get().posts
          .filter((p) => p.isFeatured)
          .sort((a, b) => b.votes - a.votes)
          .slice(0, 5);
      },

      getMyPosts: () => {
        const { posts, myPosts } = get();
        return posts.filter((p) => myPosts.has(p.id));
      },

      getPostById: (id) => get().posts.find((p) => p.id === id)
    }),
    {
      name: 'stylespace-gallery',
      partialPersist: ['posts', 'myPosts', 'votedPosts'],
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name);
          if (!str) return null;
          const data = JSON.parse(str);
          return {
            ...data,
            state: {
              ...data.state,
              myPosts: new Set(data.state.myPosts || []),
              votedPosts: new Set(data.state.votedPosts || [])
            }
          };
        },
        setItem: (name, value) => {
          const data = {
            ...value,
            state: {
              ...value.state,
              myPosts: Array.from(value.state.myPosts || []),
              votedPosts: Array.from(value.state.votedPosts || [])
            }
          };
          localStorage.setItem(name, JSON.stringify(data));
        },
        removeItem: (name) => localStorage.removeItem(name)
      }
    }
  )
);
