import { GARMENT_SILHOUETTES, type GarmentType } from '../data/garmentSilhouettes'
import type { PatternItem } from './PatternImporter'

interface PatternWardrobeProps {
  items: PatternItem[]
  activeGarments: Record<GarmentType, PatternItem | null>
  onSelect: (item: PatternItem) => void
  onRemove: (type: GarmentType) => void
}

export default function PatternWardrobe({
  items,
  activeGarments,
  onSelect,
  onRemove,
}: PatternWardrobeProps) {
  const garmentTypes = Object.keys(GARMENT_SILHOUETTES) as GarmentType[]

  // Only show categories with items
  const categoriesWithItems = garmentTypes.filter((type) =>
    items.some((item) => item.garmentType === type)
  )

  if (items.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Wardrobe</h2>
        <p className="text-sm text-gray-500 text-center py-4">
          Your wardrobe is empty. Create clothing above!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <h2 className="text-lg font-semibold">Wardrobe</h2>

      {categoriesWithItems.map((type) => {
        const typeItems = items.filter((item) => item.garmentType === type)
        const activeItem = activeGarments[type]
        const silhouette = GARMENT_SILHOUETTES[type]

        return (
          <div key={type} className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-300">{silhouette.name}</h3>
              {activeItem && (
                <button
                  onClick={() => onRemove(type)}
                  className="text-xs text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {typeItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className={`relative aspect-square rounded overflow-hidden border-2 transition-all ${
                    activeItem?.id === item.id
                      ? 'border-blue-500 ring-2 ring-blue-500/50'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  title={item.name}
                >
                  {/* Pattern preview */}
                  <div
                    className="absolute inset-0"
                    style={{
                      backgroundImage: `url(${item.patternUrl})`,
                      backgroundSize: '24px 24px',
                      backgroundRepeat: 'repeat',
                    }}
                  />
                  {/* Mini silhouette overlay */}
                  <svg
                    viewBox={silhouette.viewBox}
                    className="absolute inset-0 w-full h-full opacity-30"
                  >
                    <path d={silhouette.path} fill="black" />
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
