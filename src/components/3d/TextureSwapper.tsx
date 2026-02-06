import { useRef, useState, useCallback } from 'react'
import type { VRM } from '@pixiv/three-vrm'
import * as THREE from 'three'
import { useMeshGroups } from '../../hooks/useMeshGroups'
import { useSmartMeshDetection, type DetectionConfidence } from '../../hooks/useSmartMeshDetection'
import {
  applyTextureToMeshes,
  loadTextureFromFile,
} from '../../utils/textureUtils'
import TexturePreview, { useTexturePreview } from '../ui/TexturePreview'

interface TextureSwapperProps {
  vrm: VRM | null
  onTextureApplied?: () => void
  compact?: boolean
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

export default function TextureSwapper({ vrm, onTextureApplied, compact = false }: TextureSwapperProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showPrompts, setShowPrompts] = useState(false)
  const [activePrompt, setActivePrompt] = useState<keyof typeof TEXTURE_PROMPTS>('pattern')
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Detection state
  const [suggestedMesh, setSuggestedMesh] = useState<string | null>(null)
  const [detectionConfidence, setDetectionConfidence] = useState<DetectionConfidence | null>(null)
  const [alternativeSuggestions, setAlternativeSuggestions] = useState<string[]>([])

  // Texture preview state
  const { previewState, showPreview, hidePreview, clearPreview } = useTexturePreview()
  const [pendingTexture, setPendingTexture] = useState<THREE.Texture | null>(null)
  const [previewEnabled, setPreviewEnabled] = useState(true)

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoadError(null)

    // Analyze filename to suggest mesh
    const detection = analyzeMeshTarget(file.name)
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
      return
    }

    // If preview is enabled, show the preview first
    if (previewEnabled) {
      setIsLoading(true)
      loadTextureFromFile({
        file,
        onLoad: (texture) => {
          setPendingTexture(texture)
          showPreview(file, groupedMode ? selectedGroup || undefined : selectedMesh || undefined)
          setIsLoading(false)
        },
        onError: (error) => {
          setLoadError(error.message)
          setIsLoading(false)
        },
      })
    } else {
      // Apply directly without preview
      applyTextureDirectly(file, meshesToApply)
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const applyTextureDirectly = (file: File, meshes: THREE.Mesh[]) => {
    setIsLoading(true)
    loadTextureFromFile({
      file,
      onLoad: (texture) => {
        applyTextureToMeshes({
          texture,
          meshes,
          onComplete: () => {
            setIsLoading(false)
            onTextureApplied?.()
          },
        })
      },
      onError: (error) => {
        setLoadError(error.message)
        setIsLoading(false)
      },
    })
  }

  const handlePreviewConfirm = useCallback(() => {
    if (!pendingTexture) return

    const meshesToApply = getSelectedMeshes()
    if (meshesToApply.length === 0) {
      setLoadError('No mesh selected')
      clearPreview()
      setPendingTexture(null)
      return
    }

    setIsLoading(true)
    applyTextureToMeshes({
      texture: pendingTexture,
      meshes: meshesToApply,
      onComplete: () => {
        setIsLoading(false)
        hidePreview()
        setPendingTexture(null)
        onTextureApplied?.()
      },
    })
  }, [pendingTexture, getSelectedMeshes, hidePreview, clearPreview, onTextureApplied])

  const handlePreviewCancel = useCallback(() => {
    hidePreview()
    if (pendingTexture) {
      pendingTexture.dispose()
      setPendingTexture(null)
    }
  }, [hidePreview, pendingTexture])

  const copyPrompt = () => {
    navigator.clipboard.writeText(TEXTURE_PROMPTS[activePrompt])
  }

  const handleResetTextures = () => {
    resetSelectedTextures()
    onTextureApplied?.()
  }

  const handleGroupChange = (value: string) => {
    setSelectedGroup(value)
    clearDetectionHints()
  }

  const handleMeshChange = (value: string) => {
    setSelectedMesh(value)
    clearDetectionHints()
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  if (!vrm) {
    if (compact) {
      return (
        <div className="text-center text-kid-sm text-gray-500 py-2">
          Load an avatar first to change textures
        </div>
      )
    }
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Texture Swapper</h2>
        <p className="text-sm text-gray-500">Load a VRM avatar first</p>
      </div>
    )
  }

  // Compact mode for kid-friendly UI
  if (compact) {
    return (
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          disabled={isLoading}
          className="hidden"
        />

        {/* Quick action buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleButtonClick}
            disabled={isLoading}
            className="flex-1 h-10 flex items-center justify-center gap-2 bg-primary/10 text-primary rounded-kid font-medium text-kid-sm hover:bg-primary/20 transition-all disabled:opacity-50"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            Add Texture
          </button>

          <button
            onClick={handleResetTextures}
            className="h-10 px-4 flex items-center justify-center gap-1 bg-gray-100 text-gray-600 rounded-kid font-medium text-kid-sm hover:bg-gray-200 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 9-9" />
              <polyline points="3 3 3 12 12 12" />
            </svg>
            Reset
          </button>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="text-kid-xs text-gray-500 text-center">Applying texture...</div>
        )}

        {/* Mesh selector - simplified */}
        <select
          value={groupedMode ? selectedGroup || '' : selectedMesh || ''}
          onChange={(e) => groupedMode ? handleGroupChange(e.target.value) : handleMeshChange(e.target.value)}
          className="w-full h-10 bg-white text-gray-700 px-3 rounded-kid border border-gray-200 text-kid-sm"
        >
          {groupedMode
            ? Array.from(meshGroups.entries()).map(([groupName, groupMeshes]) => (
                <option key={groupName} value={groupName}>
                  {groupName} ({groupMeshes.length})
                </option>
              ))
            : allMeshes.map((mesh, index) => (
                <option key={`${mesh.name}-${index}`} value={mesh.name}>
                  {mesh.name}
                </option>
              ))}
        </select>

        {/* Texture Preview Modal */}
        <TexturePreview
          file={previewState.file}
          texture={pendingTexture}
          isOpen={previewState.isOpen}
          onClose={handlePreviewCancel}
          onConfirm={handlePreviewConfirm}
          onCancel={handlePreviewCancel}
          targetMeshName={previewState.targetMeshName}
          isApplying={isLoading}
        />
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

        {/* Mesh selector */}
        {groupedMode ? (
          <select
            value={selectedGroup || ''}
            onChange={(e) => handleGroupChange(e.target.value)}
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
            onChange={(e) => handleMeshChange(e.target.value)}
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm text-gray-400">Upload Texture</label>
          <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={previewEnabled}
              onChange={(e) => setPreviewEnabled(e.target.checked)}
              className="w-3 h-3 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            Preview
          </label>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          onChange={handleFileChange}
          disabled={isLoading}
          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-green-600 file:text-white hover:file:bg-green-500 cursor-pointer disabled:opacity-50"
        />
        {isLoading && !previewState.isOpen && (
          <div className="text-xs text-gray-500">Applying texture...</div>
        )}
      </div>

      {/* Texture Preview Modal */}
      <TexturePreview
        file={previewState.file}
        texture={pendingTexture}
        isOpen={previewState.isOpen}
        onClose={handlePreviewCancel}
        onConfirm={handlePreviewConfirm}
        onCancel={handlePreviewCancel}
        targetMeshName={previewState.targetMeshName}
        isApplying={isLoading}
      />

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
