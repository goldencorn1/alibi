import type { CSSProperties } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, normalizeLocale } from "@/src/ui/i18n";
import { TermHelp, TermHelpProvider } from "@/src/ui/term-help";
import {
  LEADERBOARD_COLUMNS,
  buildLeaderboardViewModel,
  type LeaderboardRowViewModel,
} from "@/app/components/wallet-discovery/view-model";
import {
  CARD_STYLE,
  MetricValue,
  RecordedStamp,
  SUNK_STYLE,
  StatusBadge,
  VISUALLY_HIDDEN,
} from "@/app/components/wallet-discovery/metric-parts";

/**
 * `/wallet-discovery` — the recorded 30-day leaderboard.
 *
 * Server-rendered from the recorded fixture; no fetch, no clock. The table is a
 * real `<table>` with a `<caption>` and `scope`-ed headers, and the only
 * clickable rows are the ones with captured detail — expressed as `<a>`
 * elements so they are keyboard-reachable, rather than a `<tr onClick>`.
 */

export const dynamic = "force-dynamic";

const CELL: CSSProperties = {
  borderBottom: `1px solid var(--line)`,
  padding: "0.55rem 0.6rem",
  verticalAlign: "top",
  textAlign: "left",
};

const HEAD_CELL: CSSProperties = {
  ...CELL,
  borderBottom: `2px solid var(--ink)`,
  position: "sticky",
  top: 0,
  background: "var(--card)",
  fontSize: "0.7rem",
  letterSpacing: "0.05em",
  textTransform: "uppercase",
  whiteSpace: "normal",
};

function WalletCell({ row }: { row: LeaderboardRowViewModel }) {
  const short = `${row.wallet.slice(0, 10)}…${row.wallet.slice(-6)}`;
  return (
    <span style={{ display: "grid", gap: "0.2rem" }}>
      {row.detail_href ? (
        <Link
          href={row.detail_href}
          style={{ fontWeight: 700, color: "var(--accent)", textDecoration: "underline" }}
        >
          {row.user_name ?? short}
          <span style={VISUALLY_HIDDEN}> — open recorded wallet detail for {row.wallet}</span>
        </Link>
      ) : (
        <span style={{ fontWeight: 700 }}>{row.user_name ?? short}</span>
      )}
      <code className="safe-wrap" style={{ fontSize: "0.62rem", color: "var(--muted)" }}>
        {row.wallet}
      </code>
      <span className="font-prose" style={{ fontSize: "0.62rem", color: "var(--muted)" }}>
        verified_badge={String(row.verified_badge)} · source_vol_30d={row.source_vol_text} · source_pnl_30d=
        {row.source_pnl_text}
      </span>
      {row.detail_captured ? null : (
        <span style={{ display: "inline-flex", gap: "0.35rem", alignItems: "center", flexWrap: "wrap" }}>
          <span
            className="font-prose"
            style={{
              border: `1px dashed var(--muted)`,
              borderRadius: "0.35rem",
              padding: "0.05rem 0.35rem",
              fontSize: "0.62rem",
              color: "var(--muted)",
            }}
          >
            Detail not captured
          </span>
          <TermHelp termId="detail_not_captured" />
        </span>
      )}
    </span>
  );
}

