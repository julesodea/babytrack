import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate React and React Router into their own chunk
          'react-vendor': ['react', 'react-dom', 'react-router'],
          // Separate React Query into its own chunk
          'react-query': ['@tanstack/react-query'],
          // Separate Supabase into its own chunk (loaded by API modules)
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
    // Increase chunk size warning limit to 600kb (since we're now splitting)
    chunkSizeWarningLimit: 600,
  },
})
