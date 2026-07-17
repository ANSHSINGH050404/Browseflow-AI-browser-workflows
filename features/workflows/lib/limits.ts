// Free-plan caps. Pro orgs are unlimited for workflows.
export const FREE_WORKFLOW_LIMIT = 3

// Soft monthly run budget for free orgs (enforced when we can count Trigger runs).
export const FREE_MONTHLY_RUN_LIMIT = 50

export function workflowLimitMessage(limit = FREE_WORKFLOW_LIMIT) {
  return `Free plan includes up to ${limit} workflows. Upgrade to Pro for unlimited workflows and the Agent node.`
}

export function runLimitMessage(limit = FREE_MONTHLY_RUN_LIMIT) {
  return `Free plan includes ${limit} workflow runs per month. Upgrade to Pro for higher volume and the Agent node.`
}

export type UsageSummary = {
  isPro: boolean
  workflowsUsed: number
  workflowLimit: number | null
  /** null when unlimited (Pro) or when run count is unavailable */
  runsUsedThisMonth: number | null
  runLimit: number | null
  agentUnlocked: boolean
}

export function buildUsageSummary({
  isPro,
  workflowsUsed,
  runsUsedThisMonth,
}: {
  isPro: boolean
  workflowsUsed: number
  runsUsedThisMonth?: number | null
}): UsageSummary {
  return {
    isPro,
    workflowsUsed,
    workflowLimit: isPro ? null : FREE_WORKFLOW_LIMIT,
    runsUsedThisMonth: isPro ? null : (runsUsedThisMonth ?? null),
    runLimit: isPro ? null : FREE_MONTHLY_RUN_LIMIT,
    agentUnlocked: isPro,
  }
}
