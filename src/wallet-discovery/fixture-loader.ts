import leaderboardJson from "@/fixtures/recorded/leaderboard-30d.json";
import walletJson from "@/fixtures/recorded/wallet-0xfe787d2da716d60e8acff57fb87eb13cd4d10319.json";
import { LeaderboardFixture, WalletFixture } from "@/src/wallet-discovery/fixture-types";

/**
 * The one wallet in this capture that has enough observed data to support
 * Outcome metrics. Every other leaderboard row is display-only.
 */
export const DETAIL_WALLET = "0xfe787d2da716d60e8acff57fb87eb13cd4d10319";

/**
 * Wallets carrying `markets`/`prices`/`trades`/`evidence` from the earlier
 * capture, which is what Attribution needs.
 *
 * MEASURED: neither appears in the recorded top-50 leaderboard response, so
 * neither has a rank. They are surfaced with `rank: null` rather than being
 * given a fabricated position.
 */
export const ATTRIBUTION_FIXTURE_WALLETS = [
  "0xc69bd5567b40ef4d11922eaa57e1f9be1c642076",
  "0x674887d1ac838099a48b629dff53f25b7b87ee08",
] as const;

/**
 * A JSON import widens string literals to `string`, so the fixture cannot be
 * assigned to its interface without a cast. Rather than cast the check away,
 * assert the invariants that matter at load time: a fixture that has silently
 * become `synthetic`, or lost its provenance, must fail loudly instead of
 * flowing into the UI as if it were recorded.
 */
function assertRecordedFixture(value: unknown, label: string): void {
  if (typeof value !== "object" || value === null) {
    throw new Error(`Fixture ${label} is not an object.`);
  }
  const record = value as Record<string, unknown>;
  if (record.fixture_status !== "recorded") {
    throw new Error(`Fixture ${label} has fixture_status=${String(record.fixture_status)}; expected "recorded".`);
  }
  if (record.data_status !== "recorded") {
    throw new Error(`Fixture ${label} has data_status=${String(record.data_status)}; expected "recorded".`);
  }
  const serialized = JSON.stringify(record);
  if (/synthetic/i.test(serialized)) {
    throw new Error(`Fixture ${label} contains the string "synthetic"; recorded fixtures must not.`);
  }
}

assertRecordedFixture(leaderboardJson, "leaderboard-30d.json");
assertRecordedFixture(walletJson, `wallet-${DETAIL_WALLET}.json`);

export const LEADERBOARD_FIXTURE = leaderboardJson as unknown as LeaderboardFixture;
export const WALLET_FIXTURE = walletJson as unknown as WalletFixture;

if (LEADERBOARD_FIXTURE.rows.length === 0) {
  throw new Error("leaderboard-30d.json contains no rows.");
}
if (WALLET_FIXTURE.wallet.toLowerCase() !== DETAIL_WALLET) {
  throw new Error(`wallet fixture is for ${WALLET_FIXTURE.wallet}, expected ${DETAIL_WALLET}.`);
}
