import * as THREE from 'three'
import { useImageTexture } from '../../hooks/useImageTexture'

interface DressProps {
  imageUrl: string | null
}

export default function Dress({ imageUrl }: DressProps) {
  const texture = useImageTexture(imageUrl)

  if (!imageUrl) return null

  return (
    <group position={[0, 0.9, 0]}>
      {/* Bodice - upper part */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 0.5, 16]} />
        <meshStandardMaterial
          map={texture}
          color={texture ? '#ffffff' : '#8b5cf6'}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Skirt - flared bottom */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.45, 0.7, 24]} />
        <meshStandardMaterial
          map={texture}
          color={texture ? '#ffffff' : '#8b5cf6'}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Straps */}
      <mesh position={[-0.15, 0.75, 0]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.05, 0.15, 0.02]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#7c3aed'} />
      </mesh>
      <mesh position={[0.15, 0.75, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.05, 0.15, 0.02]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#7c3aed'} />
      </mesh>
    </group>
  )
}
