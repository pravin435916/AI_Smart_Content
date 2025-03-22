import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
    tailwindcss(),
  ],
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        index: "index.html", // ✅ Ensures Vite processes index.html
        background: "background.js",
        content: "content.js",
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: false,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});
