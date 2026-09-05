import { NextResponse } from "next/server";
import { PAYMENT_NETWORK, PAYMENT_PRICE, TESTNET_USDC_ADDRESS, TESTNET_USDC_ATOMIC_AMOUNT } from "@/src/config";

export const runtime = "nodejs";
export async function POST() { return NextResponse.json({ kind: "subscription-prepare", status: "requires_wallet_confirmation", data_status: "recorded", chain_id: 84532, network: PAYMENT_NETWORK, price: PAYMENT_PRICE, asset: TESTNET_USDC_ADDRESS, amount: TESTNET_USDC_ATOMIC_AMOUNT, contract_address: process.env.ALIBI_SUBSCRIPTION_CONTRACT_ADDRESS ?? null, transaction: null, limitation: "No transaction is sent by the API; the wallet must review and sign an approved testnet transaction." }, { status: 200 }); }
