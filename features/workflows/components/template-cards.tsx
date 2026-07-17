"use client"

import { useTransition } from "react"
import { LayoutTemplate, Sparkles } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createWorkflowFromTemplateAction } from "@/features/workflows/actions"
import {
  FREE_WORKFLOW_LIMIT,
  workflowLimitMessage,
} from "@/features/workflows/lib/limits"
import { workflowTemplates } from "@/features/workflows/templates"
import { useProPlan } from "@/features/workflows/hooks/use-pro-plan"

export function TemplateCards({ workflowCount = 0 }: { workflowCount?: number }) {
  const [isPending, startTransition] = useTransition()
  const { isLoaded, isPro, goToUpgrade } = useProPlan()
  const atFreeLimit =
    isLoaded && !isPro && workflowCount >= FREE_WORKFLOW_LIMIT

  const useTemplate = (templateId: string) => {
    if (atFreeLimit) {
      toast.error(workflowLimitMessage())
      goToUpgrade()
      return
    }
    startTransition(async () => {
      try {
        await createWorkflowFromTemplateAction(templateId)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Couldn't create from template"
        )
      }
    })
  }

  return (
    <div className="grid w-full max-w-4xl gap-3 sm:grid-cols-2">
      {workflowTemplates.map((template) => (
        <Card key={template.id} className="text-left shadow-none">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">{template.name}</CardTitle>
              <Badge variant="secondary">{template.badge}</Badge>
            </div>
            <CardDescription>{template.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={() => useTemplate(template.id)}
            >
              <LayoutTemplate className="size-3.5" />
              Use template
            </Button>
          </CardContent>
        </Card>
      ))}
      <Card className="border-dashed text-left shadow-none sm:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="size-4" />
            Tip
          </CardTitle>
          <CardDescription>
            Free plan includes {FREE_WORKFLOW_LIMIT} workflows. The Agent node
            and unlimited workflows are on Pro — everything else is free to try.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
