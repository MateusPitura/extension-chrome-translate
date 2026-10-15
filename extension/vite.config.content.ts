import { resolve } from "path";
import { defineConfig } from "vite";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");

export default defineConfig({
  resolve: {
    alias: { "@src": root },
  },
  publicDir: false,
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
  build: {
    outDir,
    emptyOutDir: false,
    sourcemap: process.env.__DEV__ === "true",
    lib: {
      entry: resolve(root, "index.ts"),
      name: "ContentScript",
      formats: ["iife"],
      fileName: () => "src/index.js",
    },
  },
});