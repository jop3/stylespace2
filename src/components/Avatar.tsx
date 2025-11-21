import { useRef } from 'react'
import { Group } from 'three'
import TShirt from './clothing/TShirt'
import Pants from './clothing/Pants'
import Shoes from './clothing/Shoes'
import Dress from './clothing/Dress'
import type { ClothingItem, ClothingType } from '../types'

interface AvatarProps {
  activeClothing: Record<ClothingType, ClothingItem | null>
}

export default function Avatar({ activeClothing }: AvatarProps) {
  const groupRef = useRef<Group>(null)

  // Check if wearing a dress (hides separate top/bottom)
  const hasDress = activeClothing.dress !== null

  return (
    <group ref={groupRef}>
      {/* Simple humanoid body */}
      {/* Head */}
      <mesh position={[0, 2.1, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial color="#e8beac" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.15, 16]} />
        <meshStandardMaterial color="#e8beac" />
      </mesh>

      {/* Torso (base body under clothes) */}
      <mesh position={[0, 1.35, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 0.7, 16]} />
        <meshStandardMaterial color="#e8beac" />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.4, 1.4, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.06, 0.05, 0.6, 16]} />
        <meshStandardMaterial color="#e8beac" />
      </mesh>
      <mesh position={[0.4, 1.4, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.06, 0.05, 0.6, 16]} />
        <meshStandardMaterial color="#e8beac" />
      </mesh>

      {/* Hands */}
      <mesh position={[-0.55, 1.1, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#e8beac" />
      </mesh>
      <mesh position={[0.55, 1.1, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#e8beac" />
      </mesh>

      {/* Upper legs (base body under clothes) */}
      <mesh position={[-0.12, 0.65, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.5, 16]} />
        <meshStandardMaterial color="#e8beac" />
      </mesh>
      <mesh position={[0.12, 0.65, 0]}>
        <cylinderGeometry args={[0.1, 0.08, 0.5, 16]} />
        <meshStandardMaterial color="#e8beac" />
      </mesh>

      {/* Lower legs (visible below pants/dress) */}
      <mesh position={[-0.12, 0.2, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.4, 16]} />
        <meshStandardMaterial color="#e8beac" />
      </mesh>
      <mesh position={[0.12, 0.2, 0]}>
        <cylinderGeometry args={[0.07, 0.06, 0.4, 16]} />
        <meshStandardMaterial color="#e8beac" />
      </mesh>

      {/* Clothing items - dress replaces tshirt + pants */}
      {hasDress ? (
        <Dress imageUrl={activeClothing.dress?.imageUrl || null} />
      ) : (
        <>
          <TShirt imageUrl={activeClothing.tshirt?.imageUrl || null} />
          <Pants imageUrl={activeClothing.pants?.imageUrl || null} />
        </>
      )}
      <Shoes imageUrl={activeClothing.shoes?.imageUrl || null} />
    </group>
  )
}
