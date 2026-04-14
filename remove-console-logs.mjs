#!/usr/bin/env node
// Robust console.log/warn remover for Deno edge functions.
// Handles multi-line calls, template literals with ${...}, nested parens.
// Keeps console.error.

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const FUNCTIONS_DIR = "supabase/functions";

function findEdgeFunctions(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    const entry = join(full, "index.ts");
    try {
      statSync(entry);
      out.push(entry);
    } catch {}
  }
  return out;
}

/** Remove all `console.log(...)` and `console.warn(...)` calls from src. */
function stripConsole(src) {
  let out = "";
  let i = 0;
  let removed = 0;
  const re = /console\.(log|warn)\s*\(/g;

  while (i < src.length) {
    re.lastIndex = i;
    const m = re.exec(src);
    if (!m) {
      out += src.slice(i);
      break;
    }
    const start = m.index;
    out += src.slice(i, start);

    // Scan for matching close paren starting after the opening paren
    let pos = start + m[0].length;
    let depth = 1;
    let inString = null; // '"' | "'" | '`'
    let escape = false;

    while (pos < src.length && depth > 0) {
      const ch = src[pos];
      if (escape) {
        escape = false;
        pos++;
        continue;
      }
      if (inString) {
        if (ch === "\\") {
          escape = true;
        } else if (ch === inString) {
          inString = null;
        } else if (inString === "`" && ch === "$" && src[pos + 1] === "{") {
          // Template literal interpolation — scan to matching }
          pos += 2;
          let tDepth = 1;
          let tString = null;
          let tEsc = false;
          while (pos < src.length && tDepth > 0) {
            const tc = src[pos];
            if (tEsc) {
              tEsc = false;
            } else if (tString) {
              if (tc === "\\") tEsc = true;
              else if (tc === tString) tString = null;
            } else {
              if (tc === '"' || tc === "'" || tc === "`") tString = tc;
              else if (tc === "{") tDepth++;
              else if (tc === "}") tDepth--;
            }
            pos++;
          }
          continue;
        }
      } else {
        if (ch === "/" && src[pos + 1] === "/") {
          // Line comment — skip to newline
          while (pos < src.length && src[pos] !== "\n") pos++;
          continue;
        }
        if (ch === "/" && src[pos + 1] === "*") {
          pos += 2;
          while (pos < src.length - 1 && !(src[pos] === "*" && src[pos + 1] === "/")) pos++;
          pos += 2;
          continue;
        }
        if (ch === '"' || ch === "'" || ch === "`") {
          inString = ch;
        } else if (ch === "(") {
          depth++;
        } else if (ch === ")") {
          depth--;
        }
      }
      pos++;
    }

    // pos is now just past the matching close paren
    // Eat trailing semicolon
    if (src[pos] === ";") pos++;

    // If call is alone on its line, eat the leading whitespace + trailing newline
    let lineStart = start;
    while (lineStart > 0 && src[lineStart - 1] !== "\n") lineStart--;
    const prefix = src.slice(lineStart, start);
    if (/^\s*$/.test(prefix)) {
      out = out.slice(0, out.length - prefix.length);
      if (src[pos] === "\r") pos++;
      if (src[pos] === "\n") pos++;
    }

    i = pos;
    removed++;
  }

  return { out, removed };
}

const files = findEdgeFunctions(FUNCTIONS_DIR);
let totalFiles = 0;
let totalRemoved = 0;

for (const file of files) {
  const src = readFileSync(file, "utf8");
  const { out, removed } = stripConsole(src);
  if (removed > 0 && out !== src) {
    writeFileSync(file, out);
    const name = file.split(/[\\/]/).slice(-2, -1)[0];
    console.log(`  ${name}: removed ${removed} calls`);
    totalFiles++;
    totalRemoved += removed;
  }
}

console.log(`\nTotal: ${totalFiles} files, ${totalRemoved} calls removed`);
