export const ERC8004_CHAIN_ID = 84532 as const;
export const IDENTITY_REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e" as const;
export const REPUTATION_REGISTRY = "0x8004B663056A597Dffe9eCcC1965A193B7388713" as const;
export const ERC8004_VALIDATION = "not_enabled" as const;
export const ERC8004_AGENT_NAME = "Alibi Evidence Agent" as const;

export function isSupportedRegistry(address: string): boolean { return address.toLowerCase() === IDENTITY_REGISTRY.toLowerCase() || address.toLowerCase() === REPUTATION_REGISTRY.toLowerCase(); }
