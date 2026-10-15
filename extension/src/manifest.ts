import pkg from "../package.json";
import { ManifestType } from "@src/manifest-type";

const manifest: ManifestType = {
  manifest_version: 3,
  name: pkg.displayName,
  version: pkg.version,
  description: pkg.description,
  permissions: ["storage"],
  action: {
    default_icon: "icon-34.png",
    default_popup: "src/popup/index.html",
  },
  icons: {
    "128": "icon-128.png",
  },
  content_scripts: [
    {
      matches: ["https://web.whatsapp.com/*"],
      js: ["src/index.js"],
      css: ["contentStyle.module.css"],
    },
  ],
};

export default manifest;
