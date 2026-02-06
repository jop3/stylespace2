import { EffectComposer, Bloom, SMAA, Vignette, ToneMapping } from '@react-three/postprocessing'
import { ToneMappingMode, BlendFunction } from 'postprocessing'

export interface PostProcessingProps {
  /** Enable bloom effect for emissive materials */
  enableBloom?: boolean
  /** Bloom intensity (default: 0.5) */
  bloomIntensity?: number
  /** Bloom luminance threshold (default: 0.9) */
  bloomThreshold?: number
  /** Bloom smoothing (default: 0.025) */
  bloomSmoothing?: number
  /** Enable anti-aliasing (SMAA) */
  enableAntialiasing?: boolean
  /** Enable vignette effect */
  enableVignette?: boolean
  /** Vignette darkness (default: 0.5) */
  vignetteDarkness?: number
  /** Vignette offset (default: 0.5) */
  vignetteOffset?: number
  /** Enable tone mapping */
  enableToneMapping?: boolean
}

/**
 * Post-processing effects for the 3D scene
 * Includes bloom, anti-aliasing, vignette, and tone mapping
 */
export default function PostProcessing({
  enableBloom = true,
  bloomIntensity = 0.5,
  bloomThreshold = 0.9,
  bloomSmoothing = 0.025,
  enableAntialiasing = true,
  enableVignette = false,
  vignetteDarkness = 0.5,
  vignetteOffset = 0.5,
  enableToneMapping = true,
}: PostProcessingProps) {
  // Build effects array based on enabled flags
  const effects: React.ReactElement[] = []

  if (enableToneMapping) {
    effects.push(<ToneMapping key="tone" mode={ToneMappingMode.ACES_FILMIC} />)
  }

  if (enableBloom) {
    effects.push(
      <Bloom
        key="bloom"
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={bloomSmoothing}
        blendFunction={BlendFunction.ADD}
        mipmapBlur
      />
    )
  }

  if (enableAntialiasing) {
    effects.push(<SMAA key="smaa" />)
  }

  if (enableVignette) {
    effects.push(
      <Vignette
        key="vignette"
        darkness={vignetteDarkness}
        offset={vignetteOffset}
        blendFunction={BlendFunction.NORMAL}
      />
    )
  }

  if (effects.length === 0) {
    return null
  }

  return <EffectComposer>{effects}</EffectComposer>
}

// Preset configurations for easy use
export const POST_PROCESSING_PRESETS = {
  none: {
    enableBloom: false,
    enableAntialiasing: false,
    enableVignette: false,
    enableToneMapping: false,
  },
  minimal: {
    enableBloom: false,
    enableAntialiasing: true,
    enableVignette: false,
    enableToneMapping: true,
  },
  standard: {
    enableBloom: true,
    bloomIntensity: 0.4,
    bloomThreshold: 0.9,
    enableAntialiasing: true,
    enableVignette: false,
    enableToneMapping: true,
  },
  cinematic: {
    enableBloom: true,
    bloomIntensity: 0.6,
    bloomThreshold: 0.85,
    bloomSmoothing: 0.03,
    enableAntialiasing: true,
    enableVignette: true,
    vignetteDarkness: 0.4,
    vignetteOffset: 0.5,
    enableToneMapping: true,
  },
  portrait: {
    enableBloom: true,
    bloomIntensity: 0.3,
    bloomThreshold: 0.95,
    enableAntialiasing: true,
    enableVignette: true,
    vignetteDarkness: 0.3,
    vignetteOffset: 0.6,
    enableToneMapping: true,
  },
} as const

export type PostProcessingPreset = keyof typeof POST_PROCESSING_PRESETS
