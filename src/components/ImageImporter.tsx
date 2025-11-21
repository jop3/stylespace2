import { useState, useRef } from 'react'
import type { ClothingType } from '../types'

interface ImageImporterProps {
  onImport: (imageUrl: string, type: ClothingType, name: string) => void
}

const CLOTHING_TYPES: { value: ClothingType; label: string }[] = [
  { value: 'tshirt', label: 'T-Shirt' },
  { value: 'pants', label: 'Pants' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'dress', label: 'Dress' },
]

const PROMPT_TEMPLATES: Record<ClothingType, string> = {
  tshirt: `Generate an image of a t-shirt design. The image should be a flat, front-facing t-shirt with a transparent or white background. Create a stylish design with patterns or graphics. Output a 512x512 PNG image.`,

  pants: `Generate an image of pants/jeans. The image should be flat, front-facing pants with a transparent or white background. Show the full length from waist to ankles. Output a 512x512 PNG image.`,

  shoes: `Generate an image of a pair of shoes. The image should show shoes from a front/top angle with a transparent or white background. Make them stylish sneakers or casual shoes. Output a 512x512 PNG image.`,

  dress: `Generate an image of a dress. The image should be a flat, front-facing dress with a transparent or white background. Create an elegant or casual dress design. Output a 512x512 PNG image.`,
}

export default function ImageImporter({ onImport }: ImageImporterProps) {
  const [selectedType, setSelectedType] = useState<ClothingType>('tshirt')
  const [name, setName] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string
      setPreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleImport = () => {
    if (!preview) return

    const itemName = name.trim() || `${selectedType}-${Date.now()}`
    onImport(preview, selectedType, itemName)
    setPreview(null)
    setName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const copyPromptToClipboard = () => {
    navigator.clipboard.writeText(PROMPT_TEMPLATES[selectedType])
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <h2 className="text-lg font-semibold">Create New Clothing</h2>

      {/* Clothing Type Selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Clothing Type</label>
        <div className="flex flex-wrap gap-2">
          {CLOTHING_TYPES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setSelectedType(value)}
              className={`px-3 py-1 rounded text-sm ${
                selectedType === value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Helper */}
      <div>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {showPrompt ? 'Hide' : 'Show'} LLM Prompt Helper
        </button>

        {showPrompt && (
          <div className="mt-2 space-y-2">
            <textarea
              value={PROMPT_TEMPLATES[selectedType]}
              readOnly
              className="w-full h-24 bg-gray-900 text-gray-300 text-xs p-2 rounded border border-gray-700"
            />
            <button
              onClick={copyPromptToClipboard}
              className="w-full py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Copy Prompt to Clipboard
            </button>
            <p className="text-xs text-gray-500">
              Use this prompt with DALL-E, Midjourney, or any image-generating AI.
              Then upload the resulting image below.
            </p>
          </div>
        )}
      </div>

      {/* Name Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Name (optional)</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My cool design"
          className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Image Upload */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Upload Image (PNG/JPG)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleFileChange}
          className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-500 cursor-pointer"
        />
      </div>

      {/* Preview */}
      {preview && (
        <div className="border border-gray-700 rounded p-2">
          <p className="text-xs text-gray-400 mb-1">Preview:</p>
          <img
            src={preview}
            alt="Preview"
            className="w-full h-32 object-contain bg-gray-900 rounded"
          />
        </div>
      )}

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={!preview}
        className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded font-semibold transition-colors"
      >
        Apply to Avatar
      </button>
    </div>
  )
}
