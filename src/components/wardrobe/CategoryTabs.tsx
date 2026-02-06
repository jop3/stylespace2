import React from 'react';

export type ClothingCategory = 'tops' | 'bottoms' | 'dresses' | 'shoes' | 'accessories' | 'hair';

interface CategoryTabsProps {
  activeCategory: ClothingCategory;
  onCategoryChange: (category: ClothingCategory) => void;
  itemCounts?: Record<ClothingCategory, number>;
}

interface CategoryConfig {
  id: ClothingCategory;
  emoji: string;
  label: string;
}

const categories: CategoryConfig[] = [
  { id: 'tops', emoji: '👕', label: 'Tops' },
  { id: 'bottoms', emoji: '👖', label: 'Bottoms' },
  { id: 'dresses', emoji: '👗', label: 'Dresses' },
  { id: 'shoes', emoji: '👟', label: 'Shoes' },
  { id: 'accessories', emoji: '🎀', label: 'Accessories' },
  { id: 'hair', emoji: '💇', label: 'Hair' },
];

/**
 * Horizontal scrolling category tabs for wardrobe
 * Kid-friendly with emoji icons
 */
export function CategoryTabs({
  activeCategory,
  onCategoryChange,
  itemCounts = {} as Record<ClothingCategory, number>,
}: CategoryTabsProps) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
      <div className="flex gap-2 min-w-max py-1">
        {categories.map((category) => {
          const isActive = activeCategory === category.id;
          const count = itemCounts[category.id] || 0;

          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`
                flex flex-col items-center gap-1
                px-4 py-3 rounded-kid-lg
                transition-all duration-normal
                min-w-[80px]
                ${
                  isActive
                    ? 'bg-primary text-white shadow-glow-pink'
                    : 'bg-white text-gray-600 shadow-kid hover:shadow-kid-lg'
                }
              `}
              aria-current={isActive ? 'true' : undefined}
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {category.emoji}
              </span>
              <span className="text-kid-xs font-semibold">{category.label}</span>
              {count > 0 && (
                <span
                  className={`
                    text-xs px-1.5 py-0.5 rounded-full
                    ${isActive ? 'bg-white/20' : 'bg-gray-100'}
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CategoryTabs;
