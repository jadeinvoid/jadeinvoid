import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import siteAssets from './site-assets.json' with { type: 'json' }

const projectRoot = resolve(process.cwd())
const sourceAssets = resolve(projectRoot, 'public')
const outputRoot = resolve(projectRoot, 'dist')

function siteReleaseAssets() {
  return {
    name: 'site-release-assets',
    async closeBundle() {
      await Promise.all(siteAssets.map(async (asset) => {
        const destination = resolve(outputRoot, asset)
        await mkdir(dirname(destination), { recursive: true })
        await copyFile(resolve(sourceAssets, asset), destination)
      }))
      await writeFile(resolve(outputRoot, '_redirects'), '/* /index.html 200\n')
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
