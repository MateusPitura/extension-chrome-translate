import pkg from "../package.json";
import { ManifestType } from "@src/manifest-type";

const manifest: ManifestType = {
	manifest_version: 3,
	name: pkg.displayName,
	version: pkg.version,
	description: pkg.description,
	action: {
		default_icon: "icon-34.png",
	},
	icons: {
		"128": "icon-128.png",
	},
	content_scripts: [
		{
			matches: ["https://web.whatsapp.com/*"],
			js: ["src/pages/background/index.js"],
			css: ["contentStyle.module.css"],
		},
	],
	web_accessible_resources: [
		{
			resources: [
				"contentStyle.module.css",
				"icon-128.png",
				"icon-34.png",
				"src/pages/background/index.js",
			],
			matches: ["<all_urls>"],
		},
	],
};

export default manifest;
