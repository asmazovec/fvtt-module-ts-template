#!/usr/bin/env node
/**
 * Symlinks <repo>/dist into <FoundryData>/Data/modules/<MODULE_ID>.
 * Reads paths from foundry-config.json or $FOUNDRY_DATA_PATH.
 * Never overwrites a non-symlink directory.
 */
import { readFile, symlink, lstat, rm, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, resolve } from "node:path";

async function loadConfig() {
  const envPath = process.env.FOUNDRY_DATA_PATH;
  if (envPath) return { dataPath: envPath };
  try {
    const raw = await readFile("foundry-config.json", "utf8");
    return JSON.parse(raw);
  } catch {
    throw new Error(
      "Provide foundry-config.json (copy from foundry-config.example.json) or set FOUNDRY_DATA_PATH."
    );
  }
}

async function readModuleId() {
  const raw = await readFile("module.json", "utf8");
  const { id } = JSON.parse(raw);
  if (!id || id.includes("{{")) throw new Error("module.json id is not set. Run `npm run init:template` first.");
  return id;
}

async function main() {
  const { dataPath } = await loadConfig();
  if (!dataPath) throw new Error("dataPath missing from foundry-config.json");
  const id = await readModuleId();
  const src = resolve("dist");
  if (!existsSync(src)) await mkdir(src, { recursive: true });
  const dest = join(dataPath, "modules", id);

  if (existsSync(dest)) {
    const s = await lstat(dest);
    if (!s.isSymbolicLink()) {
      throw new Error(`Refusing to overwrite non-symlink at ${dest}. Remove it manually if intended.`);
    }
    await rm(dest);
  }
  await symlink(src, dest, "junction");
  console.log(`Linked ${dest} -> ${src}`);
}

main().catch((e) => { console.error(e.message); process.exit(1); });
