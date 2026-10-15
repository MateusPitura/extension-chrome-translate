import * as fs from "fs";
import * as path from "path";
import { PluginOption } from "vite";
import manifest from "../src/manifest";
import colorLog from "./log";

const { resolve } = path;

const publicDir = resolve(__dirname, "..", "public");
const distDir = resolve(__dirname, "..", "dist");

export default function makeManifest(): PluginOption {
  return {
    name: "make-manifest",
    buildEnd() {
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
      }

      const manifestPath = resolve(publicDir, "manifest.json");
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

      colorLog(`Manifest file copy complete: ${manifestPath}`, "success");
    },
    closeBundle() {
      if (fs.existsSync(distDir)) {
        const manifestDistPath = resolve(distDir, "manifest.json");
        fs.writeFileSync(manifestDistPath, JSON.stringify(manifest, null, 2));
      }
    },
  };
}
