import React, { useRef, useCallback, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import * as THREE from 'three';
import VRMAvatar from './VRMAvatar';
import type { VRM } from '@pixiv/three-vrm';
import { RotateButton } from './RotateButton';

interface SimpleAvatarViewProps {
  vrmUrl: string | null;
  onLoadError?: (error: string) => void;
  onVRMLoaded?: (vrm: VRM) => void;
  backgroundColor?: string;
  showControls?: boolean;
  rotationSpeed?: number;
  autoRotate?: boolean;
}

/**
 * Controlled rotation for the avatar
 */
function AvatarRotation({
  children,
  targetRotation,
  autoRotate,
}: {
  children: React.ReactNode;
  targetRotation: number;
  autoRotate: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentRotation = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;

    if (autoRotate) {
      // Slow auto rotation
      currentRotation.current += delta * 0.3;
    } else {
      // Smooth interpolation to target rotation
      const diff = targetRotation - currentRotation.current;
      currentRotation.current += diff * 0.1;
    }

    groupRef.current.rotation.y = currentRotation.current;
  });

  return <group ref={groupRef}>{children}</group>;
}

/**
 * Auto-frame camera to fit the VRM model
 */
function AutoFrameCamera({ vrm }: { vrm: VRM | null }) {
  const { camera } = useThree();
  const hasFramed = useRef(false);

  useEffect(() => {
    if (!vrm || hasFramed.current) return;
    hasFramed.current = true;

    // Calculate bounding box of the VRM
    const box = new THREE.Box3().setFromObject(vrm.scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Calculate the optimal camera distance based on model size
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera as THREE.PerspectiveCamera).fov * (Math.PI / 180);
    const cameraDistance = Math.abs(maxDim / Math.sin(fov / 2)) * 0.55;

    // Target the upper body (face area)
    const targetY = center.y + size.y * 0.1;

    // Set camera position
    camera.position.set(0, targetY, cameraDistance);
    camera.lookAt(0, targetY, 0);
  }, [vrm, camera]);

  return null;
}

function LoadingSpinner() {
  return (
    <mesh position={[0, 1, 0]}>
      <torusGeometry args={[0.2, 0.05, 16, 32]} />
      <meshBasicMaterial color="#FF6B9D" />
    </mesh>
  );
}

function Scene({
  vrmUrl,
  onLoadError,
  onVRMLoaded,
  backgroundColor,
  targetRotation,
  autoRotate,
}: {
  vrmUrl: string | null;
  onLoadError?: (error: string) => void;
  onVRMLoaded?: (vrm: VRM) => void;
  backgroundColor: string;
  targetRotation: number;
  autoRotate: boolean;
}) {
  const [loadedVRM, setLoadedVRM] = useState<VRM | null>(null);

  const handleVRMLoaded = useCallback(
    (vrm: VRM) => {
      setLoadedVRM(vrm);
      onVRMLoaded?.(vrm);
    },
    [onVRMLoaded]
  );

  // Floor color - slightly darker than background
  const floorColor = new THREE.Color(backgroundColor).multiplyScalar(0.5);

  return (
    <>
      <color attach="background" args={[backgroundColor]} />

      {/* Soft ambient lighting */}
      <ambientLight intensity={0.6} color="#ffffff" />

      {/* Key light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      {/* Fill light */}
      <directionalLight position={[-3, 3, 3]} intensity={0.4} color="#e8f4ff" />

      {/* Rim light */}
      <directionalLight position={[0, 3, -5]} intensity={0.3} color="#fff5e6" />

      <PerspectiveCamera makeDefault position={[0, 1.2, 2.5]} fov={35} />

      <Suspense fallback={<LoadingSpinner />}>
        <AvatarRotation targetRotation={targetRotation} autoRotate={autoRotate}>
          {vrmUrl && (
            <VRMAvatar
              url={vrmUrl}
              onError={onLoadError}
              onVRMLoaded={handleVRMLoaded}
            />
          )}
        </AvatarRotation>
      </Suspense>

      <AutoFrameCamera vrm={loadedVRM} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[3, 32]} />
        <meshStandardMaterial color={floorColor} roughness={0.8} metalness={0.1} />
      </mesh>

      <Environment preset="studio" environmentIntensity={0.5} />
    </>
  );
}

/**
 * Kid-friendly 3D avatar viewer
 * Simple rotation controls instead of complex orbit controls
 */
export function SimpleAvatarView({
  vrmUrl,
  onLoadError,
  onVRMLoaded,
  backgroundColor = '#FFF8F0',
  showControls = true,
  rotationSpeed = Math.PI / 4, // 45 degrees per click
  autoRotate = false,
}: SimpleAvatarViewProps) {
  const [targetRotation, setTargetRotation] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(autoRotate);

  // Rotation handlers
  const handleRotateLeft = useCallback(() => {
    setIsAutoRotating(false);
    setTargetRotation((prev) => prev + rotationSpeed);
  }, [rotationSpeed]);

  const handleRotateRight = useCallback(() => {
    setIsAutoRotating(false);
    setTargetRotation((prev) => prev - rotationSpeed);
  }, [rotationSpeed]);

  // Touch/swipe support
  const touchStartRef = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
    setIsAutoRotating(false);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartRef.current === null) return;

      const deltaX = e.touches[0].clientX - touchStartRef.current;
      const rotationDelta = (deltaX / window.innerWidth) * Math.PI;

      setTargetRotation((prev) => prev - rotationDelta * 0.5);
      touchStartRef.current = e.touches[0].clientX;
    },
    []
  );

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
  }, []);

  return (
    <div
      className="relative w-full h-full"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Canvas
        shadows
        gl={{
          antialias: true,
          powerPreference: 'default',
        }}
      >
        <Scene
          vrmUrl={vrmUrl}
          onLoadError={onLoadError}
          onVRMLoaded={onVRMLoaded}
          backgroundColor={backgroundColor}
          targetRotation={targetRotation}
          autoRotate={isAutoRotating}
        />
      </Canvas>

      {/* Rotation controls */}
      {showControls && vrmUrl && (
        <div className="absolute bottom-24 left-0 right-0 flex justify-center gap-6 pointer-events-none">
          <div className="pointer-events-auto">
            <RotateButton
              direction="left"
              onClick={handleRotateLeft}
              size="lg"
            />
          </div>
          <div className="pointer-events-auto">
            <RotateButton
              direction="right"
              onClick={handleRotateRight}
              size="lg"
            />
          </div>
        </div>
      )}

      {/* Empty state prompt */}
      {!vrmUrl && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-6">
            <div className="text-kid-3xl mb-2">
              <span role="img" aria-label="sparkles">✨</span>
            </div>
            <p className="text-kid-lg font-semibold text-gray-600">
              Load an avatar to get started!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimpleAvatarView;
