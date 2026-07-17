"use client"

import { useTransition } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createWorkflowAction } from "@/features/workflows/actions"
import { generateSlug } from "@/features/workflows/lib/generate-slug"
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
  const [isPending, startTransition] = useTransition()
  const { isLoaded, isPro, goToUpgrade } = useProPlan()

  const atFreeLimit =
    isLoaded && !isPro && workflowCount >= FREE_WORKFLOW_LIMIT

  const handleCreateWorkflow = () => {
    if (atFreeLimit) {
      toast.error(workflowLimitMessage())
      goToUpgrade()
      return
    }
    startTransition(async () => {
      try {
        await createWorkflowAction(generateSlug())
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Couldn't create workflow"
        )
      }
    })
  }

  return (
    <Button
      onClick={handleCreateWorkflow}
      disabled={isPending}
      variant={variant}
      size={size}
      title={atFreeLimit ? workflowLimitMessage() : undefined}
    >
      <PlusIcon />
      {label}
    </Button>
  )
}
