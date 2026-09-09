import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sharp from 'sharp'
import siteAssets from './site-assets.json' with { type: 'json' }

const projectRoot = resolve(process.cwd())
const sourceAssets = resolve(projectRoot, 'public')
const outputRoot = resolve(projectRoot, 'dist')

function siteReleaseAssets() {
  return {
    name: 'site-release-assets',
    apply: 'build',
    async closeBundle() {
      let savedBytes = 0
      for (const asset of siteAssets) {
        const destination = resolve(outputRoot, asset)
        await mkdir(dirname(destination), { recursive: true })
        const source = resolve(sourceAssets, asset)
        // Published filenames are content hashes: preserve those exact bytes.
        // Recompress only legacy PNGs, without resizing or quantizing artwork.
        if (asset.endsWith('.png') && !asset.startsWith('published/')) {
          const original = await readFile(source)
          const optimized = await sharp(original).png({ compressionLevel: 9, effort: 10 }).toBuffer()
          const output = optimized.length < original.length ? optimized : original
          savedBytes += original.length - output.length
          await writeFile(destination, output)
        } else {
          await copyFile(source, destination)
        }
      }
      console.log(`Lossless PNG optimization saved ${(savedBytes / 1024 / 1024).toFixed(2)} MiB`)
      await copyFile(resolve(projectRoot, 'cloudflare/_headers'), resolve(outputRoot, '_headers'))
    },
  }
}

export default defineConfig({
  plugins: [react(), siteReleaseAssets()],
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false,
  },
})
