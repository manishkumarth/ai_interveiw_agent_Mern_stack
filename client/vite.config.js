import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  optimizeDeps: {
    esbuildOptions: {
      // Prevents esbuild from attempting to spin up a separate shell process on Windows
      supported: { 
        'dynamic-import': true 
      }
    }
  }
})