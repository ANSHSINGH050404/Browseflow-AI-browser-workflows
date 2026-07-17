import type { Edge } from "@xyflow/react"

import type { StepNodeType } from "@/features/workflows/nodes/node-registry"
import type { WorkflowGraph } from "@/lib/db/schema"

export type WorkflowTemplate = {
  id: string
  name: string
  description: string
  /** Short label shown on the template card. */
  badge: string
  graph: WorkflowGraph
}

function step(
  id: string,
  type: StepNodeType["data"]["type"],
  kind: StepNodeType["data"]["kind"],
  title: string,
  position: { x: number; y: number },
  values: Record<string, string> = {}
): StepNodeType {
  return {
    id,
    type: "step",
    position,
    data: { type, kind, title, values },
  }
}

function edge(source: string, target: string): Edge {
  return {
    id: `${source}-${target}`,
    source,
    target,
    type: "smoothstep",
  }
}

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "hello-extract",
    name: "Extract page title",
    description:
      "Open a page and extract a piece of text. The fastest way to see Browseflow work.",
    badge: "Starter",
    graph: {
      nodes: [
        step("start", "start", "trigger", "Start", { x: 0, y: 0 }),
        step("open-1", "open-url", "action", "Open URL 1", { x: 280, y: 0 }, {
          url: "https://example.com",
        }),
        step("extract-1", "extract", "action", "Extract 1", { x: 560, y: 0 }, {
          instruction: "Extract the main heading text on the page",
        }),
      ],
      edges: [edge("start", "open-1"), edge("open-1", "extract-1")],
    },
  },
  {
    id: "act-and-extract",
    name: "Act then extract",
    description:
      "Open a site, perform a natural-language click, then pull data off the page.",
    badge: "Browser",
    graph: {
      nodes: [
        step("start", "start", "trigger", "Start", { x: 0, y: 0 }),
        step("open-1", "open-url", "action", "Open URL 1", { x: 280, y: 0 }, {
          url: "https://news.ycombinator.com",
        }),
        step("act-1", "act", "action", "Act 1", { x: 560, y: 0 }, {
          instruction: "Click the first story link in the list",
        }),
        step("extract-1", "extract", "action", "Extract 1", { x: 840, y: 0 }, {
          instruction: "Extract the article title and the first paragraph",
        }),
      ],
      edges: [
        edge("start", "open-1"),
        edge("open-1", "act-1"),
        edge("act-1", "extract-1"),
      ],
    },
  },
  {
    id: "http-notify",
    name: "HTTP check + email",
    description:
      "Call an API endpoint and email yourself the result. No browser required.",
    badge: "API",
    graph: {
      nodes: [
        step("start", "start", "trigger", "Start", { x: 0, y: 0 }),
        step("http-1", "http", "action", "HTTP 1", { x: 280, y: 0 }, {
          method: "GET",
          url: "https://httpbin.org/json",
        }),
        step("email-1", "send-email", "action", "Send Email 1", { x: 560, y: 0 }, {
          to: "you@example.com",
          subject: "Browseflow HTTP check",
          body: "Status: {{http-1.status}}\n\nBody preview:\n{{http-1.body}}",
        }),
      ],
      edges: [edge("start", "http-1"), edge("http-1", "email-1")],
    },
  },
  {
    id: "scheduled-scrape",
    name: "Scheduled page check",
    description:
      "Run on a schedule: open a URL, extract a value, and wait for the next tick.",
    badge: "Schedule",
    graph: {
      nodes: [
        step(
          "schedule-1",
          "schedule",
          "trigger",
          "Schedule 1",
          { x: 0, y: 0 },
          { interval: "hourly" }
        ),
        step("open-1", "open-url", "action", "Open URL 1", { x: 280, y: 0 }, {
          url: "https://example.com",
        }),
        step("extract-1", "extract", "action", "Extract 1", { x: 560, y: 0 }, {
          instruction: "Extract the main heading on the page",
        }),
      ],
      edges: [edge("schedule-1", "open-1"), edge("open-1", "extract-1")],
    },
  },
]

export function getTemplate(id: string): WorkflowTemplate | undefined {
  return workflowTemplates.find((t) => t.id === id)
}
