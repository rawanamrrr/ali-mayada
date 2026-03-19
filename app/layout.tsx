import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { RomanticAudio } from "@/components/romantic-audio"
import { LanguageProvider } from "@/contexts/LanguageContext"
import { LanguageToggle } from "@/components/language-toggle"
import { Footer } from "@/components/footer"
import "./globals.css"

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://ali-mayada.digitivaa.com"),
  title: "Ali & Mayada - Wedding Celebration",
  description: "Join us in celebrating Ali & Mayada's wedding",
  generator: "Digitiva",
  openGraph: {
    url: "https://ali-mayada.digitivaa.com/",
    type: "website",
    title: "Ali & Mayada - Wedding Celebration",
    description: "Join us in celebrating Ali & Mayada's wedding",
    images: [
      {
        url: "https://ali-mayada.digitivaa.com/invitation-design.jpg",
        width: 768,
        height: 1365,
        alt: "Ali & Mayada Wedding Invitation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ali & Mayada - Wedding Celebration",
    description: "Join us in celebrating Ali & Mayada's wedding",
    images: ["https://ali-mayada.digitivaa.com/invitation-design.jpg"],
  },
  icons: {
    icon: "/invitation-design.jpg",
    apple: "/invitation-design.jpg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Open Graph tags for Facebook & WhatsApp previews */}
        <meta property="og:url" content="https://ali-mayada.digitivaa.com/" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Ali & Mayada - Wedding Celebration" />
        <meta property="og:description" content="Join us in celebrating Ali & Mayada's wedding" />
        <meta
          property="og:image"
          content="https://ali-mayada.digitivaa.com/invitation-design.jpg"
        />
        <meta property="og:image:width" content="768" />
        <meta property="og:image:height" content="1365" />
        <meta property="og:image:alt" content="Ali & Mayada Wedding Invitation" />
        {/* Removed invalid fb:app_id since it's not needed for basic sharing */}

        {/* Twitter Card tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Ali & Mayada - Wedding Celebration" />
        <meta name="twitter:description" content="Join us in celebrating Ali & Mayada's wedding" />
        <meta name="twitter:image" content="https://ali-mayada.digitivaa.com/invitation-design.jpg" />

        {/* Preload PNG with high priority to eliminate lag on Netlify */}
        <link
          rel="preload"
          href="/invitation-design.jpg"
          as="image"
          type="image/png"
        />
        {/* Preload video and poster for faster intro */}
        <link
          rel="preload"
          href="/engagement-video.mp4"
          as="video"
          type="video/mp4"
        />
        {/* Preconnect to domains for faster loading */}
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" />
        {/* Preload Google Fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&display=swap"
          as="style"
        />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} ${playfair.variable} relative bg-[#ebebeb]`}>
        <LanguageProvider>
          <Suspense fallback={null}>
            <LanguageToggle />
            {children}
            <RomanticAudio />
            <Footer />
          </Suspense>
          <Analytics />
        </LanguageProvider>
      </body>
    </html>
  )
}