"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { CreateWorkflowDialog } from "@/features/workflows/components/create-workflow-dialog"
import {
  FREE_WORKFLOW_LIMIT,
  workflowLimitMessage,
} from "@/features/workflows/lib/limits"
import { useProPlan } from "@/features/workflows/hooks/use-pro-plan"

export function NewWorkflowButton({
  workflowCount = 0,
  variant = "default",
  size,
  label = "New workflow",
}: {
  workflowCount?: number
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const { isLoaded, isPro, goToUpgrade } = useProPlan()

  const atFreeLimit =
    isLoaded && !isPro && workflowCount >= FREE_WORKFLOW_LIMIT

  const handleClick = () => {
    if (atFreeLimit) {
      toast.error(workflowLimitMessage())
      goToUpgrade()
      return
    }
    setOpen(true)
  }

  return (
    <>
      <Button
        onClick={handleClick}
        variant={variant}
        size={size}
        title={atFreeLimit ? workflowLimitMessage() : undefined}
      >
        <PlusIcon />
        {label}
      </Button>
      <CreateWorkflowDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
