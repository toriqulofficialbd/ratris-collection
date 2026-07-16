import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    extensions: [".js", ".jsx", ".ts", ".tsx", ".json"],
  },

  esbuild: {
    loader: "jsx",
    include: /\\.(?:js|jsx|ts|tsx)$/,
    exclude: [],
  },

  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setupTests.js"],
  },
});