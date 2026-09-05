import { NextRequest, NextResponse } from "next/server";
import { errorResponse } from "@/src/contracts";

export const runtime = "nodejs";
export async function POST(request: NextRequest): Promise<Response> { let body: unknown; try { body = await request.json(); } catch { return errorResponse("invalid_input", "Request body must be valid JSON.", "recorded", false, 400); } const txHash = body && typeof body === "object" && typeof (body as Record<string, unknown>).tx_hash === "string" ? (body as Record<string, unknown>).tx_hash as string : ""; if (!/^0x[a-fA-F0-9]{64}$/.test(txHash)) return errorResponse("invalid_input", "tx_hash must be a 32-byte public transaction hash.", "recorded", false, 400); return NextResponse.json({ kind: "subscription-verification", status: "unavailable", data_status: "recorded", tx_hash: txHash, limitation: "RPC and a deployed approved contract are required; no verification claim is made." }, { status: 503 }); }
