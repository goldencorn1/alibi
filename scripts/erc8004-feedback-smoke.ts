import { reputationPlan } from "@/src/erc8004/reputation";
console.log(JSON.stringify({ action: "reputation_plan_only", plan: reputationPlan(), transactions_sent: 0, validation: "not_enabled" }, null, 2));
