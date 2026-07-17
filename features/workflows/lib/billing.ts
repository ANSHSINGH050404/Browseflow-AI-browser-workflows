/**
 * Plan / entitlement checks for Browseflow.
 *
 * Clerk B2B (organization) plans are often registered as slug `pro` under the
 * Organization Plans tab, but `has()` may require the `org:` prefix
 * (`org:pro`). User-plan checkouts use bare `pro`. We accept both, plus an
 * optional feature slug, so a correctly subscribed org is never locked out
 * by a slug-prefix mismatch.
 *
 * Override via env if your dashboard slug differs:
 *   NEXT_PUBLIC_PRO_PLAN_SLUG=pro
 *   NEXT_PUBLIC_AGENT_FEATURE_SLUG=agent
 */

export const BILLING_PATH = "/billing"

const DEFAULT_PLAN_SLUGS = ["pro", "org:pro"] as const

function planSlugs(): string[] {
  const fromEnv = process.env.NEXT_PUBLIC_PRO_PLAN_SLUG?.trim()
  if (fromEnv) {
    // If they set "pro", also try "org:pro" (and vice versa).
    const variants = new Set([fromEnv])
    if (fromEnv.startsWith("org:")) {
      variants.add(fromEnv.slice(4))
    } else {
      variants.add(`org:${fromEnv}`)
    }
    return [...variants]
  }
  return [...DEFAULT_PLAN_SLUGS]
}

function agentFeatureSlug(): string {
  return process.env.NEXT_PUBLIC_AGENT_FEATURE_SLUG?.trim() || "agent"
}

/**
 * Clerk `has` from `auth()` / `useAuth()` — may be undefined while loading.
 * Typed loosely: Clerk's generated check types are strict union over known
 * plan/feature slugs, but we pass runtime slugs from env / dashboard config.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClerkHas = ((check: any) => boolean) | undefined | null

/**
 * True when the active entity (org when selected) is on Pro / has Agent.
 * Safe when `has` is still undefined (returns false).
 */
export function checkIsPro(has: ClerkHas): boolean {
  if (!has) return false

  // Feature entitlement is the preferred capability gate when configured on the plan.
  try {
    if (has({ feature: agentFeatureSlug() })) return true
  } catch {
    // Feature may not exist on the instance yet — fall through to plan checks.
  }

  for (const slug of planSlugs()) {
    try {
      if (has({ plan: slug })) return true
    } catch {
      // ignore invalid slug shapes
    }
  }

  return false
}
