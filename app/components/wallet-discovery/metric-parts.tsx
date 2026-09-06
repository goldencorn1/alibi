import type { CSSProperties, ReactNode } from "react";
import type { MetricStatus } from "@/src/contracts";
import { TermHelp } from "@/src/ui/term-help";
import type { TermId } from "@/src/ui/glossary";
import {
  MISSING_TEXT,
  NOT_APPLICABLE_TEXT,
  type AnyEnvelope,
  type MetricDisplay,
  type RenderedMetric,
  renderMetric,
} from "@/app/components/wallet-discovery/view-model";

/**
 * Shared presentation for Wallet Discovery.
 *
 * Server components throughout; `TermHelp` is the only client island. Styling
 * uses the existing `globals.css` tokens and adds no new visual dependency.
 *
 * The one rule these pieces exist to enforce: a metric that was not observed
 * renders as an em dash with its status and reason beside it, never as a `0`
 * and never as a blank cell that a reader could mistake for a zero.
 */

export const CARD_STYLE: CSSProperties = {
  border: "2px solid var(--ink)",
  borderRadius: "0.65rem",
  background: "var(--card)",
  padding: "1rem",
};

export const SUNK_STYLE: CSSProperties = {
  border: `1px solid var(--line)`,
  borderRadius: "0.5rem",
  background: "var(--surface-sunk)",
  padding: "0.6rem 0.75rem",
};

/**
 * Visually hidden but announced. Defined inline because `globals.css` is owned
 * by another change and must not grow a utility class from here.
 */
export const VISUALLY_HIDDEN: CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  margin: "-1px",
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

/** Colour per status. `unavailable` is muted, not alarming: it is a fact, not an error. */
function statusColour(status: MetricStatus): string {
  switch (status) {
    case "complete":
      return "var(--green)";
    case "partial":
      return "var(--accent)";
    default:
      return "var(--muted)";
  }
}

