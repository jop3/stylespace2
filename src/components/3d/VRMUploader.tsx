import { useRef, useState } from 'react'
import { useToast } from '../ui/Toast'

interface VRMUploaderProps {
  onUpload: (url: string, fileName: string) => void
  currentFile: string | null
  compact?: boolean
}

/**
 * VRM file magic bytes (glTF binary format starts with "glTF")
 */
const GLTF_MAGIC = new Uint8Array([0x67, 0x6c, 0x54, 0x46]) // "glTF"

/**
 * Validates a file by checking its magic bytes
 * VRM files are glTF binary format and should start with "glTF"
 */
async function validateVRMFile(file: File): Promise<{ valid: boolean; reason?: string }> {
  // Check file extension
  if (!file.name.toLowerCase().endsWith('.vrm')) {
    return { valid: false, reason: 'File must have a .vrm extension' }
  }

  // Check file size (VRM files should be at least a few KB)
  if (file.size < 1000) {
    return { valid: false, reason: 'File is too small to be a valid VRM' }
  }

  // Check magic bytes
  try {
    const buffer = await file.slice(0, 4).arrayBuffer()
    const bytes = new Uint8Array(buffer)

    const isGLTF = bytes.every((byte, index) => byte === GLTF_MAGIC[index])
    if (!isGLTF) {
      return {
        valid: false,
        reason: 'File does not appear to be a valid VRM/glTF file',
      }
    }
  } catch {
    // If we can't read the file, let the loader handle it
    return { valid: true }
  }

  return { valid: true }
}

export default function VRMUploader({ onUpload, currentFile, compact = false }: VRMUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isValidating, setIsValidating] = useState(false)
  const { addToast } = useToast()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsValidating(true)

    try {
      // Validate file
      const validation = await validateVRMFile(file)
      if (!validation.valid) {
        addToast('error', validation.reason || 'Invalid VRM file')
        setIsValidating(false)
        // Reset input so same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      // Create blob URL and upload
      const url = URL.createObjectURL(file)
      onUpload(url, file.name)
      addToast('success', `Loaded: ${file.name}`)
    } catch (err) {
      console.error('Error processing VRM file:', err)
      addToast('error', 'Failed to process VRM file')
    } finally {
      setIsValidating(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Compact mode - just a button
  if (compact) {
    return (
      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".vrm"
          onChange={handleFileChange}
          disabled={isValidating}
          className="hidden"
        />
        <button
          onClick={handleButtonClick}
          disabled={isValidating}
          className="w-full h-touch flex items-center justify-center gap-2 bg-purple text-white rounded-kid-lg font-semibold shadow-kid hover:shadow-glow-purple transition-all disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          {isValidating ? 'Loading...' : 'Upload VRM'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <h2 className="text-lg font-semibold">VRM Avatar</h2>

      <div>
        <label className="block text-sm text-gray-400 mb-2">Upload VRM File</label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".vrm"
          onChange={handleFileChange}
          disabled={isValidating}
          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {isValidating && (
          <div className="text-xs text-gray-500 mt-1">Validating file...</div>
        )}
      </div>

      {currentFile && (
        <div className="text-sm text-gray-400">
          Loaded: <span className="text-purple-400">{currentFile}</span>
        </div>
      )}

      <div className="border-t border-gray-700 pt-3">
        <p className="text-xs text-gray-500 mb-2">
          Get free VRM avatars from:
        </p>
        <div className="flex flex-col gap-1">
          <a
            href="https://hub.vroid.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            VRoid Hub (hub.vroid.com)
          </a>
          <a
            href="https://vroid.com/studio"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Create your own with VRoid Studio
          </a>
        </div>
      </div>

      <div className="bg-gray-900 rounded p-2 text-xs text-gray-500">
        <strong className="text-gray-400">Note:</strong> Respect avatar licenses.
        Check "Terms of Use" on VRoid Hub before using avatars.
      </div>
    </div>
  )
}
