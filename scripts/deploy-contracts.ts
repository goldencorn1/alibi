export const DEPLOYMENT_BOUNDARY = { chain_id: 84532, max_transactions: 2, max_gas_per_transaction: 500_000, cumulative_gas_cap: 1_500_000, mainnet: false, real_funds: false } as const;
console.log(JSON.stringify({ action: "deployment-plan-only", ...DEPLOYMENT_BOUNDARY }, null, 2));
