import { useState, useEffect, useCallback } from 'react'
import type { VRM } from '@pixiv/three-vrm'
import { type AssetCategory, ASSET_CATEGORIES } from '../../data/downloadedAssets'
import { useMeshGroups } from '../../hooks/useMeshGroups'
import { useSmartMeshDetection, type DetectionConfidence } from '../../hooks/useSmartMeshDetection'
import {
  applyTextureToMeshes,
  createTextureFromImage,
  isValidAssetPath,
} from '../../utils/textureUtils'

interface DownloadedAsset {
  id: string
  name: string
  path: string
  category: AssetCategory
}

interface DownloadedAssetsProps {
  vrm: VRM | null
  onModelSelect: (url: string, name: string) => void
  currentModelUrl: string | null
  compact?: boolean
}

/**
 * Fetches the asset manifest from public folder
 */
async function fetchAssetManifest(): Promise<DownloadedAsset[]> {
  try {
    const response = await fetch('/downloads/manifest.json')
    if (response.ok) {
      return await response.json()
    }
  } catch {
    // Manifest doesn't exist yet
  }
  return []
}

export default function DownloadedAssets({ vrm, onModelSelect, currentModelUrl, compact = false }: DownloadedAssetsProps) {
  const [assets, setAssets] = useState<DownloadedAsset[]>([])
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('Models')
  const [loading, setLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showPicker, setShowPicker] = useState(false)

  // Detection state
  const [suggestedMesh, setSuggestedMesh] = useState<string | null>(null)
  const [detectionConfidence, setDetectionConfidence] = useState<DetectionConfidence | null>(null)
  const [alternativeSuggestions, setAlternativeSuggestions] = useState<string[]>([])

  // Use shared hooks
  const {
    meshGroups,
    allMeshes,
    selectedGroup,
    selectedMesh,
    groupedMode,
    setSelectedGroup,
    setSelectedMesh,
    toggleGroupedMode,
    getSelectedMeshes,
    resetSelectedTextures,
  } = useMeshGroups(vrm)

  const analyzeMeshTarget = useSmartMeshDetection(meshGroups)

  const clearDetectionHints = useCallback(() => {
    setSuggestedMesh(null)
    setDetectionConfidence(null)
    setAlternativeSuggestions([])
    setLoadError(null)
  }, [])

  // Load asset manifest on mount
  useEffect(() => {
    fetchAssetManifest().then((data) => {
      setAssets(data)
      setLoading(false)
    })
  }, [])

  const filteredAssets = assets.filter((a) => a.category === selectedCategory)

  const handleTextureApply = (asset: DownloadedAsset) => {
    if (!vrm) return

    // Validate asset path for security
    if (!isValidAssetPath(asset.path)) {
      setLoadError('Invalid asset path')
      return
    }

    setLoadError(null)
    setIsApplying(true)

    // Analyze asset name to suggest mesh (using category for better detection)
    const detection = analyzeMeshTarget(asset.name, asset.category)
    if (detection.meshName && groupedMode) {
      setSuggestedMesh(detection.meshName)
      setDetectionConfidence(detection.confidence)
      setAlternativeSuggestions(detection.alternatives)
      setSelectedGroup(detection.meshName)
    } else {
      clearDetectionHints()
    }

    const meshesToApply = getSelectedMeshes()
    if (meshesToApply.length === 0) {
      setLoadError('No mesh selected')
      setIsApplying(false)
      return
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      const texture = createTextureFromImage(img)
      applyTextureToMeshes({
        texture,
        meshes: meshesToApply,
        onComplete: () => {
          setIsApplying(false)
        },
      })
    }

    img.onerror = () => {
      setLoadError(`Failed to load image: ${asset.name}`)
      setIsApplying(false)
    }

    img.src = asset.path
  }

  const handleResetTextures = () => {
    resetSelectedTextures()
    clearDetectionHints()
  }

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value)
    clearDetectionHints()
  }

  const handleMeshChange = (value: string) => {
    setSelectedMesh(value)
    clearDetectionHints()
  }

  const isTextureCategory = selectedCategory !== 'Models'

  // Get model assets for compact mode
  const modelAssets = assets.filter((a) => a.category === 'Models')

  // Compact mode - just a button that opens a model picker
  if (compact) {
    if (loading) {
      return (
        <button
          disabled
          className="w-full h-touch flex items-center justify-center gap-2 bg-gray-100 text-gray-400 rounded-kid-lg font-semibold"
        >
          Loading...
        </button>
      )
    }

    if (modelAssets.length === 0) {
      return (
        <button
          disabled
          className="w-full h-touch flex items-center justify-center gap-2 bg-gray-100 text-gray-400 rounded-kid-lg font-semibold"
        >
          No Models Available
        </button>
      )
    }

    return (
      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="w-full h-touch flex items-center justify-center gap-2 bg-mint text-white rounded-kid-lg font-semibold shadow-kid hover:shadow-glow-mint transition-all"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Browse Models
        </button>

        {showPicker && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-kid-lg shadow-kid-lg border border-gray-200 p-3 max-h-60 overflow-y-auto z-dropdown">
            <div className="grid grid-cols-2 gap-2">
              {modelAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => {
                    onModelSelect(asset.path, asset.name)
                    setShowPicker(false)
                  }}
                  className={`p-3 rounded-kid text-center transition-all ${
                    currentModelUrl === asset.path
                      ? 'bg-mint/20 ring-2 ring-mint'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="text-2xl mb-1">🧑</div>
                  <div className="text-kid-xs font-medium text-gray-700 truncate">{asset.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Downloaded Assets</h2>
        <p className="text-sm text-gray-500">Loading...</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <h2 className="text-lg font-semibold">Downloaded Assets</h2>

      {assets.length === 0 ? (
        <div className="text-sm text-gray-400 space-y-2">
          <p>No assets found. Add files to:</p>
          <code className="block bg-gray-900 p-2 rounded text-xs">
            public/downloads/
          </code>
          <p className="text-xs">Then run: <code className="bg-gray-900 px-1 rounded">npm run scan-assets</code></p>
        </div>
      ) : (
        <>
          {/* Category tabs */}
          <div className="flex flex-wrap gap-1">
            {ASSET_CATEGORIES.map((cat) => {
              const count = assets.filter((a) => a.category === cat).length
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    selectedCategory === cat
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {cat} ({count})
                </button>
              )
            })}
          </div>

          {/* Mesh selector for textures */}
          {isTextureCategory && vrm && (meshGroups.size > 0 || allMeshes.length > 0) && (
            <div className="space-y-2">
              {/* Toggle between grouped and individual mode */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-400">Apply to:</label>
                <button
                  onClick={toggleGroupedMode}
                  className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
                  title={groupedMode ? 'Switch to individual mesh selection' : 'Switch to grouped selection'}
                >
                  {groupedMode ? 'Grouped' : 'Individual'} ⇄
                </button>
                <button
                  onClick={handleResetTextures}
                  className="text-xs px-2 py-1 rounded bg-red-700 hover:bg-red-600 transition-colors ml-auto"
                  title="Reset to original textures"
                >
                  Reset
                </button>
              </div>

              {/* Auto-detection hint with confidence */}
              {suggestedMesh && detectionConfidence && (
                <div className="space-y-1">
                  <div
                    className={`text-xs p-2 rounded border ${
                      detectionConfidence === 'high'
                        ? 'bg-green-900/50 text-green-200 border-green-700'
                        : detectionConfidence === 'medium'
                        ? 'bg-blue-900/50 text-blue-200 border-blue-700'
                        : 'bg-yellow-900/50 text-yellow-200 border-yellow-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>
                        {detectionConfidence === 'high'
                          ? '✓'
                          : detectionConfidence === 'medium'
                          ? '💡'
                          : '?'}
                      </span>
                      <span className="font-semibold">
                        Auto-selected: {suggestedMesh}
                      </span>
                      <span className="ml-auto text-xs opacity-75">
                        {detectionConfidence === 'high'
                          ? 'High confidence'
                          : detectionConfidence === 'medium'
                          ? 'Medium confidence'
                          : 'Low confidence'}
                      </span>
                    </div>
                    {alternativeSuggestions.length > 0 && (
                      <div className="mt-1 text-xs opacity-75">
                        Also consider: {alternativeSuggestions.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Error message */}
              {loadError && (
                <div className="text-xs p-2 rounded border bg-red-900/50 text-red-200 border-red-700">
                  {loadError}
                </div>
              )}

              {/* Loading indicator */}
              {isApplying && (
                <div className="text-xs text-gray-500">Applying texture...</div>
              )}

              {/* Mesh selector */}
              {groupedMode ? (
                <select
                  value={selectedGroup || ''}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 text-sm"
                >
                  {Array.from(meshGroups.entries()).map(([groupName, groupMeshes]) => (
                    <option key={groupName} value={groupName}>
                      {groupName} ({groupMeshes.length} mesh{groupMeshes.length > 1 ? 'es' : ''})
                    </option>
                  ))}
                </select>
              ) : (
                <select
                  value={selectedMesh || ''}
                  onChange={(e) => handleMeshChange(e.target.value)}
                  className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 text-sm"
                >
                  {allMeshes.map((mesh, index) => (
                    <option key={`${mesh.name}-${index}`} value={mesh.name}>
                      {mesh.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Asset grid */}
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => {
                  if (selectedCategory === 'Models') {
                    onModelSelect(asset.path, asset.name)
                  } else {
                    handleTextureApply(asset)
                  }
                }}
                disabled={isApplying}
                className={`p-2 rounded-lg text-center transition-all ${
                  selectedCategory === 'Models' && currentModelUrl === asset.path
                    ? 'bg-purple-600 ring-2 ring-purple-400'
                    : 'bg-gray-700 hover:bg-gray-600'
                } ${isApplying ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={asset.name}
              >
                {selectedCategory === 'Models' ? (
                  <div className="text-2xl mb-1">🧑</div>
                ) : (
                  <img
                    src={asset.path}
                    alt={asset.name}
                    className="w-full h-12 object-cover rounded mb-1"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none'
                    }}
                  />
                )}
                <div className="text-xs font-medium truncate">{asset.name}</div>
              </button>
            ))}
          </div>

          {filteredAssets.length === 0 && (
            <p className="text-xs text-gray-500 text-center py-4">
              No {selectedCategory.toLowerCase()} found
            </p>
          )}
        </>
      )}
    </div>
  )
}
