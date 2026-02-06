import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense, useMemo, useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'
import VRMAvatar from './VRMAvatar'
import type { VRM } from '@pixiv/three-vrm'
import PostProcessing, { type PostProcessingPreset, POST_PROCESSING_PRESETS } from './PostProcessing'

// Lighting preset configurations
export type LightingPreset = 'studio' | 'outdoor' | 'dramatic' | 'soft'

interface LightingConfig {
  ambient: { intensity: number; color: string }
  key: { position: [number, number, number]; intensity: number; color: string }
  fill: { position: [number, number, number]; intensity: number; color: string }
  rim: { position: [number, number, number]; intensity: number; color: string }
  shadowMapSize: number
  shadowBias: number
  shadowNormalBias: number
}

const LIGHTING_PRESETS: Record<LightingPreset, LightingConfig> = {
  studio: {
    ambient: { intensity: 0.4, color: '#ffffff' },
    key: { position: [5, 5, 5], intensity: 1.2, color: '#ffffff' },
    fill: { position: [-4, 3, 4], intensity: 0.5, color: '#e8f4ff' },
    rim: { position: [0, 4, -5], intensity: 0.6, color: '#fff5e6' },
    shadowMapSize: 2048,
    shadowBias: -0.0001,
    shadowNormalBias: 0.02,
  },
  outdoor: {
    ambient: { intensity: 0.5, color: '#87ceeb' },
    key: { position: [10, 15, 5], intensity: 1.5, color: '#ffffcc' },
    fill: { position: [-5, 2, 5], intensity: 0.3, color: '#87ceeb' },
    rim: { position: [0, 3, -6], intensity: 0.2, color: '#ffd700' },
    shadowMapSize: 2048,
    shadowBias: -0.0001,
    shadowNormalBias: 0.03,
  },
  dramatic: {
    ambient: { intensity: 0.15, color: '#1a1a2e' },
    key: { position: [6, 8, 3], intensity: 1.8, color: '#ff9500' },
    fill: { position: [-6, 2, 4], intensity: 0.15, color: '#4a90d9' },
    rim: { position: [-2, 5, -4], intensity: 0.8, color: '#ff4444' },
    shadowMapSize: 2048,
    shadowBias: -0.0002,
    shadowNormalBias: 0.02,
  },
  soft: {
    ambient: { intensity: 0.7, color: '#ffffff' },
    key: { position: [3, 6, 4], intensity: 0.8, color: '#ffffff' },
    fill: { position: [-3, 4, 3], intensity: 0.6, color: '#ffffff' },
    rim: { position: [0, 3, -4], intensity: 0.3, color: '#ffffff' },
    shadowMapSize: 1024,
    shadowBias: -0.0001,
    shadowNormalBias: 0.02,
  },
}

// Camera preset angles
export type CameraPreset = 'front' | 'side' | 'back' | 'threequarter'

interface CameraPosition {
  position: [number, number, number]
  target: [number, number, number]
}

const CAMERA_PRESETS: Record<CameraPreset, CameraPosition> = {
  front: { position: [0, 1.2, 2.5], target: [0, 1, 0] },
  side: { position: [2.5, 1.2, 0], target: [0, 1, 0] },
  back: { position: [0, 1.2, -2.5], target: [0, 1, 0] },
  threequarter: { position: [1.8, 1.3, 1.8], target: [0, 1, 0] },
}

// Environment presets using drei's preset options
export type EnvironmentPreset = 'studio' | 'city' | 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'park' | 'lobby'

interface EnvironmentConfig {
  preset: 'sunset' | 'dawn' | 'night' | 'warehouse' | 'forest' | 'apartment' | 'studio' | 'city' | 'park' | 'lobby'
  backgroundBlur: number
  backgroundIntensity: number
  environmentIntensity: number
}

