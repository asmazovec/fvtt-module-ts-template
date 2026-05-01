# UI Frameworks

**Default:** ApplicationV2 + Handlebars. This is what Foundry ships and what this template uses. Stick to it unless a task specifically demands a reactive framework.

## When a framework is justified
- Complex, highly interactive UIs (graph editors, large tables with inline editing).
- Shared component library across many sheets.
- Otherwise, a well-decomposed ApplicationV2 with Parts and Actions is sufficient.

## Integration options (as of v14)
- **Svelte** — most mature path in the Foundry ecosystem via [`@typhonjs-fvtt/runtime`](https://github.com/typhonjs-fvtt/runtime) and `@typhonjs-fvtt/svelte-standard`. Mount a Svelte root inside an ApplicationV2 Part.
- **Vue 3** — mount a Vue app inside an ApplicationV2 Part's root element in `_onRender`. Manage unmount in `_onClose`.
- **React** — same pattern as Vue (`createRoot` in `_onRender`). Overkill for most modules.

## Rules of engagement
- Always wrap the framework inside an ApplicationV2 — Foundry expects its window/focus/close lifecycle.
- Never render outside the window element; Foundry's layering (z-index, focus trap, `ui.windows`) depends on owning the DOM subtree.
- Keep framework state local to the app instance; persist to documents/settings via standard Foundry APIs.
- Add the framework as a dev dependency and ensure Vite bundles it — do not rely on Foundry globals for it.

## Before adopting
Ask the user. Framework choice affects bundle size, build config and long-term maintenance.