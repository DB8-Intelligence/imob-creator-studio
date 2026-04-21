/**
 * Refactor dos 19 Layouts de tema pra usar SectionsWrapper.
 *
 * Antes:
 *   <BrisaHero {...props} />
 *   <BrisaImoveis {...props} />
 *   <BrisaAbout {...props} />
 *   <BrisaDepoimentos {...props} />
 *   <BrisaContato {...props} />
 *   <BrisaFooter {...props} />
 *
 * Depois:
 *   <SectionsWrapper site={props.site}>
 *     {{
 *       hero: <BrisaHero {...props} />,
 *       imoveis: <BrisaImoveis {...props} />,
 *       ...
 *     }}
 *   </SectionsWrapper>
 *
 * + import SectionsWrapper do arquivo "../SectionsWrapper".
 */
import fs from "node:fs";
import path from "node:path";

const TEMAS_DIR = path.resolve(process.cwd(), "src/components/site-temas");

// Pastas que contêm Layout.tsx (descarta ThemeRenderer, SectionsWrapper, tipos)
const themeDirs = fs
  .readdirSync(TEMAS_DIR)
  .map((name) => path.join(TEMAS_DIR, name))
  .filter((p) => fs.statSync(p).isDirectory());

let refactored = 0;
let skipped = 0;

for (const dir of themeDirs) {
  const layoutFile = fs
    .readdirSync(dir)
    .find((f) => /^[A-Z].*Layout\.tsx$/.test(f));
  if (!layoutFile) continue;

  const layoutPath = path.join(dir, layoutFile);
  const prefix = layoutFile.replace("Layout.tsx", "");
  let content = fs.readFileSync(layoutPath, "utf8");

  // Já refatorado?
  if (content.includes("SectionsWrapper")) {
    skipped++;
    continue;
  }

  // 1. Adiciona import do SectionsWrapper logo após o import de tipos
  content = content.replace(
    /(import type { TemaProps } from "\.\.\/tipos";\r?\n)/,
    `$1import SectionsWrapper from "../SectionsWrapper";\n`,
  );

  // 2. Substitui o bloco das 6 seções pelo SectionsWrapper
  const sectionsRegex = new RegExp(
    String.raw`      <${prefix}Hero \{\.\.\.props\} />\r?\n` +
      String.raw`      <${prefix}Imoveis \{\.\.\.props\} />\r?\n` +
      String.raw`      <${prefix}About \{\.\.\.props\} />\r?\n` +
      String.raw`      <${prefix}Depoimentos \{\.\.\.props\} />\r?\n` +
      String.raw`      <${prefix}Contato \{\.\.\.props\} />\r?\n` +
      String.raw`      <${prefix}Footer \{\.\.\.props\} />`,
    "m",
  );

  const replacement =
    `      <SectionsWrapper site={props.site}>\n` +
    `        {{\n` +
    `          hero: <${prefix}Hero {...props} />,\n` +
    `          imoveis: <${prefix}Imoveis {...props} />,\n` +
    `          about: <${prefix}About {...props} />,\n` +
    `          depoimentos: <${prefix}Depoimentos {...props} />,\n` +
    `          contato: <${prefix}Contato {...props} />,\n` +
    `          footer: <${prefix}Footer {...props} />,\n` +
    `        }}\n` +
    `      </SectionsWrapper>`;

  if (!sectionsRegex.test(content)) {
    console.warn(`[skip] pattern nao bateu em ${layoutPath}`);
    skipped++;
    continue;
  }

  content = content.replace(sectionsRegex, replacement);
  fs.writeFileSync(layoutPath, content);
  refactored++;
  console.log(`[ok] ${prefix}Layout atualizado`);
}

console.log(`\nTotal refatorados: ${refactored} | ignorados: ${skipped}`);
