# ApplicationV2 & Document Sheets

v14 is ApplicationV2-first. Use v1 (`Application`, `FormApplication`) only when migrating legacy code.

## Building blocks
- `foundry.applications.api.ApplicationV2` — base class.
- `foundry.applications.api.HandlebarsApplicationMixin` — mixes Handlebars template rendering + Parts system.
- `foundry.applications.sheets.DocumentSheetV2` / `ActorSheetV2` / `ItemSheetV2` — document-bound sheets with built-in form handling.

Resolve exact import paths via `foundry-api-docs` — the `foundry.applications.*` tree is the canonical location in v14.

## Concepts to know before coding
- **Parts** — a sheet is composed of named parts, each backed by a template. The mixin renders and patches them independently.
- **Actions** — declarative handlers declared in `static DEFAULT_OPTIONS.actions`, bound to elements via `data-action="..."` in templates. Prefer actions over ad-hoc event listeners.
- **Tabs** — declared via `static TABS` on the class; the mixin wires ARIA and state.
- **Form handling** — `DocumentSheetV2` submits via `static DEFAULT_OPTIONS.form.handler`; return processed submit data, not DOM.
- **Context preparation** — override `_prepareContext` (async). For per-part data, override `_preparePartContext`.

## Registering a sheet
Use `foundry.documents.collections.DocumentSheetConfig.registerSheet` (or the current equivalent — verify the path via MCP) inside `init`. Always pass your `module.id` as the scope so users can opt in per document type.

## Gotchas
- Do not mutate `options` after construction — copy into instance state.
- Re-rendering is diffed; avoid destroying DOM you want to keep (e.g. focus). Use `_onRender` for post-render DOM work.
- Keep templates in `templates/` and reference them via `systems/{{MODULE_ID}}/templates/...` or `modules/{{MODULE_ID}}/...` — Foundry resolves these URLs.