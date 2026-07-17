"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { useClerk } from "@clerk/nextjs"
import { PricingTable } from "@clerk/nextjs"
import { CheckCircle2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useProPlan } from "@/features/workflows/hooks/use-pro-plan"

class BillingErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error("Billing error caught:", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-sm">
          <h2 className="mb-2 text-base font-semibold text-destructive">
            Billing is not enabled
          </h2>
          <p className="mb-4 text-muted-foreground">
            The pricing table cannot be rendered because billing is currently
            disabled for this Clerk instance.
          </p>
          <a
            href="https://dashboard.clerk.com/last-active?path=billing/settings"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            Enable Billing in Clerk Dashboard
          </a>
        </div>
      )
    }

    return this.props.children
  }
}

function EntitlementBanner() {
  const { isLoaded, isPro, refreshEntitlements } = useProPlan()
  const [refreshing, setRefreshing] = React.useState(false)

  if (!isLoaded) {
    return (
      <p className="text-sm text-muted-foreground">Checking your plan…</p>
    )
  }

  if (isPro) {
    return (
      <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        <div>
          <p className="font-medium text-emerald-800 dark:text-emerald-300">
            Pro is active for this organization
          </p>
          <p className="mt-0.5 text-muted-foreground">
            The Agent node and unlimited workflows are unlocked. Open a workflow
            and add Agent from the Toolbar.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
      <p className="font-medium">This organization is on Free</p>
      <p className="text-muted-foreground">
        Subscribe to an <strong>Organization</strong> Pro plan below (not a
        personal user plan). After checkout, click refresh if Agent still looks
        locked — the session token can lag a few seconds.
      </p>
      <Button
        size="sm"
        variant="outline"
        className="w-fit"
        disabled={refreshing}
        onClick={() => {
          setRefreshing(true)
          void refreshEntitlements().finally(() => setRefreshing(false))
        }}
      >
        <RefreshCw className={refreshing ? "animate-spin" : undefined} />
        Refresh plan status
      </Button>
    </div>
  )
}

export default function BillingPage() {
  const { session } = useClerk()

  // Returning from checkout with newSubscriptionRedirectUrl lands here — reload
  // claims so the rest of the app sees Pro immediately.
  useEffect(() => {
    void session?.reload()
  }, [session])

  return (
    <div className="h-svh overflow-y-auto">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Plans & billing
          </h1>
          <p className="text-sm text-muted-foreground">
            Free includes 3 workflows and every node except Agent. Pro unlocks
            unlimited workflows and the Agent node.
          </p>
        </div>

        <EntitlementBanner />

        <div className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
          <div>
            <div className="text-sm font-semibold">Free</div>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Up to 3 workflows</li>
              <li>50 runs per month</li>
              <li>Start, Schedule, Open URL, Act, Extract, Observe</li>
              <li>HTTP, Wait, Condition, Email</li>
              <li>Session replay & multiplayer canvas</li>
              <li>Export / import / duplicate</li>
            </ul>
          </div>
          <div>
            <div className="text-sm font-semibold">Pro</div>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-muted-foreground">
              <li>Unlimited workflows</li>
              <li>Agent node (multi-step autonomy)</li>
              <li>Everything on Free</li>
            </ul>
          </div>
        </div>

        <BillingErrorBoundary>
          <PricingTable
            for="organization"
            newSubscriptionRedirectUrl="/billing"
          />
        </BillingErrorBoundary>

        <p className="text-xs text-muted-foreground">
          Plans must live under Clerk Dashboard → Billing →{" "}
          <strong>Organization Plans</strong> with slug{" "}
          <code className="rounded bg-muted px-1">pro</code> (or set{" "}
          <code className="rounded bg-muted px-1">
            NEXT_PUBLIC_PRO_PLAN_SLUG
          </code>{" "}
          to match). Optional: add feature{" "}
          <code className="rounded bg-muted px-1">agent</code> to the plan for
          feature-based unlocks.
        </p>

        <Button variant="ghost" size="sm" className="self-start" asChild>
          <Link href="/app">Back to app</Link>
        </Button>
      </div>
    </div>
  )
}
