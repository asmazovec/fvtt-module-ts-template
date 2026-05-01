# Foundry API Lookup

**Goal:** never invent an API. Always resolve a symbol against a real source.

## Source priority
1. **`foundry-api-docs` MCP server** — primary. Exposes tools like `searchApi`, `getClass`, `getHook`, `listNamespace`. Index is built from `$FOUNDRY_APP_PATH/resources/app`.
2. **Portable Foundry sources** at `$FOUNDRY_APP_PATH`:
   - `resources/app/client/**` — client-side API (UI, canvas, apps, documents).
   - `resources/app/common/**` — shared code (DataModel, utils, schema fields).
   - `resources/app/public/lang/en.yml` — canonical i18n keys reused by modules.
   - JSDoc comments above each class/function are the authoritative spec.
3. **Type definitions** under `node_modules/@league-of-foundry-developers/foundry-vtt-types/` — use via `foundry-types` MCP. They lag behind core; mismatch means core wins.
4. **Official docs** (`foundryvtt.com/api/`, `foundryvtt.wiki`) — consult via the web-search MCP when a concept is unclear.

## Common lookup recipes
- **Hook name & payload:** `getHook(name)` → returns declaration site + callsite(s).
- **Class surface:** `getClass("Actor")` → methods, statics, parent chain.
- **Namespace listing:** `listNamespace("foundry.applications.api")` → all exported symbols.
- **Deprecation check:** `findDeprecated()` on the types server flags anything marked `@deprecated` for the current core version.

## When `$FOUNDRY_APP_PATH` is missing
- Do not guess. Ask the user to set it, or fall back to the types package and mark any assumptions explicitly in your plan.
- Never copy Foundry source code into this repo — it is proprietary.

## When sources contradict
Order of trust (high → low): live core JS → JSDoc in core → community types → older tutorials/blog posts.