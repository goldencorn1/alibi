import { describe, expect, it } from "vitest";
import { uiStateFromResponse } from "@/src/ui/state";

describe("single-page UI state mapping", () => {
  it("maps HTTP and report outcomes to the approved six states", () => {
    expect(uiStateFromResponse(402, {})).toBe("payment_required");
    expect(uiStateFromResponse(400, { error: { code: "invalid_input" } })).toBe("error");
    expect(uiStateFromResponse(200, { unattributed_count: 1 })).toBe("unattributed");
    expect(uiStateFromResponse(200, { wallet_metrics: { status: "insufficient_evidence" } })).toBe("insufficient");
    expect(uiStateFromResponse(200, { unattributed_count: 0 })).toBe("success");
  });
});
