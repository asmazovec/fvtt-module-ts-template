# Localization

## File layout
- `lang/en.json` — canonical, always complete. Every key this module emits must exist here.
- `lang/{locale}.json` — translations; missing keys fall back to English.
- Declare each file in `module.json` under `languages[]` with `lang`, `name`, `path`.

## Key conventions
- Namespace everything under `{{MODULE_ID}}.` to avoid collisions with core / system / other modules.
- Group hierarchically (`{{MODULE_ID}}.settings.enableX.name`, `{{MODULE_ID}}.settings.enableX.hint`).
- Keep keys stable — they are your public API for translators.

## Runtime usage
- `game.i18n.localize(key)` — simple lookup.
- `game.i18n.format(key, data)` — interpolation (`{value}` placeholders).
- `game.i18n.has(key)` — use when a key is optional.
- In Handlebars: `{{localize "key"}}` / `{{{localize "key" arg=...}}}`. The templating layer is evaluated at render time — `i18nInit` must have run.

## When adding a new language
1. Copy `en.json` → `{locale}.json`. Keep the same key set.
2. Add a `languages[]` entry in `module.json`.
3. Commit both — CI verifies key parity.

## Reusing core strings
Foundry ships a large set of reusable keys under `resources/app/public/lang/en.yml` (e.g. `Save`, `Cancel`, `FILES.*`). Prefer those over re-inventing; look them up via `foundry-api-docs`.