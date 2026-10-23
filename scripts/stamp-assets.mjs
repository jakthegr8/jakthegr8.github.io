// Adds a content hash to every local CSS and JS link in index.html (main.css?v=1a2b3c4d).
// GitHub Pages lets browsers cache files for 10 minutes; without a changing URL, a visitor can get
// new HTML with yesterday's CSS and JS. Run after editing css/ or js/:  node scripts/stamp-assets.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const page = new URL("../index.html", import.meta.url);
const html = readFileSync(page, "utf8");

const stamped = html.replace(/(href|src)="((?:css|js)\/[\w.-]+\.(?:css|js))(?:\?v=[\w]+)?"/g, (_, attr, path) => {
  const hash = createHash("sha256").update(readFileSync(new URL("../" + path, import.meta.url))).digest("hex").slice(0, 8);
  return `${attr}="${path}?v=${hash}"`;
});

writeFileSync(page, stamped);
for (const m of stamped.matchAll(/(?:href|src)="((?:css|js)\/[^"]+)"/g)) console.log(m[1]);
