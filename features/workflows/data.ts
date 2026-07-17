import { and, count, desc, eq } from "drizzle-orm"

import { db } from "@/lib/db"
import { WorkflowGraph, workflows } from "@/lib/db/schema"
import { validateGraph } from "@/features/workflows/lib/validate-graph"

export async function saveWorkflowGraph({
  orgId,
  id,
  graph,
}: {
  orgId: string
  id: string
  graph: WorkflowGraph
}) {
  const problems = validateGraph(graph)
  if (problems.length > 0) throw new Error(problems.join(" "))
  await db
    .update(workflows)
    .set({ graph, updatedAt: new Date() })
    .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))
}

export function listWorkflows(orgId: string) {
  return db
    .select()
    .from(workflows)
    .where(eq(workflows.orgId, orgId))
    .orderBy(desc(workflows.createdAt))
}

export async function countWorkflows(orgId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(workflows)
    .where(eq(workflows.orgId, orgId))
  return row?.value ?? 0
}

export async function getWorkflow(orgId: string, id: string) {
  const [workflow] = await db
    .select()
    .from(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))

  return workflow
}

export async function createWorkflow(
  orgId: string,
  name: string,
  graph?: WorkflowGraph | null
) {
  const [workflow] = await db
    .insert(workflows)
    .values({ orgId, name, graph: graph ?? null })
    .returning()

  return workflow
}

export async function renameWorkflow(orgId: string, id: string, name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error("Workflow name cannot be empty")

  const [workflow] = await db
    .update(workflows)
    .set({ name: trimmed, updatedAt: new Date() })
    .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))
    .returning()

  return workflow
}

export async function deleteWorkflow(orgId: string, id: string) {
  const [workflow] = await db
    .delete(workflows)
    .where(and(eq(workflows.id, id), eq(workflows.orgId, orgId)))
    .returning()

  return workflow
}

/** All workflows that have a persisted graph (used by the schedule runner). */
export async function listWorkflowsWithGraphs() {
  return db.select().from(workflows)
}
