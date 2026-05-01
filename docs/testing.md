# Testing & Verification

## Layers
1. **Type-check** — fastest signal. Runs `tsc --noEmit`. Catches most API misuse because `foundry-vtt-types` is strict.
2. **Vitest unit tests** — for pure logic: data model migrations, utility functions, computed fields. No Foundry runtime; mock `game`/`CONFIG` when needed.
3. **Quench (optional)** — in-Foundry integration tests. Requires the Quench module installed in the target world. Tests live under `src/tests/quench/` and self-register on `ready`.

## Vitest conventions
- Co-locate tests next to units (`*.test.ts`) or in `src/tests/unit/`.
- For Foundry globals, use a small `test/setup.ts` that stubs the minimum surface you need. Do not try to emulate the full client.
- Prefer property-based tests for schema migrations.

## Quench conventions
- One suite per feature area. Guard registration with `CONFIG.debug.hooks || game.modules.get("quench")?.active`.
- Quench tests can be slow — do not block `ready` on them.

## What to run before declaring done
- Type-check clean.
- Vitest green.
- `build` succeeds and `dist/module.json` exists and is valid JSON.
- Manual smoke in Foundry if the change touches UI or hooks — ask the user to run it if you cannot.