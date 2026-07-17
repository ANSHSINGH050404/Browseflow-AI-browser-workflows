"use client"

import { useEffect, useId, useState, useTransition } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createWorkflowAction } from "@/features/workflows/actions"

type CreateWorkflowDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Optional custom create handler (e.g. sidebar server action). Defaults to createWorkflowAction. */
  onCreate?: (name: string) => Promise<void>
}

export function CreateWorkflowDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateWorkflowDialogProps) {
  const inputId = useId()
  const [name, setName] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) setName("")
  }, [open])

  const submit = () => {
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error("Enter a workflow name")
      return
    }

    startTransition(async () => {
      try {
        if (onCreate) {
          await onCreate(trimmed)
        } else {
          await createWorkflowAction(trimmed)
        }
        onOpenChange(false)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Couldn't create workflow"
        )
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New workflow</DialogTitle>
          <DialogDescription>
            Give your workflow a name. You can rename it later from the editor
            menu.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor={inputId}>Name</Label>
            <Input
              id={inputId}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Scrape product prices"
              autoFocus
              maxLength={80}
              disabled={isPending}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
