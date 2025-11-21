import type { BodyType } from './Avatar2D'

export type StageStyle = 'none' | 'circle' | 'runway' | 'spotlight'

interface SceneControlsProps {
  bodyType: BodyType
  onBodyTypeChange: (type: BodyType) => void
  backgroundColor: string
  onBackgroundColorChange: (color: string) => void
  stageStyle: StageStyle
  onStageStyleChange: (style: StageStyle) => void
  show2DControls?: boolean
}

const BACKGROUND_PRESETS = [
  { name: 'Dark', color: '#1f2937' },
  { name: 'Navy', color: '#1e3a5f' },
  { name: 'Purple', color: '#4c1d95' },
  { name: 'Rose', color: '#9f1239' },
  { name: 'Forest', color: '#14532d' },
  { name: 'Sunset', color: '#7c2d12' },
  { name: 'Slate', color: '#334155' },
  { name: 'White', color: '#f8fafc' },
]

const BODY_TYPES: { value: BodyType; label: string; icon: string }[] = [
  { value: 'feminine', label: 'Feminine', icon: '♀' },
  { value: 'masculine', label: 'Masculine', icon: '♂' },
  { value: 'androgynous', label: 'Neutral', icon: '⚥' },
]

const STAGE_STYLES: { value: StageStyle; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'circle', label: 'Circle' },
  { value: 'runway', label: 'Runway' },
  { value: 'spotlight', label: 'Spotlight' },
]

export default function SceneControls({
  bodyType,
  onBodyTypeChange,
  backgroundColor,
  onBackgroundColorChange,
  stageStyle,
  onStageStyleChange,
  show2DControls = true,
}: SceneControlsProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-4">
      <h2 className="text-lg font-semibold">Scene Settings</h2>

      {/* Body Type Selector - only in 2D mode */}
      {show2DControls && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Body Type</label>
          <div className="flex gap-2">
            {BODY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => onBodyTypeChange(type.value)}
                className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                  bodyType === type.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                <span className="mr-1">{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stage Style Selector - only in 2D mode */}
      {show2DControls && (
        <div>
          <label className="block text-sm text-gray-400 mb-2">Stage Style</label>
          <div className="grid grid-cols-4 gap-2">
            {STAGE_STYLES.map((stage) => (
              <button
                key={stage.value}
                onClick={() => onStageStyleChange(stage.value)}
                className={`py-2 px-2 rounded text-xs font-medium transition-colors ${
                  stageStyle === stage.value
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {stage.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Background Color */}
      <div>
        <label className="block text-sm text-gray-400 mb-2">Background</label>
        <div className="grid grid-cols-4 gap-2">
          {BACKGROUND_PRESETS.map((preset) => (
            <button
              key={preset.color}
              onClick={() => onBackgroundColorChange(preset.color)}
              className={`h-10 rounded transition-all ${
                backgroundColor === preset.color
                  ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800'
                  : 'hover:scale-105'
              }`}
              style={{ backgroundColor: preset.color }}
              title={preset.name}
            />
          ))}
        </div>
        {/* Custom color picker */}
        <div className="mt-2 flex items-center gap-2">
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => onBackgroundColorChange(e.target.value)}
            className="w-10 h-8 rounded cursor-pointer"
          />
          <span className="text-xs text-gray-400">Custom color</span>
        </div>
      </div>
    </div>
  )
}
