import { useState } from 'react'
import './index.css'
import Avatar2D from './components/Avatar2D'
import ClothingPanel from './components/ClothingPanel'
import ImageImporter from './components/ImageImporter'
import type { ClothingItem, ClothingType } from './types'

function App() {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>([])
  const [activeClothing, setActiveClothing] = useState<Record<ClothingType, ClothingItem | null>>({
    body: null,
    underwear: null,
    pants: null,
    tshirt: null,
    dress: null,
    jacket: null,
    shoes: null,
    accessories: null,
  })

  const handleImageImport = (imageUrl: string, type: ClothingType, name: string) => {
    const newItem: ClothingItem = {
      id: Date.now().toString(),
      name,
      type,
      imageUrl,
    }
    setClothingItems(prev => [...prev, newItem])

    // If adding a dress, remove tshirt and pants; vice versa
    if (type === 'dress') {
      setActiveClothing(prev => ({ ...prev, dress: newItem, tshirt: null, pants: null }))
    } else if (type === 'tshirt' || type === 'pants') {
      setActiveClothing(prev => ({ ...prev, [type]: newItem, dress: null }))
    } else {
      setActiveClothing(prev => ({ ...prev, [type]: newItem }))
    }
  }

  const handleSelectClothing = (item: ClothingItem) => {
    if (item.type === 'dress') {
      setActiveClothing(prev => ({ ...prev, dress: item, tshirt: null, pants: null }))
    } else if (item.type === 'tshirt' || item.type === 'pants') {
      setActiveClothing(prev => ({ ...prev, [item.type]: item, dress: null }))
    } else {
      setActiveClothing(prev => ({ ...prev, [item.type]: item }))
    }
  }

  const handleRemoveClothing = (type: ClothingType) => {
    setActiveClothing(prev => ({ ...prev, [type]: null }))
  }

  return (
    <div className="w-full h-full flex">
      {/* 2D Avatar Viewport */}
      <div className="flex-1">
        <Avatar2D activeClothing={activeClothing} />
      </div>

      {/* Side Panel */}
      <div className="w-96 bg-gray-900 text-white p-4 flex flex-col gap-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-center">StyleSpace</h1>
        <p className="text-gray-400 text-sm text-center">2D Avatar Dress-Up</p>

        <ImageImporter onImport={handleImageImport} />

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
