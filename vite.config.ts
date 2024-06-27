import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    "process.env": "{}"
  },
  build: {
    outDir: "./build"
  },
  server: {
    watch: {
      ignored: ["!**/node_modules/@biconomy/**"]
    }
  },
  optimizeDeps: {
    exclude: ["@biconomy/account"]
  }
})
