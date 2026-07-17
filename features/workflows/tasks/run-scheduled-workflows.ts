import { logger, schedules, tasks } from "@trigger.dev/sdk"

import { listWorkflowsWithGraphs } from "@/features/workflows/data"
import { orgRunTag } from "@/features/workflows/lib/usage"
import type { runWorkflowTask } from "@/features/workflows/tasks/run-workflow"

/**
 * Hourly sweep: any workflow whose graph has a Schedule trigger with
 * interval "hourly" (or "daily" at UTC midnight) is triggered.
 *
 * Requires the graph to have been saved (Run or Save) so the DB snapshot
 * includes the schedule node.
 */
export const runScheduledWorkflowsTask = schedules.task({
  id: "run-scheduled-workflows",
  cron: "0 * * * *",
  run: async (payload) => {
    const hour = payload.timestamp.getUTCHours()
    const isMidnight = hour === 0

    const all = await listWorkflowsWithGraphs()
    const due = all.filter((wf) => {
      const graph = wf.graph
      if (!graph?.nodes?.length) return false
      const scheduleNode = graph.nodes.find((n) => n.data.type === "schedule")
      if (!scheduleNode) return false
      const interval = scheduleNode.data.values.interval?.trim().toLowerCase()
      if (interval === "hourly") return true
      if (interval === "daily") return isMidnight
      return false
    })

    logger.log(`Scheduled sweep found ${due.length} workflow(s)`, {
      hour,
      total: all.length,
    })

    const triggered: string[] = []
    for (const wf of due) {
      const handle = await tasks.trigger<typeof runWorkflowTask>(
        "run-workflow",
        { workflowId: wf.id, orgId: wf.orgId },
        {
          tags: [`workflow:${wf.id}`, orgRunTag(wf.orgId), "scheduled"],
        }
      )
      triggered.push(handle.id)
      logger.log(`Triggered scheduled run for ${wf.name}`, {
        workflowId: wf.id,
        runId: handle.id,
      })
    }

    return { triggered: triggered.length, runIds: triggered }
  },
})
