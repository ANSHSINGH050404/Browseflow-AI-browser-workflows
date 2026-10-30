import { auth } from "@clerk/nextjs/server"
import { runs } from "@trigger.dev/sdk"

import { countWorkflows } from "@/features/workflows/data"
import { checkIsPro } from "@/features/workflows/lib/billing"
import {
  buildUsageSummary,
  type UsageSummary,
} from "@/features/workflows/lib/limits"

export function orgRunTag(orgId: string) {
  return `org:${orgId}`
}

/** Best-effort count of run-workflow executions for this org since month start. */
export async function countOrgRunsThisMonth(orgId: string): Promise<number | null> {
  try {
    const now = new Date()
    const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))

    let total = 0
    // Cap so a busy org cannot hang the sidebar render.
    for await (const run of runs.list({
      tag: orgRunTag(orgId),
      from,
      taskIdentifier: "run-workflow",
    })) {
      void run
      total += 1
      if (total > 200) break
    }
    return total
  } catch {
    return null
  }
}

export async function getUsageSummaryForActiveOrg(): Promise<UsageSummary | null> {
  const { orgId, has } = await auth()
  if (!orgId) return null

  const isPro = checkIsPro(has)
  const workflowsUsed = await countWorkflows(orgId)
  const runsUsedThisMonth = isPro ? null : await countOrgRunsThisMonth(orgId)

  return buildUsageSummary({ isPro, workflowsUsed, runsUsedThisMonth })
}
