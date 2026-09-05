import { x402Client, x402HTTPClient } from "@x402/fetch";
import { wrapFetchWithPayment } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { toClientEvmSigner } from "@x402/evm";
import { baseSepolia } from "viem/chains";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { assertAllowedPayment } from "@/src/payment/policy";
import { PAYMENT_NETWORK, TESTNET_USDC_ADDRESS, TESTNET_USDC_ATOMIC_AMOUNT } from "@/src/config";

const ZERO = "0x0000000000000000000000000000000000000000";
const tokenAbi = [{ type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "balance", type: "uint256" }] }] as const;

function requireConfig(): { baseUrl: string; rpcUrl: string; payTo: string; key: `0x${string}` } {
  const baseUrl = process.env.APP_BASE_URL || "http://127.0.0.1:3000";
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
  const payTo = process.env.ALIBI_PAYMENT_ADDRESS;
  const key = process.env.BUYER_AGENT_PRIVATE_KEY;
  if (!rpcUrl || !payTo || !key) throw new Error("Missing approved Base Sepolia buyer configuration; no signing attempted.");
  if (!/^0x[a-fA-F0-9]{64}$/.test(key)) throw new Error("Buyer private key format is invalid; no signing attempted.");
  return { baseUrl, rpcUrl, payTo, key: key as `0x${string}` };
}

async function main() {
  try {
    const config = requireConfig();
    const account = privateKeyToAccount(config.key);
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(config.rpcUrl) });
    const chainId = await publicClient.getChainId();
    if (chainId !== 84532) throw new Error("Configured RPC is not Base Sepolia; no signing attempted.");
    const balance = await publicClient.readContract({ address: TESTNET_USDC_ADDRESS, abi: tokenAbi, functionName: "balanceOf", args: [account.address] });
    if (balance < BigInt(TESTNET_USDC_ATOMIC_AMOUNT)) throw new Error("Buyer wallet lacks the required test USDC; no signing attempted.");
    const signer = toClientEvmSigner(account, publicClient);
    const client = new x402Client();
    registerExactEvmScheme(client, {
      signer,
      networks: [PAYMENT_NETWORK],
      paymentRequirementsSelector: (_version, requirements) => {
        const requirement = requirements.find((candidate) => candidate.scheme === "exact");
        if (!requirement) throw new Error("No exact payment option was offered.");
        if (requirement.payTo.toLowerCase() === ZERO) throw new Error("Server did not provide a configured payTo address.");
        assertAllowedPayment(requirement, config.payTo, "/attribution");
        return requirement;
      },
      schemeOptions: { rpcUrl: config.rpcUrl },
    });
    const paidFetch = wrapFetchWithPayment(globalThis.fetch, new x402HTTPClient(client));
    const response = await paidFetch(`${config.baseUrl}/attribution`, { method: "POST", headers: { "content-type": "application/json", "x-alibi-input": "0x674887d1ac838099a48b629dff53f25b7b87ee08", "x-alibi-mode": "recorded" }, body: JSON.stringify({ input: "0x674887d1ac838099a48b629dff53f25b7b87ee08", mode: "recorded" }) });
    console.log(JSON.stringify({ status: response.status, network: PAYMENT_NETWORK, amount: TESTNET_USDC_ATOMIC_AMOUNT, asset: TESTNET_USDC_ADDRESS, detail_schema: response.ok ? "detail-response" : "payment-not-settled" }));
    if (!response.ok) process.exitCode = 2;
  } catch (error) {
    console.log(JSON.stringify({ status: "blocked", reason: error instanceof Error ? error.message : "unknown" }));
    process.exitCode = 2;
  }
}

main();
