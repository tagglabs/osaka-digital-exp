import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://b1.tagg.live/osaka25-artifact-cms",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), tailwindcss()],
});
