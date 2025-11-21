import { useState, useEffect } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { VRMLoaderPlugin, VRM } from '@pixiv/three-vrm'

export function useVRM(url: string | null) {
  const [vrm, setVrm] = useState<VRM | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!url) {
      setVrm(null)
      return
    }

    setLoading(true)
    setError(null)

    const loader = new GLTFLoader()
    loader.register((parser) => new VRMLoaderPlugin(parser))

    loader.load(
      url,
      (gltf) => {
        const vrmModel = gltf.userData.vrm as VRM
        if (vrmModel) {
          // Rotate to face camera (VRM models face +Z by default)
          vrmModel.scene.rotation.y = Math.PI
          setVrm(vrmModel)
        } else {
          setError('Not a valid VRM file')
        }
        setLoading(false)
      },
      (progress) => {
        console.log('Loading VRM:', (progress.loaded / progress.total) * 100, '%')
      },
      (err) => {
        console.error('Error loading VRM:', err)
        setError('Failed to load VRM file')
        setLoading(false)
      }
    )

    return () => {
      if (vrm) {
        vrm.scene.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry?.dispose()
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose())
            } else {
              obj.material?.dispose()
            }
          }
        })
      }
    }
  }, [url])

  return { vrm, loading, error }
}
