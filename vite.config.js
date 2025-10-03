import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "./", // 👈 keep this
  optimizeDeps: { exclude: ['serverless-http', 'express'] },
  build: { rollupOptions: { external: ['serverless-http', 'express'] } }
})
