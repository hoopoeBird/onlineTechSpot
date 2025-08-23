import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import fs from "fs";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,

    proxy: {
      // This is the key part:
      "/api": {
        target: "http://localhost:1337",
        changeOrigin: true, // Needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, "/api"),
        secure: false, // If backend were HTTPS with self-signed certs
      },
      // additional proxy entries if Strapi serves other paths you directly access
      // e.g., if you fetch /uploads
      // '/uploads': {
      //   target: 'http://localhost:1337',
      //   changeOrigin: true,
      // },
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
