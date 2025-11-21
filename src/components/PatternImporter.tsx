import { useState, useRef } from 'react'
import { GARMENT_SILHOUETTES, type GarmentType } from '../data/garmentSilhouettes'

export interface PatternItem {
  id: string
  name: string
  garmentType: GarmentType
  patternUrl: string // The pattern/texture image
}

interface PatternImporterProps {
  onImport: (item: PatternItem) => void
}

const AI_PROMPT = `Generate a seamless tileable fabric/pattern texture.

Requirements:
- Size: 512x512 pixels
- MUST be seamless (edges connect perfectly when tiled)
- Style: [DESCRIBE YOUR PATTERN - e.g., floral, geometric, stripes, plaid, abstract, solid color with subtle texture]
- Colors: [DESCRIBE COLORS - e.g., navy blue with gold accents, pastel pink gradient]
- Output: PNG image

Examples of good prompts:
- "Seamless elegant damask pattern in burgundy and gold"
- "Tileable denim fabric texture, dark blue wash"
- "Seamless polka dots, white dots on red background"
- "Abstract watercolor seamless pattern, soft pastels"
- "Seamless plaid/tartan pattern, green and black"
`

export default function PatternImporter({ onImport }: PatternImporterProps) {
  const [selectedGarment, setSelectedGarment] = useState<GarmentType>('dress')
  const [name, setName] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleImport = () => {
    if (!preview) return

    const item: PatternItem = {
      id: Date.now().toString(),
      name: name.trim() || `${GARMENT_SILHOUETTES[selectedGarment].name} ${Date.now()}`,
      garmentType: selectedGarment,
      patternUrl: preview,
    }

    onImport(item)
    setPreview(null)
    setName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const copyPrompt = () => {
    navigator.clipboard.writeText(AI_PROMPT)
  }

  const garmentTypes = Object.keys(GARMENT_SILHOUETTES) as GarmentType[]

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <h2 className="text-lg font-semibold">Create Clothing</h2>
      <p className="text-xs text-gray-500">Generate a pattern texture with AI, then apply it to a garment</p>

      {/* Garment Type Selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Garment Type</label>
        <div className="flex flex-wrap gap-2">
          {garmentTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedGarment(type)}
              className={`px-3 py-1 rounded text-sm ${
                selectedGarment === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {GARMENT_SILHOUETTES[type].name}
            </button>
          ))}
        </div>
      </div>

      {/* AI Prompt Helper */}
      <div>
        <button
          onClick={() => setShowPrompt(!showPrompt)}
          className="text-sm text-blue-400 hover:text-blue-300"
        >
          {showPrompt ? 'Hide' : 'Show'} AI Pattern Prompt
        </button>

        {showPrompt && (
          <div className="mt-2 space-y-2">
            <textarea
              value={AI_PROMPT}
              readOnly
              className="w-full h-40 bg-gray-900 text-gray-300 text-xs p-2 rounded border border-gray-700"
            />
            <button
              onClick={copyPrompt}
              className="w-full py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Copy Prompt
            </button>
            <p className="text-xs text-gray-500">
              Works with DALL-E, Midjourney, Stable Diffusion, etc.
              The same pattern works for both 2D and 3D modes!
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
          placeholder="Red Floral Dress"
          className="w-full bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Pattern Upload */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Upload Pattern Texture</label>
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
          <p className="text-xs text-gray-400 mb-1">Pattern Preview:</p>
          <div className="flex gap-2">
            <img
              src={preview}
              alt="Pattern"
              className="w-16 h-16 object-cover rounded"
            />
            <div
              className="w-16 h-16 rounded"
              style={{
                backgroundImage: `url(${preview})`,
                backgroundSize: '32px 32px',
                backgroundRepeat: 'repeat',
              }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Left: Original | Right: Tiled preview</p>
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
