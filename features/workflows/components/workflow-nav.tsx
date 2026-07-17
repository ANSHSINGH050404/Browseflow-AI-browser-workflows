"use client"

import { useTransition } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { PlusIcon, WorkflowIcon } from "lucide-react"
import { toast } from "sonner"

import { generateSlug } from "@/features/workflows/lib/generate-slug"
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
  const [isPending, startTransition] = useTransition()
  const { isLoaded, isPro, goToUpgrade } = useProPlan()

  const atFreeLimit =
    isLoaded && !isPro && workflows.length >= FREE_WORKFLOW_LIMIT

  const handleCreateWorkflow = () => {
    if (atFreeLimit) {
      toast.error(workflowLimitMessage())
      goToUpgrade()
      return
    }
    startTransition(async () => {
      try {
        await onCreateWorkflow(generateSlug())
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Couldn't create workflow"
        )
      }
    })
  }

  const workflowItems = workflows.map((workflow) => (
    <SidebarMenuItem key={workflow.id}>
      <SidebarMenuButton
        asChild
        isActive={pathname === `/workflows/${workflow.id}`}
      >
        <Link href={`/workflows/${workflow.id}`}>
          <span>{workflow.name}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  ))

  const createTitle = atFreeLimit
    ? workflowLimitMessage()
    : "New workflow"

  if (state === "collapsed") {
    return (
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
                        onClick={handleCreateWorkflow}
                        disabled={isPending}
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
    )
  }

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex items-center justify-between gap-2 pr-1">
        <span>Workflows</span>
        {isLoaded && !isPro && (
          <span className="text-[10px] font-normal text-muted-foreground">
            {workflows.length}/{FREE_WORKFLOW_LIMIT} free
          </span>
        )}
      </SidebarGroupLabel>
      <SidebarGroupAction
        title={createTitle}
        onClick={handleCreateWorkflow}
        disabled={isPending}
      >
        <PlusIcon />
        <span className="sr-only">New workflow</span>
      </SidebarGroupAction>
      <SidebarGroupContent>
        <SidebarMenu className="gap-y-0.5">{workflowItems}</SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
