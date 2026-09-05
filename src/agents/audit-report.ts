import { AuditReportAgent, buildAuditReport } from "@/src/observability/audit-agent";
import { AgentEvent } from "@/src/contracts";

/** Read-only facade. It may persist events, but never changes the business bundle. */
export class AuditAndReportAgent {
  private constructor(private readonly run: AuditReportAgent) {}

  static async create(input: string): Promise<AuditAndReportAgent> {
    return new AuditAndReportAgent(await AuditReportAgent.create(input));
  }

  get run_id(): string { return this.run.run_id; }
  get input_digest(): string { return this.run.input_digest; }
  get audit(): AuditReportAgent { return this.run; }
  async report() { return this.run.getReport(); }
}

export function auditReportFromEvents(events: AgentEvent[], runId: string) {
  return buildAuditReport(events, runId);
}
