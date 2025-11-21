import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useVRM } from '../../hooks/useVRM'
import type { VRM } from '@pixiv/three-vrm'

interface VRMAvatarProps {
  url: string
  onError?: (error: string) => void
}

export default function VRMAvatar({ url, onError }: VRMAvatarProps) {
  const { vrm, loading, error } = useVRM(url)
  const vrmRef = useRef<VRM | null>(null)

  useEffect(() => {
    if (error && onError) {
      onError(error)
    }
  }, [error, onError])

  useEffect(() => {
    vrmRef.current = vrm
  }, [vrm])

  // Update VRM each frame (for animations, look-at, etc.)
  useFrame((_state, delta) => {
    if (vrmRef.current) {
      vrmRef.current.update(delta)
    }
  })

  if (loading) {
    return (
      <mesh position={[0, 1, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color="#4a90d9" wireframe />
      </mesh>
    )
  }

  if (!vrm) {
    return null
  }

  return <primitive object={vrm.scene} />
}
