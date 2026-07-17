import type { Stagehand } from "@browserbasehq/stagehand"

import type {
  ActionNodeType,
  NodeType,
} from "@/features/workflows/nodes/node-registry"
import { act } from "./act"
import { agent } from "./agent"
import { condition } from "./condition"
import { extract } from "./extract"
import { httpRequest } from "./http"
import { observe } from "./observe"
import { openUrl } from "./open-url"
import { sendEmail } from "./send-email"
import { waitSeconds } from "./wait"

export type NodeContext = {
  values: Record<string, string>
  getStagehand: () => Promise<Stagehand>
}

export type NodeExecutor = (ctx: NodeContext) => Promise<unknown>

// All action nodes must be registered here (`satisfies` makes a missing one a
// compile error). Schedule is a trigger but still produces run output.
export const nodeExecutors = {
  schedule: async ({ values }) => ({
    interval: values.interval ?? "hourly",
    triggeredAt: new Date().toISOString(),
  }),
  "open-url": async ({ values, getStagehand }) =>
    openUrl({ stagehand: await getStagehand(), url: values.url }),
  act: async ({ values, getStagehand }) =>
    act({ stagehand: await getStagehand(), instruction: values.instruction }),
  extract: async ({ values, getStagehand }) =>
    extract({
      stagehand: await getStagehand(),
      instruction: values.instruction,
    }),
  observe: async ({ values, getStagehand }) =>
    observe({
      stagehand: await getStagehand(),
      instruction: values.instruction,
    }),
  agent: async ({ values, getStagehand }) =>
    agent({ stagehand: await getStagehand(), instruction: values.instruction }),
  "send-email": async ({ values }) =>
    sendEmail({ to: values.to, subject: values.subject, body: values.body }),
  http: async ({ values }) =>
    httpRequest({
      method: values.method,
      url: values.url,
      body: values.body,
      headersJson: values.headers,
    }),
  wait: async ({ values }) => waitSeconds({ seconds: values.seconds }),
  condition: async ({ values }) =>
    condition({
      left: values.left,
      operator: values.operator,
      right: values.right,
    }),
} satisfies Record<ActionNodeType | "schedule", NodeExecutor>

// Runtime lookup used by the runner (triggers without an executor are no-ops).
export type RegisteredExecutor = keyof typeof nodeExecutors

export function getExecutor(type: NodeType): NodeExecutor | undefined {
  return (nodeExecutors as Partial<Record<NodeType, NodeExecutor>>)[type]
}
