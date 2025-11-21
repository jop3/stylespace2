import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Suspense } from 'react'
import VRMAvatar from './VRMAvatar'

interface Avatar3DProps {
  vrmUrl: string | null
  onLoadError?: (error: string) => void
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#666" wireframe />
    </mesh>
  )
}

export default function Avatar3D({ vrmUrl, onLoadError }: Avatar3DProps) {
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-gray-800 to-gray-900">
      <Canvas
        camera={{ position: [0, 1.2, 2.5], fov: 35 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} />

        <Suspense fallback={<LoadingFallback />}>
          {vrmUrl ? (
            <VRMAvatar url={vrmUrl} onError={onLoadError} />
          ) : (
            <PlaceholderAvatar />
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
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        <Environment preset="city" />
      </Canvas>

      {/* Overlay for no VRM loaded */}
      {!vrmUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-gray-800/80 px-6 py-4 rounded-lg text-center">
            <p className="text-gray-300">No VRM avatar loaded</p>
            <p className="text-gray-500 text-sm mt-1">Upload a .vrm file to get started</p>
          </div>
        </div>
      )}
    </div>
  )
}

function PlaceholderAvatar() {
  return (
    <group position={[0, 0.9, 0]}>
      {/* Simple humanoid placeholder */}
      {/* Head */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#e8beac" />
      </mesh>
      {/* Body */}
      <mesh position={[0, 0.3, 0]}>
        <capsuleGeometry args={[0.15, 0.4, 8, 16]} />
        <meshStandardMaterial color="#4a5568" />
      </mesh>
      {/* Legs */}
      <mesh position={[-0.08, -0.2, 0]}>
        <capsuleGeometry args={[0.06, 0.3, 8, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.08, -0.2, 0]}>
        <capsuleGeometry args={[0.06, 0.3, 8, 16]} />
        <meshStandardMaterial color="#2d3748" />
      </mesh>
    </group>
  )
}
