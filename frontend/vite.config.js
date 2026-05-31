import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    proxy: {
      '/auth': 'http://localhost:8000',
      '/urls': 'http://localhost:8000',
      '/health': 'http://localhost:8000',
    },
  },
})
