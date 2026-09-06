import { expect, test } from "@playwright/test";

test("defaults to Chinese, switches locale without refetch, and persists the cookie", async ({ page }) => {
  await page.context().clearCookies();
  let apiRequests = 0;
  page.on("request", (request) => {
    if (["/summary", "/attribution", "/audit"].some((path) => request.url().includes(path))) apiRequests += 1;
  });
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.getByRole("main")).toHaveAttribute("lang", "zh-CN");
  await expect(page).toHaveTitle(/Alibi — 时间戳可信代理/);
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("main")).toHaveAttribute("lang", "en");
  await expect(page).toHaveTitle(/Alibi — Timestamp Trust Agent/);
  expect(apiRequests).toBe(0);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("main")).toHaveAttribute("lang", "en");
});

test("TermHelp supports focus, pin, Escape, and outside click", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/");
  const help = page.getByRole("button", { name: /解释|Explain/ }).first();
  await help.focus();
  await expect(help).toHaveAttribute("aria-expanded", "true");
  await help.click();
  await expect(help).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(help).toHaveAttribute("aria-expanded", "false");
  await help.click();
  await expect(help).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("heading", { name: "Alibi." }).click();
  await expect(help).toHaveAttribute("aria-expanded", "false");
});

test("TermHelp icons stay compact and keep their own label space", async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/");
  const help = page.locator(".term-help-button").first();
  const metrics = await help.evaluate((button) => {
    const wrapper = button.parentElement;
    if (!wrapper) throw new Error("TermHelp wrapper missing");
    const buttonStyle = getComputedStyle(button);
    const wrapperStyle = getComputedStyle(wrapper);
    return {
      buttonWidth: button.getBoundingClientRect().width,
      buttonHeight: button.getBoundingClientRect().height,
      buttonPadding: buttonStyle.padding,
      wrapperWidth: wrapper.getBoundingClientRect().width,
      wrapperMargin: Number.parseFloat(wrapperStyle.marginInlineStart),
      wrapperFlex: wrapperStyle.flex,
    };
  });
  expect(metrics.buttonWidth).toBeLessThanOrEqual(18);
  expect(metrics.buttonHeight).toBeLessThanOrEqual(18);
  expect(metrics.buttonPadding).toBe("0px");
  expect(metrics.wrapperWidth).toBeGreaterThan(metrics.buttonWidth);
  expect(metrics.wrapperMargin).toBeGreaterThan(0);
  expect(metrics.wrapperFlex).toContain("0 0 auto");
});

test("locale layout remains usable on mobile and at 200 percent zoom", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.context().clearCookies();
  await page.goto("/");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
  await expect(page.getByRole("tablist")).toBeVisible();
  await expect(page.getByRole("main")).toHaveAttribute("lang", "en");
  await page.screenshot({ path: "artifacts/verification/ui-i18n-glossary-001/en-mobile-200.png", fullPage: true });
});
