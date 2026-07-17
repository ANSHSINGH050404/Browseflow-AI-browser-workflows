import { auth } from "@clerk/nextjs/server"
import { WorkflowIcon } from "lucide-react"

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { ImportWorkflowButton } from "@/features/workflows/components/import-workflow-button"
import { NewWorkflowButton } from "@/features/workflows/components/new-workflow-button"
import { TemplateCards } from "@/features/workflows/components/template-cards"
import { listWorkflows } from "@/features/workflows/data"

export default async function AppHomePage() {
  const { orgId } = await auth()
  const workflows = orgId ? await listWorkflows(orgId) : []

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 overflow-y-auto p-6">
      <Empty className="border-none py-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <WorkflowIcon />
          </EmptyMedia>
          <EmptyTitle>
            {workflows.length === 0
              ? "Build your first workflow"
              : "No workflow selected"}
          </EmptyTitle>
          <EmptyDescription>
            {workflows.length === 0
              ? "Start from a template, import a .browseflow.json file, or open a blank canvas."
              : "Select a workflow from the sidebar, import one, or create another."}
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex-row flex-wrap justify-center gap-2">
          <NewWorkflowButton workflowCount={workflows.length} />
          <ImportWorkflowButton workflowCount={workflows.length} />
        </EmptyContent>
      </Empty>

      <div className="flex w-full max-w-4xl flex-col gap-3">
        <h2 className="text-sm font-semibold tracking-tight">
          Start from a template
        </h2>
        <TemplateCards workflowCount={workflows.length} />
      </div>
    </div>
  )
}
