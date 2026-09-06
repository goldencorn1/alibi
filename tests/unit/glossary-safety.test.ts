import { describe, expect, it } from "vitest";
import { GLOSSARY, coverageReport, glossaryEntry, pendingDefinitionCount, type TermId } from "@/src/ui/glossary";
import { DICTIONARY, SUPPORTED_LOCALES, type Locale } from "@/src/ui/i18n";

/**
 * Safety invariants for the approved glossary.
 *
 * These assertions are deliberately structural: they hold for every current
 * entry and must keep holding for any term added later, by any author. They
 * encode the output policy (no causal claims, no investment advice, no
 * accusation) as machine-checkable rules rather than review conventions.
 */

type StringSite = { where: string; text: string };

/** Every user-visible string in the glossary, tagged with its origin for failure messages. */
function glossaryStrings(): StringSite[] {
  const sites: StringSite[] = [];
  for (const [key, item] of Object.entries(GLOSSARY)) {
    for (const locale of SUPPORTED_LOCALES) {
      sites.push({ where: `GLOSSARY.${key}.label.${locale}`, text: item.label[locale] });
      sites.push({ where: `GLOSSARY.${key}.definition.${locale}`, text: item.definition[locale] });
      if (item.limitation) sites.push({ where: `GLOSSARY.${key}.limitation.${locale}`, text: item.limitation[locale] });
    }
  }
  return sites;
}

/** Every user-visible string in the UI dictionary. */
function dictionaryStrings(): StringSite[] {
  const sites: StringSite[] = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const [key, text] of Object.entries(DICTIONARY[locale])) {
      sites.push({ where: `DICTIONARY.${locale}.${key}`, text });
    }
  }
  return sites;
}

const ALL_SITES = [...glossaryStrings(), ...dictionaryStrings()];

describe("glossary structural integrity", () => {
  it("has no duplicate term ids", () => {
    const entries = Object.values(GLOSSARY);
    const ids = entries.map((item) => item.term_id);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    expect(duplicates, `duplicate term ids: ${[...new Set(duplicates)].join(", ")}`).toEqual([]);
    expect(new Set(ids).size).toBe(entries.length);
  });

  it("keys each entry under its own term_id", () => {
    for (const [key, item] of Object.entries(GLOSSARY)) {
      expect(item.term_id, `GLOSSARY.${key} is keyed under a mismatched term_id`).toBe(key);
    }
  });

  it("has zero pending definitions", () => {
    expect(pendingDefinitionCount()).toBe(0);
    const pending = Object.entries(GLOSSARY)
      .filter(([, item]) => item.display !== "approved")
      .map(([key]) => key);
    expect(pending, `entries not approved: ${pending.join(", ")}`).toEqual([]);
  });

  it("reports PASS with no unmapped or duplicate console terms", () => {
    const report = coverageReport();
    expect(report.duplicate_term_ids).toEqual([]);
    expect(report.unmapped_terms, `unmapped: ${report.unmapped_terms.join(", ")}`).toEqual([]);
    expect(report.pending_definition).toBe(0);
    expect(report.status).toBe("PASS");
  });
});

describe("bilingual completeness", () => {
  it("provides a non-empty label and definition in every locale", () => {
    for (const [key, item] of Object.entries(GLOSSARY)) {
      for (const locale of SUPPORTED_LOCALES) {
        expect(item.label[locale]?.trim(), `GLOSSARY.${key}.label.${locale} is empty`).toBeTruthy();
        expect(item.definition[locale]?.trim(), `GLOSSARY.${key}.definition.${locale} is empty`).toBeTruthy();
      }
    }
  });

  it("provides both locales whenever a limitation is present", () => {
    for (const [key, item] of Object.entries(GLOSSARY)) {
      if (!item.limitation) continue;
      for (const locale of SUPPORTED_LOCALES) {
        expect(item.limitation[locale]?.trim(), `GLOSSARY.${key}.limitation.${locale} is empty`).toBeTruthy();
      }
    }
  });

  it("keeps identical locale key sets on every entry", () => {
    const expected = [...SUPPORTED_LOCALES].sort();
    for (const [key, item] of Object.entries(GLOSSARY)) {
      expect(Object.keys(item.label).sort(), `GLOSSARY.${key}.label locales`).toEqual(expected);
      expect(Object.keys(item.definition).sort(), `GLOSSARY.${key}.definition locales`).toEqual(expected);
      if (item.limitation) {
        expect(Object.keys(item.limitation).sort(), `GLOSSARY.${key}.limitation locales`).toEqual(expected);
      }
    }
  });

  it("keeps identical key sets across dictionary locales", () => {
    const [first, ...rest] = SUPPORTED_LOCALES.map((locale) => Object.keys(DICTIONARY[locale]).sort());
    for (const keys of rest) expect(keys).toEqual(first);
  });

  it("carries no placeholder or untranslated marker text", () => {
    // A placeholder shipped to users is worse than an explicit "unavailable".
    const placeholders = [/\bTODO\b/i, /\bTBD\b/i, /\bFIXME\b/i, /\bXXX\b/, /\bWIP\b/i, /待补/, /占位/, /lorem ipsum/i];
    for (const site of ALL_SITES) {
      for (const pattern of placeholders) {
        expect(pattern.test(site.text), `${site.where} contains placeholder text: ${site.text}`).toBe(false);
      }
    }
  });
});

