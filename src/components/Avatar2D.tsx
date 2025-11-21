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

export type BodyType = 'feminine' | 'masculine' | 'androgynous'

interface Avatar2DProps {
  activeGarments: Record<GarmentType, PatternItem | null>
  bodyType: BodyType
  backgroundColor: string
  stageStyle: 'none' | 'circle' | 'runway' | 'spotlight'
}

// Body silhouettes for different body types
const BODY_SILHOUETTES: Record<BodyType, {
  torso: string
  leftArm: string
  rightArm: string
  leftLeg: string
  rightLeg: string
  head: { cx: number; cy: number; rx: number; ry: number }
  hair: { cx: number; cy: number; rx: number; ry: number; fill: string }
  neck: { x: number; y: number; width: number; height: number }
  leftHand: { cx: number; cy: number; rx: number; ry: number }
  rightHand: { cx: number; cy: number; rx: number; ry: number }
  leftFoot: { cx: number; cy: number; rx: number; ry: number }
  rightFoot: { cx: number; cy: number; rx: number; ry: number }
}> = {
  feminine: {
    torso: 'M155 155 L245 155 L255 200 L260 280 L250 320 L150 320 L140 280 L145 200 Z',
    leftArm: 'M155 160 L120 170 L90 310 L108 315 L125 200 L155 180 Z',
    rightArm: 'M245 160 L280 170 L310 310 L292 315 L275 200 L245 180 Z',
    leftLeg: 'M150 320 L185 320 L178 540 L142 540 Z',
    rightLeg: 'M215 320 L250 320 L258 540 L222 540 Z',
    head: { cx: 200, cy: 80, rx: 48, ry: 58 },
    hair: { cx: 200, cy: 50, rx: 55, ry: 45, fill: '#4a3728' },
    neck: { x: 187, y: 130, width: 26, height: 25 },
    leftHand: { cx: 99, cy: 320, rx: 13, ry: 16 },
    rightHand: { cx: 301, cy: 320, rx: 13, ry: 16 },
    leftFoot: { cx: 160, cy: 555, rx: 22, ry: 12 },
    rightFoot: { cx: 240, cy: 555, rx: 22, ry: 12 },
  },
  masculine: {
    torso: 'M135 155 L265 155 L270 200 L268 280 L260 320 L140 320 L132 280 L130 200 Z',
    leftArm: 'M135 158 L95 168 L62 310 L85 318 L108 195 L135 180 Z',
    rightArm: 'M265 158 L305 168 L338 310 L315 318 L292 195 L265 180 Z',
    leftLeg: 'M140 320 L190 320 L185 540 L135 540 Z',
    rightLeg: 'M210 320 L260 320 L265 540 L215 540 Z',
    head: { cx: 200, cy: 80, rx: 50, ry: 55 },
    hair: { cx: 200, cy: 55, rx: 48, ry: 35, fill: '#3d2b1f' },
    neck: { x: 182, y: 128, width: 36, height: 27 },
    leftHand: { cx: 73, cy: 320, rx: 16, ry: 20 },
    rightHand: { cx: 327, cy: 320, rx: 16, ry: 20 },
    leftFoot: { cx: 160, cy: 555, rx: 28, ry: 14 },
    rightFoot: { cx: 240, cy: 555, rx: 28, ry: 14 },
  },
  androgynous: {
    torso: 'M145 155 L255 155 L262 200 L264 280 L255 320 L145 320 L136 280 L138 200 Z',
    leftArm: 'M145 160 L108 170 L76 310 L96 316 L116 195 L145 180 Z',
    rightArm: 'M255 160 L292 170 L324 310 L304 316 L284 195 L255 180 Z',
    leftLeg: 'M145 320 L188 320 L182 540 L138 540 Z',
    rightLeg: 'M212 320 L255 320 L262 540 L218 540 Z',
    head: { cx: 200, cy: 80, rx: 49, ry: 56 },
    hair: { cx: 200, cy: 52, rx: 52, ry: 40, fill: '#5c4033' },
    neck: { x: 185, y: 130, width: 30, height: 25 },
    leftHand: { cx: 86, cy: 320, rx: 14, ry: 18 },
    rightHand: { cx: 314, cy: 320, rx: 14, ry: 18 },
    leftFoot: { cx: 160, cy: 555, rx: 25, ry: 13 },
    rightFoot: { cx: 240, cy: 555, rx: 25, ry: 13 },
  },
}

// Skin tones for variety
const SKIN_TONE = '#e8beac'

