import toposort from "toposort"

import type { WorkflowGraph } from "@/lib/db/schema"
import { nodeRegistry } from "@/features/workflows/nodes/node-registry"

// Structural problems knowable before a run — empty array means runnable. Pure
// (no db import) so the client can pre-flight the in-hand graph and toast,
// while the server reuses it as the save-time backstop.
export function validateGraph({ nodes, edges }: WorkflowGraph): string[] {
  const problems: string[] = []

  const triggers = nodes.filter((n) => n.data.kind === "trigger")
  if (triggers.length !== 1) {
    problems.push(
      `A workflow needs exactly one trigger (Start or Schedule) — found ${triggers.length}.`
    )
  }

  // The runner only executes nodes touching an edge, so with none Run is a no-op.
  if (edges.length === 0) {
    problems.push("Connect your nodes before running.")
  } else {
    try {
      // toposort throws on a cycle — the run would otherwise fail mid-sort.
      toposort(edges.map((e) => [e.source, e.target]))
    } catch {
      problems.push("Workflow has a cycle — remove the loop before running.")
    }
  }

  // Required fields on connected nodes (orphans are skipped at run time).
  const connected = new Set(edges.flatMap((e) => [e.source, e.target]))
  for (const node of nodes) {
    if (!connected.has(node.id) && node.data.kind !== "trigger") continue
    // Isolated trigger with no edges already covered above.
    if (!connected.has(node.id)) continue

    const def = nodeRegistry[node.data.type]
    if (!def) continue
    for (const field of def.fields) {
      if (!field.required) continue
      const value = node.data.values[field.key]?.trim()
      if (!value) {
        problems.push(
          `"${node.data.title}" is missing required field: ${field.label}.`
        )
      }
    }

    if (node.data.type === "schedule") {
      const interval = node.data.values.interval?.trim().toLowerCase()
      if (interval && interval !== "hourly" && interval !== "daily") {
        problems.push(
          `"${node.data.title}" interval must be "hourly" or "daily".`
        )
      }
    }
  }

  return problems
}