describe("output policy: no asserted claims about persons", () => {
  /**
   * Banned assertion phrasings. These are claims about what a wallet holder
   * knew, spoke, or is worth copying. Each is asserted individually so a
   * failure names the exact phrase.
   */
  const BANNED_ASSERTIONS = [
    "knew first",
    "speaks Chinese",
    "better judgment",
    "worth following",
    "decide whether to follow",
    "decide how to follow",
    "他是先知道",
    "先知道",
    "决定跟不跟",
    "决定怎么跟",
    "值不值得跟单",
  ] as const;

  for (const phrase of BANNED_ASSERTIONS) {
    it(`never asserts "${phrase}"`, () => {
      const hits = ALL_SITES.filter((site) => site.text.includes(phrase)).map((site) => site.where);
      expect(hits, `"${phrase}" found at: ${hits.join(", ")}`).toEqual([]);
    });
  }
});

describe("output policy: insider wording only under negation", () => {
  /**
   * "insider" / "内幕" are permitted only inside a disclaimer that denies the
   * claim. The regexes require a negator ahead of the term within the same
   * clause, so a sentence boundary between them does not count as negation.
   */
  const NEGATED_INSIDER_EN = /\b(?:not|never|no|nor)\b[^.;!?]{0,90}?insider/i;
  const NEGATED_INSIDER_ZH = /(?:不|非)[^。；;.!?]{0,48}?内幕/;

  const mentionsInsider = (text: string) => /insider/i.test(text) || text.includes("内幕");

  it("still ships the existing safety disclaimers", () => {
    // Guards against "fixing" this rule by deleting the disclaimers instead.
    const mentions = ALL_SITES.filter((site) => mentionsInsider(site.text));
    expect(mentions.length).toBeGreaterThanOrEqual(5);
  });

  it("negates every insider mention", () => {
    const violations = ALL_SITES.filter((site) => {
      if (!mentionsInsider(site.text)) return false;
      const englishOk = !/insider/i.test(site.text) || NEGATED_INSIDER_EN.test(site.text);
      const chineseOk = !site.text.includes("内幕") || NEGATED_INSIDER_ZH.test(site.text);
      return !(englishOk && chineseOk);
    });
    expect(
      violations.map((site) => `${site.where}: ${site.text}`),
      "insider wording must appear only in a negated clause",
    ).toEqual([]);
  });
});

describe("TermId surface is not narrowed", () => {
  /**
   * app/page-client.tsx resolves some ids at runtime via string construction
   * ("worker_" + agent_id) and error-code mapping, so these ids cannot be
   * removed without breaking the UI in ways tsc cannot see.
   */
  const WORKER_AGENT_IDS = [
    "input", "market-data", "repricing", "evidence", "attribution",
    "wallet-analysis", "policy-verification", "report", "payment",
  ] as const;

  it("resolves every runtime-constructed worker term id", () => {
    for (const agentId of WORKER_AGENT_IDS) {
      const termId = ("worker_" + agentId.replaceAll("-", "_")) as TermId;
      expect(GLOSSARY[termId], `${termId} is referenced by page-client at runtime`).toBeDefined();
      expect(glossaryEntry(termId).term_id).toBe(termId);
    }
  });

  it("resolves the error-code and state term ids the UI falls back to", () => {
    const required: TermId[] = [
      "error", "empty", "loading", "success", "unattributed", "insufficient_evidence",
      "indeterminate", "payment_required", "payment_invalid", "timeout",
      "provider_unavailable", "upstream_unavailable", "unavailable", "unsupported_language",
      "value_na", "value_none",
    ];
    for (const termId of required) {
      expect(GLOSSARY[termId], `${termId} must remain resolvable`).toBeDefined();
    }
  });

  it("resolves every cluster dimension term id", () => {
    const dimensions: TermId[] = [
      "same_side_ratio", "time_concentration", "median_profile_age_days",
      "first_trade_ratio", "entry_price_dispersion", "market_novelty_ratio",
    ];
    for (const termId of dimensions) {
      expect(GLOSSARY[termId], `${termId} is mapped from a cluster dimension`).toBeDefined();
    }
  });

  it("resolves the wallet-discovery and provenance term ids", () => {
    const required: TermId[] = [
      "wallet_discovery", "leaderboard", "recorded_snapshot", "wallet_detail",
      "data_provenance", "cutoff", "coverage", "lead_rate", "sample_size",
      "realized_pnl_7d", "median_exposure_minutes", "profile_age_days",
      "timestamp_uncertainty", "detail_not_captured", "discriminability",
    ];
    for (const termId of required) {
      expect(GLOSSARY[termId], `${termId} must remain resolvable`).toBeDefined();
    }
  });
});

describe("locale typing", () => {
  it("keeps zh-CN and en as the supported locales", () => {
    const locales: readonly Locale[] = SUPPORTED_LOCALES;
    expect([...locales]).toEqual(["zh-CN", "en"]);
  });
});
