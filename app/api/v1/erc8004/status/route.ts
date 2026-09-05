import { NextResponse } from "next/server";
import { erc8004Status } from "@/src/erc8004/status";

export const runtime = "nodejs";
export async function GET() { return NextResponse.json(erc8004Status(), { headers: { "cache-control": "no-store" } }); }
