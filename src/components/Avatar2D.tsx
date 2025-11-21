import type { ClothingItem, ClothingType } from '../types'
import { LAYER_ORDER } from '../types'

interface Avatar2DProps {
  activeClothing: Record<ClothingType, ClothingItem | null>
}

export default function Avatar2D({ activeClothing }: Avatar2DProps) {
  // Get all active clothing items sorted by layer order
  const layers = Object.entries(activeClothing)
    .filter(([, item]) => item !== null)
    .map(([type, item]) => ({ type: type as ClothingType, item: item! }))
    .sort((a, b) => LAYER_ORDER[a.type] - LAYER_ORDER[b.type])

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
      {/* Avatar container - fixed aspect ratio */}
      <div className="relative" style={{ width: '400px', height: '600px' }}>
        {/* Base body silhouette */}
        <svg
          viewBox="0 0 400 600"
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 0 }}
        >
          {/* Head */}
          <ellipse cx="200" cy="80" rx="50" ry="60" fill="#e8beac" />

          {/* Neck */}
          <rect x="185" y="130" width="30" height="30" fill="#e8beac" />

          {/* Body/Torso */}
          <path
            d="M140 160 L260 160 L270 320 L130 320 Z"
            fill="#e8beac"
          />

          {/* Left Arm */}
          <path
            d="M140 160 L100 170 L80 300 L100 310 L120 200 L140 200 Z"
            fill="#e8beac"
          />

          {/* Right Arm */}
          <path
            d="M260 160 L300 170 L320 300 L300 310 L280 200 L260 200 Z"
            fill="#e8beac"
          />

          {/* Left Leg */}
          <path
            d="M130 320 L170 320 L165 550 L125 550 Z"
            fill="#e8beac"
          />

          {/* Right Leg */}
          <path
            d="M230 320 L270 320 L275 550 L235 550 Z"
            fill="#e8beac"
          />
        </svg>

        {/* Clothing layers */}
        {layers.map(({ type, item }) => (
          <img
            key={item.id}
            src={item.imageUrl}
            alt={item.name}
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ zIndex: LAYER_ORDER[type] + 1 }}
          />
        ))}

        {/* Placeholder text when no clothing */}
        {layers.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 text-sm bg-gray-800/80 px-4 py-2 rounded">
              Upload clothing to dress your avatar!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
