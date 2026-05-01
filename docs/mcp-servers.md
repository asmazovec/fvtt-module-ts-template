# MCP Servers

All MCP servers used by this repo are declared in `.mcp.json` at the repo root. Claude Code auto-loads them when the workspace opens. Inspect `.mcp.json` to see the current list; the entries below describe intent.

## Project-local (shipped in `tools/mcp/`)
- **`foundry-api-docs`** — indexes `$FOUNDRY_APP_PATH/resources/app/{client,common}/**/*.mjs` plus JSDoc. Tools: `searchApi`, `getClass`, `getHook`, `listNamespace`, `listHooks`. **Primary source of truth** for Foundry API questions.
- **`foundry-types`** — indexes the installed `@league-of-foundry-developers/foundry-vtt-types` package. Tools: `getTypeDefinition`, `findDeprecated`, `resolveImport`. Use when you need the *declared* signature rather than the *runtime* behaviour.
- **`foundry-live` (optional)** — WebSocket bridge to a running Foundry instance. Lets you read/write documents, run Quench suites, reload the world. Off by default; enable only with user consent because it mutates live data.

## Third-party (must-haves)
- **Web search** (e.g. Tavily/Brave MCP) — for Foundry blog posts, release notes, community docs. Use when portable sources are silent.
- **Filesystem MCP** — scoped to the repo root. Lets Claude explore without shell access.
- **TypeScript LSP MCP** — hover/go-to-definition/diagnostics across the codebase. Faster and more precise than grep for TS navigation.

## Choosing a tool
- Foundry API question → `foundry-api-docs` → `foundry-types` → web search.
- This repo's own code → LSP → filesystem.
- Live game state / smoke test → `foundry-live` (ask user first).

## Disabling a server
Comment it out in `.mcp.json` and restart Claude Code. Some servers (notably `foundry-live`) should stay disabled unless actively needed.