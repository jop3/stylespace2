// Garment silhouette paths for 2D paper doll
// These define the shape of each clothing item that gets filled with patterns

export const GARMENT_SILHOUETTES = {
  dress: {
    name: 'Dress',
    viewBox: '0 0 400 600',
    // Dress shape - bodice + flared skirt
    path: `
      M 160 140
      L 240 140
      L 250 160
      L 260 200
      L 265 240
      C 280 320, 300 400, 310 500
      L 310 520
      L 90 520
      L 90 500
      C 100 400, 120 320, 135 240
      L 140 200
      L 150 160
      Z
    `,
    // Straps
    extras: [
      'M 170 140 L 175 100 L 185 100 L 180 140 Z',
      'M 220 140 L 215 100 L 225 100 L 230 140 Z',
    ],
  },

  tshirt: {
    name: 'T-Shirt',
    viewBox: '0 0 400 600',
    // T-shirt body
    path: `
      M 140 150
      L 120 160
      L 80 180
      L 85 230
      L 130 210
      L 130 320
      L 270 320
      L 270 210
      L 315 230
      L 320 180
      L 280 160
      L 260 150
      L 240 145
      C 220 140, 180 140, 160 145
      Z
    `,
    extras: [],
  },

  pants: {
    name: 'Pants',
    viewBox: '0 0 400 600',
    // Pants with two legs
    path: `
      M 130 300
      L 270 300
      L 275 320
      L 280 400
      L 275 520
      L 220 520
      L 215 400
      L 200 360
      L 185 400
      L 180 520
      L 125 520
      L 120 400
      L 125 320
      Z
    `,
    extras: [],
  },

  skirt: {
    name: 'Skirt',
    viewBox: '0 0 400 600',
    // A-line skirt
    path: `
      M 140 300
      L 260 300
      L 265 320
      C 280 380, 300 450, 310 520
      L 90 520
      C 100 450, 120 380, 135 320
      Z
    `,
    extras: [],
  },

  jacket: {
    name: 'Jacket',
    viewBox: '0 0 400 600',
    // Open jacket
    path: `
      M 130 150
      L 100 165
      L 60 190
      L 70 260
      L 120 235
      L 120 340
      L 175 340
      L 175 180
      L 200 170
      L 225 180
      L 225 340
      L 280 340
      L 280 235
      L 330 260
      L 340 190
      L 300 165
      L 270 150
      L 245 145
      C 220 142, 180 142, 155 145
      Z
    `,
    extras: [],
  },

  shoes: {
    name: 'Shoes',
    viewBox: '0 0 400 600',
    // Two shoes at bottom
    path: `
      M 100 530
      L 100 555
      L 95 560
      L 95 570
      L 175 570
      L 180 555
      L 180 530
      Z
    `,
    extras: [
      // Right shoe
      `M 220 530
       L 220 555
       L 215 560
       L 215 570
       L 295 570
       L 300 555
       L 300 530
       Z`,
    ],
  },
}

export type GarmentType = keyof typeof GARMENT_SILHOUETTES
