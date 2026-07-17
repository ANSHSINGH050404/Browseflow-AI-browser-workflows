import { resend } from "@/lib/resend"

export async function sendEmail({
  to,
  subject,
  body,
}: {
  to: string
  subject: string
  body: string
}) {
  // Prefer a verified domain in production. Falls back to Resend's onboarding
  // address so local/dev still works without extra DNS.
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "Browseflow <onboarding@resend.dev>"

  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html: body.includes("<") ? body : body.replace(/\n/g, "<br/>"),
  })

  // The Resend SDK returns { data, error } and does not throw on API errors.
  // Throw so the run marks this step failed instead of looking successful.
  if (error || !data) {
    throw new Error(error?.message ?? "Resend returned no email id")
  }

  return { id: data.id }
}
