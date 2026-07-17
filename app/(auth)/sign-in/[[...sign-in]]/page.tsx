import Link from "next/link"
import { SignIn } from "@clerk/nextjs"
import { Workflow } from "lucide-react"

export default function SignInPage() {
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
      <SignIn forceRedirectUrl="/app" signUpUrl="/sign-up" />
    </div>
  )
}
