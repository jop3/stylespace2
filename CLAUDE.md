# StyleSpace - Project Context

## Overview

StyleSpace is an avatar customization tool with two modes:
1. **2D Paper Doll** - SVG silhouettes with tileable pattern textures
2. **3D VRM Avatar** - Three.js-based VRM model viewer with texture swapping

The app integrates with a ComfyUI backend for AI texture generation.

## Architecture

```
React App (Vite)
    ↓
Node.js Backend (Express) - configurable via VITE_API_BASE
    ↓
ComfyUI (AI workflows) - localhost:8188
```

## Key Files

### Core Components
| File | Purpose |
|------|---------|
| `src/App.tsx` | Root component, state management, mode switching |
| `src/components/3d/Avatar3D.tsx` | Three.js Canvas setup, lighting, scene |
| `src/components/3d/VRMAvatar.tsx` | VRM model rendering |
| `src/components/3d/TextureSwapper.tsx` | Manual texture upload and mesh selection |
| `src/components/3d/DownloadedAssets.tsx` | Asset browser with smart detection |
| `src/components/3d/VRMUploader.tsx` | VRM file upload with validation |

### Shared Hooks
| File | Purpose |
|------|---------|
| `src/hooks/useVRM.ts` | VRM loading, disposal, detailed error handling |
| `src/hooks/useAIAsset.ts` | ComfyUI API with polling and error recovery |
| `src/hooks/useMeshGroups.ts` | Mesh grouping and selection for texture application |
| `src/hooks/useSmartMeshDetection.ts` | AI-powered mesh detection from filenames |

### Utilities
| File | Purpose |
|------|---------|
| `src/utils/textureUtils.ts` | Shared texture loading, application, type guards |

### UI Components
| File | Purpose |
|------|---------|
| `src/components/ui/Toast.tsx` | Toast notification system |
| `src/components/ui/ErrorBoundary.tsx` | Error handling for 3D components |

## Smart Mesh Detection

Located in `src/hooks/useSmartMeshDetection.ts`.

**Algorithm:**
- Analyzes texture filename for keywords (face, pants, hair, etc.)
- Uses pre-compiled regex patterns for performance
- Weighted scoring: high (10pts), medium (5pts), low (2pts)
- Calculates confidence based on score gap between best and second-best match
- Returns suggested mesh with confidence level (high/medium/low)

**Constants in `DETECTION_SCORES` and `CONFIDENCE_THRESHOLDS`.**

## State Management

All state in `App.tsx` using React hooks:
- `viewMode`: '2d' | '3d'
- `vrmUrl` / `vrmFileName`: Current loaded model
- `currentVRM`: VRM instance for texture operations
- `patternItems` / `activeGarments`: 2D mode state
- `backgroundColor` / `stageStyle` / `backgroundImage`: Scene customization

Blob URLs are tracked and cleaned up on unmount to prevent memory leaks.

## Texture Application Flow

1. User uploads texture or selects from assets
2. `useSmartMeshDetection` hook suggests best mesh match
3. User confirms or selects different mesh
4. `loadTextureFromFile()` or `loadAndApplyTexture()` loads the image
5. `applyTextureToMeshes()` applies with material property preservation
6. Original textures stored in Map for reset functionality

All texture utilities use proper type guards instead of `as any` casts.

## Environment Variables

Create `.env` based on `.env.example`:
```
VITE_API_BASE=http://localhost:3001
VITE_POLL_INTERVAL=2000
VITE_MAX_POLL_ERRORS=5
```

## Running the Project

```bash
npm install
npm run dev          # Frontend on :5173
npm run server       # Backend on :3001 (needs ComfyUI)
```

## Error Handling

- **Toast notifications** for user feedback (replaces alert())
- **Error boundaries** wrap 3D components to prevent full app crashes
- **VRM loading** provides detailed error types and messages
- **API polling** stops after MAX_POLL_ERRORS consecutive failures

## Conventions

- Components in `src/components/`, organized by feature
- Hooks in `src/hooks/`
- Utilities in `src/utils/`
- Data/types in `src/data/`
- Tailwind for styling
- Type guards for material properties (no `as any`)
- JSDoc comments on complex functions
- Named constants for magic numbers
