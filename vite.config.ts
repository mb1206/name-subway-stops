import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/name-subway-stops/',
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    globals: true,
    alias: {
      'react-map-gl/maplibre': '/src/test-mocks/react-map-gl.tsx',
      'react-map-gl': '/src/test-mocks/react-map-gl.tsx',
    },
  },
})
