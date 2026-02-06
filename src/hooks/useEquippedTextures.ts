import { useEffect, useRef } from 'react';
import type { VRM } from '@pixiv/three-vrm';
import * as THREE from 'three';
import { useWardrobeStore } from '../stores/wardrobeStore';
import { createTextureFromImage } from '../utils/textureUtils';
import type { ClothingCategory } from '../components/wardrobe/CategoryTabs';

/**
 * Get all meshes from a VRM scene
 */
function getVRMMeshes(vrm: VRM): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  vrm.scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      meshes.push(obj);
    }
  });
  return meshes;
}

/**
 * Find best matching mesh for a clothing category
 */
function findMeshForCategory(meshes: THREE.Mesh[], category: ClothingCategory, itemName: string): THREE.Mesh | null {
  // Meshes to EXCLUDE for clothing (not face/hair for clothes)
  const excludeForClothing = ['face', 'eye', 'mouth', 'teeth', 'tongue', 'brow', 'lash', 'iris', 'pupil'];
  const excludeForHair = ['face', 'eye', 'body', 'cloth', 'shoe'];

  // Keywords to MATCH for each category (prioritized)
  const categoryKeywords: Record<ClothingCategory, string[]> = {
    tops: ['cloth', 'top', 'shirt', 'jacket', 'coat', 'torso', 'chest', 'upper', 'outfit'],
    bottoms: ['cloth', 'bottom', 'pant', 'skirt', 'leg', 'lower', 'outfit'],
    dresses: ['cloth', 'dress', 'outfit', 'torso'],
    shoes: ['shoe', 'foot', 'feet', 'boot', 'sandal', 'sock'],
    accessories: ['accessory', 'glasses', 'earring', 'necklace', 'watch', 'ring', 'belt'],
    hair: ['hair'],
  };

  const keywords = categoryKeywords[category] || [];
  const isClothing = ['tops', 'bottoms', 'dresses', 'shoes'].includes(category);
  const isHair = category === 'hair';
  const isAccessory = category === 'accessories';

  // For hair: ONLY apply if there's a mesh with "hair" in the name
  if (isHair) {
    const hairMesh = meshes.find(m => m.name.toLowerCase().includes('hair'));
    return hairMesh || null; // Return null if no hair mesh exists
  }

  // For accessories: be strict, only apply to matching meshes
  if (isAccessory) {
    for (const mesh of meshes) {
      const meshName = mesh.name.toLowerCase();
      if (keywords.some(kw => meshName.includes(kw))) {
        return mesh;
      }
    }
    return null; // Don't fallback for accessories
  }

  // Filter out face meshes for clothing
  console.log(`Filtering meshes for category "${category}":`);
  const eligibleMeshes = meshes.filter(mesh => {
    const meshName = mesh.name.toLowerCase();
    const excluded = excludeForClothing.some(ex => meshName.includes(ex));
    console.log(`  "${mesh.name}" -> "${meshName}" -> excluded: ${excluded}`);
    return !excluded;
  });
  console.log(`Eligible meshes: ${eligibleMeshes.map(m => m.name).join(', ')}`);

  // First try: match by category keywords (highest priority)
  for (const mesh of eligibleMeshes) {
    const meshName = mesh.name.toLowerCase();
    if (keywords.some(kw => meshName.includes(kw))) {
      return mesh;
    }
  }

  // Second try: for clothing, find any "body" mesh
  if (isClothing) {
    for (const mesh of eligibleMeshes) {
      const meshName = mesh.name.toLowerCase();
      console.log(`Checking mesh "${mesh.name}" (lowercase: "${meshName}") for body`);
      if (meshName.includes('body')) {
        console.log(`  -> MATCHED body mesh: "${mesh.name}"`);
        return mesh;
      }
    }
  }

  // Last resort for clothing: return largest mesh (likely the body)
  if (isClothing && eligibleMeshes.length > 0) {
    let largestMesh = eligibleMeshes[0];
    let largestSize = 0;

    for (const mesh of eligibleMeshes) {
      const box = new THREE.Box3().setFromObject(mesh);
      const size = box.getSize(new THREE.Vector3());
      const volume = size.x * size.y * size.z;
      if (volume > largestSize) {
        largestSize = volume;
        largestMesh = mesh;
      }
    }
    return largestMesh;
  }

  return null; // Don't fallback blindly
}

/**
 * Apply texture to a mesh - handles both single material and material arrays
 */
function applyTextureToMesh(mesh: THREE.Mesh, texture: THREE.Texture) {
  // Configure texture for proper display
  texture.flipY = false; // VRM models typically need flipY = false
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

  let applied = false;
  for (const material of materials) {
    if (material && 'map' in material) {
      const stdMaterial = material as THREE.MeshStandardMaterial;

      // Store original texture for potential reset
      if (!mesh.userData.originalMaps) {
        mesh.userData.originalMaps = new Map();
      }
      if (!mesh.userData.originalMaps.has(material.uuid)) {
        mesh.userData.originalMaps.set(material.uuid, stdMaterial.map);
      }

      stdMaterial.map = texture;
      stdMaterial.needsUpdate = true;
      applied = true;
      console.log(`  Applied to material ${material.uuid.slice(0, 8)}`);
    }
  }

  if (!applied) {
    console.warn(`Could not apply texture to mesh "${mesh.name}" - no valid material found`);
  }
}

/**
 * Hook that automatically applies equipped wardrobe items to the VRM
 * Re-applies textures when VRM changes or equipped items change
 */
export function useEquippedTextures(vrm: VRM | null) {
  const { equippedItems, getItemById } = useWardrobeStore();

  // Track which items we've already applied to avoid re-applying
  const appliedItemsRef = useRef<Set<string>>(new Set());
  const vrmIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!vrm) {
      appliedItemsRef.current.clear();
      vrmIdRef.current = null;
      return;
    }

    // Check if VRM changed (new model loaded)
    const vrmId = vrm.scene.uuid;
    if (vrmIdRef.current !== vrmId) {
      appliedItemsRef.current.clear();
      vrmIdRef.current = vrmId;
    }

    // Get all equipped item IDs
    const equippedIds = Array.from(equippedItems.values());

    if (equippedIds.length === 0) return;

    // Get meshes from VRM
    const meshes = getVRMMeshes(vrm);
    if (meshes.length === 0) return;

    // Debug: log all mesh names
    console.log('=== VRM Meshes ===');
    meshes.forEach(m => console.log(`  - "${m.name}"`));

    // Find items that need to be applied
    const itemsToApply = equippedIds.filter(id => !appliedItemsRef.current.has(id));

    if (itemsToApply.length === 0) return;

    // Apply each texture
    itemsToApply.forEach(itemId => {
      const item = getItemById(itemId);
      if (!item || !item.textureUrl) return;

      // Find best mesh for this item
      const targetMesh = findMeshForCategory(meshes, item.category, item.name);
      if (!targetMesh) {
        console.warn(`No suitable mesh found for ${item.name}`);
        return;
      }

      // Load and apply texture
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        const texture = createTextureFromImage(img);
        applyTextureToMesh(targetMesh, texture);
        appliedItemsRef.current.add(itemId);
        console.log(`Applied texture "${item.name}" to mesh "${targetMesh.name}"`);
      };

      img.onerror = () => {
        console.error('Failed to load texture:', item.textureUrl);
      };

      img.src = item.textureUrl;
    });
  }, [vrm, equippedItems, getItemById]);
}

export default useEquippedTextures;
