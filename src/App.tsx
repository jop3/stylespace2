import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useState } from 'react'
import './index.css'
import Avatar from './components/Avatar'
import ClothingPanel from './components/ClothingPanel'
import SVGImporter from './components/SVGImporter'
import type { ClothingItem, ClothingType } from './types'

function App() {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [activeClothing, setActiveClothing] = useState<Record<ClothingType, ClothingItem | null>>({
    tshirt: null,
    pants: null,
    shoes: null,
  })

  const handleSVGImport = (svg: string, type: ClothingType, name: string) => {
    const newItem: ClothingItem = {
      id: Date.now().toString(),
      name,
      type,
      svg,
    }
    setClothingItems(prev => [...prev, newItem])
    setActiveClothing(prev => ({ ...prev, [type]: newItem }))
  }

  const handleSelectClothing = (item: ClothingItem) => {
    setActiveClothing(prev => ({ ...prev, [item.type]: item }))
  }

  const handleRemoveClothing = (type: ClothingType) => {
    setActiveClothing(prev => ({ ...prev, [type]: null }))
  }

  return (
    <div className="w-full h-full flex">
      {/* 3D Viewport */}
      <div className="flex-1 bg-gradient-to-b from-gray-900 to-gray-800">
        <Canvas camera={{ position: [0, 1, 4], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-5, 5, -5]} intensity={0.5} />
          <Avatar activeClothing={activeClothing} />
          <OrbitControls
            target={[0, 1, 0]}
            minDistance={2}
            maxDistance={8}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
          />
          <gridHelper args={[10, 10, '#444', '#333']} />
        </Canvas>
      </div>

      {/* Side Panel */}
      <div className="w-96 bg-gray-900 text-white p-4 flex flex-col gap-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-center">StyleSpace</h1>
        <p className="text-gray-400 text-sm text-center">3D Avatar Dress-Up</p>

        <SVGImporter onImport={handleSVGImport} />

        <ClothingPanel
          clothingItems={clothingItems}
          activeClothing={activeClothing}
          onSelect={handleSelectClothing}
          onRemove={handleRemoveClothing}
        />
      </div>
    </div>
  )
}

export default App
