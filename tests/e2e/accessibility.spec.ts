import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.context().addCookies([{ name: "alibi_locale", value: "en", url: "http://127.0.0.1:3000" }]);
});

test.describe("cluster/language accessibility acceptance", () => {
  test("keeps controls and landmarks keyboard reachable at 200% zoom", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto("/");
    await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
    await page.getByRole("tab", { name: "APP" }).focus();
    await expect(page.getByRole("tab", { name: "APP" })).toBeFocused();
    await page.getByRole("tab", { name: "APP" }).press("Tab");
    await expect(page.getByLabel("MARKET / PROFILE / 0x ADDRESS")).toBeFocused();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
    expect(overflow).toBe(true);
  });

  test("honors reduced motion and exposes semantic status regions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.getByRole("button", { name: /Market timeline/ }).click();
    const analyze = page.getByRole("button", { name: "Analyze", exact: true });
    await expect(analyze).toBeEnabled();
    await analyze.click();
    await page.getByTestId("summary-card").waitFor();
    const animationDuration = await page.evaluate(() => {
      const node = document.createElement("div");
      node.className = "wire-dot";
      document.body.append(node);
      const duration = getComputedStyle(node).animationDuration;
      node.remove();
      return duration;
    });
    expect(["0.001ms", "1e-06s"]).toContain(animationDuration);
    await expect(page.getByRole("tablist")).toHaveAttribute("aria-label", "Analysis output panels");
    await expect(page.getByRole("main")).toHaveAttribute("lang", "en");
  });
});
