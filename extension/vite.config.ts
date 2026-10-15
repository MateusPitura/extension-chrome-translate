import { resolve } from "path";
import { defineConfig } from "vite";
import copyContentStyle from "./plugins/copy-content-style";
import makeManifest from "./plugins/make-manifest";

const root = resolve(__dirname, "src");
const outDir = resolve(__dirname, "dist");
const publicDir = resolve(__dirname, "public");

export default defineConfig({
  resolve: {
    alias: { "@src": root },
  },
  plugins: [makeManifest(), copyContentStyle()],
  publicDir,
  build: {
    outDir,
    sourcemap: process.env.__DEV__ === "true",
    rollupOptions: {
      input: {
        popup: resolve(root, "popup", "index.html"),
      },
      output: {
        entryFileNames: "src/popup/[name].js",
      },
    },
  },
});
