import { useRef, useState, useEffect } from 'react'
import type { VRM } from '@pixiv/three-vrm'
import * as THREE from 'three'

interface TextureSwapperProps {
  vrm: VRM | null
  onTextureApplied?: () => void
}

const TEXTURE_PROMPTS = {
  pattern: `Generate a seamless tileable fabric texture pattern.
- Size: 512x512 pixels
- Style: [describe pattern - stripes, plaid, floral, geometric, etc.]
- Colors: [describe color scheme]
- Must be seamless/tileable
- PNG format`,

  fabric: `Generate a realistic fabric texture.
- Size: 512x512 pixels
- Material: [cotton, silk, denim, leather, etc.]
- Color: [describe color]
- Should tile seamlessly
- PNG format`,

  custom: `Generate a texture for 3D clothing.
- Size: 512x512 pixels
- Style: [describe what you want]
- Must work as a repeating texture
- PNG format`,
}

export default function TextureSwapper({ vrm, onTextureApplied }: TextureSwapperProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [meshGroups, setMeshGroups] = useState<Map<string, THREE.Mesh[]>>(new Map())
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null)
  const [allMeshes, setAllMeshes] = useState<{ name: string; mesh: THREE.Mesh }[]>([])
  const [groupedMode, setGroupedMode] = useState(true)
  const [showPrompts, setShowPrompts] = useState(false)
  const [activePrompt, setActivePrompt] = useState<keyof typeof TEXTURE_PROMPTS>('pattern')

  // Scan VRM for meshes and group by base name
  useEffect(() => {
    if (!vrm) {
      setMeshGroups(new Map())
      setSelectedGroup(null)
      setAllMeshes([])
      setSelectedMesh(null)
      return
    }

    const groups = new Map<string, THREE.Mesh[]>()
    const meshList: { name: string; mesh: THREE.Mesh }[] = []

    vrm.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        // Add to mesh list for individual selection
        const meshName = object.name || `Mesh ${meshList.length}`
        meshList.push({ name: meshName, mesh: object })

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
  }, [vrm])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

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

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
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
              (material as THREE.MeshStandardMaterial).map = texture
              material.needsUpdate = true
            }
          })
        })

        onTextureApplied?.()
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(TEXTURE_PROMPTS[activePrompt])
  }

  if (!vrm) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Texture Swapper</h2>
        <p className="text-sm text-gray-500">Load a VRM avatar first</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <h2 className="text-lg font-semibold">Change Textures</h2>

      {/* Mesh selector with toggle */}
      <div className="space-y-2">
        {/* Toggle between grouped and individual mode */}
        <div className="flex items-center gap-2">
          <label className="block text-sm text-gray-400">Select Part</label>
          <button
            onClick={() => setGroupedMode(!groupedMode)}
            className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {groupedMode ? 'Grouped' : 'Individual'} ⇄
          </button>
        </div>

        {/* Mesh selector */}
        {groupedMode ? (
          <select
            value={selectedGroup || ''}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700"
          >
            {Array.from(meshGroups.entries()).map(([groupName, groupMeshes]) => (
              <option key={groupName} value={groupName}>
                {groupName} ({groupMeshes.length})
              </option>
            ))}
          </select>
        ) : (
          <select
            value={selectedMesh || ''}
            onChange={(e) => setSelectedMesh(e.target.value)}
            className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700"
          >
            {allMeshes.map((mesh, index) => (
              <option key={`${mesh.name}-${index}`} value={mesh.name}>
                {mesh.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Texture upload */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Upload Texture</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-500 cursor-pointer"
        />
      </div>

      {/* AI Prompt Helper */}
      <div>
        <button
          onClick={() => setShowPrompts(!showPrompts)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {showPrompts ? 'Hide' : 'Show'} AI Texture Prompts
        </button>

        {showPrompts && (
          <div className="mt-2 space-y-2">
            <div className="flex gap-1">
              {(Object.keys(TEXTURE_PROMPTS) as Array<keyof typeof TEXTURE_PROMPTS>).map((key) => (
                <button
                  key={key}
                  onClick={() => setActivePrompt(key)}
                  className={`px-2 py-1 text-xs rounded ${
                    activePrompt === key
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>
            <textarea
              value={TEXTURE_PROMPTS[activePrompt]}
              readOnly
              className="w-full h-28 bg-gray-900 text-gray-300 text-xs p-2 rounded border border-gray-700"
            />
            <button
              onClick={copyPrompt}
              className="w-full py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Copy Prompt
            </button>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500">
        Tip: Generate seamless textures with AI, then upload to change avatar clothing.
      </p>
    </div>
  )
}
