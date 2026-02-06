import { useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import type { VRM } from '@pixiv/three-vrm'
import { isMappableMaterial } from '../utils/textureUtils'

/**
 * Mesh info for individual mesh selection
 */
export interface MeshInfo {
  name: string
  mesh: THREE.Mesh
}

/**
 * Return type for useMeshGroups hook
 */
export interface UseMeshGroupsResult {
  /** Map of group names to arrays of meshes */
  meshGroups: Map<string, THREE.Mesh[]>
  /** Flat list of all meshes with names */
  allMeshes: MeshInfo[]
  /** Currently selected group name */
  selectedGroup: string | null
  /** Currently selected individual mesh name */
  selectedMesh: string | null
  /** Whether grouped mode is active */
  groupedMode: boolean
  /** Map of original textures for reset functionality */
  originalTextures: Map<THREE.Material, THREE.Texture | null>
  /** Set the selected group */
  setSelectedGroup: (group: string | null) => void
  /** Set the selected individual mesh */
  setSelectedMesh: (mesh: string | null) => void
  /** Toggle between grouped and individual mode */
  toggleGroupedMode: () => void
  /** Set grouped mode directly */
  setGroupedMode: (mode: boolean) => void
  /** Get meshes to apply texture to based on current selection */
  getSelectedMeshes: () => THREE.Mesh[]
  /** Reset textures to original for selected meshes */
  resetSelectedTextures: () => void
}

/**
 * Extracts the base name from a mesh name by removing trailing numbers
 * e.g., "Armor_01" -> "Armor", "Body" -> "Body"
 */
function getBaseName(name: string): string {
  return name.replace(/_?\d+$/, '') || 'Other'
}

/**
 * Hook for managing VRM mesh groups and selection
 *
 * Provides functionality for:
 * - Grouping meshes by base name
 * - Switching between grouped and individual selection modes
 * - Storing original textures for reset functionality
 * - Getting selected meshes for texture application
 *
 * @param vrm - The VRM model to scan for meshes
 * @returns Mesh groups, selection state, and helper functions
 *
 * @example
 * ```tsx
 * const { meshGroups, selectedGroup, getSelectedMeshes, resetSelectedTextures } = useMeshGroups(vrm)
 *
 * // Apply texture to selected meshes
 * const meshes = getSelectedMeshes()
 * applyTextureToMeshes({ texture, meshes })
 *
 * // Reset to original
 * resetSelectedTextures()
 * ```
 */
export function useMeshGroups(vrm: VRM | null): UseMeshGroupsResult {
  const [meshGroups, setMeshGroups] = useState<Map<string, THREE.Mesh[]>>(new Map())
  const [allMeshes, setAllMeshes] = useState<MeshInfo[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [selectedMesh, setSelectedMesh] = useState<string | null>(null)
  const [groupedMode, setGroupedMode] = useState(true)
  const [originalTextures] = useState<Map<THREE.Material, THREE.Texture | null>>(() => new Map())

  // Scan VRM for meshes and group by base name
  useEffect(() => {
    if (!vrm) {
      setMeshGroups(new Map())
      setSelectedGroup(null)
      setAllMeshes([])
      setSelectedMesh(null)
      originalTextures.clear()
      return
    }

    const groups = new Map<string, THREE.Mesh[]>()
    const meshList: MeshInfo[] = []

    vrm.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        // Add to mesh list for individual selection
        const meshName = object.name || `Mesh ${meshList.length}`
        meshList.push({ name: meshName, mesh: object })

        // Store original textures
        const materials = Array.isArray(object.material) ? object.material : [object.material]
        materials.forEach((material) => {
          if (material && isMappableMaterial(material) && !originalTextures.has(material)) {
            originalTextures.set(material, material.map || null)
          }
        })

        // Group by base name
        const baseName = getBaseName(object.name || 'Unknown')
        if (!groups.has(baseName)) {
          groups.set(baseName, [])
        }
        groups.get(baseName)!.push(object)
      }
    })

    setAllMeshes(meshList)
    setMeshGroups(groups)

    // Auto-select first group/mesh
    const firstGroup = groups.keys().next().value
    if (firstGroup) {
      setSelectedGroup(firstGroup)
    }
    if (meshList.length > 0) {
      setSelectedMesh(meshList[0].name)
    }
  }, [vrm, originalTextures])

  const toggleGroupedMode = useCallback(() => {
    setGroupedMode((prev) => !prev)
  }, [])

  const getSelectedMeshes = useCallback((): THREE.Mesh[] => {
    if (groupedMode) {
      if (!selectedGroup) return []
      return meshGroups.get(selectedGroup) || []
    } else {
      if (!selectedMesh) return []
      const meshInfo = allMeshes.find((m) => m.name === selectedMesh)
      return meshInfo ? [meshInfo.mesh] : []
    }
  }, [groupedMode, selectedGroup, selectedMesh, meshGroups, allMeshes])

  const resetSelectedTextures = useCallback(() => {
    const meshes = getSelectedMeshes()

    meshes.forEach((mesh) => {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material]

      materials.forEach((material) => {
        if (material && isMappableMaterial(material) && originalTextures.has(material)) {
          material.map = originalTextures.get(material) || null
          material.needsUpdate = true
        }
      })
    })
  }, [getSelectedMeshes, originalTextures])

  return {
    meshGroups,
    allMeshes,
    selectedGroup,
    selectedMesh,
    groupedMode,
    originalTextures,
    setSelectedGroup,
    setSelectedMesh,
    toggleGroupedMode,
    setGroupedMode,
    getSelectedMeshes,
    resetSelectedTextures,
  }
}
