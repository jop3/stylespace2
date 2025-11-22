import { useState, useEffect } from 'react'
import type { VRM } from '@pixiv/three-vrm'
import * as THREE from 'three'
import { type AssetCategory, ASSET_CATEGORIES } from '../../data/downloadedAssets'

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
}

// Fetch the asset manifest from public folder
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

export default function DownloadedAssets({ vrm, onModelSelect, currentModelUrl }: DownloadedAssetsProps) {
  const [assets, setAssets] = useState<DownloadedAsset[]>([])
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('Models')
  const [loading, setLoading] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [meshGroups, setMeshGroups] = useState<Map<string, THREE.Mesh[]>>(new Map())
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null)
  const [allMeshes, setAllMeshes] = useState<{ name: string; mesh: THREE.Mesh }[]>([])
  const [groupedMode, setGroupedMode] = useState(true)
  const [originalTextures] = useState<Map<THREE.Material, THREE.Texture | null>>(new Map())
  const [suggestedMesh, setSuggestedMesh] = useState<string | null>(null)
  const [detectionConfidence, setDetectionConfidence] = useState<'low' | 'medium' | 'high' | null>(null)
  const [alternativeSuggestions, setAlternativeSuggestions] = useState<string[]>([])

  // Enhanced mesh detection with priority weighting, confidence scoring, and category context
  const analyzeMeshTarget = (
    assetName: string,
    category?: string
  ): {
    meshName: string | null
    confidence: 'low' | 'medium' | 'high' | null
    alternatives: string[]
  } => {
    const lower = assetName.toLowerCase()
    const categoryLower = category?.toLowerCase() || ''

    // Priority-weighted keywords (higher priority = more specific/reliable)
    const meshHints: Record<string, { high: string[]; medium: string[]; low: string[] }> = {
      Face: {
        high: ['face', 'facial', 'makeup', 'skintone', 'complexion'],
        medium: ['head', 'skin', 'portrait'],
        low: ['eye', 'mouth', 'nose', 'cheek', 'forehead'],
      },
      Body: {
        high: ['torso', 'bodytexture', 'bodyskin'],
        medium: ['body', 'chest', 'shirt', 'top', 'dress', 'jacket', 'coat', 'blouse', 'sweater'],
        low: ['clothing', 'fabric', 'wear'],
      },
      Hair: {
        high: ['hair', 'hairstyle', 'haircolor'],
        medium: ['wig', 'bangs', 'ponytail'],
        low: ['strand', 'curl'],
      },
      Leg: {
        high: ['pants', 'trousers', 'jeans', 'leggings'],
        medium: ['leg', 'skirt', 'shorts', 'legwear'],
        low: ['thigh', 'knee', 'shin'],
      },
      Arm: {
        high: ['sleeve', 'armwear', 'gloves'],
        medium: ['arm', 'forearm', 'bicep'],
        low: ['hand', 'wrist', 'elbow'],
      },
      Foot: {
        high: ['shoe', 'boot', 'footwear', 'sneaker', 'sandal'],
        medium: ['foot', 'feet', 'sock', 'stocking'],
        low: ['toe', 'heel', 'ankle'],
      },
    }

    // Score each mesh group
    const scores: Record<string, number> = {}

    for (const [groupName, priorities] of Object.entries(meshHints)) {
      let score = 0

      // Check high priority keywords (worth 10 points each)
      for (const keyword of priorities.high) {
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i')
        const containsRegex = new RegExp(keyword, 'i')

        if (wordBoundaryRegex.test(lower)) {
          score += 10 // Exact word match
        } else if (containsRegex.test(lower)) {
          score += 7 // Substring match
        }
      }

      // Check medium priority keywords (worth 5 points each)
      for (const keyword of priorities.medium) {
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i')
        const containsRegex = new RegExp(keyword, 'i')

        if (wordBoundaryRegex.test(lower)) {
          score += 5
        } else if (containsRegex.test(lower)) {
          score += 3
        }
      }

      // Check low priority keywords (worth 2 points each)
      for (const keyword of priorities.low) {
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i')
        if (wordBoundaryRegex.test(lower)) {
          score += 2
        }
      }

      // Category context bonus (worth 3 points)
      // If the asset category matches the body part, boost the score
      if (categoryLower && categoryLower.includes(groupName.toLowerCase())) {
        score += 3
      }

      if (score > 0) {
        scores[groupName] = score
      }
    }

    // Sort by score and filter to only existing mesh groups
    const sortedMatches = Object.entries(scores)
      .filter(([groupName]) => meshGroups.has(groupName))
      .sort(([, a], [, b]) => b - a)

    if (sortedMatches.length === 0) {
      return { meshName: null, confidence: null, alternatives: [] }
    }

    const [bestMatch, bestScore] = sortedMatches[0]
    const alternatives = sortedMatches.slice(1, 3).map(([name]) => name)

    // Determine confidence based on score and gap to next best match
    let confidence: 'low' | 'medium' | 'high'
    const secondBestScore = sortedMatches[1]?.[1] || 0
    const scoreGap = bestScore - secondBestScore

    if (bestScore >= 10 && scoreGap >= 5) {
      confidence = 'high' // Strong match with clear winner
    } else if (bestScore >= 5 && scoreGap >= 2) {
      confidence = 'medium' // Good match but less certain
    } else {
      confidence = 'low' // Weak or ambiguous match
    }

    return {
      meshName: bestMatch,
      confidence,
      alternatives,
    }
  }

  // Load asset manifest on mount
  useEffect(() => {
    fetchAssetManifest().then((data) => {
      setAssets(data)
      setLoading(false)
    })
  }, [])

  // Scan VRM for meshes and group by base name
  useEffect(() => {
    if (!vrm) {
      setMeshGroups(new Map())
      setSelectedGroup(null)
      setAllMeshes([])
      setSelectedMesh(null)
      originalTextures.clear()
      return
    }

    const groups = new Map<string, THREE.Mesh[]>()
    const meshList: { name: string; mesh: THREE.Mesh }[] = []

    vrm.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        // Add to mesh list for individual selection
        const meshName = object.name || `Mesh ${meshList.length}`
        meshList.push({ name: meshName, mesh: object })

        // Store original textures
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => {
          if (material && 'map' in material && !originalTextures.has(material)) {
            originalTextures.set(material, (material as any).map || null)
          }
        })

        // Group by base name
        const baseName = (object.name || 'Unknown').replace(/_?\d+$/, '') || 'Other'
        if (!groups.has(baseName)) {
          groups.set(baseName, [])
        }
        groups.get(baseName)!.push(object)
      }
    })

    setAllMeshes(meshList)
    setMeshGroups(groups)

    const firstGroup = groups.keys().next().value
    if (firstGroup) {
      setSelectedGroup(firstGroup)
    }
    if (meshList.length > 0) {
      setSelectedMesh(meshList[0].name)
    }
  }, [vrm, originalTextures])

  const filteredAssets = assets.filter((a) => a.category === selectedCategory)

  const handleTextureApply = (asset: DownloadedAsset) => {
    if (!vrm) return

    // Analyze asset name to suggest mesh (using category for better detection)
    const detection = analyzeMeshTarget(asset.name, asset.category)
    if (detection.meshName && groupedMode) {
      setSuggestedMesh(detection.meshName)
      setDetectionConfidence(detection.confidence)
      setAlternativeSuggestions(detection.alternatives)
      setSelectedGroup(detection.meshName)
    } else {
      setSuggestedMesh(null)
      setDetectionConfidence(null)
      setAlternativeSuggestions([])
    }

    let meshesToApply: THREE.Mesh[] = []

    if (groupedMode) {
      // Apply to all meshes in the selected group
      if (!selectedGroup) return
      const groupMeshes = meshGroups.get(selectedGroup)
      if (!groupMeshes || groupMeshes.length === 0) return
      meshesToApply = groupMeshes
    } else {
      // Apply to single selected mesh
      if (!selectedMesh) return
      const meshInfo = allMeshes.find((m) => m.name === selectedMesh)
      if (!meshInfo) return
      meshesToApply = [meshInfo.mesh]
    }

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const texture = new THREE.Texture(img)
      texture.needsUpdate = true
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.colorSpace = THREE.SRGBColorSpace

      // Apply texture to selected meshes
      meshesToApply.forEach((mesh) => {
        const materials = Array.isArray(mesh.material)
          ? mesh.material
          : [mesh.material]

        materials.forEach((material) => {
          // Handle various material types (MeshStandardMaterial, MeshBasicMaterial, MToonMaterial, etc.)
          if (material && 'map' in material) {
            // Store original properties to preserve transparency, etc.
            const wasTransparent = material.transparent
            const originalOpacity = (material as any).opacity
            const originalAlphaMap = (material as any).alphaMap

            (material as THREE.MeshStandardMaterial).map = texture

            // Restore transparency properties
            material.transparent = wasTransparent
            if (originalOpacity !== undefined) {
              (material as any).opacity = originalOpacity
            }
            if (originalAlphaMap !== undefined) {
              (material as any).alphaMap = originalAlphaMap
            }

            material.needsUpdate = true
          }
        })
      })
    }
    img.src = asset.path
  }

  const handleResetTextures = () => {
    if (!vrm) return

    let meshesToReset: THREE.Mesh[] = []

    if (groupedMode) {
      // Reset all meshes in the selected group
      if (!selectedGroup) return
      const groupMeshes = meshGroups.get(selectedGroup)
      if (!groupMeshes || groupMeshes.length === 0) return
      meshesToReset = groupMeshes
    } else {
      // Reset single selected mesh
      if (!selectedMesh) return
      const meshInfo = allMeshes.find((m) => m.name === selectedMesh)
      if (!meshInfo) return
      meshesToReset = [meshInfo.mesh]
    }

    // Restore original textures
    meshesToReset.forEach((mesh) => {
      const materials = Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]

      materials.forEach((material) => {
        if (material && 'map' in material && originalTextures.has(material)) {
          (material as THREE.MeshStandardMaterial).map = originalTextures.get(material) || null
          material.needsUpdate = true
        }
      })
    })
  }

  const isTextureCategory = selectedCategory !== 'Models'

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
                  onClick={() => setGroupedMode(!groupedMode)}
                  className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
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

              {/* Mesh selector */}
              {groupedMode ? (
                <select
                  value={selectedGroup || ''}
                  onChange={(e) => {
                    setSelectedGroup(e.target.value)
                    setSuggestedMesh(null)
                    setDetectionConfidence(null)
                    setAlternativeSuggestions([])
                  }}
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
                  onChange={(e) => {
                    setSelectedMesh(e.target.value)
                    setSuggestedMesh(null)
                    setDetectionConfidence(null)
                    setAlternativeSuggestions([])
                  }}
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
                className={`p-2 rounded-lg text-center transition-all ${
                  selectedCategory === 'Models' && currentModelUrl === asset.path
                    ? 'bg-purple-600 ring-2 ring-purple-400'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
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
