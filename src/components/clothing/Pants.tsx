import { useImageTexture } from '../../hooks/useImageTexture'

interface PantsProps {
  imageUrl: string | null
}

export default function Pants({ imageUrl }: PantsProps) {
  const texture = useImageTexture(imageUrl)

  if (!imageUrl) return null

  return (
    <group position={[0, 0, 0]}>
      {/* Waist/hip area */}
      <mesh position={[0, 0.92, 0]}>
        <cylinderGeometry args={[0.22, 0.2, 0.15, 16]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#1e3a5f'} />
      </mesh>

      {/* Left leg */}
      <mesh position={[-0.12, 0.6, 0]}>
        <cylinderGeometry args={[0.11, 0.09, 0.6, 16]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#1e3a5f'} />
      </mesh>

      {/* Right leg */}
      <mesh position={[0.12, 0.6, 0]}>
        <cylinderGeometry args={[0.11, 0.09, 0.6, 16]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#1e3a5f'} />
      </mesh>
    </group>
  )
}
