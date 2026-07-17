"use client"

import Link from "next/link"
import { Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import type { UsageSummary } from "@/features/workflows/lib/limits"
import { cn } from "@/lib/utils"

function MeterRow({
  label,
  used,
  limit,
}: {
  label: string
  used: number
  limit: number
}) {
  const pct = Math.min(100, Math.round((used / Math.max(limit, 1)) * 100))
  const near = pct >= 80
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn(near && "text-amber-600 dark:text-amber-400")}>
          {used}/{limit}
        </span>
      </div>
      <Progress
        value={pct}
        className={cn(
          "h-1",
          near && "[&_[data-slot=progress-indicator]]:bg-amber-500"
        )}
      />
    </div>
  )
}

export function UsageMeter({ usage }: { usage: UsageSummary }) {
  if (usage.isPro) {
    return (
      <div className="rounded-lg border border-border bg-card px-2.5 py-2 group-data-[collapsible=icon]:hidden">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-medium">Usage</span>
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <Sparkles className="size-3" />
            Pro
          </Badge>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">
          Unlimited workflows · Agent unlocked
        </p>
      </div>
    )
  }

  const wfLimit = usage.workflowLimit ?? 3
  const runLimit = usage.runLimit ?? 50

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card px-2.5 py-2 group-data-[collapsible=icon]:hidden">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium">Usage</span>
        <Badge variant="outline" className="text-[10px]">
          Free
        </Badge>
      </div>
      <MeterRow
        label="Workflows"
        used={usage.workflowsUsed}
        limit={wfLimit}
      />
      {usage.runsUsedThisMonth != null && (
        <MeterRow
          label="Runs this month"
          used={usage.runsUsedThisMonth}
          limit={runLimit}
        />
      )}
      <p className="text-[11px] text-muted-foreground">
        Agent node is Pro-only.
      </p>
      <Button size="sm" variant="secondary" className="h-7 text-xs" asChild>
        <Link href="/billing">Upgrade</Link>
      </Button>
    </div>
  )
}
