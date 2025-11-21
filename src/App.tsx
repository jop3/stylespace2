import { useState } from 'react'
import './index.css'
import Avatar2D from './components/Avatar2D'
import Avatar3D from './components/3d/Avatar3D'
import ClothingPanel from './components/ClothingPanel'
import ImageImporter from './components/ImageImporter'
import VRMUploader from './components/3d/VRMUploader'
import type { ClothingItem, ClothingType } from './types'

type ViewMode = '2d' | '3d'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('2d')

  // 2D State
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

  // 3D VRM State
  const [vrmUrl, setVrmUrl] = useState<string | null>(null)
  const [vrmFileName, setVrmFileName] = useState<string | null>(null)

  const handleImageImport = (imageUrl: string, type: ClothingType, name: string) => {
    const newItem: ClothingItem = {
      id: Date.now().toString(),
      name,
      type,
      imageUrl,
    }
    setClothingItems(prev => [...prev, newItem])

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

  const handleVRMUpload = (url: string, fileName: string) => {
    // Revoke old URL to prevent memory leak
    if (vrmUrl) {
      URL.revokeObjectURL(vrmUrl)
    }
    setVrmUrl(url)
    setVrmFileName(fileName)
  }

  return (
    <div className="w-full h-full flex">
      {/* Main Viewport */}
      <div className="flex-1 relative">
        {viewMode === '2d' ? (
          <Avatar2D activeClothing={activeClothing} />
        ) : (
          <Avatar3D vrmUrl={vrmUrl} />
        )}

        {/* Mode Switcher (floating) */}
        <div className="absolute top-4 left-4 flex bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <button
            onClick={() => setViewMode('2d')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === '2d'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            2D Paper Doll
          </button>
          <button
            onClick={() => setViewMode('3d')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === '3d'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            3D VRM
          </button>
        </div>
      </div>

      {/* Side Panel */}
      <div className="w-96 bg-gray-900 text-white p-4 flex flex-col gap-4 overflow-y-auto">
        <h1 className="text-2xl font-bold text-center">StyleSpace</h1>
        <p className="text-gray-400 text-sm text-center">
          {viewMode === '2d' ? '2D Paper Doll Mode' : '3D VRM Avatar Mode'}
        </p>

        {viewMode === '2d' ? (
          <>
            <ImageImporter onImport={handleImageImport} />
            <ClothingPanel
              clothingItems={clothingItems}
              activeClothing={activeClothing}
              onSelect={handleSelectClothing}
              onRemove={handleRemoveClothing}
            />
          </>
        ) : (
          <>
            <VRMUploader onUpload={handleVRMUpload} currentFile={vrmFileName} />

            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">3D Controls</h2>
              <ul className="text-sm text-gray-400 space-y-1">
                <li>• Drag to rotate camera</li>
                <li>• Scroll to zoom in/out</li>
                <li>• Right-drag to pan</li>
              </ul>
            </div>

            <div className="bg-gray-800 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-2">Coming Soon</h2>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Change VRM outfit textures</li>
                <li>• Pose animations</li>
                <li>• Expression controls</li>
                <li>• Screenshot/export</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