export default async function WalletDiscoveryPage() {
  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const model = buildLeaderboardViewModel();

  return (
    <TermHelpProvider locale={locale}>
      <main style={{ maxWidth: "84rem", margin: "0 auto", padding: "2rem 1.5rem 4rem", display: "grid", gap: "1.25rem" }}>
        <header style={{ display: "grid", gap: "0.6rem" }}>
          <nav aria-label="Breadcrumb" className="font-prose" style={{ fontSize: "0.72rem" }}>
            <Link href="/" style={{ color: "var(--accent)" }}>
              ← Alibi 时间证据链首页
            </Link>
          </nav>
          <h1 style={{ margin: 0, fontSize: "1.5rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            Wallet Discovery
            <TermHelp termId="wallet_discovery" />
          </h1>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <RecordedStamp asOf={model.as_of_text} />
            <span className="font-prose" style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
              as_of_source={model.as_of_source} · window={model.window}
            </span>
            <TermHelp termId="recorded_snapshot" />
          </div>
          <p className="font-prose safe-wrap" style={{ margin: 0, fontSize: "0.74rem", color: "var(--muted)" }}>
            数据来源 <code className="safe-wrap">{model.source_url}</code>。上游响应含{" "}
            {model.rows_available_in_response} 行，本 fixture 保留 {model.rows_returned} 行。
            as_of 来自采集时的响应头，不是当前时间。本页只描述可观察到的时间关系与证据限制。
          </p>
        </header>

        <section aria-labelledby="coverage-note-heading" style={SUNK_STYLE}>
          <h2 id="coverage-note-heading" style={{ margin: "0 0 0.35rem", fontSize: "0.8rem" }}>
            本快照实际覆盖了什么
          </h2>
          <p className="font-prose safe-wrap" style={{ margin: 0, fontSize: "0.72rem", color: "var(--muted)" }}>
            {model.rows_returned} 行中只有 {model.detail_captured_count} 个钱包抓取了钱包级端点；其余{" "}
            {model.uncaptured_count} 个只有排行榜行本身，8 个指标一律为 <code>null</code>。
            <strong style={{ color: "var(--ink)" }}> 空值显示为 “—”，它表示未观测，不是 0。</strong>{" "}
            rank / wallet / user_name / verified_badge / source_vol_30d / source_pnl_30d 对全部 {model.rows_returned}{" "}
            行都是上游真实字段。
          </p>
        </section>

        <div
          role="region"
          aria-labelledby="leaderboard-caption"
          tabIndex={0}
          style={{ ...CARD_STYLE, padding: 0, overflowX: "auto" }}
        >
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "72rem", fontSize: "0.78rem" }}>
            <caption
              id="leaderboard-caption"
              className="font-prose"
              style={{ captionSide: "top", padding: "0.85rem 0.75rem", textAlign: "left", fontSize: "0.74rem" }}
            >
              Recorded 30 日排行榜快照，{model.rows_returned} 行，as_of {model.as_of_text}。
              每个指标单元格给出 metric_status、reason_code、样本量与覆盖率；“—” 表示未观测，不得读作 0。
              仅 {model.detail_captured_count} 行有已捕获详情并可点击进入。
            </caption>
            <thead>
              <tr>
                <th scope="col" style={HEAD_CELL}>
                  Rank
                </th>
                <th scope="col" style={{ ...HEAD_CELL, minWidth: "16rem" }}>
                  Wallet / Profile
                </th>
                {LEADERBOARD_COLUMNS.map((column) => (
                  <th key={column.key} scope="col" style={{ ...HEAD_CELL, minWidth: "9rem" }}>
                    <span style={{ display: "inline-flex", gap: "0.3rem", alignItems: "center", flexWrap: "wrap" }}>
                      {column.header}
                      <TermHelp termId={column.termId} />
                    </span>
                  </th>
                ))}
                <th scope="col" style={HEAD_CELL}>
                  Data Status
                </th>
              </tr>
            </thead>
            <tbody>
              {model.rows.map((row) => (
                <tr key={row.wallet}>
                  <th scope="row" style={{ ...CELL, fontWeight: 700 }}>
                    {row.rank}
                  </th>
                  <td style={CELL}>
                    <WalletCell row={row} />
                  </td>
                  {LEADERBOARD_COLUMNS.map((column) => {
                    const metric = row.metrics[column.key];
                    return (
                      <td key={column.key} style={CELL} title={metric.title}>
                        <MetricValue metric={metric} compact />
                      </td>
                    );
                  })}
                  <td style={CELL}>
                    <span style={{ display: "grid", gap: "0.25rem" }}>
                      <span className="stamp" style={{ color: "var(--green)", fontSize: "0.58rem", padding: "0.1rem 0.35rem", width: "fit-content", fontWeight: 800 }}>
                        {row.data_status}
                      </span>
                      <span className="font-prose" style={{ fontSize: "0.62rem", color: "var(--muted)" }}>
                        detail_captured={String(row.detail_captured)}
                      </span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/*
          Kept in its own section, NOT injected into the ranked table. Both
          wallets are measured absent from the recorded top-50 response, so they
          have no rank and none is invented for them.
        */}
        <section aria-labelledby="unranked-heading" style={{ ...CARD_STYLE, display: "grid", gap: "0.75rem" }}>
          <h2 id="unranked-heading" style={{ margin: 0, fontSize: "1rem" }}>
            时间证据链演示钱包（不在 30 日排行榜样本内）
          </h2>
          <p className="font-prose safe-wrap" style={{ margin: 0, fontSize: "0.72rem", color: "var(--muted)" }}>
            以下 {model.attribution_fixture_wallets.length} 个钱包有 markets / prices / trades 采集，用于时间证据链演示。
            实测它们<strong style={{ color: "var(--ink)" }}>不在 recorded top-50 响应内，因此 rank 为 null</strong>
            ，未伪造名次，也未并入上表。
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: "0.6rem" }}>
            {model.attribution_fixture_wallets.map((entry) => (
              <li key={entry.wallet} style={SUNK_STYLE}>
                <span style={{ display: "grid", gap: "0.3rem" }}>
                  <Link
                    href={entry.detail_href}
                    style={{ fontWeight: 700, color: "var(--accent)", textDecoration: "underline" }}
                  >
                    <code className="safe-wrap">{entry.wallet}</code>
                    <span style={VISUALLY_HIDDEN}> — open recorded wallet detail</span>
                  </Link>
                  <span className="font-prose" style={{ fontSize: "0.66rem", color: "var(--muted)" }}>
                    rank=null · fixture <code className="safe-wrap">{entry.fixture}</code>
                  </span>
                  <span className="font-prose safe-wrap" style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                    {entry.note}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="limitations-heading" style={{ ...CARD_STYLE, display: "grid", gap: "0.5rem" }}>
          <h2 id="limitations-heading" style={{ margin: 0, fontSize: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            限制
            <StatusBadge status="partial" />
          </h2>
          <ul className="font-prose" style={{ margin: 0, paddingInlineStart: "1.1rem", display: "grid", gap: "0.3rem" }}>
            {model.limitations.map((item, index) => (
              <li key={index} className="safe-wrap" style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                {item}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </TermHelpProvider>
  );
}
