// Auto-generated asset manifest for VRoid Hub downloads
// Run `npm run scan-assets` to regenerate this file

export interface DownloadedAsset {
  id: string
  name: string
  path: string
  category: AssetCategory
  thumbnail?: string
  author?: string
}

export type AssetCategory = 'Models' | 'Clothes' | 'Eyes' | 'Hair' | 'Textures'

export const ASSET_CATEGORIES: AssetCategory[] = ['Models', 'Clothes', 'Eyes', 'Hair', 'Textures']

// This will be populated by scanning public/downloads/
// For now, we'll dynamically scan on app load
export const DOWNLOADED_ASSETS: DownloadedAsset[] = []

// Helper to generate asset ID from filename
export function generateAssetId(filename: string): string {
  return filename.toLowerCase().replace(/\s+/g, '-').replace(/\.[^.]+$/, '')
}

// Helper to get display name from filename
export function getDisplayName(filename: string): string {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
}

// Category to file extension mapping
export const CATEGORY_EXTENSIONS: Record<AssetCategory, string[]> = {
  Models: ['.vrm'],
  Clothes: ['.png', '.jpg', '.jpeg', '.webp'],
  Eyes: ['.png', '.jpg', '.jpeg', '.webp'],
  Hair: ['.png', '.jpg', '.jpeg', '.webp'],
  Textures: ['.png', '.jpg', '.jpeg', '.webp'],
}
