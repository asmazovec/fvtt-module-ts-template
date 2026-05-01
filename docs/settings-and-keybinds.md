# Settings & Keybindings

## Settings
- Registered during `init` via `game.settings.register({{MODULE_ID}}, key, config)`.
- `scope: "world"` (GM-controlled, shared) vs `"client"` (per-user).
- `config: true` surfaces the setting in the Settings UI; `false` for internal state.
- Use `onChange` sparingly — prefer re-reading on demand. If you must react, make the handler idempotent.
- For grouped dialogs, register a menu via `game.settings.registerMenu` pointing at an ApplicationV2 class.

## Typed settings
- Pass a DataModel class as `type` to get schema-validated structured settings (v12+). Prefer this over free-form objects.
- For primitives (`Boolean`, `Number`, `String`), use the JS constructor as `type`.

## Access patterns
- `game.settings.get({{MODULE_ID}}, key)` — reads cached value; cheap.
- `game.settings.set(...)` — async; await it if subsequent logic depends on persistence.

## Keybindings
- `game.keybindings.register({{MODULE_ID}}, action, config)` during `init`.
- `editable` provides default bindings; users can override via Configure Controls.
- `restricted: true` limits to GMs.
- `onDown`/`onUp` return `true` to consume the event.

## Lookup
Exact field shapes (icons, range for numeric, filePicker for paths, etc.) are in the portable sources under `common/packages/` and `client/core/settings.mjs` — resolve via `foundry-api-docs`.