const ENVIRONMENT_PRESETS: Record<EnvironmentPreset, EnvironmentConfig> = {
  studio: {
    preset: 'studio',
    backgroundBlur: 0.5,
    backgroundIntensity: 0.3,
    environmentIntensity: 1,
  },
  city: {
    preset: 'city',
    backgroundBlur: 0,
    backgroundIntensity: 0.5,
    environmentIntensity: 1,
  },
  sunset: {
    preset: 'sunset',
    backgroundBlur: 0,
    backgroundIntensity: 0.8,
    environmentIntensity: 1.2,
  },
  dawn: {
    preset: 'dawn',
    backgroundBlur: 0,
    backgroundIntensity: 0.6,
    environmentIntensity: 0.9,
  },
  night: {
    preset: 'night',
    backgroundBlur: 0,
    backgroundIntensity: 0.4,
    environmentIntensity: 0.5,
  },
  warehouse: {
    preset: 'warehouse',
    backgroundBlur: 0.3,
    backgroundIntensity: 0.4,
    environmentIntensity: 1,
  },
  forest: {
    preset: 'forest',
    backgroundBlur: 0,
    backgroundIntensity: 0.7,
    environmentIntensity: 1,
  },
  apartment: {
    preset: 'apartment',
    backgroundBlur: 0.3,
    backgroundIntensity: 0.5,
    environmentIntensity: 1,
  },
  park: {
    preset: 'park',
    backgroundBlur: 0,
    backgroundIntensity: 0.6,
    environmentIntensity: 1,
  },
  lobby: {
    preset: 'lobby',
    backgroundBlur: 0.2,
    backgroundIntensity: 0.5,
    environmentIntensity: 1,
  },
}

interface Avatar3DProps {
  vrmUrl: string | null
  onLoadError?: (error: string) => void
  onVRMLoaded?: (vrm: VRM) => void
  backgroundColor?: string
  backgroundImage?: string | null
  lightingPreset?: LightingPreset
  cameraPreset?: CameraPreset
  onCameraPresetChange?: (preset: CameraPreset) => void
  postProcessingPreset?: PostProcessingPreset
  environmentPreset?: EnvironmentPreset
}

function LoadingFallback() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  )
}

function BackgroundImage({ url }: { url: string }) {
  const { scene } = useThree()

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.setCrossOrigin('anonymous')
    loader.load(url, (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      scene.background = texture
    })

    return () => {
      if (scene.background instanceof THREE.Texture) {
        scene.background.dispose()
        scene.background = null
      }
    }
  }, [url, scene])

  return null
}

// Optimized directional light with proper shadow configuration
function KeyLight({ config }: { config: LightingConfig }) {
  const lightRef = useRef<THREE.DirectionalLight>(null)

  useEffect(() => {
    if (lightRef.current) {
      const light = lightRef.current
      // Configure shadow camera for better coverage
      light.shadow.camera.left = -3
      light.shadow.camera.right = 3
      light.shadow.camera.top = 3
      light.shadow.camera.bottom = -3
      light.shadow.camera.near = 0.1
      light.shadow.camera.far = 20
      light.shadow.camera.updateProjectionMatrix()
    }
  }, [])

  return (
    <directionalLight
      ref={lightRef}
      position={config.key.position}
      intensity={config.key.intensity}
      color={config.key.color}
      castShadow
      shadow-mapSize-width={config.shadowMapSize}
      shadow-mapSize-height={config.shadowMapSize}
      shadow-bias={config.shadowBias}
      shadow-normalBias={config.shadowNormalBias}
    />
  )
}

// Camera controller for smooth transitions between presets
function CameraController({
  preset,
  controlsRef
}: {
  preset: CameraPreset
  controlsRef: React.RefObject<typeof OrbitControls | null>
}) {
  const { camera } = useThree()
  const isAnimating = useRef(false)

  useEffect(() => {
    const targetPos = CAMERA_PRESETS[preset]
    if (!targetPos || isAnimating.current) return

    isAnimating.current = true

    // Smooth camera transition
    const startPos = camera.position.clone()
    const endPos = new THREE.Vector3(...targetPos.position)
    const startTime = Date.now()
    const duration = 500 // ms

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)

      camera.position.lerpVectors(startPos, endPos, eased)

      if (controlsRef.current) {
        const controls = controlsRef.current as unknown as { target: THREE.Vector3; update: () => void }
        controls.target.set(...targetPos.target)
        controls.update()
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        isAnimating.current = false
      }
    }

    animate()
  }, [preset, camera, controlsRef])

  return null
}

