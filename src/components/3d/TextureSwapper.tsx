import { useRef, useState, useEffect } from 'react'
import type { VRM } from '@pixiv/three-vrm'
import * as THREE from 'three'

interface TextureSwapperProps {
  vrm: VRM | null
  onTextureApplied?: () => void
}

interface MeshInfo {
  name: string
  mesh: THREE.Mesh
  materialIndex: number
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
  const [meshes, setMeshes] = useState<MeshInfo[]>([])
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null)
  const [showPrompts, setShowPrompts] = useState(false)
  const [activePrompt, setActivePrompt] = useState<keyof typeof TEXTURE_PROMPTS>('pattern')

  // Scan VRM for meshes when it changes
  useEffect(() => {
    if (!vrm) {
      setMeshes([])
      return
    }

    const foundMeshes: MeshInfo[] = []
    vrm.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((_, index) => {
          foundMeshes.push({
            name: object.name || `Mesh ${foundMeshes.length}`,
            mesh: object,
            materialIndex: index,
          })
        })
      }
    })
    setMeshes(foundMeshes)
    if (foundMeshes.length > 0) {
      setSelectedMesh(foundMeshes[0].name)
    }
  }, [vrm])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !selectedMesh) return

    const meshInfo = meshes.find((m) => m.name === selectedMesh)
    if (!meshInfo) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const texture = new THREE.Texture(img)
        texture.needsUpdate = true
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        texture.colorSpace = THREE.SRGBColorSpace

        const materials = Array.isArray(meshInfo.mesh.material)
          ? meshInfo.mesh.material
          : [meshInfo.mesh.material]

        const material = materials[meshInfo.materialIndex]
        // Handle various material types (MeshStandardMaterial, MeshBasicMaterial, MToonMaterial, etc.)
        if (material && 'map' in material) {
          (material as THREE.MeshStandardMaterial).map = texture
          material.needsUpdate = true
        }

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

      {/* Mesh selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Select Part</label>
        <select
          value={selectedMesh || ''}
          onChange={(e) => setSelectedMesh(e.target.value)}
          className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700"
        >
          {meshes.map((mesh, index) => (
            <option key={`${mesh.name}-${index}`} value={mesh.name}>
              {mesh.name}
            </option>
          ))}
        </select>
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
