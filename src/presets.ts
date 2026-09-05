import { PresetDemo } from "@/src/contracts";

export const DEMO_PRESETS: PresetDemo[] = [
  {
    id: "market",
    label: "Market timeline",
    description: "Polymarket market preset; read-only repricing windows.",
    input: "https://polymarket.com/event/will-there-be-no-change-in-fed-interest-rates-after-the-september-2026-meeting-615",
    kind: "market",
    mode: "recorded",
  },
  {
    id: "wallet-a",
    label: "Wallet A",
    description: "Public wallet input; coverage gate is shown before any conclusion.",
    input: "0x674887d1ac838099a48b629dff53f25b7b87ee08",
    kind: "wallet",
    mode: "recorded",
  },
  {
    id: "wallet-b",
    label: "Wallet B",
    description: "Second wallet preset for comparison without identity inference.",
    input: "0xc69bd5567b40ef4d11922eaa57e1f9be1c642076",
    kind: "wallet",
    mode: "recorded",
  },
];
