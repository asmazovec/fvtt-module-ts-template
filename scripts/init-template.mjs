#!/usr/bin/env node
/**
 * Interactive template initializer. Replaces {{MODULE_ID}}, {{MODULE_TITLE}},
 * {{MODULE_DESCRIPTION}}, {{AUTHOR_NAME}}, {{AUTHOR_URL}}, {{GITHUB_OWNER}}
 * across the repo after cloning the GitHub template.
 */
import { readdir, readFile, writeFile, stat, rename } from "node:fs/promises";
import { join, extname } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";

const ROOT = process.cwd();
const IGNORED_DIRS = new Set([
  "node_modules", "dist", ".git", "coverage", ".github/template-cleanup.yml"
]);
const TEXT_EXT = new Set([
  ".ts", ".js", ".mjs", ".cjs", ".json", ".md", ".scss", ".css",
  ".hbs", ".html", ".yml", ".yaml", ".txt", ".editorconfig", ""
]);

async function walk(dir, out = []) {
  for (const entry of await readdir(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const s = await stat(full);
    if (s.isDirectory()) await walk(full, out);
    else out.push(full);
  }
  return out;
}

function isTextFile(path) {
  const ext = extname(path).toLowerCase();
  return TEXT_EXT.has(ext) || path.endsWith(".gitignore") || path.endsWith(".nvmrc");
}

async function prompt(rl, q, fallback) {
  const ans = (await rl.question(`${q}${fallback ? ` [${fallback}]` : ""}: `)).trim();
  return ans || fallback || "";
}

function validateId(id) {
  if (!/^[a-z][a-z0-9-]*$/.test(id)) {
    throw new Error("Module id must be lowercase kebab-case, starting with a letter.");
  }
}

async function main() {
  const rl = createInterface({ input: stdin, output: stdout });
  try {
    console.log("FoundryVTT module template initializer\n");
    const id = await prompt(rl, "Module id (kebab-case)", "my-foundry-module");
    validateId(id);
    const title = await prompt(rl, "Module title", "My Foundry Module");
    const desc = await prompt(rl, "Short description", "A FoundryVTT v14 module.");
    const author = await prompt(rl, "Author name", "Your Name");
    const authorUrl = await prompt(rl, "Author URL", "");
    const owner = await prompt(rl, "GitHub owner (user or org)", author.toLowerCase().replace(/\s+/g, "-"));

    const replacements = new Map([
      ["{{MODULE_ID}}", id],
      ["{{MODULE_TITLE}}", title],
      ["{{MODULE_DESCRIPTION}}", desc],
      ["{{AUTHOR_NAME}}", author],
      ["{{AUTHOR_URL}}", authorUrl],
      ["{{GITHUB_OWNER}}", owner]
    ]);

    const files = await walk(ROOT);
    let changed = 0;
    for (const file of files) {
      if (!isTextFile(file)) continue;
      const original = await readFile(file, "utf8");
      let next = original;
      for (const [from, to] of replacements) next = next.split(from).join(to);
      if (next !== original) { await writeFile(file, next); changed++; }
    }
    console.log(`\nReplaced placeholders in ${changed} files.`);
    console.log("Next steps:");
    console.log("  1. npm install");
    console.log("  2. npm run mcp:build");
    console.log("  3. cp foundry-config.example.json foundry-config.json && edit paths");
    console.log("  4. npm run link:foundry");
    console.log("  5. npm run dev");
  } finally {
    rl.close();
  }
}

main().catch((e) => { console.error(e.message); process.exit(1); });
