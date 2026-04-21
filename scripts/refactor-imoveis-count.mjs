/**
 * Refactor dos 19 Imoveis.tsx pra usar getImoveisCount(site) em vez de
 * slice hardcoded. Adiciona import do helper e substitui N da slice.
 */
import fs from "node:fs";
import path from "node:path";

const TEMAS_DIR = path.resolve(process.cwd(), "src/components/site-temas");

const themeDirs = fs
  .readdirSync(TEMAS_DIR)
  .map((name) => path.join(TEMAS_DIR, name))
  .filter((p) => fs.statSync(p).isDirectory());

let refactored = 0;
let skipped = 0;

for (const dir of themeDirs) {
  const imoveisFile = fs
    .readdirSync(dir)
    .find((f) => /^[A-Z].*Imoveis\.tsx$/.test(f));
  if (!imoveisFile) continue;

  const fullPath = path.join(dir, imoveisFile);
  let content = fs.readFileSync(fullPath, "utf8");

  if (content.includes("getImoveisCount")) {
    skipped++;
    continue;
  }

  const sliceRegex = /items\.slice\(0,\s*\d+\)\.map/g;
  if (!sliceRegex.test(content)) {
    console.warn(`[skip] pattern slice nao bateu em ${fullPath}`);
    skipped++;
    continue;
  }

  // Reseta regex global
  sliceRegex.lastIndex = 0;

  // 1. Adiciona getImoveisCount ao import de tipos existente
  //    Procura padrao: import ... from "../tipos"; ou similar
  if (content.match(/from "@\/types\/site"/)) {
    content = content.replace(
      /(import\s*\{[^}]*\})\s*from\s*"@\/types\/site"/,
      (match, g1) => {
        if (g1.includes("getImoveisCount")) return match;
        return g1.replace(/\}$/, ", getImoveisCount }") + ' from "@/types/site"';
      },
    );
  } else {
    // Nao importava de @/types/site ainda — adiciona import novo
    content = content.replace(
      /(import type { TemaProps } from "\.\.\/tipos";\r?\n)/,
      `$1import { getImoveisCount } from "@/types/site";\n`,
    );
  }

  // 2. Substitui items.slice(0, N).map por items.slice(0, getImoveisCount(site)).map
  content = content.replace(
    /items\.slice\(0,\s*\d+\)\.map/g,
    "items.slice(0, getImoveisCount(site)).map",
  );

  fs.writeFileSync(fullPath, content);
  refactored++;
  console.log(`[ok] ${imoveisFile}`);
}

console.log(`\nTotal refatorados: ${refactored} | ignorados: ${skipped}`);
