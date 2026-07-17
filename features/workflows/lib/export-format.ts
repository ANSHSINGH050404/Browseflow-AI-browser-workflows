import type { Edge } from "@xyflow/react"

import type { StepNodeType } from "@/features/workflows/nodes/node-registry"
import { nodeRegistry } from "@/features/workflows/nodes/node-registry"
import type { WorkflowGraph } from "@/lib/db/schema"
import { validateGraph } from "@/features/workflows/lib/validate-graph"

export const EXPORT_VERSION = 1 as const

export type WorkflowExport = {
  version: typeof EXPORT_VERSION
  app: "browseflow"
  name: string
  exportedAt: string
  graph: WorkflowGraph
}

export function buildExport(name: string, graph: WorkflowGraph): WorkflowExport {
  return {
    version: EXPORT_VERSION,
    app: "browseflow",
    name,
    exportedAt: new Date().toISOString(),
    graph,
  }
}

export function downloadExport(payload: WorkflowExport) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  const safe = payload.name.replace(/[^\w\-]+/g, "-").toLowerCase() || "workflow"
  a.href = url
  a.download = `${safe}.browseflow.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Assign fresh node ids and rewrite edge endpoints + {{oldId. tokens in fields. */
export function remapGraphIds(graph: WorkflowGraph): WorkflowGraph {
  const idMap = new Map<string, string>()
  for (const node of graph.nodes) {
    idMap.set(node.id, crypto.randomUUID())
  }

  const rewrite = (text: string) =>
    text.replace(/\{\{\s*([^}.]+)\./g, (match, oldId: string) => {
      const next = idMap.get(oldId)
      return next ? match.replace(oldId, next) : match
    })

  const nodes: StepNodeType[] = graph.nodes.map((node) => {
    const values: Record<string, string> = {}
    for (const [key, value] of Object.entries(node.data.values ?? {})) {
      values[key] = rewrite(value)
    }
    return {
      ...node,
      id: idMap.get(node.id)!,
      data: { ...node.data, values },
    }
  })

  const edges: Edge[] = graph.edges.map((edge) => ({
    ...edge,
    id: crypto.randomUUID(),
    source: idMap.get(edge.source) ?? edge.source,
    target: idMap.get(edge.target) ?? edge.target,
  }))

  return { nodes, edges }
}

export function parseWorkflowImport(raw: unknown): {
  name: string
  graph: WorkflowGraph
} {
  if (!raw || typeof raw !== "object") {
    throw new Error("Import file must be a JSON object")
  }

  const obj = raw as Record<string, unknown>

  // Accept full Browseflow export or a bare { nodes, edges } graph.
  let name = "Imported workflow"
  let graph: WorkflowGraph | undefined

  if (obj.graph && typeof obj.graph === "object") {
    if (typeof obj.name === "string" && obj.name.trim()) {
      name = obj.name.trim()
    }
    graph = obj.graph as WorkflowGraph
  } else if (Array.isArray(obj.nodes) && Array.isArray(obj.edges)) {
    graph = { nodes: obj.nodes as StepNodeType[], edges: obj.edges as Edge[] }
  }

  if (!graph?.nodes || !graph.edges) {
    throw new Error("Import is missing a graph with nodes and edges")
  }

  // Drop unknown node types so older/newer files fail clearly.
  for (const node of graph.nodes) {
    if (!node?.data?.type || !(node.data.type in nodeRegistry)) {
      throw new Error(
        `Unknown node type "${String(node?.data?.type)}" — update Browseflow or remove that node.`
      )
    }
  }

  const problems = validateGraph(graph)
  if (problems.length > 0) {
    throw new Error(problems[0])
  }

  return { name, graph: remapGraphIds(graph) }
}
