import Link from "next/link"
import { Workflow } from "lucide-react"

import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Docs · Browseflow",
  description: "How to build and run AI browser workflows in Browseflow.",
}

export default function HelpPage() {
  return (
    <div className="min-h-svh bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Workflow className="size-4" />
          </span>
          Browseflow
        </Link>
        <Button size="sm" asChild>
          <Link href="/sign-up">Start free</Link>
        </Button>
      </header>

      <article className="mx-auto max-w-3xl space-y-8 px-6 py-10">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">How Browseflow works</h1>
          <p className="mt-2 text-muted-foreground">
            Build visual workflows that drive a real browser with AI, then run
            them on demand or on a schedule.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">1. Create a workflow</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Sign up, create or join an organization, then open the app home.
            Start from a <strong>template</strong> or a blank canvas. Free orgs
            get 3 workflows; Pro is unlimited.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">2. Add nodes</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Start</strong> — run manually from the Run button.
            </li>
            <li>
              <strong>Schedule</strong> — hourly or daily (save the graph so the
              scheduler can load it).
            </li>
            <li>
              <strong>Open URL, Act, Extract, Observe, Agent</strong> — browser
              steps powered by Stagehand + Browserbase.
            </li>
            <li>
              <strong>HTTP, Wait, Condition, Send Email</strong> — APIs, delays,
              gates, and notifications.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">3. Wire data between steps</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Click a node, focus a field, then click a <strong>Connection</strong>{" "}
            chip to insert tokens like{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              {"{{nodeId.path}}"}
            </code>
            . Upstream outputs are interpolated before each step runs.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">4. Run, stop, replay</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hit <strong>Run</strong> to validate the graph, persist it, and start
            a background task. Watch live status in the console. After browser
            steps finish, open the session replay. Use{" "}
            <strong>Save graph</strong> from the ⋯ menu so scheduled workflows
            keep the latest snapshot.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Duplicate, export, import</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            In the editor ⋯ menu: <strong>Duplicate</strong> clones the graph
            with new node ids, <strong>Export JSON</strong> downloads a{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              .browseflow.json
            </code>{" "}
            file. On the app home, use <strong>Import</strong> to load that file
            into a new workflow.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Plans &amp; usage</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>
              <strong>Free</strong> — up to 3 workflows, 50 runs/month, all nodes
              except Agent. Usage meters live in the sidebar.
            </li>
            <li>
              <strong>Pro</strong> — unlimited workflows + Agent node.
            </li>
          </ul>
          <Button variant="outline" size="sm" className="mt-2" asChild>
            <Link href="/billing">View billing</Link>
          </Button>
        </section>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Email delivery</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Set <code className="rounded bg-muted px-1 py-0.5 text-xs">RESEND_FROM_EMAIL</code>{" "}
            to a verified Resend sender (e.g.{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              Browseflow &lt;alerts@yourdomain.com&gt;
            </code>
            ). Without it, the app falls back to Resend&apos;s onboarding address
            for development.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-muted/30 p-6">
          <h2 className="text-lg font-semibold">Invite teammates</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Use the organization switcher in the sidebar → manage organization →
            Members to invite your team. Everyone in the org can edit the same
            canvas in realtime.
          </p>
        </section>
      </article>
    </div>
  )
}
