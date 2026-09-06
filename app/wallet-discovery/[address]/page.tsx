import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { isWalletAddress } from "@/src/contracts";
import { LOCALE_COOKIE, normalizeLocale } from "@/src/ui/i18n";
import { TermHelp, TermHelpProvider } from "@/src/ui/term-help";
import {
  ATTRIBUTION_FIELDS,
  FIT_FIELDS,
  OUTCOME_FIELDS,
  buildWalletDetailViewModel,
} from "@/app/components/wallet-discovery/view-model";
import {
  CARD_STYLE,
  EnvelopeField,
  FieldGroup,
  MISSING_TEXT,
  RecordedStamp,
  SUNK_STYLE,
} from "@/app/components/wallet-discovery/metric-parts";

/**
 * `/wallet-discovery/[address]` — one wallet, three groups.
 *
 * A wallet with no captured detail still renders: the page says so explicitly
 * and shows every field as `—` with its reason code. It does not 404, because
 * "we did not observe this" is a real answer and is more useful than an error
 * page. A malformed address does 404 — that is a bad URL, not an unobserved
 * subject.
 */

export const dynamic = "force-dynamic";

export default async function WalletDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const { address } = await params;
  if (!isWalletAddress(address)) notFound();

  const cookieStore = await cookies();
  const locale = normalizeLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const model = buildWalletDetailViewModel(address);

  return (
    <TermHelpProvider locale={locale}>
      <main style={{ maxWidth: "70rem", margin: "0 auto", padding: "2rem 1.5rem 4rem", display: "grid", gap: "1.25rem" }}>
        <header style={{ display: "grid", gap: "0.6rem" }}>
          <nav aria-label="Breadcrumb" className="font-prose" style={{ display: "flex", gap: "1rem", flexWrap: "wrap", fontSize: "0.72rem" }}>
            <Link href="/wallet-discovery" style={{ color: "var(--accent)" }}>
              ← Wallet Discovery 排行榜
            </Link>
            {/* Explicit route back to the existing Alibi time-evidence-chain surface. */}
            <Link href="/" style={{ color: "var(--accent)" }}>
              Alibi 时间证据链（首页）
            </Link>
          </nav>
          <h1 style={{ margin: 0, fontSize: "1.25rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            <span className="safe-wrap">Wallet Detail</span>
            <TermHelp termId="wallet_detail" />
          </h1>
          <code className="safe-wrap" style={{ fontSize: "0.8rem", fontWeight: 700 }}>
            {model.wallet}
          </code>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
            <RecordedStamp asOf={model.as_of_text} />
            <span className="font-prose" style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
              rank={model.rank === null ? "null" : model.rank} · user_name={model.user_name ?? MISSING_TEXT} ·
              verified_badge={String(model.verified_badge)} · detail_captured={String(model.detail_captured)}
            </span>
          </div>
        </header>

        <section aria-labelledby="scope-heading" style={SUNK_STYLE}>
          <h2 id="scope-heading" style={{ margin: "0 0 0.35rem", fontSize: "0.8rem" }}>
            本页观测范围
          </h2>
          <ul className="font-prose" style={{ margin: 0, paddingInlineStart: "1.1rem", display: "grid", gap: "0.25rem" }}>
            {model.limitations.map((item, index) => (
              <li key={index} className="safe-wrap" style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        {model.detail_captured ? null : (
          <section aria-labelledby="not-captured-heading" style={{ ...CARD_STYLE, borderColor: "var(--muted)", background: "var(--warn-surface)" }}>
            <h2 id="not-captured-heading" style={{ margin: "0 0 0.35rem", fontSize: "0.9rem" }}>
              Detail not captured
            </h2>
            <p className="font-prose safe-wrap" style={{ margin: 0, fontSize: "0.72rem" }}>
              {model.in_recorded_leaderboard
                ? "本钱包出现在 recorded 排行榜中，但本次采集只保存了排行榜行本身，没有抓取它的 /trades、/closed-positions、/activity。因此下方 Outcome 指标全部为未观测。"
                : model.in_capture
                  ? "本钱包有 markets / prices / trades 采集，但没有 Outcome 端点观测，因此 Outcome 组全部为未观测。"
                  : "本次 recorded 采集完全未观测该地址，因此本页不对它作出任何指标陈述。"}{" "}
              全部空值显示为 “{MISSING_TEXT}”，表示未观测，不是 0。
            </p>
          </section>
        )}

        {/* A. Outcome */}
        <FieldGroup
          id="outcome"
          title="A. Outcome Metrics"
          termId="outcome"
          intro={
            <>
              每个字段展开后给出 value / unit / requested-observed window / as_of / sample_size / coverage /
              metric_status / reason_code / limitations。以 median_exposure_minutes 表述持仓时长口径。
            </>
          }
        >
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {OUTCOME_FIELDS.map((field) => (
              <EnvelopeField
                key={field.key}
                label={field.label}
                envelope={model.outcome[field.key]}
                display={field.display}
                termId={field.termId}
              />
            ))}
          </div>
        </FieldGroup>

        {/* B. Attribution */}
        <FieldGroup
          id="attribution"
          title="B. Attribution Metrics"
          termId="attribution_surface"
          status={model.attribution.status}
          reasonCode={model.attribution.reason_code}
          intro={
            <>
              只描述可观察到的时间关系与证据限制。四段判定的取值空间为{" "}
              <code className="safe-wrap">{model.attribution.verdict_space.join(" / ")}</code>；
              列出取值空间不代表已作出任何判定。coverage 低于 0.40 时不输出 lead_rate。
            </>
          }
          limitations={model.attribution.limitations}
        >
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {ATTRIBUTION_FIELDS.map((field) => (
              <EnvelopeField
                key={field.key}
                label={field.label}
                envelope={model.attribution.fields[field.key]}
                display={field.display}
                termId={field.termId}
              />
            ))}
          </div>
          <div style={SUNK_STYLE}>
            <p className="font-prose" style={{ margin: "0 0 0.2rem", fontSize: "0.7rem", fontWeight: 700 }}>
              evidence[] — {model.attribution.evidence.length} 条
            </p>
            <p className="font-prose safe-wrap" style={{ margin: 0, fontSize: "0.68rem", color: "var(--muted)" }}>
              {model.attribution.absence === "no_qualified_evidence"
                ? "该钱包的 recorded 采集中没有任何带可验证发布时间的合格来源（fixture 自述标记为 [Unattributed]）。合格证据为 0，因此不展示证据条目，也不输出四段判定。本次范围内没有合格证据，不等于不存在公开信息。"
                : "该钱包没有归因采集，没有证据集合可展示。"}
            </p>
          </div>
        </FieldGroup>

        {/* C. Fit — unavailable by construction; no order-book depth exists. */}
        <FieldGroup
          id="fit"
          title="C. Fit Metrics"
          termId="fit_surface"
          status={model.fit.status}
          reasonCode={model.fit.reason_code}
          intro={
            <>
              本次采集没有订单簿深度数据，整组为 <code>unavailable</code>，reason_code{" "}
              <code>{model.fit.reason_code}</code>。六个字段名列出以说明口径，值一律为 “{MISSING_TEXT}”，不作估算。
            </>
          }
          limitations={model.fit.limitations}
        >
          <div style={{ display: "grid", gap: "0.5rem" }}>
            {FIT_FIELDS.map((field) => (
              <EnvelopeField
                key={field.key}
                label={field.label}
                envelope={model.fit.fields[field.key]}
                display={field.display}
              />
            ))}
          </div>
        </FieldGroup>

        <section aria-labelledby="chain-heading" style={{ ...CARD_STYLE, display: "grid", gap: "0.5rem" }}>
          <h2 id="chain-heading" style={{ margin: 0, fontSize: "1rem", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
            时间证据链
            <TermHelp termId="time_evidence_chain" />
          </h2>
          <p className="font-prose safe-wrap" style={{ margin: 0, fontSize: "0.72rem", color: "var(--muted)" }}>
            成交、市场重定价与来源发布之间的时间关系在 Alibi 首页呈现。时间先后不证明因果。
          </p>
          <Link
            href="/"
            style={{
              width: "fit-content",
              border: "2px solid var(--ink)",
              borderRadius: "0.5rem",
              padding: "0.4rem 0.8rem",
              background: "var(--card)",
              color: "var(--ink)",
              fontWeight: 700,
              fontSize: "0.75rem",
              textDecoration: "none",
            }}
          >
            打开 Alibi 时间证据链 →
          </Link>
        </section>
      </main>
    </TermHelpProvider>
  );
}
