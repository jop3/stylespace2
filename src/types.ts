export type ClothingType = 'tshirt' | 'pants' | 'shoes'

export interface ClothingItem {
  id: string
  name: string
  type: ClothingType
  svg: string
}
