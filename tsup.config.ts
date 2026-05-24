import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.js'],
  outDir: 'dist',
  format: ['cjs'],
  minify: true,
  clean: true,
  bundle: true,
  sourcemap: false,
  dts: false,
  banner: {
    js: '#!/usr/bin/env node',
  },
  external: ['typescript'],
})
