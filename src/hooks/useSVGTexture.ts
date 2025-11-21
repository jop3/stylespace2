import { useEffect, useState } from 'react'
import * as THREE from 'three'

export function useSVGTexture(svg: string | null): THREE.Texture | null {
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (!svg) {
      setTexture(null)
      return
    }

    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    const img = new Image()
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const newTexture = new THREE.CanvasTexture(canvas)
      newTexture.needsUpdate = true
      setTexture(newTexture)

      URL.revokeObjectURL(url)
    }

    img.onerror = () => {
      console.error('Failed to load SVG')
      URL.revokeObjectURL(url)
    }

    img.src = url

    return () => {
      URL.revokeObjectURL(url)
      if (texture) {
        texture.dispose()
      }
    }
  }, [svg])

  return texture
}
