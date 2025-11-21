import { useSVGTexture } from '../../hooks/useSVGTexture'

interface TShirtProps {
  svg: string | null
}

export default function TShirt({ svg }: TShirtProps) {
  const texture = useSVGTexture(svg)

  if (!svg) return null

  return (
    <group position={[0, 1.35, 0]}>
      {/* Main torso */}
      <mesh>
        <cylinderGeometry args={[0.28, 0.23, 0.75, 16]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#3b82f6'} />
      </mesh>

      {/* Left sleeve */}
      <mesh position={[-0.35, 0.15, 0]} rotation={[0, 0, 0.8]}>
        <cylinderGeometry args={[0.1, 0.12, 0.25, 12]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#3b82f6'} />
      </mesh>

      {/* Right sleeve */}
      <mesh position={[0.35, 0.15, 0]} rotation={[0, 0, -0.8]}>
        <cylinderGeometry args={[0.1, 0.12, 0.25, 12]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#3b82f6'} />
      </mesh>

      {/* Collar */}
      <mesh position={[0, 0.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.03, 8, 16]} />
        <meshStandardMaterial map={texture} color={texture ? '#ffffff' : '#2563eb'} />
      </mesh>
    </group>
  )
}
