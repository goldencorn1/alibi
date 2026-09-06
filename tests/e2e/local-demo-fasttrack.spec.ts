import { expect, test } from "@playwright/test";

const WALLET_A = "0x674887d1ac838099a48b629dff53f25b7b87ee08";

test.describe("local recorded wallet discovery fast track", () => {
  test("renders the 20-row recorded snapshot and two detail entry points", async ({ page }) => {
    await page.goto("/");
    const discovery = page.getByTestId("wallet-discovery");
    await expect(discovery).toBeVisible();
    await expect(discovery.locator("tbody tr")).toHaveCount(20);
    await expect(discovery.getByText("recorded", { exact: true }).first()).toBeVisible();
    await expect(discovery.getByText(/不适用|n\/a/, { exact: true }).first()).toBeVisible();
    await expect(page.getByTestId("recorded-detail-presets").getByRole("button", { name: /打开已记录详情|Open recorded detail/ })).toHaveCount(2);
    await expect(page.getByTestId("wallet-surfaces")).toContainText(/不可用|unavailable/);
  });

  test("opens a recorded wallet preset without inventing detail metrics", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("recorded-detail-presets").getByRole("button", { name: /打开已记录详情|Open recorded detail/ }).first().click();
    await expect(page.locator("#analysis-input")).toHaveValue(WALLET_A);
    await page.getByRole("tab", { name: "APP" }).click();
    const analyze = page.getByTestId("alibi-app").getByRole("button", { name: /分析|Analyze/, exact: true });
    await expect(analyze).toBeEnabled();
    await analyze.click();
    await expect(page.getByTestId("summary-card")).toBeVisible();
    await expect(page.getByTestId("summary-card")).toContainText(/recorded|已记录/);
    await expect(page.getByTestId("wallet-surfaces")).toContainText(/unavailable|不可用/);
  });

  test("renders the recorded Agent Console inventory with independent TermHelp controls", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Market timeline/ }).click();
    await page.getByTestId("alibi-app").getByRole("button", { name: /分析|Analyze/, exact: true }).click();
    const consolePanel = page.getByTestId("agent-console");
    await expect(consolePanel).toBeVisible({ timeout: 15_000 });
    await expect(consolePanel.getByTestId("platform-agent-grid").locator("[data-testid^='platform-agent-']")).toHaveCount(4);
    await expect(consolePanel.locator("details")).toHaveCount(9);
    await consolePanel.locator("details").evaluateAll((details) => details.forEach((element) => { (element as HTMLDetailsElement).open = true; }));
    const helpButtons = consolePanel.locator("button[data-testid^='term-help-']");
    expect(await helpButtons.count()).toBeGreaterThan(40);
    for (const help of await helpButtons.all()) {
      await expect(help).toHaveAttribute("aria-label", /解释|Explain/);
    }
    await expect(consolePanel).not.toContainText("data_status=synthetic");
    await expect(consolePanel.getByRole("button", { name: /Markdown/ })).toBeVisible();
  });

  test("serves recorded API routes and rejects an uncaptured wallet explicitly", async ({ request }) => {
    const leaderboard = await request.get("/api/v1/leaderboard");
    expect(leaderboard.status()).toBe(200);
    const leaderboardJson = await leaderboard.json();
    expect(leaderboardJson.data_status).toBe("recorded");
    expect(leaderboardJson.rows).toHaveLength(20);

    const metrics = await request.get(`/api/v1/wallet/${WALLET_A}/metrics`);
    expect(metrics.status()).toBe(200);
    const metricsJson = await metrics.json();
    expect(metricsJson.data_status).toBe("recorded");
    expect(metricsJson.metric_status).toBe("unavailable");
    expect(metricsJson.metrics.realized_pnl_7d).toBeNull();

    const missing = await request.get("/api/v1/wallet/0x0000000000000000000000000000000000000001/metrics");
    expect(missing.status()).toBe(404);
    const missingJson = await missing.json();
    expect(missingJson.error.code).toBe("not_found");
    expect(missingJson.error.data_status).toBe("recorded");
  });

  test("runs the A2A Console against real local recorded endpoints", async ({ page }) => {
    await page.goto("/");
    const consolePanel = page.getByTestId("a2a-console");
    await expect(consolePanel).toBeVisible();
    await expect(consolePanel.getByTestId("a2a-empty")).toBeVisible();
    await consolePanel.getByRole("button", { name: /运行 Agent 请求|Run Agent Request/ }).click();
    await expect(consolePanel.getByTestId("a2a-machine-response")).toContainText('"data_status": "recorded"', { timeout: 20_000 });
    await expect(consolePanel).toContainText(/not_performed|未执行/);
    await expect(consolePanel).toContainText(/20|worker|Worker/);
    await expect(consolePanel).not.toContainText('"settlement": "confirmed"');
    await consolePanel.getByRole("button", { name: "MCP 工具", exact: true }).click();
    await expect(consolePanel).toContainText("alibi_summary");
    await expect(consolePanel).toContainText(/recorded_only|仅记录/);
  });

  for (const locale of ["zh-CN", "en"] as const) {
    test(`${locale} desktop mobile and 200 percent screenshots`, async ({ page }) => {
      await page.context().addCookies([{ name: "alibi_locale", value: locale, url: "http://127.0.0.1:3000" }]);
      const viewports = [
        [1440, 1100, "desktop"],
        [390, 844, "mobile"],
        [1280, 1000, "200-percent"],
      ] as const;
      for (const [width, height, label] of viewports) {
        await page.setViewportSize({ width, height });
        await page.goto("/");
        if (label === "200-percent") {
          await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
        }
        await expect(page.getByTestId("wallet-discovery")).toBeVisible();
        await page.screenshot({ path: `artifacts/verification/local-demo-fast-track/screenshots/${locale}-${label}.png`, fullPage: true });
      }
    });

    test(`${locale} A2A response screenshots`, async ({ page }) => {
      await page.context().addCookies([{ name: "alibi_locale", value: locale, url: "http://127.0.0.1:3000" }]);
      const viewports = [[1440, 1100, "desktop"], [390, 844, "mobile"], [1280, 1000, "200-percent"]] as const;
      for (const [width, height, label] of viewports) {
        await page.setViewportSize({ width, height });
        await page.goto("/");
        await page.getByTestId("a2a-console").getByRole("button", { name: /运行 Agent 请求|Run Agent Request/ }).click();
        await expect(page.getByTestId("a2a-machine-response")).toContainText('"data_status": "recorded"', { timeout: 20_000 });
        if (label === "200-percent") await page.evaluate(() => { document.documentElement.style.zoom = "2"; });
        await page.screenshot({ path: `artifacts/verification/local-demo-fast-track/screenshots/${locale}-a2a-${label}.png`, fullPage: true });
      }
    });
  }
});
