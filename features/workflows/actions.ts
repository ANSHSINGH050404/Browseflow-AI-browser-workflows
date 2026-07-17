"use server"

import * as Sentry from "@sentry/nextjs"
import { auth } from "@clerk/nextjs/server"
import { runs, tasks } from "@trigger.dev/sdk"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

import type { runWorkflowTask } from "@/features/workflows/tasks/run-workflow"

import { liveblocks } from "@/lib/liveblocks"
import {
  countWorkflows,
  createWorkflow,
  deleteWorkflow,
  getWorkflow,
  renameWorkflow,
  saveWorkflowGraph,
} from "@/features/workflows/data"
import {
  parseWorkflowImport,
  remapGraphIds,
} from "@/features/workflows/lib/export-format"
import { checkIsPro } from "@/features/workflows/lib/billing"
import {
  FREE_MONTHLY_RUN_LIMIT,
  FREE_WORKFLOW_LIMIT,
  runLimitMessage,
  workflowLimitMessage,
} from "@/features/workflows/lib/limits"
import { generateSlug } from "@/features/workflows/lib/generate-slug"
import { getTemplate } from "@/features/workflows/templates"
import {
  countOrgRunsThisMonth,
  orgRunTag,
} from "@/features/workflows/lib/usage"
import { WorkflowGraph } from "@/lib/db/schema"

async function assertCanCreateWorkflow(orgId: string, isPro: boolean) {
  if (isPro) return
  const existing = await countWorkflows(orgId)
  if (existing >= FREE_WORKFLOW_LIMIT) {
    Sentry.logger.warn("Workflow creation denied — free limit reached", {
      orgId,
      existing,
    })
    throw new Error(workflowLimitMessage())
  }
}

async function assertCanRunWorkflow(orgId: string, isPro: boolean) {
  if (isPro) return
  const used = await countOrgRunsThisMonth(orgId)
  if (used != null && used >= FREE_MONTHLY_RUN_LIMIT) {
    Sentry.logger.warn("Workflow run denied — free monthly run limit", {
      orgId,
      used,
    })
    throw new Error(runLimitMessage())
  }
}

export async function createWorkflowAction(name?: string) {
  const { orgId, has } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  const isPro = checkIsPro(has)
  await assertCanCreateWorkflow(orgId, isPro)

  Sentry.getIsolationScope().setAttributes({
    action: "createWorkflowAction",
    orgId,
  })

  const workflow = await createWorkflow(orgId, name?.trim() || generateSlug())

  Sentry.logger.info("Workflow created", { workflowId: workflow.id, orgId })

  revalidatePath("/app", "layout")
  redirect(`/workflows/${workflow.id}`)
}

export async function createWorkflowFromTemplateAction(templateId: string) {
  const { orgId, has } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  const template = getTemplate(templateId)
  if (!template) {
    throw new Error("Unknown template")
  }

  const isPro = checkIsPro(has)
  await assertCanCreateWorkflow(orgId, isPro)

  Sentry.getIsolationScope().setAttributes({
    action: "createWorkflowFromTemplateAction",
    orgId,
    templateId,
  })

  const workflow = await createWorkflow(orgId, template.name, template.graph)

  Sentry.logger.info("Workflow created from template", {
    workflowId: workflow.id,
    orgId,
    templateId,
  })

  revalidatePath("/app", "layout")
  redirect(`/workflows/${workflow.id}`)
}

export async function cloneWorkflowAction(
  id: string,
  graphOverride?: WorkflowGraph | null
) {
  const { orgId, has } = await auth()
  if (!orgId) throw new Error("No active organization")

  const isPro = checkIsPro(has)
  await assertCanCreateWorkflow(orgId, isPro)

  const source = await getWorkflow(orgId, id)
  if (!source) throw new Error("Workflow not found")

  const graphSource = graphOverride ?? source.graph
  if (!graphSource) {
    throw new Error("Save the workflow graph before cloning it.")
  }

  const graph = remapGraphIds(graphSource)
  const name = source.name.startsWith("Copy of ")
    ? source.name
    : `Copy of ${source.name}`

  const workflow = await createWorkflow(orgId, name, graph)

  Sentry.logger.info("Workflow cloned", {
    workflowId: workflow.id,
    sourceId: id,
    orgId,
  })

  revalidatePath("/app", "layout")
  redirect(`/workflows/${workflow.id}`)
}