// Setup tone mapping and renderer optimizations
function RendererSetup() {
  const { gl } = useThree()

  useEffect(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping
    gl.toneMappingExposure = 1.0
    gl.outputColorSpace = THREE.SRGBColorSpace
  }, [gl])

  return null
}

// Auto-frame camera to fit the VRM model
function AutoFrameCamera({
  vrm,
  controlsRef,
  enabled = true,
}: {
  vrm: VRM | null
  controlsRef: React.RefObject<typeof OrbitControls | null>
  enabled?: boolean
}) {
  const { camera } = useThree()
  const hasFramed = useRef(false)
  const lastVrmId = useRef<string | null>(null)

  useEffect(() => {
    if (!vrm || !enabled) return

    // Generate a unique ID for this VRM based on its scene UUID
    const vrmId = vrm.scene.uuid

    // Only frame if this is a new VRM
    if (lastVrmId.current === vrmId && hasFramed.current) return

    lastVrmId.current = vrmId
    hasFramed.current = true

    // Calculate bounding box of the VRM
    const box = new THREE.Box3().setFromObject(vrm.scene)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())

    // Calculate the optimal camera distance based on model size
    const maxDim = Math.max(size.x, size.y, size.z)
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180)
    const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.6

    // Target the upper body (face area) rather than center
    const targetY = center.y + size.y * 0.15 // Slightly above center for face focus

    // Animate camera to optimal position
    const startPos = camera.position.clone()
    const endPos = new THREE.Vector3(0, targetY, cameraDistance)
    const startTime = Date.now()
    const duration = 600 // ms

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Ease out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)

      camera.position.lerpVectors(startPos, endPos, eased)

      if (controlsRef.current) {
        const controls = controlsRef.current as unknown as { target: THREE.Vector3; update: () => void }
        const startTarget = controls.target.clone()
        const endTarget = new THREE.Vector3(0, targetY, 0)
        controls.target.lerpVectors(startTarget, endTarget, eased)
        controls.update()
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    // Small delay to ensure VRM is fully loaded and positioned
    setTimeout(animate, 100)
  }, [vrm, camera, controlsRef, enabled])

  return null
}

