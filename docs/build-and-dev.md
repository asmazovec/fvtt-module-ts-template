# Build & Dev Loop

All scripts are defined in `package.json`. This doc describes intent, not exact command strings — check `package.json` for the current names.

## Scripts (intent)
- **Type-check** — `tsc --noEmit` against `src/`. Run before committing.
- **Dev** — Vite in watch mode, emitting to `dist/`. Foundry loads the same `dist/` via symlink.
- **Build** — production Vite build + manifest copy. Output is what ships.
- **Link** — creates a symlink `<FoundryData>/Data/modules/{{MODULE_ID}} → <repo>/dist`. Path is read from `foundry-config.json` (gitignored) or `$FOUNDRY_DATA_PATH`.
- **Clean** — removes `dist/`.

## Verifying a change in-Foundry
1. Run dev.
2. Start Foundry pointing at the linked module (user does this, unless you have a live-MCP that can restart it).
3. Reload the world (`F5` in the browser) — ESM cache is per-page-load.
4. Check the browser console for module boot logs and deprecation warnings.

## HMR caveats
- Foundry is not an HMR-friendly runtime. Expect a full page reload for most changes.
- Hot-reloading hooks twice causes duplicate registrations. Either key your registrations by a module-scoped flag or restart the page.
- Templates and language files are cached; clear via `F5` plus Foundry's "Return to Setup" when stuck.

## Compendium packs
- Source under `packs/_source/` as YAML/JSON. Build into LevelDB via `@foundryvtt/foundryvtt-cli` (`fvtt package pack`). Output goes into `packs/` and ships in the zip.

## Safety
- The link script must refuse to overwrite an existing non-symlink directory. If it complains, resolve manually — do not `rm -rf` user data.