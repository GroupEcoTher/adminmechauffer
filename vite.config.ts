import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@products': path.resolve(__dirname, './src/pages/products'), // Alias pour le répertoire ./pages/products/
      '@components': path.resolve(__dirname, 'src/components'),
      '@users': path.resolve(__dirname, 'src/pages/users')
    },
  },
})