import { isWalletAddress } from "@/src/contracts";

export function validateErc8004WalletRelation(owner: string | null, payment: string | null, client: string | null): { ok: boolean; reason: string } {
  if (!owner || !payment || !client) return { ok: false, reason: "owner_payment_client_required" };
  if (!isWalletAddress(owner) || !isWalletAddress(payment) || !isWalletAddress(client)) return { ok: false, reason: "public_evm_address_required" };
  if (owner.toLowerCase() !== payment.toLowerCase()) return { ok: false, reason: "owner_must_equal_payment_address" };
  if (owner.toLowerCase() === client.toLowerCase()) return { ok: false, reason: "client_must_differ_from_owner" };
  return { ok: true, reason: "owner_payment_equal_client_distinct" };
}
