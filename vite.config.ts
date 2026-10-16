import react from '@vitejs/plugin-react'
import tw from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tw()],
})
