# StyleSpace

An interactive avatar customization application for creating and styling 2D paper doll outfits and 3D VRM avatars with texture swapping, smart mesh detection, and AI-powered texture generation.

## Features

### 2D Paper Doll Mode
- Layered SVG silhouettes with tileable pattern textures
- Multiple garment types: dress, t-shirt, pants, skirt, jacket, shoes
- Body type options: feminine, masculine, androgynous
- Pattern import and wardrobe management

### 3D VRM Avatar Mode
- Load and display VRM (VRoid) avatar models
- Smart texture swapping with automatic mesh detection
- Grouped and individual mesh selection modes
- Reset to original textures
- Sample avatar gallery

### AI-Powered Generation (via ComfyUI)
- UV Texture Generation - controlled garment textures
- Turnaround Generation - 4-view character renders
- Depth Modifier - style transfer via depth maps
- Background Generation - scene backgrounds

### Asset Management
- Browse downloaded VRoid Hub assets (clothing, eyes, hair)
- Smart detection suggests which mesh to apply textures to
- Confidence scoring with visual indicators

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **3D Rendering**: Three.js, React Three Fiber, @react-three/drei
- **VRM Support**: @pixiv/three-vrm
- **Styling**: Tailwind CSS
- **AI Backend**: Node.js/Express + ComfyUI (separate service)

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- (Optional) ComfyUI for AI generation features

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173`

### With AI Generation (Optional)

```bash
# Install backend dependencies
npm run server:install

# Start backend (in separate terminal)
npm run server

# Requires ComfyUI running at http://127.0.0.1:8188
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run scan-assets` | Scan public/downloads for asset manifest |
| `npm run server` | Start AI backend server |
| `npm run server:install` | Install backend dependencies |

## Project Structure

```
src/
├── components/
│   ├── 3d/                    # 3D rendering components
│   │   ├── Avatar3D.tsx       # Main 3D scene
│   │   ├── VRMAvatar.tsx      # VRM model renderer
│   │   ├── TextureSwapper.tsx # Texture application UI
│   │   ├── DownloadedAssets.tsx # Asset browser
│   │   ├── VRMGallery.tsx     # Sample avatars
│   │   └── VRMUploader.tsx    # File upload
│   ├── ui/Creator/            # AI generation UI
│   ├── Avatar2D.tsx           # 2D paper doll
│   ├── PatternImporter.tsx    # Pattern upload
│   ├── PatternWardrobe.tsx    # Garment grid
│   └── SceneControls.tsx      # Scene settings
├── hooks/
│   ├── useVRM.ts              # VRM loading hook
│   └── useAIAsset.ts          # AI backend API
├── data/
│   ├── garmentSilhouettes.ts  # 2D garment shapes
│   └── downloadedAssets.ts    # Asset types
└── App.tsx                    # Root component
```

## Usage

### Loading a VRM Model
1. Click "Upload VRM" or select from the gallery
2. The model loads in the 3D viewport
3. Use mouse to orbit, zoom, and pan

### Applying Textures
1. Upload a texture image or select from downloaded assets
2. Smart detection suggests the best mesh match
3. Click a mesh to apply the texture
4. Use "Grouped" mode to apply to all related meshes
5. Click "Reset" to restore original textures

### Smart Mesh Detection
The app analyzes texture filenames to suggest which avatar part to apply them to:
- **High confidence** (green): Strong match based on keywords
- **Medium confidence** (blue): Likely match
- **Low confidence** (yellow): Uncertain, manual selection recommended

## Downloaded Assets

Place VRoid Hub assets in `public/downloads/`:
- `Clothes/` - Clothing textures
- `Eyes/` - Eye textures
- `Hair/` - Hair textures
- `Models/` - VRM model files

Run `npm run scan-assets` to generate the asset manifest.

## License

Private project - not for redistribution.
