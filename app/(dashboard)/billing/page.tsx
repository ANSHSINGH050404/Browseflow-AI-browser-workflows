"use client"

import React from "react"
import Link from "next/link"
import { PricingTable } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

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

export default function BillingPage() {
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

        <Button variant="ghost" size="sm" className="self-start" asChild>
          <Link href="/app">Back to app</Link>
        </Button>
      </div>
    </div>
  )
}
