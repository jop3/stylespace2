export type ClothingType = 'body' | 'underwear' | 'pants' | 'tshirt' | 'dress' | 'jacket' | 'shoes' | 'accessories'

// Layer order (higher = on top)
export const LAYER_ORDER: Record<ClothingType, number> = {
  body: 0,
  underwear: 1,
  pants: 2,
  tshirt: 3,
  dress: 4,
  jacket: 5,
  shoes: 6,
  accessories: 7,
}

export interface ClothingItem {
  id: string
  name: string
  type: ClothingType
  imageUrl: string
}
