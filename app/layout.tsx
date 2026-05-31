import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const siteUrl = "https://vedantkeshariaportfolio.vercel.app"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Vedant Kesharia | Full-Stack AI Engineer, SDE, and Researcher",
  description:
    "Vedant Kesharia portfolio featuring AI/ML research, software engineering experience, publications, and full-stack projects in Next.js, AWS, Java, Python, and React.",
  keywords: [
    "Vedant Kesharia",
    "Vedant Kesharia portfolio",
    "Vedant Kesharia AI engineer",
    "Vedant Kesharia software engineer",
    "Vedant Kesharia researcher",
    "Full-Stack AI Engineer",
    "Software Development Engineer",
    "AI ML portfolio",
    "Next.js portfolio",
    "AWS Java developer",
  ],
  authors: [{ name: "Vedant Kesharia", url: siteUrl }],
  creator: "Vedant Kesharia",
  publisher: "Vedant Kesharia",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Vedant Kesharia Portfolio",
    title: "Vedant Kesharia | Full-Stack AI Engineer, SDE, and Researcher",
    description:
      "Explore Vedant Kesharia's portfolio, including Amazon SDE experience, AI/ML research publications, and full-stack engineering projects.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vedant Kesharia | Full-Stack AI Engineer, SDE, and Researcher",
    description:
      "Portfolio of Vedant Kesharia with software engineering experience, AI/ML research, publications, and full-stack projects.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
  generator: "Next.js",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
