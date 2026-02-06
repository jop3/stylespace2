import { useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'

export interface TexturePreviewProps {
  /** The texture file to preview */
  file: File | null
  /** The loaded texture (if already loaded) */
  texture?: THREE.Texture | null
  /** Whether the preview modal is open */
  isOpen: boolean
  /** Callback when the modal is closed */
  onClose: () => void
  /** Callback when the texture is confirmed for application */
  onConfirm: () => void
  /** Callback when the texture is rejected */
  onCancel: () => void
  /** Optional mesh name being targeted */
  targetMeshName?: string
  /** Whether texture is currently being applied */
  isApplying?: boolean
}

/**
 * Modal component for previewing textures before applying them to meshes
 * Shows the texture image with tiling preview and metadata
 */
export default function TexturePreview({
  file,
  texture: _texture,
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  targetMeshName,
  isApplying = false,
}: TexturePreviewProps) {
  // _texture reserved for future use (e.g., showing actual 3D preview)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageInfo, setImageInfo] = useState<{
    width: number
    height: number
    aspectRatio: string
    fileSize: string
  } | null>(null)
  const [tilingMode, setTilingMode] = useState<'single' | '2x2' | '3x3'>('single')

  // Generate preview URL from file
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      setImageInfo(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    // Get image dimensions
    const img = new Image()
    img.onload = () => {
      const aspectRatio =
        img.width === img.height
          ? '1:1'
          : img.width > img.height
          ? `${(img.width / img.height).toFixed(2)}:1`
          : `1:${(img.height / img.width).toFixed(2)}`

      setImageInfo({
        width: img.width,
        height: img.height,
        aspectRatio,
        fileSize: formatFileSize(file.size),
      })
    }
    img.src = url

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  // Handle keyboard events
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      } else if (e.key === 'Enter' && !isApplying) {
        onConfirm()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel, onConfirm, isApplying])

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose()
      }
    },
    [onClose]
  )

  if (!isOpen || !previewUrl) return null

  const tilingCount = tilingMode === 'single' ? 1 : tilingMode === '2x2' ? 2 : 3

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-white">Texture Preview</h3>
            {targetMeshName && (
              <p className="text-sm text-gray-400">
                Applying to: <span className="text-blue-400">{targetMeshName}</span>
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-4 space-y-4">
          {/* Tiling Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Preview tiling:</span>
            <div className="flex gap-1">
              {(['single', '2x2', '3x3'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setTilingMode(mode)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    tilingMode === mode
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {mode === 'single' ? '1×1' : mode === '2x2' ? '2×2' : '3×3'}
                </button>
              ))}
            </div>
          </div>

          {/* Texture Preview with Tiling */}
          <div className="relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div
              className="w-full aspect-square"
              style={{
                backgroundImage: `url(${previewUrl})`,
                backgroundSize: `${100 / tilingCount}% ${100 / tilingCount}%`,
                backgroundRepeat: 'repeat',
              }}
            />
            {/* Checkerboard overlay for transparency */}
            <div
              className="absolute inset-0 pointer-events-none -z-10"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, #333 25%, transparent 25%),
                  linear-gradient(-45deg, #333 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, #333 75%),
                  linear-gradient(-45deg, transparent 75%, #333 75%)
                `,
                backgroundSize: '20px 20px',
                backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
              }}
            />
          </div>

          {/* Image Info */}
          {imageInfo && (
            <div className="flex flex-wrap gap-4 text-sm">
              <InfoBadge label="Dimensions" value={`${imageInfo.width}×${imageInfo.height}px`} />
              <InfoBadge label="Aspect Ratio" value={imageInfo.aspectRatio} />
              <InfoBadge label="File Size" value={imageInfo.fileSize} />
              <InfoBadge label="File" value={file?.name || 'Unknown'} />
            </div>
          )}

          {/* Warnings */}
          {imageInfo && (imageInfo.width !== imageInfo.height || !isPowerOfTwo(imageInfo.width)) && (
            <div className="text-xs p-2 rounded bg-yellow-900/50 text-yellow-200 border border-yellow-700">
              <strong>Note:</strong>{' '}
              {imageInfo.width !== imageInfo.height && 'Non-square textures may stretch. '}
              {!isPowerOfTwo(imageInfo.width) &&
                'Non-power-of-2 dimensions may affect tiling quality.'}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-700 bg-gray-800/50">
          <button
            onClick={onCancel}
            disabled={isApplying}
            className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isApplying}
            className="px-4 py-2 text-sm bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isApplying ? (
              <>
                <LoadingSpinner />
                Applying...
              </>
            ) : (
              'Apply Texture'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

interface InfoBadgeProps {
  label: string
  value: string
}

function InfoBadge({ label, value }: InfoBadgeProps) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-gray-500">{label}:</span>
      <span className="text-gray-300 font-medium">{value}</span>
    </div>
  )
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
        fill="none"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function isPowerOfTwo(n: number): boolean {
  return n > 0 && (n & (n - 1)) === 0
}

// Export a hook for easier integration
export function useTexturePreview() {
  const [previewState, setPreviewState] = useState<{
    file: File | null
    isOpen: boolean
    targetMeshName?: string
  }>({
    file: null,
    isOpen: false,
  })

  const showPreview = useCallback((file: File, targetMeshName?: string) => {
    setPreviewState({
      file,
      isOpen: true,
      targetMeshName,
    })
  }, [])

  const hidePreview = useCallback(() => {
    setPreviewState((prev) => ({
      ...prev,
      isOpen: false,
    }))
  }, [])

  const clearPreview = useCallback(() => {
    setPreviewState({
      file: null,
      isOpen: false,
    })
  }, [])

  return {
    previewState,
    showPreview,
    hidePreview,
    clearPreview,
  }
}
