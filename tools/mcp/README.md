# Project-local MCP servers

Three servers ship with this template. Build them once with `npm run mcp:build`, then Claude Code picks them up via `.mcp.json` at the repo root.

## foundry-api-docs
Indexes the portable Foundry sources at `$FOUNDRY_APP_PATH/resources/app/{client,common}/**/*.mjs`. Exposes:
- `search_api(query, limit?)` — fuzzy search across class/function/hook names.
- `get_class(name)` — file path, JSDoc, and method list.
- `get_hook(name)` — declaration + all callsites.
- `list_namespace(ns)` — symbols under a `foundry.*` namespace.
- `list_hooks(filter?)` — enumerate every `Hooks.call(All)` callsite.

Requires `FOUNDRY_APP_PATH` in the environment. Without it the server starts but every tool returns an error telling the user to set the variable.

## foundry-types
Indexes the installed `foundry-vtt-types` package. Exposes:
- `get_type_definition(symbol)` — resolve a TS symbol to its `.d.ts` source.
- `find_deprecated(pattern?)` — list `@deprecated` declarations.
- `resolve_import(symbol)` — suggest the `import` path.

## foundry-live
Not a local server. Use one of the community bridges (e.g. [`foundry-api-bridge`](https://foundryvtt.com/packages/foundry-api-bridge) / [`adambdooley/foundry-vtt-mcp`](https://github.com/adambdooley/foundry-vtt-mcp)) by installing the companion Foundry module and adding the server entry to `.mcp.json` yourself. See `foundry-live/README.md`.