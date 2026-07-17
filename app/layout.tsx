import type { Metadata } from "next"
import { ClerkProvider } from "@clerk/nextjs"
import { shadcn } from "@clerk/ui/themes"
import { Geist, Geist_Mono } from "next/font/google"

import "@clerk/ui/themes/shadcn.css"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Browseflow — AI browser workflows",
    template: "%s · Browseflow",
  },
  description:
    "Describe the browser. Ship the workflow. Visual AI browser automation with live runs and session replay.",
  applicationName: "Browseflow",
  openGraph: {
    title: "Browseflow — AI browser workflows",
    description:
      "Visual builder for AI browser automation — act, extract, agent, and more.",
    type: "website",
    siteName: "Browseflow",
  },
  twitter: {
    card: "summary_large_image",
    title: "Browseflow",
    description: "AI browser workflows without the scripts.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        geist.variable
      )}
    >
      <body>
        <ClerkProvider
          appearance={{ theme: shadcn }}
          taskUrls={{ "choose-organization": "/choose-organization" }}
          signInFallbackRedirectUrl="/app"
          signUpFallbackRedirectUrl="/app"
        >
          <ThemeProvider>
            <TooltipProvider>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </ClerkProvider>
      </body>
    </html>
  )
}
