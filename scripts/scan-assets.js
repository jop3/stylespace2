#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

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

// Extract all zip files in a directory
function extractZips(categoryDir) {
  const files = fs.readdirSync(categoryDir)
  let extracted = 0

  for (const file of files) {
    if (file.toLowerCase().endsWith('.zip')) {
      const zipPath = path.join(categoryDir, file)
      console.log(`  Extracting: ${file}`)
      try {
        execSync(`unzip -o -q "${zipPath}" -d "${categoryDir}"`, { stdio: 'pipe' })
        // Remove zip after extraction
        fs.unlinkSync(zipPath)
        extracted++
      } catch (err) {
        console.error(`  Failed to extract ${file}:`, err.message)
      }
    }
  }
  return extracted
}

// Recursively find all asset files (handles nested folders from zips)
function findAssetFiles(dir, validExtensions, basePath = '') {
  const results = []
  if (!fs.existsSync(dir)) return results

  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    const relativePath = basePath ? `${basePath}/${item.name}` : item.name

    if (item.isDirectory()) {
      results.push(...findAssetFiles(fullPath, validExtensions, relativePath))
    } else {
      const ext = path.extname(item.name).toLowerCase()
      if (validExtensions.includes(ext)) {
        results.push({ file: item.name, relativePath, fullPath })
      }
    }
  }
  return results
}

function scanDirectory() {
  const assets = []

  for (const category of CATEGORIES) {
    const categoryDir = path.join(downloadsDir, category)

    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true })
      continue
    }

    // Extract any zip files first
    const extracted = extractZips(categoryDir)
    if (extracted > 0) {
      console.log(`  Extracted ${extracted} zip file(s) in ${category}`)
    }

    const validExtensions = EXTENSIONS[category]
    const files = findAssetFiles(categoryDir, validExtensions)

    for (const { file, relativePath } of files) {
      assets.push({
        id: generateId(relativePath.replace(/\//g, '-')),
        name: getDisplayName(file),
        path: `/downloads/${category}/${relativePath}`,
        category,
      })
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
