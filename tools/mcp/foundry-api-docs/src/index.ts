/**
 * MCP server: Foundry core source lookup.
 * Indexes $FOUNDRY_APP_PATH/resources/app/{client,common}/**\/*.mjs lazily on first tool call.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const APP_PATH = process.env.FOUNDRY_APP_PATH;

type IndexEntry = {
  file: string;
  line: number;
  kind: "class" | "function" | "hook" | "namespace";
  name: string;
  jsdoc?: string;
  snippet?: string;
};

let INDEX: IndexEntry[] | null = null;

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  let items: string[];
  try {
    items = await readdir(dir);
  } catch {
    return out;
  }
  for (const item of items) {
    const full = join(dir, item);
    let s;
    try { s = await stat(full); } catch { continue; }
    if (s.isDirectory()) await walk(full, out);
    else if (full.endsWith(".mjs") || full.endsWith(".js")) out.push(full);
  }
  return out;
}

function extractJsDocAbove(lines: string[], lineIdx: number): string | undefined {
  let end = lineIdx - 1;
  while (end >= 0 && lines[end]?.trim() === "") end--;
  if (end < 0 || !lines[end]?.trimEnd().endsWith("*/")) return undefined;
  let start = end;
  while (start >= 0 && !lines[start]?.trimStart().startsWith("/**")) start--;
  if (start < 0) return undefined;
  return lines.slice(start, end + 1).join("\n");
}

async function buildIndex(): Promise<IndexEntry[]> {
  if (!APP_PATH) {
    throw new Error(
      "FOUNDRY_APP_PATH is not set. Point it at the `resources/app` directory of a portable Foundry install."
    );
  }
  const roots = [join(APP_PATH, "client"), join(APP_PATH, "common")];
  const files: string[] = [];
  for (const r of roots) await walk(r, files);

  const entries: IndexEntry[] = [];
  const classRe = /^\s*(?:export\s+)?(?:default\s+)?class\s+([A-Z][A-Za-z0-9_]*)/;
  const fnRe = /^\s*(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z_][A-Za-z0-9_]*)/;
  const hookRe = /Hooks\.(?:call|callAll)\(\s*["'`]([^"'`]+)["'`]/g;
  const nsRe = /^\s*(?:globalThis\.)?foundry\.([a-zA-Z0-9_.]+)\s*=/;

  for (const file of files) {
    let content: string;
    try { content = await readFile(file, "utf8"); } catch { continue; }
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      let m;
      if ((m = classRe.exec(line))) {
        entries.push({
          file, line: i + 1, kind: "class", name: m[1]!,
          jsdoc: extractJsDocAbove(lines, i),
          snippet: line.trim()
        });
      } else if ((m = fnRe.exec(line))) {
        entries.push({
          file, line: i + 1, kind: "function", name: m[1]!,
          jsdoc: extractJsDocAbove(lines, i),
          snippet: line.trim()
        });
      } else if ((m = nsRe.exec(line))) {
        entries.push({
          file, line: i + 1, kind: "namespace", name: `foundry.${m[1]}`,
          snippet: line.trim()
        });
      }
    }

    for (const m of content.matchAll(hookRe)) {
      const idx = m.index ?? 0;
      const lineNo = content.slice(0, idx).split("\n").length;
      entries.push({
        file, line: lineNo, kind: "hook", name: m[1]!,
        snippet: lines[lineNo - 1]?.trim()
      });
    }
  }
  return entries;
}

async function ensureIndex(): Promise<IndexEntry[]> {
  if (!INDEX) INDEX = await buildIndex();
  return INDEX;
}

function rel(p: string): string {
  return APP_PATH ? relative(APP_PATH, p) : p;
}

// -------- MCP wiring --------

const server = new Server(
  { name: "foundry-api-docs", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "search_api",
      description: "Fuzzy-search class/function/namespace/hook names in Foundry core sources.",
      inputSchema: {
        type: "object",
        properties: {
          query: { type: "string" },
          kind: { type: "string", enum: ["class", "function", "hook", "namespace"] },
          limit: { type: "number", default: 20 }
        },
        required: ["query"]
      }
    },
    {
      name: "get_class",
      description: "Return file path, JSDoc and snippet for a class declaration.",
      inputSchema: {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"]
      }
    },
    {
      name: "get_hook",
      description: "Return every callsite of a named Foundry hook.",
      inputSchema: {
        type: "object",
        properties: { name: { type: "string" } },
        required: ["name"]
      }
    },
    {
      name: "list_namespace",
      description: "List entries whose name starts with a `foundry.*` namespace prefix.",
      inputSchema: {
        type: "object",
        properties: { ns: { type: "string" } },
        required: ["ns"]
      }
    },
    {
      name: "list_hooks",
      description: "Enumerate all Foundry hook callsites, optionally filtered by substring.",
      inputSchema: {
        type: "object",
        properties: { filter: { type: "string" } }
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  try {
    const idx = await ensureIndex();
    const args = (req.params.arguments ?? {}) as Record<string, unknown>;

    switch (req.params.name) {
      case "search_api": {
        const q = String(args.query ?? "").toLowerCase();
        const kind = args.kind as IndexEntry["kind"] | undefined;
        const limit = Number(args.limit ?? 20);
        const hits = idx
          .filter((e) => (!kind || e.kind === kind) && e.name.toLowerCase().includes(q))
          .slice(0, limit)
          .map((e) => ({ ...e, file: rel(e.file) }));
        return { content: [{ type: "text", text: JSON.stringify(hits, null, 2) }] };
      }
      case "get_class": {
        const name = String(args.name ?? "");
        const hits = idx
          .filter((e) => e.kind === "class" && e.name === name)
          .map((e) => ({ ...e, file: rel(e.file) }));
        return { content: [{ type: "text", text: JSON.stringify(hits, null, 2) }] };
      }
      case "get_hook": {
        const name = String(args.name ?? "");
        const hits = idx
          .filter((e) => e.kind === "hook" && e.name === name)
          .map((e) => ({ ...e, file: rel(e.file) }));
        return { content: [{ type: "text", text: JSON.stringify(hits, null, 2) }] };
      }
      case "list_namespace": {
        const ns = String(args.ns ?? "");
        const hits = idx
          .filter((e) => e.kind === "namespace" && e.name.startsWith(ns))
          .map((e) => ({ ...e, file: rel(e.file) }));
        return { content: [{ type: "text", text: JSON.stringify(hits, null, 2) }] };
      }
      case "list_hooks": {
        const f = (args.filter ? String(args.filter) : "").toLowerCase();
        const seen = new Set<string>();
        const hits = idx
          .filter((e) => e.kind === "hook" && (!f || e.name.toLowerCase().includes(f)))
          .filter((e) => { if (seen.has(e.name)) return false; seen.add(e.name); return true; })
          .map((e) => ({ name: e.name, file: rel(e.file), line: e.line }));
        return { content: [{ type: "text", text: JSON.stringify(hits, null, 2) }] };
      }
      default:
        return { content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }], isError: true };
    }
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);