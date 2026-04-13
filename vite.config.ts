import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("@react-pdf/renderer")) return "react-pdf";
          if (id.includes("node_modules/exceljs") || id.includes("node_modules/xlsx")) return "xlsx";
          if (id.includes("node_modules/recharts")) return "recharts";
          if (id.includes("node_modules/framer-motion")) return "framer-motion";
          if (id.includes("node_modules/@radix-ui/")) return "radix-ui";
        },
      },
    },
  },
}));
