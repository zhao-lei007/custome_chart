import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',  // Use relative paths for assets
  server: { host: true, port: 5173 },
  build: {
    rollupOptions: {
      input: {
        manage: resolve(__dirname, 'manage.html'),
        editor: resolve(__dirname, 'editor.html'),
      },
    },
    sourcemap: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
})
