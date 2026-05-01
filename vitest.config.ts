import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": resolve(__dirname, "src") }
  },
  test: {
    environment: "happy-dom",
    globals: false,
    include: ["src/**/*.test.ts"],
    setupFiles: ["src/tests/setup.ts"]
  }
});