import type { ClothingItem, ClothingType } from '../types'

interface ClothingPanelProps {
  clothingItems: ClothingItem[]
  activeClothing: Record<ClothingType, ClothingItem | null>
  onSelect: (item: ClothingItem) => void
  onRemove: (type: ClothingType) => void
}

const CLOTHING_CATEGORIES: { type: ClothingType; label: string }[] = [
  { type: 'tshirt', label: 'Tops' },
  { type: 'pants', label: 'Pants' },
  { type: 'dress', label: 'Dresses' },
  { type: 'jacket', label: 'Jackets' },
  { type: 'shoes', label: 'Shoes' },
  { type: 'accessories', label: 'Accessories' },
]

export default function ClothingPanel({
  clothingItems,
  activeClothing,
  onSelect,
  onRemove,
}: ClothingPanelProps) {
  // Only show categories that have items
  const categoriesWithItems = CLOTHING_CATEGORIES.filter(
    ({ type }) => clothingItems.some((item) => item.type === type)
  )

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Wardrobe</h2>

      {categoriesWithItems.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Your wardrobe is empty!</p>
          <p className="text-xs mt-1">Upload clothing images above to get started.</p>
        </div>
      ) : (
        categoriesWithItems.map(({ type, label }) => {
          const items = clothingItems.filter((item) => item.type === type)
          const activeItem = activeClothing[type]

          return (
            <div key={type} className="bg-gray-800 rounded-lg p-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium text-gray-300">{label}</h3>
                {activeItem && (
                  <button
                    onClick={() => onRemove(type)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className={`aspect-square rounded overflow-hidden border-2 transition-all ${
                      activeItem?.id === item.id
                        ? 'border-blue-500 ring-2 ring-blue-500/50'
                        : 'border-gray-700 hover:border-gray-500'
                    }`}
                    title={item.name}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain bg-gray-900"
                    />
                  </button>
                ))}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
