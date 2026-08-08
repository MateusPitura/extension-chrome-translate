import * as fs from "fs";
import * as path from "path";
import { PluginOption } from "vite";
import colorLog from "./log";

const { resolve } = path;

const root = resolve(__dirname, "..");
const contentStyle = resolve(root, "src", "style.module.css");
const outDir = resolve(__dirname, "..", "public");

export default function copyContentStyle(): PluginOption {
  return {
    name: "make-manifest",
    buildEnd() {
      fs.copyFileSync(contentStyle, resolve(outDir, "contentStyle.module.css"));

      colorLog("contentStyle copied", "success");
    },
  };
}
