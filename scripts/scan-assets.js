#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const downloadsDir = path.join(__dirname, '../public/downloads')
const manifestPath = path.join(downloadsDir, 'manifest.json')

const CATEGORIES = ['Models', 'Clothes', 'Eyes', 'Hair', 'Textures']

const EXTENSIONS = {
  Models: ['.vrm'],
  Clothes: ['.png', '.jpg', '.jpeg', '.webp'],
  Eyes: ['.png', '.jpg', '.jpeg', '.webp'],
  Hair: ['.png', '.jpg', '.jpeg', '.webp'],
  Textures: ['.png', '.jpg', '.jpeg', '.webp'],
}

function generateId(filename) {
  return filename.toLowerCase().replace(/\s+/g, '-').replace(/\.[^.]+$/, '')
}

function getDisplayName(filename) {
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
}

function scanDirectory() {
  const assets = []

  for (const category of CATEGORIES) {
    const categoryDir = path.join(downloadsDir, category)

    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true })
      continue
    }

    const files = fs.readdirSync(categoryDir)
    const validExtensions = EXTENSIONS[category]

    for (const file of files) {
      const ext = path.extname(file).toLowerCase()
      if (validExtensions.includes(ext)) {
        assets.push({
          id: generateId(file),
          name: getDisplayName(file),
          path: `/downloads/${category}/${file}`,
          category,
        })
      }
    }
  }

  return assets
}

// Run scan
console.log('Scanning downloads folder...')
const assets = scanDirectory()
fs.writeFileSync(manifestPath, JSON.stringify(assets, null, 2))
console.log(`Found ${assets.length} assets:`)
CATEGORIES.forEach(cat => {
  const count = assets.filter(a => a.category === cat).length
  console.log(`  ${cat}: ${count}`)
})
console.log(`Manifest saved to: ${manifestPath}`)
