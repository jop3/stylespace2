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

const isWindows = process.platform === 'win32'

// Extract a zip file cross-platform
function extractZip(zipPath, destDir) {
  if (isWindows) {
    // Use tar (built into Windows 10 1803+) which supports zip extraction
    execSync(`tar -xf "${zipPath}" -C "${destDir}"`, { stdio: 'pipe' })
  } else {
    // Use unzip on Unix-like systems
    execSync(`unzip -o -q "${zipPath}" -d "${destDir}"`, { stdio: 'pipe' })
  }
}

// Recursively extract all zips, including nested ones
function extractAllZips(dir, depth = 0) {
  if (depth > 5) return 0 // Prevent infinite recursion
  if (!fs.existsSync(dir)) return 0

  let totalExtracted = 0
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)

    if (item.isDirectory()) {
      // Recurse into subdirectories
      totalExtracted += extractAllZips(fullPath, depth + 1)
    } else if (item.name.toLowerCase().endsWith('.zip')) {
      console.log(`  ${'  '.repeat(depth)}Extracting: ${item.name}`)
      try {
        // Extract to same directory
        extractZip(fullPath, dir)
        fs.unlinkSync(fullPath)
        totalExtracted++
        // Re-scan this directory for newly extracted zips
        totalExtracted += extractAllZips(dir, depth)
      } catch (err) {
        console.error(`  Failed to extract ${item.name}:`, err.message)
      }
    }
  }
  return totalExtracted
}

// Smart name extraction from path
function getSmartName(filePath, category) {
  const parts = filePath.split('/')
  const filename = parts[parts.length - 1]
  const filenameNoExt = filename.replace(/\.[^.]+$/, '')

  // If file is in a subfolder, use folder name + filename for context
  if (parts.length > 1) {
    const folderName = parts[parts.length - 2]
    // Skip generic folder names
    const genericNames = ['textures', 'texture', 'images', 'image', 'assets', 'export', 'output', category.toLowerCase()]
    if (!genericNames.includes(folderName.toLowerCase())) {
      // Combine folder and file name if they're different
      if (!filenameNoExt.toLowerCase().includes(folderName.toLowerCase())) {
        return cleanName(`${folderName} ${filenameNoExt}`)
      }
    }
  }

  return cleanName(filenameNoExt)
}

// Clean up name for display
function cleanName(name) {
  return name
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^\s+|\s+$/g, '')
    .replace(/\b\w/g, c => c.toUpperCase()) // Title case
}

// Generate unique ID
function generateId(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// Recursively find all asset files
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

// Flatten deeply nested single-folder structures
// e.g., Models/SomeZip/folder1/folder2/model.vrm -> Models/model.vrm
function flattenSingleFolders(categoryDir) {
  let flattened = 0

  function processDir(dir) {
    if (!fs.existsSync(dir)) return
    const items = fs.readdirSync(dir, { withFileTypes: true })

    for (const item of items) {
      if (!item.isDirectory()) continue
      const subdir = path.join(dir, item.name)
      const subItems = fs.readdirSync(subdir, { withFileTypes: true })

      // If folder only contains one subfolder (no files), flatten it
      const subfolders = subItems.filter(i => i.isDirectory())
      const files = subItems.filter(i => !i.isDirectory())

      if (subfolders.length === 1 && files.length === 0) {
        const innerFolder = path.join(subdir, subfolders[0].name)
        const innerItems = fs.readdirSync(innerFolder)

        // Move all contents up
        for (const inner of innerItems) {
          const src = path.join(innerFolder, inner)
          const dest = path.join(subdir, inner)
          if (!fs.existsSync(dest)) {
            fs.renameSync(src, dest)
          }
        }
        // Remove empty folder
        try {
          fs.rmdirSync(innerFolder)
          flattened++
          // Process again in case of multiple levels
          processDir(dir)
        } catch {}
      } else {
        // Recurse into non-single folders
        processDir(subdir)
      }
    }
  }

  processDir(categoryDir)
  return flattened
}

function scanDirectory() {
  const assets = []
  const seenIds = new Set()

  for (const category of CATEGORIES) {
    const categoryDir = path.join(downloadsDir, category)

    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true })
      continue
    }

    console.log(`\nProcessing ${category}...`)

    // Extract all zips (including nested)
    const extracted = extractAllZips(categoryDir)
    if (extracted > 0) {
      console.log(`  Extracted ${extracted} zip file(s)`)
    }

    // Flatten unnecessary folder nesting
    const flattened = flattenSingleFolders(categoryDir)
    if (flattened > 0) {
      console.log(`  Flattened ${flattened} nested folder(s)`)
    }

    // Find all assets
    const validExtensions = EXTENSIONS[category]
    const files = findAssetFiles(categoryDir, validExtensions)

    for (const { file, relativePath } of files) {
      const name = getSmartName(relativePath, category)
      let id = generateId(name)

      // Ensure unique ID
      let counter = 1
      let uniqueId = id
      while (seenIds.has(uniqueId)) {
        uniqueId = `${id}-${counter++}`
      }
      seenIds.add(uniqueId)

      assets.push({
        id: uniqueId,
        name,
        path: `/downloads/${category}/${relativePath}`,
        category,
      })
    }

    console.log(`  Found ${files.length} ${category.toLowerCase()}`)
  }

  return assets
}

// Ensure downloads directory exists
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true })
}

// Run scan
console.log('Scanning downloads folder...')
console.log(`Location: ${downloadsDir}`)

const assets = scanDirectory()

fs.writeFileSync(manifestPath, JSON.stringify(assets, null, 2))

console.log('\n---')
console.log(`Total: ${assets.length} assets`)
console.log(`Manifest saved to: ${manifestPath}`)
