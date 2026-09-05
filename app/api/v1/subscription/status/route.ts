import { NextResponse } from "next/server";
import { TESTNET_USDC_ADDRESS, PAYMENT_NETWORK } from "@/src/config";

export const runtime = "nodejs";
export async function GET() { return NextResponse.json({ kind: "subscription-status", status: "not_enabled", data_status: "recorded", network: PAYMENT_NETWORK, asset: TESTNET_USDC_ADDRESS, contract_address: process.env.ALIBI_SUBSCRIPTION_CONTRACT_ADDRESS ?? null, limitation: "A local or Base Sepolia contract address is required for subscription verification." }); }
