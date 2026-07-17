"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PlusIcon, Trash2, WorkflowIcon } from "lucide-react"
import { toast } from "sonner"

import { CreateWorkflowDialog } from "@/features/workflows/components/create-workflow-dialog"
import { DeleteWorkflowDialog } from "@/features/workflows/components/delete-workflow-dialog"
import {
  FREE_WORKFLOW_LIMIT,
  workflowLimitMessage,
} from "@/features/workflows/lib/limits"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import type { Workflow } from "@/lib/db/schema"
import { useProPlan } from "@/features/workflows/hooks/use-pro-plan"

interface WorkflowNavProps {
  workflows: Workflow[]
  onCreateWorkflow: (name: string) => Promise<void>
}

export function WorkflowNav({ workflows, onCreateWorkflow }: WorkflowNavProps) {
  const { state } = useSidebar()
  const pathname = usePathname()
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string
    name: string
  } | null>(null)
  const { isLoaded, isPro, goToUpgrade } = useProPlan()

  const atFreeLimit =
    isLoaded && !isPro && workflows.length >= FREE_WORKFLOW_LIMIT

  const openCreateDialog = () => {
    if (atFreeLimit) {
      toast.error(workflowLimitMessage())
      goToUpgrade()
      return
    }
    setCreateOpen(true)
  }

  const workflowItems = workflows.map((workflow) => (
    <SidebarMenuItem key={workflow.id}>
      <SidebarMenuButton
        asChild
        isActive={pathname === `/workflows/${workflow.id}`}
      >
        <Link href={`/workflows/${workflow.id}`}>
          <span className="truncate">{workflow.name}</span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuAction
        showOnHover
        title={`Delete ${workflow.name}`}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setDeleteTarget({ id: workflow.id, name: workflow.name })
        }}
      >
        <Trash2 className="text-muted-foreground hover:text-destructive" />
        <span className="sr-only">Delete {workflow.name}</span>
      </SidebarMenuAction>
    </SidebarMenuItem>
  ))

  const createTitle = atFreeLimit ? workflowLimitMessage() : "New workflow"

  const dialogs = (
    <>
      <CreateWorkflowDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreate={onCreateWorkflow}
      />
      <DeleteWorkflowDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        workflowId={deleteTarget?.id ?? ""}
        workflowName={deleteTarget?.name ?? ""}
      />
    </>
  )

  if (state === "collapsed") {
    return (
      <>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Popover>
                  <PopoverTrigger asChild>
                    <SidebarMenuButton tooltip="Workflows">
                      <WorkflowIcon />
                      <span>Workflows</span>
                    </SidebarMenuButton>
                  </PopoverTrigger>
                  <PopoverContent side="right" align="start" className="p-1">
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          onClick={openCreateDialog}
                          title={createTitle}
                        >
                          <PlusIcon />
                          <span>New workflow</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                    <SidebarSeparator className="mx-0" />
                    <SidebarMenu className="gap-y-0.5">{workflowItems}</SidebarMenu>
                  </PopoverContent>
                </Popover>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {dialogs}
      </>
    )
  }

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel className="flex items-center justify-between gap-2 pr-1">
          <span>Workflows</span>
          {isLoaded && !isPro && (
            <span className="text-[10px] font-normal text-muted-foreground">
              {workflows.length}/{FREE_WORKFLOW_LIMIT} free
            </span>
          )}
        </SidebarGroupLabel>
        <SidebarGroupAction title={createTitle} onClick={openCreateDialog}>
          <PlusIcon />
          <span className="sr-only">New workflow</span>
        </SidebarGroupAction>
        <SidebarGroupContent>
          <SidebarMenu className="gap-y-0.5">{workflowItems}</SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      {dialogs}
    </>
  )
}
