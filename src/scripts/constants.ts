export const MODULE_ID = "{{MODULE_ID}}" as const;
export const MODULE_TITLE = "{{MODULE_TITLE}}" as const;

export const log = (...args: unknown[]): void => {
  console.log(`[${MODULE_ID}]`, ...args);
};
