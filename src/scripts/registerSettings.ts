import { MODULE_ID } from "@/scripts/constants";

export function registerSettings(): void {
  game.settings!.register(MODULE_ID, "enableFeatureX", {
    name: `${MODULE_ID}.settings.enableFeatureX.name`,
    hint: `${MODULE_ID}.settings.enableFeatureX.hint`,
    scope: "world",
    config: true,
    type: Boolean,
    default: false
  });
}