export default function Avatar2D({ activeGarments, bodyType, backgroundColor, stageStyle }: Avatar2DProps) {
  // Get active garments sorted by layer
  const layers = Object.entries(activeGarments)
    .filter(([, item]) => item !== null)
    .map(([type, item]) => ({ type: type as GarmentType, item: item! }))
    .sort((a, b) => GARMENT_LAYERS[a.type] - GARMENT_LAYERS[b.type])

  const body = BODY_SILHOUETTES[bodyType]

  // Stage/background rendering
  const renderStage = () => {
    switch (stageStyle) {
      case 'circle':
        return (
          <>
            <ellipse cx="200" cy="560" rx="180" ry="35" fill="rgba(0,0,0,0.3)" />
            <ellipse cx="200" cy="555" rx="160" ry="25" fill="rgba(100,100,120,0.4)" />
          </>
        )
      case 'runway':
        return (
          <>
            <rect x="120" y="400" width="160" height="200" fill="rgba(60,60,80,0.5)" />
            <line x1="120" y1="400" x2="120" y2="600" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <line x1="280" y1="400" x2="280" y2="600" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <line x1="200" y1="400" x2="200" y2="600" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="10,10" />
          </>
        )
      case 'spotlight':
        return (
          <>
            <defs>
              <radialGradient id="spotlight" cx="50%" cy="30%" r="70%">
                <stop offset="0%" stopColor="rgba(255,255,200,0.3)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0)" />
              </radialGradient>
            </defs>
            <rect x="0" y="0" width="400" height="600" fill="url(#spotlight)" />
            <ellipse cx="200" cy="560" rx="120" ry="30" fill="rgba(255,255,200,0.15)" />
          </>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="relative w-full h-full flex items-center justify-center transition-colors duration-300"
      style={{ backgroundColor }}
    >
      <div className="relative" style={{ width: '400px', height: '600px' }}>
        <svg
          viewBox="0 0 400 600"
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 0 }}
        >
          {/* Pattern definitions */}
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

          {/* Stage/Background elements */}
          {renderStage()}

          {/* Base body silhouette */}
          <g className="body">
            {/* Hair */}
            <ellipse
              cx={body.hair.cx}
              cy={body.hair.cy}
              rx={body.hair.rx}
              ry={body.hair.ry}
              fill={body.hair.fill}
            />

            {/* Head */}
            <ellipse
              cx={body.head.cx}
              cy={body.head.cy}
              rx={body.head.rx}
              ry={body.head.ry}
              fill={SKIN_TONE}
            />

            {/* Face details */}
            <ellipse cx="185" cy="80" rx="5" ry="6" fill="#2d2d2d" />
            <ellipse cx="215" cy="80" rx="5" ry="6" fill="#2d2d2d" />
            <path d="M 192 100 Q 200 108 208 100" stroke="#c9a090" strokeWidth="2" fill="none" />

            {/* Eyebrows - style varies by body type */}
            {bodyType === 'masculine' && (
              <>
                <path d="M 175 70 L 195 72" stroke="#3d2b1f" strokeWidth="2.5" />
                <path d="M 205 72 L 225 70" stroke="#3d2b1f" strokeWidth="2.5" />
              </>
            )}
            {bodyType === 'feminine' && (
              <>
                <path d="M 177 72 Q 185 69 195 72" stroke="#4a3728" strokeWidth="1.5" fill="none" />
                <path d="M 205 72 Q 215 69 223 72" stroke="#4a3728" strokeWidth="1.5" fill="none" />
              </>
            )}
            {bodyType === 'androgynous' && (
              <>
                <path d="M 177 71 L 194 72" stroke="#5c4033" strokeWidth="2" />
                <path d="M 206 72 L 223 71" stroke="#5c4033" strokeWidth="2" />
              </>
            )}

            {/* Neck */}
            <rect
              x={body.neck.x}
              y={body.neck.y}
              width={body.neck.width}
              height={body.neck.height}
              fill={SKIN_TONE}
            />

            {/* Body/Torso */}
            <path d={body.torso} fill={SKIN_TONE} />

            {/* Arms */}
            <path d={body.leftArm} fill={SKIN_TONE} />
            <path d={body.rightArm} fill={SKIN_TONE} />

            {/* Hands */}
            <ellipse
              cx={body.leftHand.cx}
              cy={body.leftHand.cy}
              rx={body.leftHand.rx}
              ry={body.leftHand.ry}
              fill={SKIN_TONE}
            />
            <ellipse
              cx={body.rightHand.cx}
              cy={body.rightHand.cy}
              rx={body.rightHand.rx}
              ry={body.rightHand.ry}
              fill={SKIN_TONE}
            />

            {/* Legs */}
            <path d={body.leftLeg} fill={SKIN_TONE} />
            <path d={body.rightLeg} fill={SKIN_TONE} />

            {/* Feet */}
            <ellipse
              cx={body.leftFoot.cx}
              cy={body.leftFoot.cy}
              rx={body.leftFoot.rx}
              ry={body.leftFoot.ry}
              fill={SKIN_TONE}
            />
            <ellipse
              cx={body.rightFoot.cx}
              cy={body.rightFoot.cy}
              rx={body.rightFoot.rx}
              ry={body.rightFoot.ry}
              fill={SKIN_TONE}
            />
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
