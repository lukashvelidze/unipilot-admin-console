import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
<<<<<<< HEAD
  base: "/", // 🔥 REQUIRED FOR GITHUB PAGES + CUSTOM DOMAIN
=======
  base: "/", // required for GitHub Pages + custom domain
>>>>>>> 92ad772b (vite)
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
