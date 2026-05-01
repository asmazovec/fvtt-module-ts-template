// Place project-local augmentations of Foundry types here.
// Community types lag behind core; narrow augmentations are safer than casts.
export { };

declare global {
  interface SettingConfig {
    "{{MODULE_ID}}.enableFeatureX": boolean;
  }
}
