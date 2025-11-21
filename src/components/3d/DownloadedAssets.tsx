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
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null)
  const [meshes, setMeshes] = useState<{ name: string; mesh: THREE.Mesh }[]>([])

  // Load asset manifest on mount
  useEffect(() => {
    fetchAssetManifest().then((data) => {
      setAssets(data)
      setLoading(false)
    })
  }, [])

  // Scan VRM for meshes when it changes (for texture application)
  useEffect(() => {
    if (!vrm) {
      setMeshes([])
      return
    }

    const foundMeshes: { name: string; mesh: THREE.Mesh }[] = []
    vrm.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        foundMeshes.push({
          name: object.name || `Mesh ${foundMeshes.length}`,
          mesh: object,
        })
      }
    })
    setMeshes(foundMeshes)
    if (foundMeshes.length > 0) {
      setSelectedMesh(foundMeshes[0].name)
    }
  }, [vrm])

  const filteredAssets = assets.filter((a) => a.category === selectedCategory)

  const handleTextureApply = (asset: DownloadedAsset) => {
    if (!vrm || !selectedMesh) return

    const meshInfo = meshes.find((m) => m.name === selectedMesh)
    if (!meshInfo) return

    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const texture = new THREE.Texture(img)
      texture.needsUpdate = true
      texture.wrapS = THREE.RepeatWrapping
      texture.wrapT = THREE.RepeatWrapping
      texture.colorSpace = THREE.SRGBColorSpace

      const materials = Array.isArray(meshInfo.mesh.material)
        ? meshInfo.mesh.material
        : [meshInfo.mesh.material]

      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshBasicMaterial) {
          material.map = texture
          material.needsUpdate = true
        }
      })
    }
    img.src = asset.path
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
          {isTextureCategory && vrm && meshes.length > 0 && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Apply to mesh:</label>
              <select
                value={selectedMesh || ''}
                onChange={(e) => setSelectedMesh(e.target.value)}
                className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 text-sm"
              >
                {meshes.map((mesh, index) => (
                  <option key={`${mesh.name}-${index}`} value={mesh.name}>
                    {mesh.name}
                  </option>
                ))}
              </select>
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
