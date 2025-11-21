import { useImageTexture } from '../../hooks/useImageTexture'

interface ShoesProps {
  imageUrl: string | null
}

export default function Shoes({ imageUrl }: ShoesProps) {
  const texture = useImageTexture(imageUrl)

  if (!imageUrl) return null

  return (
    <group>
      {/* Left shoe */}
      <mesh position={[-0.12, 0.05, 0.05]}>
        <boxGeometry args={[0.12, 0.08, 0.22]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#1a1a1a'} />
      </mesh>

      {/* Right shoe */}
      <mesh position={[0.12, 0.05, 0.05]}>
        <boxGeometry args={[0.12, 0.08, 0.22]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#1a1a1a'} />
      </mesh>
    </group>
  )
}