export function StatusBadge({ status, reasonCode }: { status: MetricStatus; reasonCode?: string | null }) {
  const colour = statusColour(status);
  return (
    <span
      style={{
        display: "inline-flex",
        gap: "0.35rem",
        alignItems: "baseline",
        flexWrap: "wrap",
        border: `1px solid ${colour}`,
        borderRadius: "999px",
        padding: "0.05rem 0.5rem",
        color: colour,
        fontSize: "0.68rem",
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      <span>{status}</span>
      {reasonCode ? <span style={{ opacity: 0.85 }}>· {reasonCode}</span> : null}
    </span>
  );
}

/** `Recorded` provenance stamp. Never says `live` on these surfaces. */
export function RecordedStamp({ asOf }: { asOf: string }) {
  return (
    <span className="font-prose" style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
      <span
        className="stamp"
        style={{ color: "var(--green)", fontSize: "0.62rem", padding: "0.15rem 0.45rem", fontWeight: 800 }}
      >
        Recorded
      </span>
      <TermHelp termId="recorded" />
      <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
        as_of <code className="safe-wrap">{asOf}</code>
      </span>
    </span>
  );
}

/**
 * The value plus its evidentiary context.
 *
 * `sample_size`, `coverage` and the limitations are rendered as text, not only
 * as a `title`: a tooltip is not reachable by every input method, so the
 * caveats would otherwise be invisible to some readers.
 */
export function MetricValue({ metric, compact = false }: { metric: RenderedMetric; compact?: boolean }) {
  return (
    <span style={{ display: "grid", gap: "0.15rem" }}>
      <span
        className="safe-wrap"
        style={{
          fontWeight: 700,
          fontSize: compact ? "0.82rem" : "0.95rem",
          // An em dash must not read as a number, so it is dimmed and labelled.
          color: metric.is_missing ? "var(--muted)" : "var(--ink)",
        }}
      >
        {metric.text}
        {metric.is_missing ? <span style={VISUALLY_HIDDEN}> not observed</span> : null}
      </span>
      <StatusBadge status={metric.status} reasonCode={metric.reason_code} />
      <span className="font-prose" style={{ fontSize: "0.64rem", color: "var(--muted)" }}>
        n={metric.sample_size_text} · coverage={metric.coverage_text}
      </span>
    </span>
  );
}

/**
 * Full envelope disclosure.
 *
 * `<details>` is used rather than a custom toggle so it is keyboard-operable
 * and screen-reader-announced with no JavaScript.
 */
export function EnvelopeDetails({
  label,
  metric,
  termId,
}: {
  label: string;
  metric: RenderedMetric;
  termId?: TermId;
}) {
  return (
    <details style={SUNK_STYLE}>
      <summary style={{ cursor: "pointer", display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontWeight: 700, fontSize: "0.75rem" }}>{label}</span>
        {termId ? <TermHelp termId={termId} /> : null}
        <span className="safe-wrap" style={{ fontWeight: 700, color: metric.is_missing ? "var(--muted)" : "var(--ink)" }}>
          {metric.text}
        </span>
        <StatusBadge status={metric.status} reasonCode={metric.reason_code} />
      </summary>
      <dl
        className="font-prose"
        style={{ margin: "0.6rem 0 0", display: "grid", gap: "0.3rem", fontSize: "0.7rem", color: "var(--muted)" }}
      >
        <Row term="unit" value={metric.unit} />
        <Row term="metric_status" value={metric.status} />
        <Row term="reason_code" value={metric.reason_code ?? NOT_APPLICABLE_TEXT} />
        <Row term="window" value={metric.window_text} />
        <Row term="as_of" value={metric.as_of_text} />
        <Row term="sample_size" value={metric.sample_size_text} />
        <Row term="coverage" value={metric.coverage_text} />
      </dl>
      {metric.limitations.length > 0 ? (
        <div className="font-prose" style={{ marginTop: "0.5rem" }}>
          <p style={{ margin: "0 0 0.25rem", fontSize: "0.68rem", fontWeight: 700 }}>limitations</p>
          <ul style={{ margin: 0, paddingInlineStart: "1.1rem", display: "grid", gap: "0.2rem" }}>
            {metric.limitations.map((item, index) => (
              <li key={index} className="safe-wrap" style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </details>
  );
}

function Row({ term, value }: { term: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
      <dt style={{ minWidth: "7rem", fontWeight: 700 }}>{term}</dt>
      <dd className="safe-wrap" style={{ margin: 0 }}>
        {value}
      </dd>
    </div>
  );
}

/** A named field group (Outcome / Attribution / Fit). */
export function FieldGroup({
  id,
  title,
  termId,
  intro,
  status,
  reasonCode,
  children,
  limitations,
}: {
  id: string;
  title: string;
  termId?: TermId;
  intro: ReactNode;
  status?: MetricStatus;
  reasonCode?: string | null;
  children: ReactNode;
  limitations?: string[];
}) {
  return (
    <section aria-labelledby={`${id}-heading`} style={{ ...CARD_STYLE, display: "grid", gap: "0.75rem" }}>
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
        <h2 id={`${id}-heading`} style={{ margin: 0, fontSize: "1rem", letterSpacing: "0.02em" }}>
          {title}
        </h2>
        {termId ? <TermHelp termId={termId} /> : null}
        {status ? <StatusBadge status={status} reasonCode={reasonCode} /> : null}
      </div>
      <div className="font-prose safe-wrap" style={{ fontSize: "0.74rem", color: "var(--muted)" }}>
        {intro}
      </div>
      {children}
      {limitations && limitations.length > 0 ? (
        <div style={SUNK_STYLE}>
          <p className="font-prose" style={{ margin: "0 0 0.3rem", fontSize: "0.7rem", fontWeight: 700 }}>
            组级限制
          </p>
          <ul className="font-prose" style={{ margin: 0, paddingInlineStart: "1.1rem", display: "grid", gap: "0.25rem" }}>
            {limitations.map((item, index) => (
              <li key={index} className="safe-wrap" style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

/** Render a raw envelope straight into a disclosure. */
export function EnvelopeField({
  label,
  envelope,
  display,
  termId,
}: {
  label: string;
  envelope: AnyEnvelope;
  display: MetricDisplay;
  termId?: TermId;
}) {
  return <EnvelopeDetails label={label} metric={renderMetric(envelope, display)} termId={termId} />;
}

export { MISSING_TEXT, NOT_APPLICABLE_TEXT };
