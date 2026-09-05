import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.context().addCookies([{ name: "alibi_locale", value: "en", url: "http://127.0.0.1:3000" }]);
});

test("recorded wallet preset shows the coverage gate", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Wallet A/ }).click();
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(page.getByTestId("state-insufficient")).toBeVisible();
  await expect(page.getByTestId("summary-card")).toContainText(/recorded/i);
});

test("API-driven payment-required and success states are mapped in one page", async ({ page }) => {
  let detailCalls = 0;
  await page.route("**/summary", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ kind: "summary", meta: { data_status: "recorded", disclaimer: "不构成投资建议" }, title: "E2E market", headline: "Synthetic contract response only.", market_count: 1, repricing_count: 1, unattributed_count: 1, recent_windows: [], wallet_metrics: null, detail_requires_payment: { price: "0.01 USDC", network: "eip155:84532" } }) });
  });
  await page.route("**/attribution", async (route) => {
    detailCalls += 1;
    if (detailCalls === 1) {
      await route.fulfill({ status: 402, headers: { "PAYMENT-REQUIRED": "synthetic-challenge" }, contentType: "application/json", body: JSON.stringify({ error: { code: "payment_required", message: "synthetic payment test", retryable: true, data_status: "recorded", retrieved_at: new Date().toISOString() } }) });
      return;
    }
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ kind: "detail", meta: { data_status: "recorded", disclaimer: "不构成投资建议" }, title: "E2E detail", windows: [], evidence: [], wallet_metrics: null, exclusions: [], paid_access: { scheme: "exact", network: "eip155:84532", price: "0.01 USDC" } }) });
  });
  await page.goto("/");
  await page.getByLabel("MARKET / PROFILE / 0x ADDRESS").fill("0x1234567890123456789012345678901234567890");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(page.getByTestId("state-unattributed")).toBeVisible();
  await page.getByRole("button", { name: /Request Detail/ }).click();
  await expect(page.getByTestId("state-payment-required")).toBeVisible();
  await page.getByLabel("One-time payment payload").fill("synthetic-payload");
  await page.getByRole("button", { name: "Retry Detail" }).click();
  await expect(page.getByTestId("state-success-detail")).toBeVisible();
});

test("GUI, CLI and APP tabs support keyboard navigation and the page declares English content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(page.locator("main")).toHaveAttribute("lang", "en");
  const tabs = page.getByRole("tab");
  await expect(tabs).toHaveCount(3);
  await expect(tabs.filter({ hasText: "APP" })).toHaveAttribute("aria-selected", "true");

  await tabs.filter({ hasText: "APP" }).press("ArrowLeft");
  await expect(tabs.filter({ hasText: "CLI" })).toHaveAttribute("aria-selected", "true");
  await tabs.filter({ hasText: "CLI" }).press("Home");
  await expect(tabs.filter({ hasText: "GUI" })).toHaveAttribute("aria-selected", "true");
  await tabs.filter({ hasText: "GUI" }).press("End");
  await expect(tabs.filter({ hasText: "APP" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel").filter({ hasText: "Actual legacy API query" })).toBeVisible();
});

test("empty recorded responses and session request count are explicit", async ({ page }) => {
  await page.route("**/summary", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "summary",
        meta: { data_status: "recorded", disclaimer: "recorded test" },
        title: "Empty recorded result",
        headline: "No recorded windows were returned.",
        market_count: 0,
        repricing_count: 0,
        unattributed_count: 0,
        recent_windows: [],
        wallet_metrics: null,
        detail_requires_payment: { price: "0.01 USDC", network: "eip155:84532" },
      }),
    });
  });
  await page.goto("/");
  await expect(page.getByTestId("session-request-count")).toContainText("Session request count 0");
  await page.getByLabel("MARKET / PROFILE / 0x ADDRESS").fill("recorded-empty-input");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(page.getByTestId("state-empty")).toBeVisible();
  await expect(page.getByTestId("session-request-count")).toContainText("Session request count 1");
  await expect(page.getByText("Synthetic data is not displayed in the user demo.")).toHaveCount(0);
});

