import { erc8004Status } from "@/src/erc8004/status";
console.log(JSON.stringify({ ...erc8004Status(), action: "preflight_only", secrets_read: false }, null, 2));
