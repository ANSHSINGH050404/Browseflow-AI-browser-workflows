import { auth } from "@clerk/nextjs/server"
import { runs } from "@trigger.dev/sdk"

import { countWorkflows } from "@/features/workflows/data"
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
    const from = new Date()
    from.setUTCDate(1)
    from.setUTCHours(0, 0, 0, 0)

    let total = 0
    // Cap so a busy org cannot hang the sidebar render.
    for await (const _run of runs.list({
      tag: orgRunTag(orgId),
      from,
      taskIdentifier: "run-workflow",
    })) {
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

  const isPro = has({ plan: "pro" })
  const workflowsUsed = await countWorkflows(orgId)
  const runsUsedThisMonth = isPro ? null : await countOrgRunsThisMonth(orgId)

  return buildUsageSummary({ isPro, workflowsUsed, runsUsedThisMonth })
}
