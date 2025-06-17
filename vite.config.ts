import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "src/utils/metaConfig.ts",
          dest: "dist",
        },
      ],
    }),
  ],
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  server: {
    proxy: {
      "/api": {
        target: "https://kifortestapi.gobbl.ai",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
      },
    },
    port: 3000,
  },
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        // Add your bot routes here
        bot: "src/pages/chatbot/PublicChat.tsx",
      },
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          wagmi: ["wagmi", "viem"],
          ui: ["lucide-react"],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
});
