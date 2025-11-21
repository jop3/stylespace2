import { useEffect, useState } from 'react'
import * as THREE from 'three'

export function useImageTexture(imageUrl: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (!imageUrl) {
      setTexture(null)
      return
    }

    const loader = new THREE.TextureLoader()

    loader.load(
      imageUrl,
      (loadedTexture) => {
        loadedTexture.colorSpace = THREE.SRGBColorSpace
        loadedTexture.needsUpdate = true
        setTexture(loadedTexture)
      },
      undefined,
      (error) => {
        console.error('Failed to load texture:', error)
      }
    )

    return () => {
      if (texture) {
        texture.dispose()
      }
    }
  }, [imageUrl])

  return texture
}
