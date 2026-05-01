/**
 * MCP server: Foundry TypeScript type definitions.
 * Scans `node_modules/@league-of-foundry-developers/foundry-vtt-types/**\/*.d.ts`.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema
} from "@modelcontextprotocol/sdk/types.js";
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const ROOT = process.env.TYPES_PACKAGE_ROOT
  ?? "node_modules/@league-of-foundry-developers/foundry-vtt-types";

type Entry = { file: string; line: number; name: string; snippet: string; deprecated: boolean };
let INDEX: Entry[] | null = null;

async function walk(dir: string, out: string[] = []): Promise<string[]> {
  let items;
  try { items = await readdir(dir); } catch { return out; }
  for (const it of items) {
    const full = join(dir, it);
    let s; try { s = await stat(full); } catch { continue; }
    if (s.isDirectory()) await walk(full, out);
    else if (full.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

async function buildIndex(): Promise<Entry[]> {
  const files = await walk(ROOT);
  const re = /^\s*(?:export\s+)?(?:declare\s+)?(?:abstract\s+)?(class|interface|type|function|const|enum|namespace)\s+([A-Za-z_][A-Za-z0-9_]*)/;
  const out: Entry[] = [];
  for (const file of files) {
    let content: string; try { content = await readFile(file, "utf8"); } catch { continue; }
    const lines = content.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const m = re.exec(line);
      if (!m) continue;
      // look at the preceding JSDoc (up to 30 lines) for @deprecated
      let deprecated = false;
      for (let j = i - 1; j >= Math.max(0, i - 30); j--) {
        const l = lines[j]!;
        if (l.includes("@deprecated")) { deprecated = true; break; }
        if (l.trimStart().startsWith("/**")) break;
      }
      out.push({ file, line: i + 1, name: m[2]!, snippet: line.trim(), deprecated });
    }
  }
  return out;
}

async function ensureIndex(): Promise<Entry[]> {
  if (!INDEX) INDEX = await buildIndex();
  return INDEX;
}

const server = new Server(
  { name: "foundry-types", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_type_definition",
      description: "Resolve a TypeScript symbol to its .d.ts declaration site(s).",
      inputSchema: {
        type: "object",
        properties: { symbol: { type: "string" } },
        required: ["symbol"]
      }
    },
    {
      name: "find_deprecated",
      description: "List declarations marked @deprecated in foundry-vtt-types.",
      inputSchema: {
        type: "object",
        properties: { pattern: { type: "string" } }
      }
    },
    {
      name: "resolve_import",
      description: "Suggest the import path for a symbol.",
      inputSchema: {
        type: "object",
        properties: { symbol: { type: "string" } },
        required: ["symbol"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  try {
    const idx = await ensureIndex();
    const args = (req.params.arguments ?? {}) as Record<string, unknown>;

    switch (req.params.name) {
      case "get_type_definition": {
        const name = String(args.symbol ?? "");
        const hits = idx.filter((e) => e.name === name).map((e) => ({
          ...e, file: relative(process.cwd(), e.file)
        }));
        return { content: [{ type: "text", text: JSON.stringify(hits, null, 2) }] };
      }
      case "find_deprecated": {
        const p = (args.pattern ? String(args.pattern) : "").toLowerCase();
        const hits = idx
          .filter((e) => e.deprecated && (!p || e.name.toLowerCase().includes(p)))
          .map((e) => ({ ...e, file: relative(process.cwd(), e.file) }));
        return { content: [{ type: "text", text: JSON.stringify(hits, null, 2) }] };
      }
      case "resolve_import": {
        const name = String(args.symbol ?? "");
        const hits = idx.filter((e) => e.name === name).slice(0, 5).map((e) => ({
          importFrom: "@league-of-foundry-developers/foundry-vtt-types",
          symbol: e.name,
          declaredIn: relative(process.cwd(), e.file)
        }));
        return { content: [{ type: "text", text: JSON.stringify(hits, null, 2) }] };
      }
      default:
        return { content: [{ type: "text", text: `Unknown tool: ${req.params.name}` }], isError: true };
    }
  } catch (err) {
    return { content: [{ type: "text", text: `Error: ${(err as Error).message}` }], isError: true };
  }
});

await server.connect(new StdioServerTransport());