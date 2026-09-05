import { NextResponse } from "next/server";
import { registrationDocument } from "@/src/erc8004/registration-schema";

export const runtime = "nodejs";
export async function GET() { return NextResponse.json(registrationDocument(), { headers: { "cache-control": "no-store" } }); }
