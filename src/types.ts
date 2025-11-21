export type ClothingType = 'tshirt' | 'pants' | 'shoes' | 'dress'

export interface ClothingItem {
  id: string
  name: string
  type: ClothingType
  imageUrl: string // data URL or blob URL from uploaded image
}
