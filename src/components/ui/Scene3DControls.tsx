import type { LightingPreset, CameraPreset, PostProcessingPreset, EnvironmentPreset } from '../3d/Avatar3D'

interface Scene3DControlsProps {
  lightingPreset: LightingPreset
  cameraPreset: CameraPreset
  postProcessingPreset: PostProcessingPreset
  environmentPreset: EnvironmentPreset
  onLightingChange: (preset: LightingPreset) => void
  onCameraChange: (preset: CameraPreset) => void
  onPostProcessingChange: (preset: PostProcessingPreset) => void
  onEnvironmentChange: (preset: EnvironmentPreset) => void
  className?: string
}

/**
 * Scene controls panel for adjusting lighting, camera, and post-processing
 */
export default function Scene3DControls({
  lightingPreset,
  cameraPreset,
  postProcessingPreset,
  environmentPreset,
  onLightingChange,
  onCameraChange,
  onPostProcessingChange,
  onEnvironmentChange,
  className = '',
}: Scene3DControlsProps) {
  return (
    <div className={`bg-gray-800 rounded-lg p-4 space-y-4 ${className}`}>
      {/* Lighting Presets */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Lighting</label>
        <div className="flex flex-wrap gap-1">
          <PresetButton
            label="Studio"
            isActive={lightingPreset === 'studio'}
            onClick={() => onLightingChange('studio')}
          />
          <PresetButton
            label="Outdoor"
            isActive={lightingPreset === 'outdoor'}
            onClick={() => onLightingChange('outdoor')}
          />
          <PresetButton
            label="Dramatic"
            isActive={lightingPreset === 'dramatic'}
            onClick={() => onLightingChange('dramatic')}
          />
          <PresetButton
            label="Soft"
            isActive={lightingPreset === 'soft'}
            onClick={() => onLightingChange('soft')}
          />
        </div>
      </div>

      {/* Camera Angles */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Camera Angle</label>
        <div className="flex flex-wrap gap-1">
          <PresetButton
            label="Front"
            isActive={cameraPreset === 'front'}
            onClick={() => onCameraChange('front')}
          />
          <PresetButton
            label="Side"
            isActive={cameraPreset === 'side'}
            onClick={() => onCameraChange('side')}
          />
          <PresetButton
            label="Back"
            isActive={cameraPreset === 'back'}
            onClick={() => onCameraChange('back')}
          />
          <PresetButton
            label="3/4"
            isActive={cameraPreset === 'threequarter'}
            onClick={() => onCameraChange('threequarter')}
          />
        </div>
      </div>

      {/* Post-Processing */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Effects</label>
        <div className="flex flex-wrap gap-1">
          <PresetButton
            label="Off"
            isActive={postProcessingPreset === 'none'}
            onClick={() => onPostProcessingChange('none')}
          />
          <PresetButton
            label="Minimal"
            isActive={postProcessingPreset === 'minimal'}
            onClick={() => onPostProcessingChange('minimal')}
          />
          <PresetButton
            label="Standard"
            isActive={postProcessingPreset === 'standard'}
            onClick={() => onPostProcessingChange('standard')}
          />
          <PresetButton
            label="Cinematic"
            isActive={postProcessingPreset === 'cinematic'}
            onClick={() => onPostProcessingChange('cinematic')}
          />
          <PresetButton
            label="Portrait"
            isActive={postProcessingPreset === 'portrait'}
            onClick={() => onPostProcessingChange('portrait')}
          />
        </div>
      </div>

      {/* Environment */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Environment</label>
        <div className="flex flex-wrap gap-1">
          <PresetButton
            label="Studio"
            isActive={environmentPreset === 'studio'}
            onClick={() => onEnvironmentChange('studio')}
          />
          <PresetButton
            label="City"
            isActive={environmentPreset === 'city'}
            onClick={() => onEnvironmentChange('city')}
          />
          <PresetButton
            label="Sunset"
            isActive={environmentPreset === 'sunset'}
            onClick={() => onEnvironmentChange('sunset')}
          />
          <PresetButton
            label="Dawn"
            isActive={environmentPreset === 'dawn'}
            onClick={() => onEnvironmentChange('dawn')}
          />
          <PresetButton
            label="Forest"
            isActive={environmentPreset === 'forest'}
            onClick={() => onEnvironmentChange('forest')}
          />
          <PresetButton
            label="Night"
            isActive={environmentPreset === 'night'}
            onClick={() => onEnvironmentChange('night')}
          />
        </div>
      </div>
    </div>
  )
}

interface PresetButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
}

function PresetButton({ label, isActive, onClick }: PresetButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-2 py-1 text-xs rounded transition-colors ${
        isActive
          ? 'bg-blue-600 text-white'
          : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
      }`}
    >
      {label}
    </button>
  )
}

// Compact version for toolbar use
interface SceneControlsCompactProps {
  lightingPreset: LightingPreset
  cameraPreset: CameraPreset
  postProcessingPreset: PostProcessingPreset
  onLightingChange: (preset: LightingPreset) => void
  onCameraChange: (preset: CameraPreset) => void
  onPostProcessingChange: (preset: PostProcessingPreset) => void
}

export function SceneControlsCompact({
  lightingPreset,
  cameraPreset,
  postProcessingPreset,
  onLightingChange,
  onCameraChange,
  onPostProcessingChange,
}: SceneControlsCompactProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        value={lightingPreset}
        onChange={(e) => onLightingChange(e.target.value as LightingPreset)}
        className="text-xs bg-gray-700 text-gray-200 rounded px-2 py-1 border-0 focus:ring-1 focus:ring-blue-500"
        title="Lighting"
      >
        <option value="studio">Studio</option>
        <option value="outdoor">Outdoor</option>
        <option value="dramatic">Dramatic</option>
        <option value="soft">Soft</option>
      </select>

      <select
        value={cameraPreset}
        onChange={(e) => onCameraChange(e.target.value as CameraPreset)}
        className="text-xs bg-gray-700 text-gray-200 rounded px-2 py-1 border-0 focus:ring-1 focus:ring-blue-500"
        title="Camera"
      >
        <option value="front">Front</option>
        <option value="side">Side</option>
        <option value="back">Back</option>
        <option value="threequarter">3/4 View</option>
      </select>

      <select
        value={postProcessingPreset}
        onChange={(e) => onPostProcessingChange(e.target.value as PostProcessingPreset)}
        className="text-xs bg-gray-700 text-gray-200 rounded px-2 py-1 border-0 focus:ring-1 focus:ring-blue-500"
        title="Effects"
      >
        <option value="none">No Effects</option>
        <option value="minimal">Minimal</option>
        <option value="standard">Standard</option>
        <option value="cinematic">Cinematic</option>
        <option value="portrait">Portrait</option>
      </select>
    </div>
  )
}
