import Link from "next/link"
import {
  Bot,
  Eye,
  Globe,
  Play,
  ScanText,
  Sparkles,
  Users,
  Video,
  Workflow,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DemoShowcase } from "@/features/workflows/components/demo-showcase"

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Workflow className="size-4" />
          </span>
          Browseflow
        </Link>
        <nav className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/help">Docs</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/sign-up">Start free</Link>
          </Button>
        </nav>
      </header>

      <main>
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-16 text-center md:py-24">
          <Badge variant="secondary" className="gap-1.5">
            <Sparkles className="size-3" />
            AI browser automation, as a visual flow
          </Badge>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance md:text-6xl">
            Describe the browser. Ship the workflow.
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground text-balance">
            Browseflow is a visual builder for AI browser workflows — open pages,
            act, extract, and agent through multi-step automations, with live runs
            and session replay for your team.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/sign-up">
                Start free
                <Play className="size-4 fill-current" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#demo">Watch demo</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Free plan: 3 workflows · 50 runs/month · Agent is Pro
          </p>
        </section>

        <section id="demo" className="mx-auto max-w-5xl scroll-mt-20 px-6 pb-16">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              See a run in under a minute
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Open a page, extract data, watch live status — without writing
              selectors.
            </p>
          </div>
          <DemoShowcase />
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Set{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              NEXT_PUBLIC_DEMO_VIDEO_URL
            </code>{" "}
            to a YouTube or Vimeo link to swap in a real recording.
          </p>
        </section>

        <section className="border-y border-border bg-muted/30">
          <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
            {[
              {
                icon: Globe,
                title: "Natural-language steps",
                body: "Act, Extract, Observe, and Agent nodes — describe what you want instead of writing selectors.",
              },
              {
                icon: Video,
                title: "Live runs + replay",
                body: "Watch each step succeed or fail in real time, then play back the Browserbase session recording.",
              },
              {
                icon: Users,
                title: "Built for teams",
                body: "Org workspaces, multiplayer canvas editing, and Pro billing when you are ready to scale.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="size-5" />
                </div>
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="mb-8 text-center text-2xl font-semibold tracking-tight">
            Nodes that map to how you think
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Play,
                label: "Start / Schedule",
                hint: "Manual or hourly/daily",
              },
              {
                icon: Globe,
                label: "Open URL",
                hint: "Navigate the browser",
              },
              {
                icon: ScanText,
                label: "Extract",
                hint: "Pull structured data",
              },
              {
                icon: Eye,
                label: "Observe",
                hint: "Find actionable elements",
              },
              {
                icon: Bot,
                label: "Agent",
                hint: "Multi-step autonomy (Pro)",
              },
              {
                icon: Sparkles,
                label: "HTTP · Wait · Condition",
                hint: "APIs and control flow",
              },
            ].map((n) => (
              <div
                key={n.label}
                className="flex items-start gap-3 rounded-lg border border-border p-4"
              >
                <n.icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">{n.label}</div>
                  <div className="text-xs text-muted-foreground">{n.hint}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="border-t border-border bg-muted/30">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-16 text-center">
            <h2 className="text-2xl font-semibold tracking-tight">
              Ready to automate the web?
            </h2>
            <p className="text-muted-foreground">
              Create an org, pick a template, hit Run. No scripts required.
            </p>
            <Button size="lg" asChild>
              <Link href="/sign-up">Create your free account</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-8 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} Browseflow</span>
        <div className="flex gap-4">
          <Link href="/help" className="hover:text-foreground">
            Docs
          </Link>
          <Link href="/sign-in" className="hover:text-foreground">
            Sign in
          </Link>
          <Link href="/billing" className="hover:text-foreground">
            Pricing
          </Link>
        </div>
      </footer>
    </div>
  )
}
