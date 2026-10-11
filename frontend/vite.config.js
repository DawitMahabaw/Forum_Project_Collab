import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const googlePopupHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: googlePopupHeaders,
  },
  preview: {
    headers: googlePopupHeaders,
  },
})
