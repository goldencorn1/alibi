export const DECIMAL_SCALE = 1_000_000n;

export function parseFixed(value: string | number, scale = DECIMAL_SCALE): bigint | null {
  const raw = typeof value === "number" ? String(value) : value.trim();
  if (!/^[+-]?(?:\d+)(?:\.\d+)?$/.test(raw)) return null;
  const negative = raw.startsWith("-");
  const unsigned = raw.replace(/^[+-]/, "");
  const [whole, fraction = ""] = unsigned.split(".");
  if (fraction.length > 6) return null;
  const units = BigInt(whole) * scale + BigInt(fraction.padEnd(6, "0") || "0");
  return negative ? -units : units;
}

export function compareFixed(left: bigint, right: bigint): -1 | 0 | 1 {
  return left < right ? -1 : left > right ? 1 : 0;
}

export function multiplyFixed(left: bigint, right: bigint): bigint {
  return (left * right) / DECIMAL_SCALE;
}

export function fixedToString(value: bigint, fractionDigits = 6): string {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const whole = absolute / DECIMAL_SCALE;
  const fraction = (absolute % DECIMAL_SCALE).toString().padStart(6, "0").slice(0, fractionDigits);
  const trimmed = fraction.replace(/0+$/, "");
  return (negative ? "-" : "") + whole.toString() + (trimmed ? "." + trimmed : "");
}

export function fixedToNumber(value: bigint): number {
  return Number(value) / Number(DECIMAL_SCALE);
}

