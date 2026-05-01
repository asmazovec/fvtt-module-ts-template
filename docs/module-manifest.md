# module.json (Foundry Manifest)

`module.json` is what Foundry reads. `package.json` is invisible to it.

## Required fields (v14)
- `id` — permanent, lowercase, kebab-case. **Never rename** after first release.
- `title`, `description`, `version`, `authors[]`.
- `compatibility: { minimum, verified, maximum? }` — Foundry generations (e.g. `"14"`). `verified` must be a core version you actually tested against.
- `esmodules[]` — list of ESM entrypoints relative to module root (typically `module.js` built by Vite).
- `styles[]`, `languages[]`, `packs[]` — optional asset declarations.

## URLs (filled by CI, not by hand)
- `url` — repo landing page.
- `manifest` — raw URL to the latest `module.json`.
- `download` — raw URL to the versioned `module.zip`.
See `docs/release-and-ci.md`; the release workflow injects these at tag time.

## Relationships
- `relationships.systems[]` / `relationships.requires[]` / `relationships.recommends[]` — use to declare dependencies with their own `compatibility` block. Prefer this over the legacy `dependencies` field.

## Flags and scopes
- `flags.{id}.*` — namespaced module-private data on documents. Read/write via `doc.getFlag(id, key)` / `doc.setFlag`.
- Never write flags under another module's id.

## Packs (compendiums)
- Point `packs[].path` at a **LevelDB directory** under `packs/` (v11+). Build/pack with Foundry's CLI (`@foundryvtt/foundryvtt-cli`) — see `docs/build-and-dev.md`.

## Validation
- Run the schema check the release workflow uses locally before bumping version.
- The JSON schema lives in the portable Foundry sources under `resources/app/common/packages/` — look it up via `foundry-api-docs`.