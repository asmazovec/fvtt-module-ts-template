#!/usr/bin/env node
/**
 * Injects version + URLs into dist/module.json for a release.
 * Reads env: MODULE_VERSION, GITHUB_REPOSITORY (owner/name).
 */
import { readFile, writeFile } from "node:fs/promises";

const version = process.env.MODULE_VERSION;
const repo = process.env.GITHUB_REPOSITORY;
if (!version) throw new Error("MODULE_VERSION env var required");
if (!repo) throw new Error("GITHUB_REPOSITORY env var required");

const raw = await readFile("dist/module.json", "utf8");
const m = JSON.parse(raw);

m.version = version;
m.url = `https://github.com/${repo}`;
m.manifest = `https://github.com/${repo}/releases/latest/download/module.json`;
m.download = `https://github.com/${repo}/releases/download/v${version}/module.zip`;
m.readme = `https://github.com/${repo}/blob/main/README.md`;
m.changelog = `https://github.com/${repo}/blob/main/CHANGELOG.md`;
m.bugs = `https://github.com/${repo}/issues`;

await writeFile("dist/module.json", JSON.stringify(m, null, 2) + "\n");
console.log(`module.json prepared for v${version} @ ${repo}`);
