"use client"

import { useCallback, useEffect, useMemo } from "react"
import { useAuth, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

import {
  BILLING_PATH,
  checkIsPro,
} from "@/features/workflows/lib/billing"

export type ProPlan = {
  // Whether Clerk has hydrated the session — `isPro` is not meaningful until this
  // is true, so components should treat `false` as "still loading", not "not pro".
  isLoaded: boolean
  // True when the active organization is subscribed to the Pro plan. Reflects the
  // active entity, so it follows the org the user currently has selected.
  isPro: boolean
  // Send the user to the pricing page to subscribe / upgrade.
  goToUpgrade: () => void
  // Force-refresh the session JWT so new plan claims show up after checkout.
  refreshEntitlements: () => Promise<void>
}

// Tells a component whether the active organization is on Pro, and hands it a
// callback to route the user to the pricing page to upgrade. Use to gate UI
// behind the Pro plan (e.g. show an "Upgrade" prompt instead of a pro-only node).
export function useProPlan(): ProPlan {
  const { has, isLoaded, orgId } = useAuth()
  const { session } = useClerk()
  const router = useRouter()

  // After returning from checkout, the JWT can lag the subscription. Reload once
  // when we have an org and still look free — cheap and fixes the most common
  // "I paid but still locked" report.
  useEffect(() => {
    if (!isLoaded || !orgId || !session) return
    if (checkIsPro(has)) return

    let cancelled = false
    void (async () => {
      try {
        await session.reload()
      } catch {
        // ignore — user may not have just subscribed
      }
      if (!cancelled) {
        // no-op: useAuth will re-render with new claims after reload
      }
    })()

    return () => {
      cancelled = true
    }
    // Only re-run when org/session identity changes, not on every has() flip.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [isLoaded, orgId, session?.id])

  const goToUpgrade = useCallback(() => {
    router.push(BILLING_PATH)
  }, [router])

  const refreshEntitlements = useCallback(async () => {
    await session?.reload()
  }, [session])

  const isPro = useMemo(() => {
    // Without an active org, org-plan checks always fail in this B2B app.
    if (!orgId) return false
    return checkIsPro(has)
  }, [has, orgId])

  return { isLoaded, isPro, goToUpgrade, refreshEntitlements }
}
