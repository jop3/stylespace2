import { useState } from 'react'
import type { ClothingType } from '../types'

interface SVGImporterProps {
  onImport: (svg: string, type: ClothingType, name: string) => void
}

const PROMPT_TEMPLATES: Record<ClothingType, string> = {
  tshirt: `Generate an SVG pattern for a t-shirt design. The SVG should be 512x512 pixels.
Create a stylish pattern or graphic that would look good on a shirt.
Only output the SVG code, nothing else.
Example themes: geometric patterns, abstract art, nature motifs, retro designs, minimalist graphics.

<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <!-- Your design here -->
</svg>`,

  pants: `Generate an SVG pattern for pants/jeans fabric. The SVG should be 512x512 pixels.
Create a repeating pattern or texture suitable for pants.
Only output the SVG code, nothing else.
Example themes: denim texture, stripes, plaid, camouflage, solid with subtle pattern.

<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <!-- Your design here -->
</svg>`,

  shoes: `Generate an SVG pattern for shoes. The SVG should be 512x512 pixels.
Create a design or pattern suitable for footwear.
Only output the SVG code, nothing else.
Example themes: sneaker patterns, leather texture, sporty designs, classic looks.

<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <!-- Your design here -->
</svg>`,
}

export default function SVGImporter({ onImport }: SVGImporterProps) {
  const [selectedType, setSelectedType] = useState<ClothingType>('tshirt')
  const [svgInput, setSvgInput] = useState('')
  const [name, setName] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')

  const handleImport = () => {
    if (!svgInput.trim()) return

    const itemName = name.trim() || `${selectedType}-${Date.now()}`
    onImport(svgInput.trim(), selectedType, itemName)
    setSvgInput('')
    setName('')
  }

  const copyPromptToClipboard = () => {
    const prompt = customPrompt || PROMPT_TEMPLATES[selectedType]
    navigator.clipboard.writeText(prompt)
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-3">
      <h2 className="text-lg font-semibold">Create New Clothing</h2>

      {/* Clothing Type Selector */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Clothing Type</label>
        <div className="flex gap-2">
          {(['tshirt', 'pants', 'shoes'] as ClothingType[]).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1 rounded text-sm capitalize ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {type === 'tshirt' ? 'T-Shirt' : type}
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
              value={customPrompt || PROMPT_TEMPLATES[selectedType]}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="w-full h-32 bg-gray-900 text-gray-300 text-xs p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={copyPromptToClipboard}
              className="w-full py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
            >
              Copy Prompt to Clipboard
            </button>
            <p className="text-xs text-gray-500">
              Copy this prompt, paste it into Claude/ChatGPT, and paste the SVG result below.
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

      {/* SVG Input */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">Paste SVG Code</label>
        <textarea
          value={svgInput}
          onChange={(e) => setSvgInput(e.target.value)}
          placeholder="<svg>...</svg>"
          className="w-full h-24 bg-gray-900 text-white p-2 rounded border border-gray-700 focus:border-blue-500 focus:outline-none font-mono text-xs"
        />
      </div>

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={!svgInput.trim()}
        className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 rounded font-semibold transition-colors"
      >
        Apply to Avatar
      </button>
    </div>
  )
}
