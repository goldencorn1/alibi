import { x402Client, x402HTTPClient } from "@x402/fetch";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import { toClientEvmSigner } from "@x402/evm";
import { baseSepolia } from "viem/chains";
import { createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { assertAllowedPayment } from "@/src/payment/policy";
import { PAYMENT_NETWORK, TESTNET_USDC_ATOMIC_AMOUNT } from "@/src/config";

function requireConfig() {
  const baseUrl = process.env.APP_BASE_URL || "http://127.0.0.1:3000";
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL;
  const payTo = process.env.ALIBI_PAYMENT_ADDRESS;
  const key = process.env.BUYER_AGENT_PRIVATE_KEY;
  if (!rpcUrl || !payTo || !key) throw new Error("Missing approved Web payment configuration; no signing attempted.");
  if (!/^0x[a-fA-F0-9]{64}$/.test(key)) throw new Error("Buyer private key format is invalid; no signing attempted.");
  return { baseUrl, rpcUrl, payTo, key: key as `0x${string}` };
}

async function main() {
  try {
    const config = requireConfig();
    const account = privateKeyToAccount(config.key);
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(config.rpcUrl) });
    if (await publicClient.getChainId() !== 84532) throw new Error("Configured RPC is not Base Sepolia; no signing attempted.");
    const signer = toClientEvmSigner(account, publicClient);
    const client = new x402Client();
    registerExactEvmScheme(client, { signer, networks: [PAYMENT_NETWORK], schemeOptions: { rpcUrl: config.rpcUrl } });
    const httpClient = new x402HTTPClient(client);
    const response = await fetch(`${config.baseUrl}/attribution`, { method: "POST", headers: { "content-type": "application/json", "x-alibi-input": "0x674887d1ac838099a48b629dff53f25b7b87ee08", "x-alibi-mode": "recorded" }, body: JSON.stringify({ input: "0x674887d1ac838099a48b629dff53f25b7b87ee08", mode: "recorded" }) });
    if (response.status !== 402) throw new Error(`Expected HTTP 402, received ${response.status}.`);
    const paymentRequired = httpClient.getPaymentRequiredResponse((name) => response.headers.get(name));
    if (new URL(paymentRequired.resource.url).pathname !== "/attribution") throw new Error("Payment resource does not match /attribution.");
    const requirement = paymentRequired.accepts.find((candidate) => candidate.scheme === "exact");
    if (!requirement) throw new Error("No exact payment option was offered.");
    assertAllowedPayment(requirement, config.payTo, "/attribution");
    const payload = await httpClient.createPaymentPayload(paymentRequired);
    const headers = httpClient.encodePaymentSignatureHeader(payload);
    console.log(JSON.stringify({ status: "payment-payload-ready", network: PAYMENT_NETWORK, amount: TESTNET_USDC_ATOMIC_AMOUNT, header_name: Object.keys(headers)[0], paste_into_ui: "PAYMENT-SIGNATURE header value generated locally; never paste a private key." }));
    void headers;
  } catch (error) {
    console.log(JSON.stringify({ status: "blocked", reason: error instanceof Error ? error.message : "unknown" }));
    process.exitCode = 2;
  }
}

main();
