"use client"

import { useTransition } from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteWorkflowAction } from "@/features/workflows/actions"

type DeleteWorkflowDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  workflowId: string
  workflowName: string
}

export function DeleteWorkflowDialog({
  open,
  onOpenChange,
  workflowId,
  workflowName,
}: DeleteWorkflowDialogProps) {
  const [isPending, startTransition] = useTransition()

  const confirmDelete = () => {
    startTransition(async () => {
      try {
        await deleteWorkflowAction(workflowId)
        // Server action redirects to /app on success.
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Couldn't delete workflow"
        )
        onOpenChange(false)
      }
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete workflow?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently deletes{" "}
            <span className="font-medium text-foreground">
              {workflowName}
            </span>{" "}
            and its saved graph. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(e) => {
              e.preventDefault()
              confirmDelete()
            }}
          >
            <Trash2 className="size-3.5" />
            {isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
