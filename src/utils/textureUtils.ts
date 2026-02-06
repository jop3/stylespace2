import * as THREE from 'three'

// Global renderer reference for anisotropic filtering
let maxAnisotropy = 1

/**
 * Initialize texture utils with renderer capabilities
 * Call this once after creating the WebGL renderer
 */
export function initTextureUtils(renderer: THREE.WebGLRenderer): void {
  maxAnisotropy = renderer.capabilities.getMaxAnisotropy()
}

/**
 * Get the current max anisotropy level
 */
export function getMaxAnisotropy(): number {
  return maxAnisotropy
}

/**
 * Type guard to check if a material has a map property (texture-capable material)
 */
export function isMappableMaterial(
  material: THREE.Material
): material is THREE.MeshStandardMaterial | THREE.MeshBasicMaterial | THREE.MeshPhongMaterial {
  return 'map' in material
}

/**
 * Type guard to check if material is a PBR material with roughness/metalness
 */
export function isPBRMaterial(
  material: THREE.Material
): material is THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial {
  return 'roughness' in material && 'metalness' in material
}

/**
 * Type guard to check if a material has opacity property
 */
export function hasOpacity(
  material: THREE.Material
): material is THREE.Material & { opacity: number } {
  return 'opacity' in material && typeof (material as { opacity?: unknown }).opacity === 'number'
}

/**
 * Type guard to check if a material has alphaMap property
 */
export function hasAlphaMap(
  material: THREE.Material
): material is THREE.Material & { alphaMap: THREE.Texture | null } {
  return 'alphaMap' in material
}

/**
 * Shared TextureLoader instance for better performance
 * Reuse instead of creating new instances
 */
export const sharedTextureLoader = new THREE.TextureLoader()
sharedTextureLoader.setCrossOrigin('anonymous')

/**
 * Texture type for encoding configuration
 */
export type TextureMapType = 'color' | 'normal' | 'roughness' | 'metalness' | 'ao' | 'emissive' | 'alpha'

/**
 * Configure a texture with optimal settings based on its type
 */
export function configureTexture(
  texture: THREE.Texture,
  mapType: TextureMapType = 'color'
): THREE.Texture {
  // Color space based on texture type
  if (mapType === 'color' || mapType === 'emissive') {
    texture.colorSpace = THREE.SRGBColorSpace
  } else {
    // Data textures (normal, roughness, metalness, ao, alpha) should be linear
    texture.colorSpace = THREE.LinearSRGBColorSpace
  }

  // Wrapping
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  // Filtering - use linear for smooth textures
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter

  // Anisotropic filtering for sharper textures at angles
  if (maxAnisotropy > 1) {
    texture.anisotropy = maxAnisotropy
  }

  // Generate mipmaps for better distance rendering
  texture.generateMipmaps = true

  // VRM models typically don't flip textures
  texture.flipY = false

  texture.needsUpdate = true
  return texture
}

/**
 * Clone a material to prevent cross-contamination when modifying
 */
export function cloneMaterial<T extends THREE.Material>(material: T): T {
  const cloned = material.clone() as T
  return cloned
}

/**
 * Safely dispose of a texture
 */
export function disposeTexture(texture: THREE.Texture | null | undefined): void {
  if (texture) {
    texture.dispose()
  }
}

/**
 * Track of cloned materials for a mesh to enable proper cleanup
 */
const clonedMaterialsMap = new WeakMap<THREE.Mesh, THREE.Material[]>()

/**
 * Get or create a cloned material for a mesh
 * Returns the cloned material that's safe to modify without affecting others
 */
export function getOrCloneMaterial(mesh: THREE.Mesh, materialIndex = 0): THREE.Material | null {
  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
  const original = materials[materialIndex]

  if (!original) return null

  // Check if we already have cloned materials for this mesh
  let clonedMaterials = clonedMaterialsMap.get(mesh)

  if (!clonedMaterials) {
    // Clone all materials for this mesh
    clonedMaterials = materials.map((mat) => mat.clone())
    clonedMaterialsMap.set(mesh, clonedMaterials)

    // Update mesh to use cloned materials
    if (Array.isArray(mesh.material)) {
      mesh.material = clonedMaterials
    } else {
      mesh.material = clonedMaterials[0]
    }
  }

  return clonedMaterials[materialIndex]
}

/**
 * Check if a mesh has cloned materials
 */
export function hasClonedMaterials(mesh: THREE.Mesh): boolean {
  return clonedMaterialsMap.has(mesh)
}

/**
 * Dispose cloned materials for a mesh
 */
export function disposeClonedMaterials(mesh: THREE.Mesh): void {
  const clonedMaterials = clonedMaterialsMap.get(mesh)
  if (clonedMaterials) {
    clonedMaterials.forEach((mat) => {
      // Dispose textures associated with the material
      if (isMappableMaterial(mat)) {
        disposeTexture(mat.map)
      }
      mat.dispose()
    })
    clonedMaterialsMap.delete(mesh)
  }
}

/**
 * Options for applying a texture to meshes
 */
export interface ApplyTextureOptions {
  /** The texture to apply */
  texture: THREE.Texture
  /** Array of meshes to apply the texture to */
  meshes: THREE.Mesh[]
  /** Optional callback when complete */
  onComplete?: () => void
  /** Whether to clone materials before modifying (default: true) */
  cloneMaterials?: boolean
  /** Whether to dispose the old texture (default: false - caller manages lifecycle) */
  disposeOldTexture?: boolean
  /** The type of texture map being applied */
  mapType?: TextureMapType
}

