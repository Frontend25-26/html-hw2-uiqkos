import { defineConfig } from 'vite'

import { REPO_NAME } from './config'

export default defineConfig(({mode}) => {
  const isDev = mode == 'development'
  return {
    root: './src',
    base: isDev ? '/' : `https://frontend25-26.github.io/${REPO_NAME}/`,
    server: {
      open: true,
      port: 3030,
    },
    build: {
      outDir: './dist'
    },
    test: {
      dir: './tests/unit',
      environment: 'jsdom',
      setupFiles: './tests/setup.js'
    }
  }
})
