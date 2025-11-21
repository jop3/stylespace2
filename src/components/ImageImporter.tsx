import { useState, useRef } from 'react'
import type { ClothingType } from '../types'

interface ImageImporterProps {
  onImport: (imageUrl: string, type: ClothingType, name: string) => void
}

const CLOTHING_TYPES: { value: ClothingType; label: string }[] = [
  { value: 'tshirt', label: 'Top' },
  { value: 'pants', label: 'Pants' },
  { value: 'dress', label: 'Dress' },
  { value: 'jacket', label: 'Jacket' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessory' },
]

const PROMPT_TEMPLATES: Partial<Record<ClothingType, string>> = {
  tshirt: `Generate a flat, front-facing t-shirt or top for a paper doll dress-up game.
- MUST have transparent background (PNG)
- Show the garment as if laid flat, front view
- Size: 400x600 pixels (tall rectangle to fit avatar)
- Position the top in the upper-middle area of the image
- Style: [describe style you want]`,

  pants: `Generate flat, front-facing pants/trousers for a paper doll dress-up game.
- MUST have transparent background (PNG)
- Show the pants as if laid flat, front view
- Size: 400x600 pixels (tall rectangle to fit avatar)
- Position pants in the lower-middle area of the image
- Style: [describe style you want]`,

  dress: `Generate a flat, front-facing dress for a paper doll dress-up game.
- MUST have transparent background (PNG)
- Show the full dress as if laid flat, front view
- Size: 400x600 pixels (tall rectangle to fit avatar)
- Center the dress in the image, covering torso to legs area
- Style: [describe style you want]`,

  jacket: `Generate a flat, front-facing jacket/coat for a paper doll dress-up game.
- MUST have transparent background (PNG)
- Show the jacket as if laid flat, front view
- Size: 400x600 pixels (tall rectangle to fit avatar)
- Position in upper area, should layer over other tops
- Style: [describe style you want]`,

  shoes: `Generate flat, front-facing shoes for a paper doll dress-up game.
- MUST have transparent background (PNG)
- Show both shoes from front view
- Size: 400x600 pixels (position shoes at bottom of image)
- Style: [describe style you want]`,

  accessories: `Generate a flat accessory for a paper doll dress-up game.
- MUST have transparent background (PNG)
- Size: 400x600 pixels
- Position appropriately (hat at top, necklace at neck area, etc.)
- Style: [describe what accessory you want]`,
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
    const prompt = PROMPT_TEMPLATES[selectedType]
    if (prompt) {
      navigator.clipboard.writeText(prompt)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <h2 className="text-lg font-semibold">Add Clothing</h2>

      {/* Clothing Type Selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Type</label>
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
          {showPrompt ? 'Hide' : 'Show'} AI Prompt Helper
        </button>

        {showPrompt && PROMPT_TEMPLATES[selectedType] && (
          <div className="mt-2 space-y-2">
            <textarea
              value={PROMPT_TEMPLATES[selectedType]}
              readOnly
              className="w-full h-32 bg-gray-900 text-gray-300 text-xs p-2 rounded border border-gray-700"
            />
            <button
              onClick={copyPromptToClipboard}
              className="w-full py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Copy Prompt
            </button>
            <p className="text-xs text-gray-500">
              Use with DALL-E, Midjourney, or any AI image generator.
              Transparent PNG works best!
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
        <label className="block text-sm text-gray-400 mb-1">Upload Image</label>
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
        Add to Wardrobe
      </button>
    </div>
  )
}
