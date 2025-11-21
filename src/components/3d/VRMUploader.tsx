import { useRef } from 'react'

interface VRMUploaderProps {
  onUpload: (url: string, fileName: string) => void
  currentFile: string | null
}

export default function VRMUploader({ onUpload, currentFile }: VRMUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.vrm')) {
      alert('Please upload a .vrm file')
      return
    }

    const url = URL.createObjectURL(file)
    onUpload(url, file.name)
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
          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-purple-600 file:text-white hover:file:bg-purple-500 cursor-pointer"
        />
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
