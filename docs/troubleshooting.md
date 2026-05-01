# Troubleshooting

## Deprecation warnings in console
- v14 logs `foundry.utils.logCompatibilityWarning` for deprecated APIs. Treat each warning as an actionable bug: find the new API via `foundry-api-docs` and migrate.
- `Application` (v1), `FormApplication`, `Dialog` (v1) are legacy. Replace with ApplicationV2 equivalents.

## Module does not load
- Check the browser console for manifest errors. Usually `esmodules[]` points at a file not present in `dist/`.
- Confirm `compatibility.minimum <= current core version <= maximum`.
- Confirm the module directory name matches `id` exactly (case-sensitive on Linux).

## `game.*` is undefined
- You are running too early — probably inside `init`. Move the code into `setup` or `ready`.

## Types say X, runtime says Y
- Runtime wins. `foundry-vtt-types` is unofficial and can lag. File the discrepancy upstream; locally, cast narrowly or extend declarations in `src/types/`.

## HMR duplicated hooks / listeners
- Full page reload (`F5`) fixes it. For durability, guard registrations behind a module-scoped symbol so re-entry is a no-op.

## "Cannot find template"
- Template path must start with `modules/{{MODULE_ID}}/templates/...`. The Handlebars loader resolves relative to Foundry's URL root, not the module root.

## i18n key shows raw
- `i18nInit` has not run, or the key is missing. Use `game.i18n.has(key)` as a defensive check; add the key to `lang/en.json`.

## Pack won't load
- LevelDB packs are directories, not files. `packs/` must contain a subdirectory per pack; the entry in `module.json` must point at that subdirectory.

## CI release published wrong URLs
- The release workflow injects URLs from the tag. If you force-pushed the tag or released from a branch, the URLs may be wrong. Delete the release, fix the tag, re-release. Never hand-edit `module.json` in a published release.