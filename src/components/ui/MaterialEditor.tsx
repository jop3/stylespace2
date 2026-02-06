import { useState, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import { isPBRMaterial, isMappableMaterial } from '../../utils/textureUtils'

export interface MaterialProperties {
  roughness: number
  metalness: number
  emissiveIntensity: number
  normalScale: number
  opacity: number
}

const DEFAULT_PROPERTIES: MaterialProperties = {
  roughness: 0.5,
  metalness: 0,
  emissiveIntensity: 0,
  normalScale: 1,
  opacity: 1,
}

interface MaterialEditorProps {
  /** The meshes to edit materials on */
  meshes: THREE.Mesh[]
  /** Whether the editor is visible */
  isVisible?: boolean
  /** Callback when properties change */
  onPropertiesChange?: (properties: MaterialProperties) => void
  /** Class name for styling */
  className?: string
}

/**
 * Material property editor for adjusting PBR material properties
 * Provides sliders for roughness, metalness, emissive intensity, and more
 */
export default function MaterialEditor({
  meshes,
  isVisible = true,
  onPropertiesChange,
  className = '',
}: MaterialEditorProps) {
  const [properties, setProperties] = useState<MaterialProperties>(DEFAULT_PROPERTIES)

  // Read initial properties from the first mesh's material
  useEffect(() => {
    if (meshes.length === 0) return

    const mesh = meshes[0]
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
    const material = materials[0]

    if (material && isPBRMaterial(material)) {
      setProperties({
        roughness: material.roughness,
        metalness: material.metalness,
        emissiveIntensity: material.emissiveIntensity,
        normalScale: material.normalScale?.x ?? 1,
        opacity: material.opacity,
      })
    }
  }, [meshes])

  // Apply property changes to all meshes
  const applyProperty = useCallback(
    (key: keyof MaterialProperties, value: number) => {
      meshes.forEach((mesh) => {
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

        materials.forEach((material) => {
          if (!material) return

          if (isPBRMaterial(material)) {
            switch (key) {
              case 'roughness':
                material.roughness = value
                break
              case 'metalness':
                material.metalness = value
                break
              case 'emissiveIntensity':
                material.emissiveIntensity = value
                break
              case 'normalScale':
                if (material.normalScale) {
                  material.normalScale.set(value, value)
                }
                break
              case 'opacity':
                material.opacity = value
                material.transparent = value < 1
                break
            }
            material.needsUpdate = true
          } else if (isMappableMaterial(material) && key === 'opacity') {
            // Non-PBR materials can still have opacity
            material.opacity = value
            material.transparent = value < 1
            material.needsUpdate = true
          }
        })
      })
    },
    [meshes]
  )

  const handleChange = useCallback(
    (key: keyof MaterialProperties, value: number) => {
      const newProperties = { ...properties, [key]: value }
      setProperties(newProperties)
      applyProperty(key, value)
      onPropertiesChange?.(newProperties)
    },
    [properties, applyProperty, onPropertiesChange]
  )

  const resetToDefaults = useCallback(() => {
    setProperties(DEFAULT_PROPERTIES)
    Object.entries(DEFAULT_PROPERTIES).forEach(([key, value]) => {
      applyProperty(key as keyof MaterialProperties, value)
    })
    onPropertiesChange?.(DEFAULT_PROPERTIES)
  }, [applyProperty, onPropertiesChange])

  if (!isVisible || meshes.length === 0) return null

  return (
    <div className={`bg-gray-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-200">Material Properties</h3>
        <button
          onClick={resetToDefaults}
          className="text-xs text-gray-400 hover:text-gray-200 transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="space-y-4">
        {/* Roughness */}
        <SliderControl
          label="Roughness"
          value={properties.roughness}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => handleChange('roughness', value)}
        />

        {/* Metalness */}
        <SliderControl
          label="Metalness"
          value={properties.metalness}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => handleChange('metalness', value)}
        />

        {/* Emissive Intensity */}
        <SliderControl
          label="Glow"
          value={properties.emissiveIntensity}
          min={0}
          max={2}
          step={0.05}
          onChange={(value) => handleChange('emissiveIntensity', value)}
        />

        {/* Normal Scale */}
        <SliderControl
          label="Normal Strength"
          value={properties.normalScale}
          min={0}
          max={2}
          step={0.05}
          onChange={(value) => handleChange('normalScale', value)}
        />

        {/* Opacity */}
        <SliderControl
          label="Opacity"
          value={properties.opacity}
          min={0}
          max={1}
          step={0.01}
          onChange={(value) => handleChange('opacity', value)}
        />
      </div>

      {/* Presets */}
      <div className="mt-4 pt-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 mb-2">Quick Presets</p>
        <div className="flex flex-wrap gap-2">
          <PresetButton
            label="Matte"
            onClick={() => {
              handleChange('roughness', 1)
              handleChange('metalness', 0)
            }}
          />
          <PresetButton
            label="Glossy"
            onClick={() => {
              handleChange('roughness', 0.2)
              handleChange('metalness', 0)
            }}
          />
          <PresetButton
            label="Metal"
            onClick={() => {
              handleChange('roughness', 0.3)
              handleChange('metalness', 1)
            }}
          />
          <PresetButton
            label="Plastic"
            onClick={() => {
              handleChange('roughness', 0.4)
              handleChange('metalness', 0)
            }}
          />
          <PresetButton
            label="Fabric"
            onClick={() => {
              handleChange('roughness', 0.9)
              handleChange('metalness', 0)
            }}
          />
        </div>
      </div>
    </div>
  )
}

interface SliderControlProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
}

function SliderControl({ label, value, min, max, step, onChange }: SliderControlProps) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <label className="text-gray-400">{label}</label>
        <span className="text-gray-500">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none
                   [&::-webkit-slider-thumb]:w-4
                   [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:rounded-full
                   [&::-webkit-slider-thumb]:bg-blue-500
                   [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:hover:bg-blue-400"
      />
    </div>
  )
}

interface PresetButtonProps {
  label: string
  onClick: () => void
}

function PresetButton({ label, onClick }: PresetButtonProps) {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
    >
      {label}
    </button>
  )
}

// Export material preset values for external use
export const MATERIAL_PRESETS = {
  matte: { roughness: 1, metalness: 0 },
  glossy: { roughness: 0.2, metalness: 0 },
  metal: { roughness: 0.3, metalness: 1 },
  plastic: { roughness: 0.4, metalness: 0 },
  fabric: { roughness: 0.9, metalness: 0 },
  glass: { roughness: 0.05, metalness: 0 },
  chrome: { roughness: 0.1, metalness: 1 },
} as const

export type MaterialPreset = keyof typeof MATERIAL_PRESETS
