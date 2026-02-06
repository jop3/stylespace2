import { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm'

/**
 * VRM loading error types for better user feedback
 */
export type VRMLoadErrorType =
  | 'invalid_file'
  | 'network_error'
  | 'parse_error'
  | 'not_vrm'
  | 'unknown'

/**
 * Detailed error information for VRM loading failures
 */
export interface VRMLoadError {
  type: VRMLoadErrorType
  message: string
  details?: string
}

/**
 * Analyzes an error and returns a user-friendly error object
 */
function parseVRMError(err: unknown, url: string): VRMLoadError {
  const errorMessage = err instanceof Error ? err.message : String(err)
  const errorName = err instanceof Error ? err.name : ''

  // Network errors
  if (
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('NetworkError') ||
    errorName === 'TypeError'
  ) {
    return {
      type: 'network_error',
      message: 'Failed to load VRM file',
      details: url.startsWith('blob:')
        ? 'The file could not be read. It may be corrupted.'
        : 'Check your network connection and try again.',
    }
  }

  // GLTF/parsing errors
  if (
    errorMessage.includes('Unexpected token') ||
    errorMessage.includes('JSON') ||
    errorMessage.includes('parse')
  ) {
    return {
      type: 'parse_error',
      message: 'Invalid file format',
      details: 'The file is not a valid VRM/glTF file. Make sure you selected a .vrm file.',
    }
  }

  // File access errors
  if (
    errorMessage.includes('404') ||
    errorMessage.includes('Not Found') ||
    errorMessage.includes('ENOENT')
  ) {
    return {
      type: 'invalid_file',
      message: 'File not found',
      details: 'The VRM file could not be found at the specified location.',
    }
  }

  // Generic unknown error
  return {
    type: 'unknown',
    message: 'Failed to load VRM file',
    details: errorMessage || 'An unexpected error occurred while loading the model.',
  }
}

/**
 * Return type for useVRM hook
 */
export interface UseVRMResult {
  /** The loaded VRM model, or null if not loaded */
  vrm: VRM | null
  /** Whether the model is currently loading */
  loading: boolean
  /** Error information if loading failed */
  error: VRMLoadError | null
  /** Loading progress (0-100) */
  progress: number
}

/**
 * Hook for loading and managing VRM avatar models
 *
 * Handles:
 * - Async loading with progress tracking
 * - Proper resource cleanup on unmount/URL change
 * - Detailed error messages for debugging
 * - Automatic model rotation to face camera
 *
 * @param url - URL of the VRM file to load (can be blob: URL for uploads)
 * @returns VRM model, loading state, and error information
 *
 * @example
 * ```tsx
 * const { vrm, loading, error, progress } = useVRM(vrmUrl)
 *
 * if (loading) return <LoadingSpinner progress={progress} />
 * if (error) return <ErrorMessage error={error} />
 * if (vrm) return <VRMRenderer vrm={vrm} />
 * ```
 */
export function useVRM(url: string | null): UseVRMResult {
  const [vrm, setVrm] = useState<VRM | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<VRMLoadError | null>(null)
  const [progress, setProgress] = useState(0)

  // Keep track of the VRM for cleanup
  const vrmRef = useRef<VRM | null>(null)

  useEffect(() => {
    // Clean up previous VRM when URL changes
    if (vrmRef.current) {
      disposeVRM(vrmRef.current)
      vrmRef.current = null
    }

    if (!url) {
      setVrm(null)
      setError(null)
      setProgress(0)
      return
    }

    setLoading(true)
    setError(null)
    setProgress(0)

    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    loader.load(
      url,
      (gltf) => {
        const vrmModel = gltf.userData.vrm as VRM | undefined
        if (vrmModel) {
          // Rotate to face camera (VRM models face +Z by default)
          vrmModel.scene.rotation.y = Math.PI
          vrmRef.current = vrmModel
          setVrm(vrmModel)
          setError(null)
        } else {
          setError({
            type: 'not_vrm',
            message: 'Not a valid VRM file',
            details:
              'The file loaded successfully but does not contain VRM data. Make sure this is a VRM avatar file.',
          })
          setVrm(null)
        }
        setLoading(false)
        setProgress(100)
      },
      (progressEvent) => {
        if (progressEvent.total > 0) {
          const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          setProgress(percent)
        }
      },
      (err) => {
        console.error('Error loading VRM:', err)
        setError(parseVRMError(err, url))
        setVrm(null)
        setLoading(false)
        setProgress(0)
      }
    )

    // Cleanup function
    return () => {
      if (vrmRef.current) {
        disposeVRM(vrmRef.current)
        vrmRef.current = null
      }
    }
  }, [url])

  return { vrm, loading, error, progress }
}

/**
 * Properly disposes of a VRM model and its resources
 * Prevents memory leaks from Three.js geometries and materials
 */
function disposeVRM(vrm: VRM): void {
  vrm.scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry?.dispose()
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => {
          disposeMaterial(m)
        })
      } else if (obj.material) {
        disposeMaterial(obj.material)
      }
    }
  })
}

/**
 * Disposes of a material and its textures
 */
function disposeMaterial(material: THREE.Material): void {
  material.dispose()

  // Dispose textures if present
  const matWithMaps = material as THREE.MeshStandardMaterial
  matWithMaps.map?.dispose()
  matWithMaps.normalMap?.dispose()
  matWithMaps.roughnessMap?.dispose()
  matWithMaps.metalnessMap?.dispose()
  matWithMaps.aoMap?.dispose()
  matWithMaps.emissiveMap?.dispose()
  matWithMaps.alphaMap?.dispose()
}
