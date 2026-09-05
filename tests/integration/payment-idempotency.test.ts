import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { resetPaymentIdempotencyForTests, withPaymentIdempotency } from "@/src/payment/idempotency";

function request(body: unknown, id = "id-1") {
  return new NextRequest("http://localhost/attribution", { method: "POST", headers: { "content-type": "application/json", "x-alibi-mode": "recorded", "PAYMENT-IDENTIFIER": id }, body: JSON.stringify(body) });
}

describe("bounded payment identifier replay", () => {
  it("replays the same terminal response and does not call the handler twice", async () => {
    resetPaymentIdempotencyForTests();
    let calls = 0;
    const handler = async () => { calls += 1; return new Response(JSON.stringify({ ok: true, calls }), { status: 200, headers: { "PAYMENT-REQUIRED": "redacted" } }); };
    const first = await withPaymentIdempotency(request({ input: "x" }), "/attribution", handler);
    const second = await withPaymentIdempotency(request({ input: "x" }), "/attribution", handler);
    expect(calls).toBe(1);
    expect(await first.text()).toBe(await second.text());
    expect(second.headers.get("PAYMENT-REQUIRED")).toBe("redacted");
  });

  it("fails closed for an identifier reused with a different request", async () => {
    resetPaymentIdempotencyForTests();
    let calls = 0;
    const handler = async () => { calls += 1; return new Response("ok", { status: 200 }); };
    await withPaymentIdempotency(request({ input: "x" }, "conflict"), "/attribution", handler);
    const response = await withPaymentIdempotency(request({ input: "y" }, "conflict"), "/attribution", handler);
    expect(response.status).toBe(409);
    expect((await response.json()).error.code).toBe("payment_invalid");
    expect(calls).toBe(1);
  });

  it("coalesces concurrent duplicate requests", async () => {
    resetPaymentIdempotencyForTests();
    let calls = 0;
    const handler = async () => { calls += 1; await new Promise((resolve) => setTimeout(resolve, 5)); return new Response("done", { status: 200 }); };
    const [first, second] = await Promise.all([withPaymentIdempotency(request({ input: "z" }, "race"), "/attribution", handler), withPaymentIdempotency(request({ input: "z" }, "race"), "/attribution", handler)]);
    expect(calls).toBe(1);
    expect(await first.text()).toBe("done");
    expect(await second.text()).toBe("done");
  });
});
