import { wait } from "@trigger.dev/sdk"

export async function waitSeconds({ seconds }: { seconds: string }) {
  const n = Number(seconds)
  if (!Number.isFinite(n) || n < 0) {
    throw new Error("Wait node requires a non-negative number of seconds")
  }
  // Cap so a misconfigured node cannot hold a machine for hours.
  const capped = Math.min(Math.floor(n), 60 * 30)
  if (capped > 0) {
    await wait.for({ seconds: capped })
  }
  return { waitedSeconds: capped }
}