function Scene({
  vrmUrl,
  onLoadError,
  onVRMLoaded,
  backgroundColor,
  backgroundImage,
  lightingPreset,
  cameraPreset,
  postProcessingPreset,
  environmentPreset,
  autoFrame = true,
}: {
  vrmUrl: string | null
  onLoadError?: (error: string) => void
  onVRMLoaded?: (vrm: VRM) => void
  backgroundColor: string
  backgroundImage?: string | null
  lightingPreset: LightingPreset
  cameraPreset: CameraPreset
  postProcessingPreset: PostProcessingPreset
  environmentPreset: EnvironmentPreset
  autoFrame?: boolean
}) {
  const controlsRef = useRef(null)
  const [loadedVRM, setLoadedVRM] = useState<VRM | null>(null)
  const lightConfig = LIGHTING_PRESETS[lightingPreset]
  const envConfig = ENVIRONMENT_PRESETS[environmentPreset]

  // Handle VRM loaded callback and track locally for auto-frame
  const handleVRMLoaded = useCallback((vrm: VRM) => {
    setLoadedVRM(vrm)
    onVRMLoaded?.(vrm)
  }, [onVRMLoaded])

  // Convert hex to THREE.Color for floor
  const floorColor = useMemo(() => {
    const color = new THREE.Color(backgroundColor)
    // Darken the floor slightly relative to background
    color.multiplyScalar(0.5)
    return color
  }, [backgroundColor])

  return (
    <>
      <RendererSetup />
      <CameraController preset={cameraPreset} controlsRef={controlsRef} />

      {backgroundImage ? (
        <BackgroundImage url={backgroundImage} />
      ) : (
        <color attach="background" args={[backgroundColor]} />
      )}

      {/* Three-point lighting setup with proper shadow configuration */}
      <ambientLight
        intensity={lightConfig.ambient.intensity}
        color={lightConfig.ambient.color}
      />

      {/* Key light - main illumination with shadows */}
      <KeyLight config={lightConfig} />

      {/* Fill light - soften shadows */}
      <directionalLight
        position={lightConfig.fill.position}
        intensity={lightConfig.fill.intensity}
        color={lightConfig.fill.color}
      />

      {/* Rim/back light - edge definition */}
      <directionalLight
        position={lightConfig.rim.position}
        intensity={lightConfig.rim.intensity}
        color={lightConfig.rim.color}
      />

      <Suspense fallback={<LoadingFallback />}>
        {vrmUrl ? (
          <VRMAvatar
            url={vrmUrl}
            onError={onLoadError}
            onVRMLoaded={handleVRMLoaded}
          />
        ) : (
          <PlaceholderText />
        )}
      </Suspense>

      {/* Auto-frame camera when VRM loads */}
      <AutoFrameCamera vrm={loadedVRM} controlsRef={controlsRef} enabled={autoFrame} />

      <OrbitControls
        ref={controlsRef}
        target={[0, 1, 0]}
        minDistance={1.5}
        maxDistance={5}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.8}
        enableDamping
        dampingFactor={0.05}
      />

      {/* Floor/Stage */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color={floorColor} roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Stage rim for effect */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[2.9, 3, 32]} />
        <meshStandardMaterial color="#ffffff" opacity={0.1} transparent />
      </mesh>

      <Environment
        preset={envConfig.preset}
        background={!backgroundImage}
        blur={envConfig.backgroundBlur}
        environmentIntensity={envConfig.environmentIntensity}
      />

      {/* Post-processing effects */}
      {postProcessingPreset !== 'none' && (
        <PostProcessing {...POST_PROCESSING_PRESETS[postProcessingPreset]} />
      )}
    </>
  )
}

export default function Avatar3D({
  vrmUrl,
  onLoadError,
  onVRMLoaded,
  backgroundColor = '#1f2937',
  backgroundImage,
  lightingPreset = 'studio',
  cameraPreset = 'front',
  postProcessingPreset = 'standard',
  environmentPreset = 'studio',
}: Avatar3DProps) {
  return (
    <div className="relative w-full h-full">
      <Canvas
        camera={{ position: [0, 1.2, 2.5], fov: 35 }}
        shadows
        gl={{
          antialias: false, // Disable native antialias when using SMAA post-processing
          powerPreference: 'high-performance',
        }}
      >
        <Scene
          vrmUrl={vrmUrl}
          onLoadError={onLoadError}
          onVRMLoaded={onVRMLoaded}
          backgroundColor={backgroundColor}
          backgroundImage={backgroundImage}
          lightingPreset={lightingPreset}
          cameraPreset={cameraPreset}
          postProcessingPreset={postProcessingPreset}
          environmentPreset={environmentPreset}
        />
      </Canvas>

      {/* Loading indicator */}
      {vrmUrl && (
        <div className="absolute bottom-4 left-4 text-xs text-gray-500">
          Drag to rotate • Scroll to zoom
        </div>
      )}
    </div>
  )
}

// Export types and presets for use in parent components
export { LIGHTING_PRESETS, CAMERA_PRESETS, POST_PROCESSING_PRESETS, ENVIRONMENT_PRESETS }
export type { PostProcessingPreset }

function PlaceholderText() {
  return null // Just show empty scene, UI will have the prompt
}
