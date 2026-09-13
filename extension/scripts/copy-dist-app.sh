#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

replace_constant() {
  local constant_name="$1"
  local input_file="$2"
  local output_file="$3"

  node - "$constant_name" "$input_file" "$output_file" <<'NODE'
const fs = require("node:fs");

const [constantName, inputFile, outputFile] = process.argv.slice(2);
const source = fs.readFileSync(outputFile, "utf8");
const value = fs.readFileSync(inputFile, "utf8")
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

const constantPattern = new RegExp(
  "(export\\s+const\\s+" +
    constantName +
    "\\s*=\\s*`)[\\s\\S]*?(`\\s*;?)",
);

if (!constantPattern.test(source)) {
  throw new Error(`Could not find ${constantName} in ${outputFile}`);
}

const updatedSource = source.replace(
  constantPattern,
  (_, prefix, suffix) => `${prefix}${value}${suffix}`,
);

fs.writeFileSync(outputFile, updatedSource);
NODE
}

replace_constant \
  SCRIPT \
  "$ROOT_DIR/extension/dist/src/index.js" \
  "$ROOT_DIR/app/src/constants/script.ts"

replace_constant \
  STYLE \
  "$ROOT_DIR/extension/dist/contentStyle.module.css" \
  "$ROOT_DIR/app/src/constants/style.ts"

echo "Copied extension build output into app constants."
