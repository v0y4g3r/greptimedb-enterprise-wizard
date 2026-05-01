import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts: ["ws-0.taildb919.ts.net"],
    host: '0.0.0.0',
    port: 5173,
  },
})
