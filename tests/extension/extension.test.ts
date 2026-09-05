import { describe, expect, it } from "vitest";
import manifest from "@/extension/manifest.json";

describe("MV3 extension boundary", () => {
  it("uses minimal read-only permissions", () => { expect(manifest.manifest_version).toBe(3); expect(manifest.permissions).toEqual(["activeTab", "storage"]); expect(manifest.host_permissions).toContain("http://127.0.0.1:3000/*"); });
  it("does not declare wallet or signing capabilities", () => { expect(JSON.stringify(manifest)).not.toMatch(/wallet|private|sign|trade|cancel|bridge/i); });
});