export async function importWorkflowAction(jsonText: string) {
  const { orgId, has } = await auth()
  if (!orgId) throw new Error("No active organization")

  const isPro = checkIsPro(has)
  await assertCanCreateWorkflow(orgId, isPro)

  let raw: unknown
  try {
    raw = JSON.parse(jsonText)
  } catch {
    throw new Error("Import file is not valid JSON")
  }

  const { name, graph } = parseWorkflowImport(raw)
  const workflow = await createWorkflow(orgId, name, graph)

  Sentry.logger.info("Workflow imported", {
    workflowId: workflow.id,
    orgId,
  })

  revalidatePath("/app", "layout")
  redirect(`/workflows/${workflow.id}`)
}

export async function renameWorkflowAction(id: string, name: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  const workflow = await renameWorkflow(orgId, id, name)
  if (!workflow) {
    throw new Error("Workflow not found")
  }

  revalidatePath("/app", "layout")
  revalidatePath(`/workflows/${id}`)
  return workflow
}

export async function deleteWorkflowAction(id: string) {
  const { orgId } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  Sentry.getIsolationScope().setAttributes({
    action: "deleteWorkflowAction",
    orgId,
    workflowId: id,
  })

  const workflow = await deleteWorkflow(orgId, id)

  if (!workflow) {
    Sentry.logger.warn("Workflow delete skipped — not found", {
      workflowId: id,
      orgId,
    })
    throw new Error("Workflow not found")
  }

  // The workflow id doubles as its Liveblocks room id — clean it up too.
  try {
    await liveblocks.deleteRoom(id)
  } catch (error) {
    // Room may not exist if the canvas was never opened; still treat delete as OK.
    Sentry.logger.warn("Liveblocks room delete skipped", {
      workflowId: id,
      orgId,
      error: error instanceof Error ? error.message : String(error),
    })
  }

  Sentry.logger.info("Workflow deleted", { workflowId: id, orgId })

  revalidatePath("/app", "layout")
  redirect("/app")
}

export async function runWorkflowAction({
  id,
  graph,
}: {
  id: string
  graph: WorkflowGraph
}) {
  const { orgId, has } = await auth()

  if (!orgId) {
    throw new Error("No active organization")
  }

  const isPro = checkIsPro(has)

  // The Agent node is Pro-only. Enforce it here rather than in the run task: the
  // action holds the Clerk session (and has()), while the Trigger.dev task runs
  // with no auth context. has() evaluates the active org, confirmed above.
  Sentry.getIsolationScope().setAttributes({
    action: "runWorkflowAction",
    orgId,
    workflowId: id,
  })

  const hasAgentNode = graph.nodes.some((node) => node.data.type === "agent")
  if (hasAgentNode && !isPro) {
    Sentry.logger.warn("Workflow run denied — Agent node requires Pro plan", {
      workflowId: id,
      orgId,
    })
    throw new Error(
      "The Agent node requires the Pro plan. Upgrade under Billing."
    )
  }

  await assertCanRunWorkflow(orgId, isPro)

  try {
    await saveWorkflowGraph({ orgId, id, graph })
  } catch (error) {
    Sentry.logger.warn("Workflow run blocked — graph validation failed", {
      workflowId: id,
      orgId,
    })
    throw error
  }

  // Longer TTL than the default 10m so a briefly stopped worker does not expire
  // the run before you can restart `npm run trigger:dev`.
  const handle = await tasks.trigger<typeof runWorkflowTask>(
    "run-workflow",
    { workflowId: id, orgId },
    {
      tags: [`workflow:${id}`, orgRunTag(orgId)],
      ttl: "30m",
    }
  )

  Sentry.logger.info("Workflow run triggered", {
    workflowId: id,
    orgId,
    runId: handle.id,
    nodeCount: graph.nodes.length,
    hasAgentNode,
  })

  return handle
}

export async function saveWorkflowAction({
  id,
  graph,
}: {
  id: string
  graph: WorkflowGraph
}) {
  const { orgId } = await auth()
  if (!orgId) throw new Error("No active organization")

  await saveWorkflowGraph({ orgId, id, graph })
  revalidatePath(`/workflows/${id}`)
  return { ok: true as const }
}

export async function cancelWorkflowRunAction(runId: string) {
  const { orgId } = await auth()
  if (!orgId) throw new Error("No active organization")

  Sentry.getIsolationScope().setAttributes({
    action: "cancelWorkflowRunAction",
    orgId,
    runId,
  })

  await runs.cancel(runId)

  Sentry.logger.info("Workflow run cancelled", { runId, orgId })
}
