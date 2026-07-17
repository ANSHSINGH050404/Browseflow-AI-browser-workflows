import Link from "next/link"
import { SignUp } from "@clerk/nextjs"
import { Workflow } from "lucide-react"

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <Link
        href="/"
        className="flex items-center gap-2 font-semibold tracking-tight"
      >
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Workflow className="size-4" />
        </span>
        Browseflow
      </Link>
      <div className="max-w-sm text-center text-sm text-muted-foreground">
        Free plan includes 3 workflows and all core nodes. Upgrade anytime for
        Agent and unlimited workflows.
      </div>
      <SignUp forceRedirectUrl="/app" signInUrl="/sign-in" />
    </div>
  )
}
