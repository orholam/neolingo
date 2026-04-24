import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Expose OPENAI_API_KEY so semantic map can call OpenAI for cluster titles (no backend)
  envPrefix: ['VITE_', 'OPENAI_'],
})
