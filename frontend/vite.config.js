import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // While developing (npm run dev), forward /api calls to the Express backend
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
})