/**
 * Applies a texture to an array of meshes while preserving material properties
 * like transparency, opacity, and alpha maps.
 * Uses material cloning to prevent cross-contamination.
 */
export function applyTextureToMeshes({
  texture,
  meshes,
  onComplete,
  cloneMaterials: shouldClone = true,
  disposeOldTexture = false,
  mapType = 'color',
}: ApplyTextureOptions): void {
  // Configure texture with optimal settings
  configureTexture(texture, mapType)

  meshes.forEach((mesh) => {
    // Get or clone the material to avoid cross-contamination
    if (shouldClone) {
      const clonedMaterial = getOrCloneMaterial(mesh)
      if (clonedMaterial && isMappableMaterial(clonedMaterial)) {
        applyTextureToMaterial(clonedMaterial, texture, disposeOldTexture)
      }
    } else {
      // Apply directly without cloning (for cases where caller manages materials)
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]
      materials.forEach((material) => {
        if (material && isMappableMaterial(material)) {
          applyTextureToMaterial(material, texture, disposeOldTexture)
        }
      })
    }
  })

  onComplete?.()
}

/**
 * Apply texture to a single material, preserving transparency settings
 */
function applyTextureToMaterial(
  material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial | THREE.MeshPhongMaterial,
  texture: THREE.Texture,
  disposeOldTexture: boolean
): void {
  // Store original properties to preserve transparency
  const wasTransparent = material.transparent
  const originalOpacity = hasOpacity(material) ? material.opacity : 1
  const originalAlphaMap = hasAlphaMap(material) ? material.alphaMap : null

  // Dispose old texture if requested
  if (disposeOldTexture && material.map) {
    material.map.dispose()
  }

  // Apply the new texture
  material.map = texture

  // Restore transparency properties
  material.transparent = wasTransparent
  if (hasOpacity(material)) {
    material.opacity = originalOpacity
  }
  if (hasAlphaMap(material)) {
    material.alphaMap = originalAlphaMap
  }

  material.needsUpdate = true
}

/**
 * Options for loading and applying a texture from a URL
 */
export interface LoadAndApplyTextureOptions {
  /** URL of the texture image */
  url: string
  /** Array of meshes to apply the texture to */
  meshes: THREE.Mesh[]
  /** Optional callback on success */
  onSuccess?: () => void
  /** Optional callback on error */
  onError?: (error: Error) => void
  /** The type of texture map being applied */
  mapType?: TextureMapType
  /** Whether to clone materials (default: true) */
  cloneMaterials?: boolean
}

/**
 * Loads a texture from URL and applies it to meshes
 */
export function loadAndApplyTexture({
  url,
  meshes,
  onSuccess,
  onError,
  mapType = 'color',
  cloneMaterials = true,
}: LoadAndApplyTextureOptions): void {
  sharedTextureLoader.load(
    url,
    (texture) => {
      // Configure texture with optimal settings (including anisotropic filtering)
      configureTexture(texture, mapType)

      applyTextureToMeshes({
        texture,
        meshes,
        onComplete: onSuccess,
        cloneMaterials,
        mapType,
      })
    },
    undefined,
    (error) => {
      console.error('Failed to load texture:', error)
      onError?.(error instanceof Error ? error : new Error('Failed to load texture'))
    }
  )
}

/**
 * Creates a texture from an HTML Image element
 */
export function createTextureFromImage(
  img: HTMLImageElement,
  mapType: TextureMapType = 'color'
): THREE.Texture {
  const texture = new THREE.Texture(img)
  texture.needsUpdate = true
  return configureTexture(texture, mapType)
}

/**
 * Options for loading a texture from a file
 */
export interface LoadTextureFromFileOptions {
  /** The file to load */
  file: File
  /** Callback with the loaded texture */
  onLoad: (texture: THREE.Texture) => void
  /** Optional callback on error */
  onError?: (error: Error) => void
}

/**
 * Loads a texture from a File object (e.g., from file input)
 */
export function loadTextureFromFile({
  file,
  onLoad,
  onError,
}: LoadTextureFromFileOptions): void {
  const reader = new FileReader()

  reader.onload = (event) => {
    const img = new Image()

    img.onload = () => {
      const texture = createTextureFromImage(img)
      onLoad(texture)
    }

    img.onerror = () => {
      const error = new Error(`Failed to load image: ${file.name}`)
      console.error(error)
      onError?.(error)
    }

    img.src = event.target?.result as string
  }

  reader.onerror = () => {
    const error = new Error(`Failed to read file: ${file.name}`)
    console.error(error)
    onError?.(error)
  }

  reader.readAsDataURL(file)
}

/**
 * Resets mesh materials to their original textures
 */
export function resetMeshTextures(
  meshes: THREE.Mesh[],
  originalTextures: Map<THREE.Material, THREE.Texture | null>
): void {
  meshes.forEach((mesh) => {
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

    materials.forEach((material) => {
      if (material && isMappableMaterial(material) && originalTextures.has(material)) {
        material.map = originalTextures.get(material) || null
        material.needsUpdate = true
      }
    })
  })
}

/**
 * Validates that a path is within the expected downloads directory
 * Prevents path traversal attacks
 */
export function isValidAssetPath(path: string): boolean {
  // Normalize the path and check it starts with expected prefix
  const normalizedPath = path.replace(/\\/g, '/')

  // Must start with /downloads/ or downloads/
  if (!normalizedPath.startsWith('/downloads/') && !normalizedPath.startsWith('downloads/')) {
    return false
  }

  // Check for path traversal attempts
  if (normalizedPath.includes('..') || normalizedPath.includes('//')) {
    return false
  }

  return true
}
