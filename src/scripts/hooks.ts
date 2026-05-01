import { MODULE_ID, log } from "@/scripts/constants";
import { registerSettings } from "@/scripts/registerSettings";

export function registerHooks(): void {
  Hooks.once("init", onInit);
  Hooks.once("ready", onReady);
}

function onInit(): void {
  log("init");
  registerSettings();
}

function onReady(): void {
  log("ready");
  // Publish a public API on the module entry for other modules to consume.
  const mod = game.modules!.get(MODULE_ID);
  if (mod) {
    (mod as unknown as { api: Record<string, unknown> }).api = {
      version: (mod as unknown as { version: string }).version
    };
  }
}