test("provider and upstream unavailable errors have distinct accessible states", async ({ page }) => {
  let calls = 0;
  await page.route("**/summary", async (route) => {
    calls += 1;
    const code = calls === 1 ? "provider_unavailable" : "upstream_unavailable";
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: { code, message: `${code} test`, retryable: true, data_status: "recorded", retrieved_at: new Date().toISOString() } }),
    });
  });
  await page.goto("/");
  await page.getByLabel("MARKET / PROFILE / 0x ADDRESS").fill("unavailable-input");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(page.getByTestId("state-provider_unavailable")).toHaveAttribute("role", "alert");
  await page.getByRole("button", { name: "Retry request" }).click();
  await expect(page.getByTestId("state-upstream_unavailable")).toHaveAttribute("role", "alert");
});

test("synthetic API payloads are blocked from every user-facing result panel", async ({ page }) => {
  await page.route("**/summary", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "summary",
        meta: { data_status: "synthetic", disclaimer: "synthetic test" },
        title: "Synthetic result",
        headline: "Should never be displayed.",
        market_count: 1,
        repricing_count: 1,
        unattributed_count: 0,
        recent_windows: [],
        wallet_metrics: null,
        detail_requires_payment: { price: "0.01 USDC", network: "eip155:84532" },
      }),
    });
  });
  await page.goto("/");
  await page.getByLabel("MARKET / PROFILE / 0x ADDRESS").fill("synthetic-input");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(page.getByTestId("state-invalid_output")).toBeVisible();
  await expect(page.getByTestId("summary-card")).toHaveCount(0);
  await expect(page.getByText("Should never be displayed.")).toHaveCount(0);
});

test("recorded cluster evidence remains address-based and conservative", async ({ page }) => {
  await page.route("**/summary", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        kind: "summary",
        meta: { data_status: "recorded", disclaimer: "recorded test", evidence_cutoff_at: "2026-09-04T12:00:00.000Z" },
        title: "Recorded cluster",
        headline: "Evidence only.",
        market_count: 1,
        repricing_count: 0,
        unattributed_count: 0,
        recent_windows: [],
        wallet_metrics: null,
        cluster_alerts: [{
          alert_id: "cluster-test",
          alert_type: "cluster_without_verified_source",
          created_at: "2026-09-04T12:00:00.000Z",
          evidence_cutoff_at: "2026-09-04T12:00:00.000Z",
          revision: 1,
          supersedes_revision: null,
          condition_id: "condition-test",
          cluster_size: 5,
          addresses: [],
          dominant_outcome: "YES",
          cluster_span_minutes: 12,
          baseline_p99_usdc: "200",
          baseline_sample_count: 200,
          baseline_algorithm_version: "p99-nearest-rank-v1",
          dimensions: [],
          dimensions_evaluable: 5,
          dimensions_passed: 4,
          herding_like_pattern: false,
          source_state: "not_found",
          state: "formal_alert",
          evidence_quality: "medium",
          data_status: "recorded",
          limitations: ["Addresses do not establish identity or personhood; this is evidence-only."],
        }],
        language_windows: [],
        source_coverage: { source_state: "not_found", coverage_complete: true, coverage_ratio: 1, required_connectors: [], healthy_connectors: [], unavailable_connectors: [], timestamp_precision: "minute", unknown_reasons: [] },
        detail_requires_payment: { price: "0.01 USDC", network: "eip155:84532" },
      }),
    });
  });
  await page.goto("/");
  await page.getByLabel("MARKET / PROFILE / 0x ADDRESS").fill("recorded-cluster-input");
  await page.getByRole("button", { name: "Analyze", exact: true }).click();
  await expect(page.getByTestId("cluster-alert-card")).toContainText("Address count: 5");
  await expect(page.getByTestId("cluster-alert-card")).toContainText("source_state=not_found");
  await expect(page.getByTestId("cluster-alert-card")).not.toContainText("users");
});
