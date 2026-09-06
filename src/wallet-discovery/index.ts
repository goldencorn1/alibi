/**
 * Wallet Discovery — recorded data layer.
 *
 * Read-only over fixtures generated from captured artifacts. No network access,
 * no clock reads: every `as_of` is derived from stored response headers.
 */
export {
  ATTRIBUTION_FIXTURE_WALLETS,
  DETAIL_WALLET,
  LEADERBOARD_FIXTURE,
  WALLET_FIXTURE,
} from "@/src/wallet-discovery/fixture-loader";
export type {
  ActivityObservation,
  ClosedPositionsObservation,
  LeaderboardFixture,
  LeaderboardFixtureRow,
  TradesObservation,
  WalletFixture,
} from "@/src/wallet-discovery/fixture-types";
export { DETAIL_WALLET_METRICS } from "@/src/wallet-discovery/outcome-metrics";
export type { WalletOutcomeMetrics } from "@/src/wallet-discovery/outcome-metrics";
export { getDetailWallets, getRecordedLeaderboard } from "@/src/wallet-discovery/leaderboard-service";
export type {
  DetailCapability,
  DetailWalletEntry,
  LeaderboardServiceRow,
  LeaderboardView,
} from "@/src/wallet-discovery/leaderboard-service";
