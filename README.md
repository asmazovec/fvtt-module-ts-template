# {{MODULE_TITLE}}

{{MODULE_DESCRIPTION}}

![Foundry v14](https://img.shields.io/badge/Foundry-v14-informational)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![Vite](https://img.shields.io/badge/Vite-8-646CFF)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Using this template

1. On GitHub, click **Use this template** → **Create a new repository**.
2. Clone it locally:
   ```bash
   git clone https://github.com/{{GITHUB_OWNER}}/{{MODULE_ID}}.git
   cd {{MODULE_ID}}
   ```
3. Install dependencies and run the initializer — it replaces all `{{MODULE_ID}}`, `{{MODULE_TITLE}}`, `{{AUTHOR_NAME}}` placeholders across the repo:
   ```bash
   npm install
   npm run init:template
   ```
4. Build the project-local MCP servers once:
   ```bash
   npm run mcp:build
   ```
5. Configure paths to your Foundry install (see **Environment** below).
6. Link and start dev:
   ```bash
   npm run link:foundry
   npm run dev
   ```
7. Launch Foundry, enable the module in a world, reload the page.

---

## Environment

Two paths matter. Configure them once per development machine.

### `FOUNDRY_APP_PATH` (required for MCP `foundry-api-docs`)

Absolute path to the portable Foundry `resources/app` directory. The MCP server at `tools/mcp/foundry-api-docs/` indexes its JavaScript sources so Claude can resolve Foundry API symbols precisely. Without it, API-lookup tools return an error.

```bash
# Linux / macOS
export FOUNDRY_APP_PATH="/path/to/FoundryVTT/resources/app"

# Windows (PowerShell)
$env:FOUNDRY_APP_PATH = "C:\FoundryVTT\resources\app"
```

Add this to your shell profile (`~/.zshrc`, `~/.bashrc`, PowerShell `$PROFILE`) or to a local `.env` that your shell auto-loads. The path is **read-only** — nothing is ever written to it.

> **Tip:** keep a portable Foundry build next to your project repos (e.g. `~/dev/foundry-portable/`) so `FOUNDRY_APP_PATH` is stable across machines.

### `foundry-config.json` (for `npm run link:foundry`)

Tells the link script where Foundry's **user Data** directory lives — this is where `modules/` is symlinked into.

```bash
cp foundry-config.example.json foundry-config.json
# then edit "dataPath" to your Foundry Data directory
```

`foundry-config.json` is gitignored. Alternatively, set `FOUNDRY_DATA_PATH` in your environment and skip the file entirely.

Typical locations for Foundry Data:
- **Linux:** `~/.local/share/FoundryVTT/Data`
- **macOS:** `~/Library/Application Support/FoundryVTT/Data`
- **Windows:** `%LOCALAPPDATA%\FoundryVTT\Data`

---

## Project layout

```
src/            TypeScript sources (entry: module.ts)
  apps/         ApplicationV2 windows & sheets
  models/       DataModel subclasses
  scripts/      Hook wiring and module logic
  tests/        Vitest unit tests
  types/        Local type augmentations
styles/         SCSS sources
templates/      Handlebars templates
lang/           i18n JSON (en.json is canonical)
tools/mcp/      Project-local MCP servers
scripts/        Repo tooling (init, link, release helpers)
docs/           Task-specific guides for Claude (read on demand)
.github/        CI & release workflows
module.json     Foundry manifest (source of truth for Foundry)
.mcp.json       MCP server registration for Claude Code
```

A deeper codebase map lives in [`CLAUDE.md`](./CLAUDE.md).

---

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite watch build into `dist/`. |
| `npm run build` | Production build. |
| `npm run clean` | Remove `dist/`. |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm test` | Vitest unit tests. |
| `npm run test:watch` | Vitest in watch mode. |
| `npm run link:foundry` | Symlink `dist/` into Foundry's `modules/` directory. |
| `npm run mcp:build` | Compile project-local MCP servers in `tools/mcp/`. |
| `npm run mcp:watch` | Watch-compile MCP servers during development. |
| `npm run init:template` | Replace `{{MODULE_ID}}` placeholders after cloning. |
| `npm run prepare:manifest` | Fill `dist/module.json` URLs at release time (CI). |

---

## Development loop

1. `npm run dev` — Vite rebuilds `dist/` on every change.
2. The symlink from step 5 of **Using this template** exposes `dist/` to Foundry as `modules/{{MODULE_ID}}`.
3. Reload Foundry (`F5`) after changes. Foundry is not HMR-friendly — expect a full page reload for most edits.
4. Check the browser DevTools console for module boot logs and deprecation warnings.

**Heads-up:**
- ESM modules are cached per page load. A manual `F5` is always the safest refresh.
- Duplicate hook registrations can appear if you re-enter `init` without a full reload. Guard registrations by module-scoped flags if this bites you.
- See [`docs/build-and-dev.md`](./docs/build-and-dev.md) and [`docs/troubleshooting.md`](./docs/troubleshooting.md) for more.

---

## MCP servers

Claude Code auto-loads `.mcp.json` at the repo root and launches five servers:

| Server | Role |
|---|---|
| `foundry-api-docs` | Indexes `$FOUNDRY_APP_PATH` for Foundry core API lookups (classes, hooks, namespaces). |
| `foundry-types` | Indexes `@league-of-foundry-developers/foundry-vtt-types` `.d.ts` files. |
| `filesystem` | Scoped repo filesystem access. |
| `web-search` | Tavily-based web search. Requires `TAVILY_API_KEY`. |
| `typescript-lsp` | Hover / go-to-definition / diagnostics across the codebase. |

Optional: a live Foundry bridge (`foundry-live`) — see [`tools/mcp/foundry-live/README.md`](./tools/mcp/foundry-live/README.md) and [`docs/mcp-servers.md`](./docs/mcp-servers.md).

Before the MCP servers work, run `npm run mcp:build` once and ensure `FOUNDRY_APP_PATH` is set in the environment that launches Claude Code.

---

## Testing

- **Type-check first:** `npm run typecheck` — fastest signal, catches most API misuse because `foundry-vtt-types` is strict.
- **Unit tests:** `npm test` runs Vitest over pure logic (models, utilities, migrations). Foundry globals are stubbed minimally in `src/tests/setup.ts`.
- **In-Foundry tests (optional):** install the [Quench](https://foundryvtt.com/packages/quench) module and register suites under `src/tests/quench/` — see [`docs/testing.md`](./docs/testing.md).

---

## Releasing

1. Update `CHANGELOG.md` with a new version section.
2. Tag and push:
   ```bash
   git tag v1.2.3
   git push --tags
   ```
3. GitHub Actions (`.github/workflows/release.yml`) will:
   - Build the project.
   - Inject `version`, `url`, `manifest`, and `download` into `dist/module.json`.
   - Zip `dist/` into `module.zip`.
   - Create a GitHub Release with both `module.json` and `module.zip` attached.
4. **First release only:** submit the module on [foundryvtt.com](https://foundryvtt.com/admin/packages/package/) using the `manifest` URL:
   ```
   https://github.com/{{GITHUB_OWNER}}/{{MODULE_ID}}/releases/latest/download/module.json
   ```
   Subsequent versions are picked up automatically by Foundry's "Check for Updates".

Full details in [`docs/release-and-ci.md`](./docs/release-and-ci.md).

> **Never re-use a tag.** Foundry caches `module.json` by download URL; re-tagging breaks clients mid-update.

---

## Working with Claude

This repository is optimized for AI-assisted development with [Claude Code](https://claude.ai/claude-code):

1. Open the repo in Claude Code — it loads [`CLAUDE.md`](./CLAUDE.md) and registers MCP servers from `.mcp.json`.
2. Claude scans the task-specific guides in `docs/`, proposes which are relevant, and asks for your approval before reading them.
3. For any Foundry API question, Claude consults the `foundry-api-docs` MCP (backed by your local `$FOUNDRY_APP_PATH`) instead of guessing — so suggestions match the Foundry version you actually run.

If you use a different AI tooling, the files in `docs/` are plain Markdown and work fine as a human reference too.

---

## License

[MIT](./LICENSE) © {{AUTHOR_NAME}}

---

## Acknowledgements

- [League of Extraordinary FoundryVTT Developers](https://github.com/League-of-Foundry-Developers) for the TypeScript type definitions.
- [DFreds/dfreds-module-template-ts](https://github.com/DFreds/dfreds-module-template-ts) and [theripper93](https://github.com/theripper93) for inspiration on module structure.
- The FoundryVTT team for the platform and extensive core API documentation.
