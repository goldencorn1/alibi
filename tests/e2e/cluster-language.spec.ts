import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.context().addCookies([{ name: "alibi_locale", value: "en", url: "http://127.0.0.1:3000" }]);
});

test.describe("cluster/language evidence UI visual states", () => {
  test("desktop recorded empty state screenshot", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1100 });
    await page.goto("/");
    await expect(page.getByRole("main")).toHaveAttribute("lang", "en");
    await page.screenshot({ path: "artifacts/verification/ui-i18n-glossary-001/cluster-language-desktop.png", fullPage: true });
  });

  test("mobile recorded empty state screenshot", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("tablist")).toBeVisible();
    await page.screenshot({ path: "artifacts/verification/ui-i18n-glossary-001/cluster-language-mobile.png", fullPage: true });
  });

  test("200 percent zoom keeps the three-panel controls reachable", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 1000 });
    await page.goto("/");
    await page.evaluate(() => {
      document.documentElement.style.zoom = "2";
    });
    await expect(page.getByRole("tab", { name: "APP" })).toBeVisible();
    await page.getByRole("tab", { name: "APP" }).press("ArrowLeft");
    await expect(page.getByRole("tab", { name: "CLI" })).toHaveAttribute("aria-selected", "true");
    await page.screenshot({ path: "artifacts/verification/ui-i18n-glossary-001/cluster-language-200-percent.png", fullPage: true });
  });
});
