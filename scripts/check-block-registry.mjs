import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const frontendRoot = process.cwd();
const backendSections = path.resolve(
  frontendRoot,
  "../lumora-treks-BE/apps/cms/blocks/sections.py",
);
const registryFile = path.resolve(frontendRoot, "src/lib/block-registry.ts");

const backend = fs.readFileSync(backendSections, "utf8");
const frontend = fs.readFileSync(registryFile, "utf8");
const backendComponents = [
  ...backend.matchAll(/component\s*=\s*"([A-Za-z0-9]+)"/g),
].map((match) => match[1]);
const registryBody = frontend.slice(
  frontend.indexOf("export const blockRegistry"),
);
const frontendComponents = [
  ...registryBody.matchAll(/^\s{2}([A-Za-z0-9]+)(?::|,)/gm),
].map((match) => match[1]);

const missing = backendComponents.filter(
  (component) => !frontendComponents.includes(component),
);
const extra = frontendComponents.filter(
  (component) => !backendComponents.includes(component),
);

if (missing.length || extra.length) {
  if (missing.length)
    console.error(
      `Missing frontend block registrations: ${missing.join(", ")}`,
    );
  if (extra.length)
    console.error(
      `Frontend registrations without backend blocks: ${extra.join(", ")}`,
    );
  process.exit(1);
}

console.log(`CMS block contract OK (${backendComponents.length} components).`);
