import { useState, useCallback } from 'react'
import './index.css'
import Avatar2D, { type BodyType } from './components/Avatar2D'
import Avatar3D from './components/3d/Avatar3D'
import PatternImporter, { type PatternItem } from './components/PatternImporter'
import PatternWardrobe from './components/PatternWardrobe'
import SceneControls, { type StageStyle } from './components/SceneControls'
import VRMUploader from './components/3d/VRMUploader'
import VRMGallery from './components/3d/VRMGallery'
import TextureSwapper from './components/3d/TextureSwapper'
import { type GarmentType } from './data/garmentSilhouettes'
import type { VRM } from '@pixiv/three-vrm'

type ViewMode = '2d' | '3d'

function App() {
  const [viewMode, setViewMode] = useState<ViewMode>('2d')

  // Unified pattern state (works for both 2D and 3D)
  const [patternItems, setPatternItems] = useState<PatternItem[]>([])
  const [activeGarments, setActiveGarments] = useState<Record<GarmentType, PatternItem | null>>({
    dress: null,
    tshirt: null,
    pants: null,
    skirt: null,
    jacket: null,
    shoes: null,
  })

  // Scene customization state
  const [bodyType, setBodyType] = useState<BodyType>('feminine')
  const [backgroundColor, setBackgroundColor] = useState('#1f2937')
  const [stageStyle, setStageStyle] = useState<StageStyle>('none')

  // 3D VRM State
  const [vrmUrl, setVrmUrl] = useState<string | null>(null)
  const [vrmFileName, setVrmFileName] = useState<string | null>(null)
  const [currentVRM, setCurrentVRM] = useState<VRM | null>(null)

  // Pattern handlers
  const handlePatternImport = (item: PatternItem) => {
    setPatternItems((prev) => [...prev, item])

    // Auto-apply to avatar
    const type = item.garmentType

    // Dress replaces shirt+pants+skirt
    if (type === 'dress') {
      setActiveGarments((prev) => ({
        ...prev,
        dress: item,
        tshirt: null,
        pants: null,
        skirt: null,
      }))
    }
    // Shirt/pants/skirt remove dress
    else if (type === 'tshirt' || type === 'pants' || type === 'skirt') {
      setActiveGarments((prev) => ({
        ...prev,
        [type]: item,
        dress: null,
      }))
    } else {
      setActiveGarments((prev) => ({ ...prev, [type]: item }))
    }
  }

  const handleSelectGarment = (item: PatternItem) => {
    const type = item.garmentType

    if (type === 'dress') {
      setActiveGarments((prev) => ({
        ...prev,
        dress: item,
        tshirt: null,
        pants: null,
        skirt: null,
      }))
    } else if (type === 'tshirt' || type === 'pants' || type === 'skirt') {
      setActiveGarments((prev) => ({
        ...prev,
        [type]: item,
        dress: null,
      }))
    } else {
      setActiveGarments((prev) => ({ ...prev, [type]: item }))
    }
  }

  const handleRemoveGarment = (type: GarmentType) => {
    setActiveGarments((prev) => ({ ...prev, [type]: null }))
  }

  // VRM handlers
  const handleVRMUpload = (url: string, fileName: string) => {
    if (vrmUrl && vrmUrl.startsWith('blob:')) {
      URL.revokeObjectURL(vrmUrl)
    }
    setVrmUrl(url)
    setVrmFileName(fileName)
    setCurrentVRM(null)
  }

  const handleVRMSelect = (url: string, name: string) => {
    if (vrmUrl && vrmUrl.startsWith('blob:')) {
      URL.revokeObjectURL(vrmUrl)
    }
    setVrmUrl(url)
    setVrmFileName(name)
    setCurrentVRM(null)
  }

  const handleVRMLoaded = useCallback((vrm: VRM) => {
    setCurrentVRM(vrm)
  }, [])

  return (
    <div className="w-full h-full flex">
      {/* Main Viewport */}
      <div className="flex-1 relative">
        {viewMode === '2d' ? (
          <Avatar2D
            activeGarments={activeGarments}
            bodyType={bodyType}
            backgroundColor={backgroundColor}
            stageStyle={stageStyle}
          />
        ) : (
          <Avatar3D
            vrmUrl={vrmUrl}
            onVRMLoaded={handleVRMLoaded}
            backgroundColor={backgroundColor}
          />
        )}

        {/* Mode Switcher */}
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
          {viewMode === '2d' ? '2D Paper Doll' : '3D VRM Avatar'}
        </p>

        {/* Scene Controls - show body type/stage only in 2D mode */}
        <SceneControls
          bodyType={bodyType}
          onBodyTypeChange={setBodyType}
          backgroundColor={backgroundColor}
          onBackgroundColorChange={setBackgroundColor}
          stageStyle={stageStyle}
          onStageStyleChange={setStageStyle}
          show2DControls={viewMode === '2d'}
        />

        {/* Unified Pattern Creator - works for both modes */}
        <PatternImporter onImport={handlePatternImport} />

        {/* Wardrobe - shared between modes */}
        <PatternWardrobe
          items={patternItems}
          activeGarments={activeGarments}
          onSelect={handleSelectGarment}
          onRemove={handleRemoveGarment}
        />

        {viewMode === '3d' && (
          <>
            <div className="border-t border-gray-700 pt-4">
              <h2 className="text-lg font-semibold mb-3">3D Avatar</h2>
            </div>

            <VRMGallery onSelect={handleVRMSelect} currentUrl={vrmUrl} />
            <VRMUploader onUpload={handleVRMUpload} currentFile={vrmFileName} />
            <TextureSwapper vrm={currentVRM} />

            <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-400">
              Drag to rotate • Scroll to zoom • Right-drag to pan
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
