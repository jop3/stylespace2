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
  const [originalTextures] = useState<Map<THREE.Material, THREE.Texture | null>>(new Map())
  const [suggestedMesh, setSuggestedMesh] = useState<string | null>(null)
  const [detectionConfidence, setDetectionConfidence] = useState<'low' | 'medium' | 'high' | null>(null)
  const [alternativeSuggestions, setAlternativeSuggestions] = useState<string[]>([])

  // Enhanced mesh detection with priority weighting and confidence scoring
  const analyzeMeshTarget = (filename: string): {
    meshName: string | null
    confidence: 'low' | 'medium' | 'high' | null
    alternatives: string[]
  } => {
    const lower = filename.toLowerCase()

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
        // Use word boundary detection for more accurate matching
        const wordBoundaryRegex = new RegExp(`\\b${keyword}\\b`, 'i')
        const containsRegex = new RegExp(keyword, 'i')

        if (wordBoundaryRegex.test(lower)) {
          score += 10 // Exact word match
        } else if (containsRegex.test(lower)) {
          score += 7 // Substring match (slightly less confident)
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Analyze filename to suggest mesh
    const detection = analyzeMeshTarget(file.name)
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

    onTextureApplied?.()
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
            onChange={(e) => {
              setSelectedMesh(e.target.value)
              setSuggestedMesh(null)
              setDetectionConfidence(null)
              setAlternativeSuggestions([])
            }}
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
