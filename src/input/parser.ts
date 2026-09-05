import { InputRef, isWalletAddress } from "@/src/contracts";

export interface ParseInputSuccess {
  ok: true;
  value: InputRef;
}

export interface ParseInputFailure {
  ok: false;
  code: "invalid_input";
  message: string;
}

export type ParseInputResult = ParseInputSuccess | ParseInputFailure;

const HOSTS = new Set(["polymarket.com", "www.polymarket.com"]);

export function parseInput(rawValue: string): ParseInputResult {
  const raw = rawValue.trim();
  if (!raw) return { ok: false, code: "invalid_input", message: "Input is required." };

  if (isWalletAddress(raw)) {
    return {
      ok: true,
      value: { kind: "wallet", raw, normalized_id: raw.toLowerCase(), source_url: null },
    };
  }

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, code: "invalid_input", message: "Use a Polymarket URL or a 0x wallet address." };
  }

  if (url.protocol !== "https:" || !HOSTS.has(url.hostname.toLowerCase())) {
    return { ok: false, code: "invalid_input", message: "Only https://polymarket.com URLs are supported." };
  }

  const segments = url.pathname.split("/").filter(Boolean);
  const category = segments[0]?.toLowerCase();
  const slug = segments[1]?.trim();
  if (!slug) return { ok: false, code: "invalid_input", message: "The Polymarket URL is missing its identifier." };

  if (category === "market" || category === "event") {
    return {
      ok: true,
      value: { kind: "market", raw, normalized_id: slug, source_url: url.toString() },
    };
  }

  if (category === "profile") {
    const normalized = isWalletAddress(slug) ? slug.toLowerCase() : slug;
    return {
      ok: true,
      value: { kind: "profile", raw, normalized_id: normalized, source_url: url.toString() },
    };
  }

  return { ok: false, code: "invalid_input", message: "Supported paths are /market, /event and /profile." };
}

export function walletAddressFromInput(input: InputRef): string | null {
  if (input.kind === "wallet" && isWalletAddress(input.normalized_id)) return input.normalized_id;
  if (input.kind === "profile" && isWalletAddress(input.normalized_id)) return input.normalized_id;
  return null;
}
