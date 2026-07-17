import * as React from "react"
import Link from "next/link"
import { OrganizationSwitcher, UserButton } from "@clerk/nextjs"
import { auth } from "@clerk/nextjs/server"
import { CircleHelp, CreditCard, Workflow } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { createWorkflowAction } from "@/features/workflows/actions"
import { UsageMeter } from "@/features/workflows/components/usage-meter"
import { WorkflowNav } from "@/features/workflows/components/workflow-nav"
import { listWorkflows } from "@/features/workflows/data"
import { getUsageSummaryForActiveOrg } from "@/features/workflows/lib/usage"

export async function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { orgId } = await auth()
  const workflows = orgId ? await listWorkflows(orgId) : []
  const usage = await getUsageSummaryForActiveOrg()

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="gap-2">
        <div className="flex flex-row items-center justify-between gap-2 group-data-[collapsible=icon]:justify-center">
          <Link
            href="/app"
            className="flex min-w-0 items-center gap-2 font-semibold tracking-tight group-data-[collapsible=icon]:hidden"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
              <Workflow className="size-3.5" />
            </span>
            <span className="truncate">Browseflow</span>
          </Link>
          <SidebarTrigger />
        </div>
        <OrganizationSwitcher
          afterCreateOrganizationUrl="/app"
          afterSelectOrganizationUrl="/app"
          afterLeaveOrganizationUrl="/app"
          hidePersonal
          appearance={{
            elements: {
              rootBox: "min-w-0 w-full group-data-[collapsible=icon]:!hidden",
              organizationSwitcherTrigger: "w-full justify-between",
            },
          }}
        />
      </SidebarHeader>
      <SidebarContent>
        <WorkflowNav
          workflows={workflows}
          onCreateWorkflow={createWorkflowAction}
        />
      </SidebarContent>
      <SidebarFooter className="gap-2 group-data-[collapsible=icon]:items-center">
        {usage && <UsageMeter usage={usage} />}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Billing & plans">
              <Link href="/billing">
                <CreditCard />
                <span>Billing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Help & docs">
              <Link href="/help">
                <CircleHelp />
                <span>Help</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarSeparator />
        <UserButton
          appearance={{
            elements: {
              rootBox: "w-full",
              userButtonTrigger:
                "w-full justify-start group-data-[collapsible=icon]:justify-center",
              userButtonOuterIdentifier: "group-data-[collapsible=icon]:hidden",
            },
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
