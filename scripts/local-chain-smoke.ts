import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { createPublicClient, createWalletClient, http, type Abi, type Address, type Hex } from "viem";

const rpcUrl = process.env.LOCAL_CHAIN_RPC_URL ?? "http://127.0.0.1:8545";
const chain = { id: 31337, name: "Hardhat Local", nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 }, rpcUrls: { default: { http: [rpcUrl] } } } as const;
const publicClient = createPublicClient({ chain, transport: http(rpcUrl) });

type Artifact = { abi: Abi; bytecode: string };
async function artifact(name: string): Promise<Artifact> {
  const file = path.join(process.cwd(), "artifacts", "contracts", "contracts", `${name}.sol`, `${name}.json`);
  return JSON.parse(await readFile(file, "utf8")) as Artifact;
}

async function deploy(name: string, args: readonly unknown[], account: Address): Promise<Address> {
  const item = await artifact(name);
  const wallet = createWalletClient({ account, chain, transport: http(rpcUrl) });
  const hash = await wallet.deployContract({ abi: item.abi, bytecode: item.bytecode as Hex, args: args as any, account });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  if (!receipt.contractAddress) throw new Error(`${name}_deployment_missing_address`);
  return receipt.contractAddress;
}

async function write(account: Address, address: Address, item: Artifact, functionName: string, args: readonly unknown[]): Promise<void> {
  const wallet = createWalletClient({ account, chain, transport: http(rpcUrl) });
  const hash = await wallet.writeContract({ address, abi: item.abi, functionName, args: args as any, account });
  await publicClient.waitForTransactionReceipt({ hash });
}

async function main() {
  const accounts = await publicClient.request({ method: "eth_accounts" } as any) as Address[];
  if (accounts.length < 2) throw new Error("local_chain_requires_two_unlocked_accounts");
  const owner = accounts[0];
  const buyer = accounts[1];
  const usdcArtifact = await artifact("TestUSDC");
  const anchorArtifact = await artifact("AlibiEvidenceAnchor");
  const subscriptionArtifact = await artifact("AlibiSubscription");
  const usdc = await deploy("TestUSDC", [], owner);
  const anchor = await deploy("AlibiEvidenceAnchor", [owner], owner);
  const subscription = await deploy("AlibiSubscription", [owner, usdc], owner);

  await write(owner, usdc, usdcArtifact, "mint", [buyer, 10_000n]);
  await write(buyer, usdc, usdcArtifact, "approve", [subscription, 10_000n]);
  await write(owner, anchor, anchorArtifact, "anchor", [`0x${"11".repeat(32)}` as Hex]);
  await write(buyer, subscription, subscriptionArtifact, "subscribe", []);

  const anchoredAt = await publicClient.readContract({ address: anchor, abi: anchorArtifact.abi, functionName: "anchoredAt", args: [`0x${"11".repeat(32)}` as Hex] }) as bigint;
  const expiresAt = await publicClient.readContract({ address: subscription, abi: subscriptionArtifact.abi, functionName: "expiresAt", args: [buyer] }) as bigint;
  const ownerReadback = await publicClient.readContract({ address: anchor, abi: anchorArtifact.abi, functionName: "owner" }) as Address;
  const subscribed = await publicClient.readContract({ address: subscription, abi: subscriptionArtifact.abi, functionName: "isSubscribed", args: [buyer] }) as boolean;
  const report = { status: anchoredAt > 0n && expiresAt > 0n && ownerReadback.toLowerCase() === owner.toLowerCase() && subscribed ? "passed" : "failed", chain_id: 31337, external_chain_transactions: 0, contracts: { usdc, anchor, subscription }, owner, buyer, anchor_readback: anchoredAt > 0n, subscription_readback: expiresAt > 0n, owner_readback: ownerReadback, subscribed, public_network: false };
  await writeFile(path.join(process.cwd(), "artifacts", "verification", "contracts-local-chain.json"), JSON.stringify(report, null, 2), "utf8");
  console.log(JSON.stringify(report));
  if (report.status !== "passed") process.exitCode = 1;
}

main().catch((error) => { console.error(error instanceof Error ? error.message : String(error)); process.exitCode = 1; });
