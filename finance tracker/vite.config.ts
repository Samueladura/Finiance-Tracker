import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  /** @type {import('tailwindcss').Config} */
  plugins: [
    tailwindcss(),
    react()
  ]
})
