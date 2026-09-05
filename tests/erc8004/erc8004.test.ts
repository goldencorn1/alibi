import { describe, expect, it } from "vitest";
import { ERC8004_CHAIN_ID, ERC8004_VALIDATION, IDENTITY_REGISTRY, REPUTATION_REGISTRY } from "@/src/erc8004/registry-config";
import { validateErc8004WalletRelation } from "@/src/erc8004/wallet";
import { registrationDocument } from "@/src/erc8004/registration-schema";

describe("ERC-8004 bounded integration", () => {
  it("locks the approved registries and validation boundary", () => { expect(ERC8004_CHAIN_ID).toBe(84532); expect(IDENTITY_REGISTRY).toBe("0x8004A818BFB912233c491871b3d84c89A494BD9e"); expect(REPUTATION_REGISTRY).toBe("0x8004B663056A597Dffe9eCcC1965A193B7388713"); expect(ERC8004_VALIDATION).toBe("not_enabled"); });
  it("requires owner=payment and a distinct client", () => { const owner = "0x0000000000000000000000000000000000000001"; const client = "0x0000000000000000000000000000000000000002"; expect(validateErc8004WalletRelation(owner, owner, client).ok).toBe(true); expect(validateErc8004WalletRelation(owner, "0x0000000000000000000000000000000000000003", client).ok).toBe(false); });
  it("exposes one root identity and no validation claim", () => { const doc = registrationDocument(); expect(doc.name).toBe("Alibi Evidence Agent"); expect(doc.registrations.validation).toBe("not_enabled"); });
});
