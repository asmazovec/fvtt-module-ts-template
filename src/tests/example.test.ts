import { describe, expect, it } from "vitest";
import { MODULE_ID } from "@/scripts/constants";

describe("constants", () => {
  it("module id is non-empty and kebab-case", () => {
    expect(MODULE_ID).toMatch(/^[a-z][a-z0-9-]*$/);
  });
});
