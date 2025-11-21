import type { ClothingItem, ClothingType } from '../types'

interface ClothingPanelProps {
  clothingItems: ClothingItem[]
  activeClothing: Record<ClothingType, ClothingItem | null>
  onSelect: (item: ClothingItem) => void
  onRemove: (type: ClothingType) => void
}

export default function ClothingPanel({
  clothingItems,
  activeClothing,
  onSelect,
  onRemove,
}: ClothingPanelProps) {
  const clothingTypes: ClothingType[] = ['tshirt', 'pants', 'shoes']

  const getTypeLabel = (type: ClothingType) => {
    switch (type) {
      case 'tshirt':
        return 'T-Shirts'
      case 'pants':
        return 'Pants'
      case 'shoes':
        return 'Shoes'
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Wardrobe</h2>

      {clothingTypes.map((type) => {
        const items = clothingItems.filter((item) => item.type === type)
        const activeItem = activeClothing[type]

        return (
          <div key={type} className="bg-gray-800 rounded-lg p-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-300">{getTypeLabel(type)}</h3>
              {activeItem && (
                <button
                  onClick={() => onRemove(type)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            {items.length === 0 ? (
              <p className="text-xs text-gray-500">No items yet. Create one above!</p>
            ) : (
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
                    <div
                      className="w-full h-full bg-white"
                      dangerouslySetInnerHTML={{ __html: item.svg }}
                      style={{
                        transform: 'scale(0.5)',
                        transformOrigin: 'top left',
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {clothingItems.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">Your wardrobe is empty!</p>
          <p className="text-xs mt-1">Use the form above to create clothing items.</p>
        </div>
      )}
    </div>
  )
}
