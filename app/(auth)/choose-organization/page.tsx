import { TaskChooseOrganization } from "@clerk/nextjs"

export default function ChooseOrganizationPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
      <div className="max-w-sm text-center">
        <h1 className="text-lg font-semibold tracking-tight">
          Choose a workspace
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Browseflow organizes workflows by organization so your team can
          collaborate. Create one or pick an existing org to continue.
        </p>
      </div>
      <TaskChooseOrganization redirectUrlComplete="/app" />
    </div>
  )
}
