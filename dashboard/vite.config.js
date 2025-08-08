import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Base path configuration - defaults to root but can be overridden
  base: process.env.VITE_BASE_PATH || '/',
  
  // Build configuration
  build: {
    // Clear the output directory before building
    emptyOutDir: true,
    // Generate manifest for better cache invalidation
    manifest: true,
    // Ensure consistent output
    outDir: 'dist',
    // Add build timestamp to avoid cache issues
    rollupOptions: {
      output: {
        // Add hash to file names for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    }
  },
  
  // Preview server configuration
  preview: {
    // Force clear cache on start
    clearScreen: false,
    // Ensure fresh content
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    // Enable host binding for testing
    host: true,
    // Standard preview port
    port: 4173,
    // Handle SPA routing
    fallback: '/index.html'
  },
  
  // Development server configuration (for consistency)
  server: {
    // Handle SPA routing for admin paths
    fallback: '/index.html',
    // Enable host binding
    host: true,
    // Development port
    port: 5173
  },
  
  // Handle SPA routing at build time
  appType: 'spa',
  
  // Define global constants for development/preview
  define: {
    // These will be available during development and preview
    // In production, they're injected by the server
    'import.meta.env.DEV_ADMIN_MODE': JSON.stringify(process.env.VITE_ADMIN_MODE === 'true'),
    'import.meta.env.DEV_API_BASE': JSON.stringify(process.env.VITE_API_BASE || 'http://localhost:3000')
  }
})
