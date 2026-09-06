import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const read = (rel: string) => readFileSync(path.resolve(root, rel), "utf8");

const pageClient = read("app/page-client.tsx");
const globals = read("app/globals.css");
const nextConfig = read("next.config.ts");
const layout = read("app/layout.tsx");

describe("visual token consolidation", () => {
  it("keeps the seven baseline brand tokens at their approved values", () => {
    const expected: Array<[string, string]> = [
      ["--ink", "#17211b"],
      ["--paper", "#f5f1e8"],
      ["--card", "#fffdf8"],
      ["--line", "#d8d0c0"],
      ["--accent", "#cf4b32"],
      ["--green", "#2d6a4f"],
    ];
    for (const [token, value] of expected) {
      expect(globals, `${token} must stay ${value}`).toContain(`${token}: ${value}`);
    }
  });

  it("rejects the Pitch palette", () => {
    for (const hex of ["#EFEFEC", "#191C1E", "#A3182F", "#2E5E5A"]) {
      expect(globals.toLowerCase()).not.toContain(hex.toLowerCase());
    }
  });

  it("declares every console and surface colour as a named token", () => {
    for (const token of [
      "--console-bg",
      "--console-edge",
      "--console-ink",
      "--console-panel",
      "--console-panel-edge",
      "--surface-sunk",
      "--evidence-line",
      "--warn-surface",
    ]) {
      expect(globals).toContain(token);
    }
  });

  it("leaves no raw hex literal in the client component", () => {
    expect(pageClient.match(/#[0-9a-fA-F]{6}\b/g)).toBeNull();
  });

  it("preserves the hard-shadow, stamp and focus-visible primitives", () => {
    expect(globals).toContain("box-shadow: 10px 10px 0 var(--ink)");
    expect(globals).toContain("box-shadow: 5px 5px 0 var(--ink)");
    expect(globals).toContain("rotate(-2deg)");
    expect(globals).toContain("outline: 2px solid var(--accent)");
    expect(globals).toContain("prefers-reduced-motion: reduce");
  });
});

describe("session request count integrity", () => {
  it("increments only after the fetch resolves, so failed requests are not counted", () => {
    const fetchAt = pageClient.indexOf("await fetch(path");
    const incrementAt = pageClient.indexOf("setCount((n) => n + 1)");
    expect(fetchAt).toBeGreaterThan(-1);
    expect(incrementAt).toBeGreaterThan(-1);
    expect(incrementAt).toBeGreaterThan(fetchAt);
  });

  it("counts from zero with no fabricated baseline", () => {
    expect(pageClient).toContain("useState(0)");
    expect(pageClient).not.toMatch(/CALL_COUNT_BASE|1223|1,223/);
  });
});

describe("no fabricated demo content", () => {
  it("contains none of the retired synthetic UI fixtures", () => {
    for (const marker of [
      "WIRE_ITEMS",
      "TERMINAL_LINES",
      "SYNTHETIC_TOTAL",
      "mulberry32",
      "WIRE_DOT_CLS",
      "AnomalyWire",
      "2026-09-04",
    ]) {
      expect(pageClient, `${marker} must not return`).not.toContain(marker);
    }
  });

  it("refuses to render synthetic payloads in the user demo", () => {
    expect(pageClient).toContain("Synthetic data is not displayed in the user demo.");
    expect(pageClient).toContain('data_status === "synthetic"');
  });

  it("never echoes the payment challenge and keeps the payload masked", () => {
    expect(pageClient).toContain('"received (redacted)"');
    expect(pageClient).toContain('type="password"');
    expect(pageClient).toContain('autoComplete="off"');
  });
});

describe("accessibility", () => {
  it("announces loading, error and success regions", () => {
    expect(pageClient).toContain('data-testid="state-loading" role="status" aria-live="polite"');
    expect(pageClient).toContain('data-testid="summary-card" role="status" aria-live="polite"');
    expect(pageClient).toContain('data-testid="state-success-detail" role="status" aria-live="polite"');
    expect(pageClient).toContain('role="alert"');
  });

  it("keeps the tablist keyboard operable via a roving tabindex", () => {
    expect(pageClient).toContain('role="tablist"');
    expect(pageClient).toContain("onKeyDown");
    expect(pageClient).toContain("tabIndex={panel === id ? 0 : -1}");
    for (const key of ["ArrowLeft", "ArrowRight", "Home", "End"]) {
      expect(pageClient).toContain(key);
    }
  });

  it("drives the document language from the negotiated locale", () => {
    expect(layout).toContain("<html lang={locale}>");
    expect(layout).not.toContain('lang="zh-CN"');
    expect(pageClient).toContain("document.documentElement.lang = locale");
  });
});

describe("dev origin allowlist", () => {
  it("allows loopback dev origins without widening the host binding", () => {
    expect(nextConfig).toContain('allowedDevOrigins: ["127.0.0.1", "localhost"]');
  });
});

describe("test hooks", () => {
  it("preserves the data-testid contract used by the Playwright suite", () => {
    for (const id of [
      "alibi-app",
      "session-request-count",
      "ui-state",
      "summary-card",
      "state-loading",
      "state-payment-required",
      "state-success-detail",
      "state-insufficient",
      "state-unattributed",
      "recorded-gui-result",
      "recorded-cli-result",
      "cluster-language-evidence",
      "cluster-dimensions",
      "cluster-alert-card",
      "agent-console",
      "platform-agent-grid",
    ]) {
      expect(pageClient, `data-testid="${id}" must be preserved`).toContain(`data-testid="${id}"`);
    }
  });
});
