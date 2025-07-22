import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'src/frontend', // Set the root to the frontend directory
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: '../../dist/frontend', // Output build artifacts to dist/frontend
    emptyOutDir: true, // Clean the output directory before building
  },
  server: {
    port: 3000, // You can specify a port for the dev server
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  publicDir: 'public', // Explicitly set the public directory
}) 