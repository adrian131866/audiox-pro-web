import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
   
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'react-vendor'
          if (id.includes('node_modules/zustand')) return 'zustand'
          if (id.includes('node_modules/lucide-react')) return 'lucide'
          if (id.includes('/src/core/audio/') || id.includes('\\src\\core\\audio\\')) return 'audio-core'
          if (id.includes('/src/core/storage/') || id.includes('\\src\\core\\storage\\')) return 'storage'
        }
      }
    },
   
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      }
    } as any,
  
    chunkSizeWarningLimit: 1000,
  },
  
  server: {
    port: 5173,
    strictPort: true,
  }
})
