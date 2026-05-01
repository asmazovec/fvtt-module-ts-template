## Why
A FoundryVTT v14 module written in TypeScript. Project-specific purpose, scope and user-facing behaviour live in `README.md` and `module.json` (`title`, `description`, `url`). Read those first for product context.

## What
- **Runtime:** FoundryVTT v14 (latest). The build is loaded into Foundry's browser context alongside core globals (`game`, `CONFIG`, `Hooks`, `foundry.*`, `ui`).
- **Language:** TypeScript 5.9, strict. Ambient types come from `@league-of-foundry-developers/foundry-vtt-types` (pinned to `#main`). Types are unofficial — trust the live sources over them when they disagree.
- **Bundler:** Vite 8. Entry: `src/module.ts`. Output: `dist/` — this is what Foundry actually loads.
- **Manifest:** `module.json` is the source of truth for Foundry (id, compatibility, entry files). `package.json` is only for the Node toolchain.
- **Tests:** Vitest for pure logic; Quench is an optional in-Foundry harness.

### Codebase map
```
src/            TS sources (entry: module.ts)
  apps/         ApplicationV2 windows & sheets
  models/       DataModel subclasses
  settings/     Settings & keybindings registration
  scripts/      Hook wiring and module logic
styles/         SCSS
templates/      Handlebars templates
lang/           i18n JSON (en.json is canonical)
tools/mcp/      Project-local MCP servers
scripts/        Repo tooling (init, link-to-foundry, release helpers)
.github/        CI & release workflows
module.json     Foundry manifest
.mcp.json       MCP server registration for Claude Code
```

## How
- **Foundry core sources** (read-only reference for the real API) are expected at `$FOUNDRY_APP_PATH` (see `README.md`). Prefer the `foundry-api-docs` MCP tool over manual grep.
- **Before editing**, re-read `module.json` and `src/module.ts` to ground yourself.
- **Never invent** Foundry API signatures — look them up in the portable sources, the types package, or via MCP.
- **Do not touch** `dist/`, `node_modules/`, or lockfiles unless the task explicitly requires it.
- Verification commands (type-check, tests, build, link) live in `docs/build-and-dev.md` and `docs/testing.md` — read on demand.

## Task-specific guides — read on demand
Decide which of the following are relevant. **List the files you intend to read and wait for user approval before opening them.** Skip this step if none apply.

- `docs/foundry-api-lookup.md` — resolving Foundry API symbols via MCP and portable sources.
- `docs/module-manifest.md` — `module.json` fields, v14 compatibility, relationships, flags.
- `docs/hooks-and-lifecycle.md` — `init`/`i18nInit`/`setup`/`ready` ordering and hook registration.
- `docs/document-sheets-appv2.md` — ApplicationV2, HandlebarsApplicationMixin, DocumentSheetV2.
- `docs/data-models.md` — DataModel / TypeDataModel subclasses and document subtypes.
- `docs/settings-and-keybinds.md` — registering settings, menus and keybindings.
- `docs/localization.md` — i18n keys, language files, fallbacks.
- `docs/build-and-dev.md` — Vite dev/build, HMR in Foundry, linking `dist/` to Data.
- `docs/testing.md` — Vitest, type-check, optional Quench.
- `docs/release-and-ci.md` — tagging and the GitHub Actions release pipeline.
- `docs/mcp-servers.md` — inventory of MCP servers wired into this repo.
- `docs/ui-frameworks.md` — adding Svelte/Vue/React if a task needs it.
- `docs/troubleshooting.md` — v13 → v14 migration pitfalls and Foundry deprecations.

## Golden rules
- Prefer v14 APIs (ApplicationV2, DataModel, `foundry.*` namespaces). Treat v13 patterns as legacy unless the task is migration.
- The manifest is load-bearing: changes to `id`, `compatibility`, or `esmodules` must be intentional and called out.