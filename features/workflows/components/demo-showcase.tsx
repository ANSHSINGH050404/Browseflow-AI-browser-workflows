"use client"

import { useEffect, useState } from "react"
import {
  CheckCircle2,
  Globe,
  Loader2,
  Play,
  ScanText,
  Sparkles,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StepStatus = "pending" | "running" | "done"

const STEPS = [
  { id: "start", label: "Start", icon: Play },
  { id: "open", label: "Open example.com", icon: Globe },
  { id: "extract", label: "Extract heading", icon: ScanText },
] as const

/**
 * Animated product mock for the landing page. If NEXT_PUBLIC_DEMO_VIDEO_URL is
 * set (YouTube or Vimeo watch/embed URL), an iframe is preferred instead.
 */
export function DemoShowcase() {
  const videoUrl = process.env.NEXT_PUBLIC_DEMO_VIDEO_URL?.trim()
  const embed = videoUrl ? toEmbedUrl(videoUrl) : null

  if (embed) {
    return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <iframe
          src={embed}
          title="Browseflow product demo"
          className="absolute inset-0 size-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return <AnimatedCanvasDemo />
}

function toEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url)
    if (u.hostname.includes("youtube.com") || u.hostname.includes("youtu.be")) {
      let id = u.searchParams.get("v")
      if (!id && u.hostname.includes("youtu.be")) {
        id = u.pathname.slice(1)
      }
      if (!id && u.pathname.startsWith("/embed/")) {
        id = u.pathname.split("/")[2]
      }
      return id ? `https://www.youtube.com/embed/${id}?rel=0` : null
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop()
      return id ? `https://player.vimeo.com/video/${id}` : null
    }
    // Already an embed URL
    if (url.includes("/embed/") || url.includes("player.vimeo.com")) {
      return url
    }
  } catch {
    return null
  }
  return null
}

function AnimatedCanvasDemo() {
  const [statuses, setStatuses] = useState<StepStatus[]>([
    "pending",
    "pending",
    "pending",
  ])
  const [output, setOutput] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    async function loop() {
      while (!cancelled) {
        setStatuses(["pending", "pending", "pending"])
        setOutput(null)
        await sleep(600)
        if (cancelled) return

        for (let i = 0; i < STEPS.length; i++) {
          setStatuses((prev) => prev.map((s, idx) => (idx === i ? "running" : s)))
          await sleep(900)
          if (cancelled) return
          setStatuses((prev) => prev.map((s, idx) => (idx === i ? "done" : s)))
        }

        setOutput("Example Domain")
        await sleep(2200)
      }
    }

    void loop()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <Sparkles className="size-3" />
            Live demo
          </Badge>
          <span className="text-xs text-muted-foreground">
            Extract page title
          </span>
        </div>
        <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium">
          Run
        </span>
      </div>

      <div className="grid gap-0 md:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-wrap items-center justify-center gap-3 p-6 md:p-8">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            const status = statuses[i]
            return (
              <div key={step.id} className="flex items-center gap-3">
                <div
                  className={cn(
                    "min-w-36 rounded-lg border-2 bg-background px-3 py-2.5 transition-colors",
                    status === "running" && "border-blue-500",
                    status === "done" && "border-emerald-500/60",
                    status === "pending" && "border-border"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex size-7 items-center justify-center rounded-md text-white",
                        i === 0 && "bg-blue-500",
                        i === 1 && "bg-emerald-500",
                        i === 2 && "bg-amber-500"
                      )}
                    >
                      {status === "running" ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : status === "done" ? (
                        <CheckCircle2 className="size-3.5" />
                      ) : (
                        <Icon className="size-3.5" />
                      )}
                    </div>
                    <span className="text-xs font-semibold">{step.label}</span>
                  </div>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden h-px w-6 bg-border sm:block" />
                )}
              </div>
            )
          })}
        </div>

        <div className="border-t border-border bg-muted/40 p-4 md:border-t-0 md:border-l">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Console
          </p>
          <div className="space-y-1.5 font-mono text-[11px]">
            {STEPS.map((step, i) => (
              <div key={step.id} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{step.label}</span>
                <span
                  className={cn(
                    statuses[i] === "done" && "text-emerald-600",
                    statuses[i] === "running" && "text-blue-600",
                    statuses[i] === "pending" && "text-muted-foreground/60"
                  )}
                >
                  {statuses[i]}
                </span>
              </div>
            ))}
            {output && (
              <div className="mt-3 rounded-md border border-border bg-background p-2">
                <span className="text-muted-foreground">extraction: </span>
                <span className="font-medium">&quot;{output}&quot;</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
