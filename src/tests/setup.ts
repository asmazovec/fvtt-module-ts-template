// Minimal Foundry global stubs for Vitest. Extend only what each test needs.
import { vi } from "vitest";

type AnyFn = (...args: unknown[]) => unknown;

const hookStore = new Map<string, AnyFn[]>();

(globalThis as unknown as { Hooks: unknown }).Hooks = {
  on: vi.fn((name: string, fn: AnyFn) => {
    const list = hookStore.get(name) ?? [];
    list.push(fn);
    hookStore.set(name, list);
    return list.length;
  }),
  once: vi.fn(),
  off: vi.fn(),
  callAll: vi.fn(),
  call: vi.fn()
};

(globalThis as unknown as { game: unknown }).game = {
  i18n: {
    localize: (k: string) => k,
    format: (k: string, d: Record<string, unknown>) => `${k}:${JSON.stringify(d)}`,
    has: (_k: string) => true
  },
  settings: {
    register: vi.fn(),
    get: vi.fn(),
    set: vi.fn()
  },
  modules: new Map()
};

(globalThis as unknown as { ui: unknown }).ui = {
  notifications: { info: vi.fn(), warn: vi.fn(), error: vi.fn() }
};
