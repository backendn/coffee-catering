import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["robots.txt", "icons/icon-192.png", "icons/icon-512.png"],
      manifest: {
        name: "Coffee & Catering",
        short_name: "Coffee",
        description: "Order quality coffee and catering for your event",
        theme_color: "#4b3621",
        background_color: "#f5f0e8",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 5173,
    watch: { usePolling: true },
  },
});
