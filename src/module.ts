import { MODULE_ID } from "@/scripts/constants";
import { registerHooks } from "@/scripts/hooks";

registerHooks();

console.info(`[${MODULE_ID}] module bundle evaluated`);
