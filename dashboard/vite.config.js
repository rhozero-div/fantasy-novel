import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { projectReaderPlugin } from './vite-plugin-project-reader'

export default defineConfig({
  plugins: [react(), projectReaderPlugin()],
})
