import { GARMENT_SILHOUETTES, type GarmentType } from '../data/garmentSilhouettes'
import type { PatternItem } from './PatternImporter'

// Layer order for garments (higher = on top)
const GARMENT_LAYERS: Record<GarmentType, number> = {
  shoes: 1,
  pants: 2,
  skirt: 3,
  tshirt: 4,
  dress: 5,
  jacket: 6,
}

interface Avatar2DProps {
  activeGarments: Record<GarmentType, PatternItem | null>
}

export default function Avatar2D({ activeGarments }: Avatar2DProps) {
  // Get active garments sorted by layer
  const layers = Object.entries(activeGarments)
    .filter(([, item]) => item !== null)
    .map(([type, item]) => ({ type: type as GarmentType, item: item! }))
    .sort((a, b) => GARMENT_LAYERS[a.type] - GARMENT_LAYERS[b.type])

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="relative" style={{ width: '400px', height: '600px' }}>
        {/* Define patterns for each active garment */}
        <svg
          viewBox="0 0 400 600"
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 0 }}
        >
          <defs>
            {layers.map(({ item }) => (
              <pattern
                key={item.id}
                id={`pattern-${item.id}`}
                patternUnits="userSpaceOnUse"
                width="64"
                height="64"
              >
                <image
                  href={item.patternUrl}
                  width="64"
                  height="64"
                  preserveAspectRatio="xMidYMid slice"
                />
              </pattern>
            ))}
          </defs>

          {/* Base body silhouette */}
          <g className="body">
            {/* Head */}
            <ellipse cx="200" cy="80" rx="50" ry="60" fill="#e8beac" />
            {/* Hair hint */}
            <ellipse cx="200" cy="55" rx="52" ry="40" fill="#4a3728" />
            {/* Face */}
            <ellipse cx="200" cy="85" rx="45" ry="50" fill="#e8beac" />
            {/* Eyes */}
            <ellipse cx="182" cy="80" rx="5" ry="6" fill="#2d2d2d" />
            <ellipse cx="218" cy="80" rx="5" ry="6" fill="#2d2d2d" />
            {/* Mouth */}
            <path d="M 190 100 Q 200 108 210 100" stroke="#c9a090" strokeWidth="2" fill="none" />

            {/* Neck */}
            <rect x="185" y="130" width="30" height="25" fill="#e8beac" />

            {/* Body/Torso */}
            <path d="M140 155 L260 155 L265 320 L135 320 Z" fill="#e8beac" />

            {/* Arms */}
            <path d="M140 155 L105 165 L75 310 L95 315 L115 195 L140 185 Z" fill="#e8beac" />
            <path d="M260 155 L295 165 L325 310 L305 315 L285 195 L260 185 Z" fill="#e8beac" />

            {/* Hands */}
            <ellipse cx="85" cy="320" rx="15" ry="18" fill="#e8beac" />
            <ellipse cx="315" cy="320" rx="15" ry="18" fill="#e8beac" />

            {/* Legs */}
            <path d="M135 320 L175 320 L170 540 L130 540 Z" fill="#e8beac" />
            <path d="M225 320 L265 320 L270 540 L230 540 Z" fill="#e8beac" />

            {/* Feet */}
            <ellipse cx="150" cy="555" rx="25" ry="12" fill="#e8beac" />
            <ellipse cx="250" cy="555" rx="25" ry="12" fill="#e8beac" />
          </g>

          {/* Render garments with pattern fills */}
          {layers.map(({ type, item }) => {
            const silhouette = GARMENT_SILHOUETTES[type]
            return (
              <g key={item.id} style={{ zIndex: GARMENT_LAYERS[type] }}>
                {/* Main path */}
                <path
                  d={silhouette.path}
                  fill={`url(#pattern-${item.id})`}
                  stroke="#00000022"
                  strokeWidth="1"
                />
                {/* Extra paths (straps, details) */}
                {silhouette.extras.map((extraPath, i) => (
                  <path
                    key={i}
                    d={extraPath}
                    fill={`url(#pattern-${item.id})`}
                    stroke="#00000022"
                    strokeWidth="1"
                  />
                ))}
              </g>
            )
          })}
        </svg>

        {/* Placeholder when no clothing */}
        {layers.length === 0 && (
          <div className="absolute inset-0 flex items-end justify-center pb-16 pointer-events-none">
            <p className="text-gray-500 text-sm bg-gray-800/90 px-4 py-2 rounded">
              Add clothing with patterns!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
