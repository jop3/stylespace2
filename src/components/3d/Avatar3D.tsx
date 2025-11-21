import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import VRMAvatar from './VRMAvatar'
import type { VRM } from '@pixiv/three-vrm'

interface Avatar3DProps {
  vrmUrl: string | null
  onLoadError?: (error: string) => void
  onVRMLoaded?: (vrm: VRM) => void
}

function LoadingFallback() {
  return (
    <mesh position={[0, 1, 0]}>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  )
}

export default function Avatar3D({ vrmUrl, onLoadError, onVRMLoaded }: Avatar3DProps) {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-800 to-gray-900">
      <Canvas
        camera={{ position: [0, 1.2, 2.5], fov: 35 }}
        shadows
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} />
        <pointLight position={[0, 2, 2]} intensity={0.3} />

        <Suspense fallback={<LoadingFallback />}>
          {vrmUrl ? (
            <VRMAvatar
              url={vrmUrl}
              onError={onLoadError}
              onVRMLoaded={onVRMLoaded}
            />
          ) : (
            <PlaceholderText />
          )}
        </Suspense>

        <OrbitControls
          target={[0, 1, 0]}
          minDistance={1.5}
          maxDistance={5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.8}
        />

        {/* Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[3, 32]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        <Environment preset="city" />
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

function PlaceholderText() {
  return null // Just show empty scene, UI will have the prompt
}
