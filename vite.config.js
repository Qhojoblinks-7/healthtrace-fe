import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Multi-page app configuration for separate Doctor and Volunteer builds
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        volunteer: path.resolve(__dirname, "volunteer.html"),
      },
    },
  },
});
