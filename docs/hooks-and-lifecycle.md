# Hooks & Lifecycle

## Boot order (client)
1. `init` — core classes loaded, `CONFIG` mutable, `game.settings` available for registration. **`game.actors` etc. are NOT ready.** Do all `CONFIG` and `registerSettings` work here.
2. `i18nInit` — translations loaded; safe to read `game.i18n.localize`.
3. `setup` — packs and localised static data resolved.
4. `ready` — full world loaded. All collections (`game.actors`, `game.items`, `game.scenes`, `game.users`) populated. Safe to touch documents.

Subsequent runtime hooks: document CRUD (`createItem`, `updateActor`, `deleteToken`, …), canvas (`canvasReady`, `drawToken`), UI (`renderApplicationV2`, `getSceneControlButtons`), combat (`combatStart`, `combatTurnChange`).

## Registration patterns
- Register once, in `src/module.ts`, during `init` or module top-level.
- Keep handler bodies thin — delegate into `src/scripts/*` modules for testability.
- Always capture the returned hook id if the handler may need to be removed.

## Lookup
- Enumerate every hook in core via the `foundry-api-docs` MCP (`getHook` / `listHooks`). Do not rely on outdated lists from blog posts — v14 added and renamed several.
- System- and module-specific hooks exist too; search the relevant system's source the same way.

## Anti-patterns
- Calling `game.*` collections inside `init` — they are not populated yet.
- Registering the same hook on module re-entry without guarding against duplicates (watch out in dev HMR; see `docs/build-and-dev.md`).
- Throwing synchronously from a hook — it can abort the boot sequence. Catch and log.