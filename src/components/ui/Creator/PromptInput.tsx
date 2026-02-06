import { useState, useRef } from 'react';
import type { WorkflowType } from '../../../hooks/useAIAsset';

interface PromptInputProps {
  workflow: WorkflowType;
  onSubmit: (params: {
    prompt: string;
    negativePrompt?: string;
    seed?: number;
    steps: number;
    cfg: number;
    inputImage?: File;
  }) => void;
  disabled?: boolean;
}

export function PromptInput({ workflow, onSubmit, disabled }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showNegative, setShowNegative] = useState(false);
  const [steps, setSteps] = useState(8);
  const [cfg, setCfg] = useState(1);
  const [seed, setSeed] = useState<string>('');
  const [inputImage, setInputImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const requiresImage = workflow === 'uv_texture' || workflow === 'depth';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;
    if (requiresImage && !inputImage) return;

    onSubmit({
      prompt: prompt.trim(),
      negativePrompt: negativePrompt.trim() || undefined,
      seed: seed ? parseInt(seed, 10) : undefined,
      steps,
      cfg,
      inputImage: inputImage || undefined
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInputImage(file);
    }
  };

  const workflowDescriptions: Record<WorkflowType, string> = {
    uv_texture: 'Generate textures from UV templates. Best for clothing like t-shirts and pants.',
    turnaround: 'Generate 4-view images (front, back, left, right) for consistent character design.',
    depth: 'Apply style transfer to existing images using depth maps. Great for material changes.',
    background: 'Generate custom backgrounds for your 3D scene.'
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-gray-400 mb-4">
        {workflowDescriptions[workflow]}
      </p>

      {/* Input Image (for uv_texture and depth workflows) */}
      {requiresImage && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Input Image *
          </label>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm"
              disabled={disabled}
            >
              {inputImage ? 'Change Image' : 'Select Image'}
            </button>
            {inputImage && (
              <span className="text-sm text-gray-400 truncate max-w-[200px]">
                {inputImage.name}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Prompt */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Prompt *
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe what you want to generate..."
          rows={3}
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          disabled={disabled}
        />
      </div>

      {/* Negative Prompt Toggle */}
      <div>
        <button
          type="button"
          onClick={() => setShowNegative(!showNegative)}
          className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
        >
          {showNegative ? '−' : '+'} Negative Prompt
        </button>
        {showNegative && (
          <textarea
            value={negativePrompt}
            onChange={(e) => setNegativePrompt(e.target.value)}
            placeholder="What to avoid in generation..."
            rows={2}
            className="w-full mt-2 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            disabled={disabled}
          />
        )}
      </div>

      {/* Parameters */}
      <div className="grid grid-cols-2 gap-4">
        {/* Steps */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Steps: {steps}
          </label>
          <input
            type="range"
            min="1"
            max="50"
            value={steps}
            onChange={(e) => setSteps(parseInt(e.target.value))}
            className="w-full"
            disabled={disabled}
          />
        </div>

        {/* CFG */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            CFG: {cfg.toFixed(1)}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            step="0.5"
            value={cfg}
            onChange={(e) => setCfg(parseFloat(e.target.value))}
            className="w-full"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Seed */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Seed (optional)
        </label>
        <input
          type="number"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="Random if empty"
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          disabled={disabled}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={disabled || !prompt.trim() || (requiresImage && !inputImage)}
        className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded font-medium transition-colors"
      >
        Generate
      </button>
    </form>
  );
}
