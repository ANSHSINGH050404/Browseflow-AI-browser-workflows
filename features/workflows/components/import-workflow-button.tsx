"use client"

import { useRef, useTransition } from "react"
import { Upload } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { importWorkflowAction } from "@/features/workflows/actions"
import { parseWorkflowImport } from "@/features/workflows/lib/export-format"
import {
  FREE_WORKFLOW_LIMIT,
  workflowLimitMessage,
} from "@/features/workflows/lib/limits"
import { useProPlan } from "@/features/workflows/hooks/use-pro-plan"

export function ImportWorkflowButton({
  workflowCount = 0,
  variant = "outline",
  size = "default",
}: {
  workflowCount?: number
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isPending, startTransition] = useTransition()
  const { isLoaded, isPro, goToUpgrade } = useProPlan()
  const atFreeLimit =
    isLoaded && !isPro && workflowCount >= FREE_WORKFLOW_LIMIT

  const onPick = () => {
    if (atFreeLimit) {
      toast.error(workflowLimitMessage())
      goToUpgrade()
      return
    }
    inputRef.current?.click()
  }

  const onFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      startTransition(async () => {
        try {
          const text = String(reader.result ?? "")
          const json = JSON.parse(text) as unknown
          // Client-side parse for fast errors; server re-parses on import.
          parseWorkflowImport(json)
          await importWorkflowAction(text)
        } catch (err) {
          toast.error(
            err instanceof Error ? err.message : "Couldn't import workflow"
          )
        }
      })
    }
    reader.onerror = () => toast.error("Couldn't read that file")
    reader.readAsText(file)
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json,.browseflow.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ""
          onFile(file)
        }}
      />
      <Button
        type="button"
        variant={variant}
        size={size}
        disabled={isPending}
        onClick={onPick}
      >
        <Upload />
        Import
      </Button>
    </>
  )
}
