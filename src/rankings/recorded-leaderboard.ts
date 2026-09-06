/**
 * Recorded public leaderboard snapshot captured by the wallet-discovery audit.
 *
 * These are display-only source fields. They are not Alibi wallet metrics and
 * must never be presented as live data or used to infer identity, strategy, or
 * performance beyond the source response itself.
 */
export interface RecordedLeaderboardRow {
  rank: number;
  wallet: string;
  username: string | null;
  x_username: string | null;
  verified_badge: boolean;
  volume_usd: number;
  pnl_usd: number;
  data_status: "recorded";
}

export const RECORDED_LEADERBOARD_CAPTURED_AT = "2026-09-05T16:14:12.000Z";
export const RECORDED_LEADERBOARD_SOURCE = "https://data-api.polymarket.com/v1/leaderboard?window=30d&limit=50&offset=0";
export const RECORDED_DETAIL_WALLETS = [
  "0x674887d1ac838099a48b629dff53f25b7b87ee08",
  "0xc69bd5567b40ef4d11922eaa57e1f9be1c642076",
] as const;

export const RECORDED_LEADERBOARD: readonly RecordedLeaderboardRow[] = [
  { rank: 1, wallet: "0xfe787d2da716d60e8acff57fb87eb13cd4d10319", username: "ferrariChampions2026", x_username: null, verified_badge: false, volume_usd: 3122297.4296160014, pnl_usd: 118281.82650032046, data_status: "recorded" },
  { rank: 2, wallet: "0x3dfb153c197d4c19d3b31c1ecd2c7b6860eeabaf", username: "0x3DFb153c197D4C19D3B31c1ecD2c7B6860eeabAf-1722957908185", x_username: null, verified_badge: false, volume_usd: 1062824.1708999998, pnl_usd: 90867.95710786711, data_status: "recorded" },
  { rank: 3, wallet: "0x924379a79c64b77ad5816ad362122a5f6228658e", username: "Kch-Temp", x_username: null, verified_badge: false, volume_usd: 470761.731929, pnl_usd: 84558.25156421342, data_status: "recorded" },
  { rank: 4, wallet: "0x5e9458202b5817a72cf81105ec8a30e6f3705ba1", username: "pleaseplease123", x_username: null, verified_badge: false, volume_usd: 9.25, pnl_usd: 71963.59959939285, data_status: "recorded" },
  { rank: 5, wallet: "0x076daa87c4fe1a85402a9b6b8e0a866224388d4c", username: null, x_username: null, verified_badge: false, volume_usd: 877238.2112660004, pnl_usd: 71065.88508861307, data_status: "recorded" },
  { rank: 6, wallet: "0x67ac9e1ad7d7e74ef0215d14fc8edb538e4fedf1", username: "fkcvffcjt", x_username: null, verified_badge: false, volume_usd: 335976.575581, pnl_usd: 69810.9032370371, data_status: "recorded" },
  { rank: 7, wallet: "0x5a218c7ad04135830a45c41aaed7294df7809318", username: "balthazar", x_username: "balthazarpoly", verified_badge: false, volume_usd: 102323.100444, pnl_usd: 66206.20655153083, data_status: "recorded" },
  { rank: 8, wallet: "0x9bb1bc70c9e098f2f297416d06a0aa3992534dbe", username: "0b1", x_username: null, verified_badge: false, volume_usd: 879361.910223, pnl_usd: 65805.54540444018, data_status: "recorded" },
  { rank: 9, wallet: "0xb0c85813a7a4428f1139ff91d3118a92c391fe7f", username: "suhail-frenz-account187", x_username: null, verified_badge: false, volume_usd: 140496.336303, pnl_usd: 59502.39658403245, data_status: "recorded" },
  { rank: 10, wallet: "0x29b52d98ac9ef9414b04164246c95bc63d74cc6c", username: "0x29b52d…", x_username: null, verified_badge: false, volume_usd: 370347.01422, pnl_usd: 54889.55637207138, data_status: "recorded" },
  { rank: 11, wallet: "0xb9392e612a5b05063ca012b5dede548e16e5da70", username: "IcemanSeason", x_username: null, verified_badge: false, volume_usd: 0, pnl_usd: 52715.405339049, data_status: "recorded" },
  { rank: 12, wallet: "0x52ecea7b3159f09db589e4f4ee64872fd0bba6f3", username: "fkigedgjdgwbg", x_username: null, verified_badge: false, volume_usd: 755710.66315, pnl_usd: 46653.65645925687, data_status: "recorded" },
  { rank: 13, wallet: "0x2dfa4e79eca44b7c774f40a45535adbc368a6f60", username: "BillyGating", x_username: null, verified_badge: false, volume_usd: 0, pnl_usd: 46499.95000867522, data_status: "recorded" },
  { rank: 14, wallet: "0x6d3c5bd13984b2de47c3a88ddc455309aab3d294", username: "VeryLucky888", x_username: "TheVeryLucky888", verified_badge: false, volume_usd: 1749090.353152999, pnl_usd: 46381.905633709684, data_status: "recorded" },
  { rank: 15, wallet: "0xe72bb501df5306c75c89383d48a1e81073fbb0a0", username: "norrisfan", x_username: "BitalikWuterin", verified_badge: false, volume_usd: 110042.997825, pnl_usd: 46073.814912329684, data_status: "recorded" },
  { rank: 16, wallet: "0xd3b034d7bfb2473fb252d0414646d9786bac329e", username: "Sunshine.Smile", x_username: null, verified_badge: false, volume_usd: 209931.866379, pnl_usd: 46017.87076474039, data_status: "recorded" },
  { rank: 17, wallet: "0x2005d16a84ceefa912d4e380cd32e7ff827875ea", username: "RN1", x_username: "RN1polymarket", verified_badge: false, volume_usd: 2993708.4303869978, pnl_usd: 44046.5623284335, data_status: "recorded" },
  { rank: 18, wallet: "0xb52e8b3afd9f0f0d502a5a76494b42816d67285c", username: "1l2ihj34li12u34", x_username: null, verified_badge: false, volume_usd: 149256.566959, pnl_usd: 43091.04973507768, data_status: "recorded" },
  { rank: 19, wallet: "0x203b0141b5a1301ca7dbbab6908a2443982646e1", username: "DanNgl", x_username: null, verified_badge: false, volume_usd: 144496.256811, pnl_usd: 42422.105190886374, data_status: "recorded" },
  { rank: 20, wallet: "0x0e604be17c231a33dc01e38a722c7fe3984e3bad", username: "0xwise", x_username: null, verified_badge: false, volume_usd: 196957.84046500002, pnl_usd: 41729.19820393925, data_status: "recorded" },
];
