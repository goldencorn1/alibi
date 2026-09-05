import { identityRegistrationPlan } from "@/src/erc8004/identity";
import { registrationDocument } from "@/src/erc8004/registration-schema";
console.log(JSON.stringify({ action: "register_plan_only", plan: identityRegistrationPlan("http://127.0.0.1:3000/.well-known/agent-registration.json"), document: registrationDocument(), transactions_sent: 0 }, null, 2));
