import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
import PostHogProvider from '@/components/PostHogProvider'
// import CookieBannerFull from '@/components/CookieBannerFull'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  style: ['normal', 'italic'],
  variable: '--font-nunito',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Empowr Heroes — Be the Change',
  description: 'Support Empowr\'s mission of lifelong wellbeing through experiential learning. Become an Empowr Hero today.',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico' },
    ],
    apple: { url: '/apple-touch-icon.png' },
  },
  manifest: '/site.webmanifest',
}

const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Empowr CIC",
    "url": "https://empowrcic.org",
    "description": "Empowr CIC is a UK-based Community Interest Company focused on empowering individuals through education, employment, and community connection.",
    "sameAs": [
      "https://www.linkedin.com/company/empowr-cic",
      "https://www.instagram.com/empowr.cic",
      "https://www.facebook.com/empowr.cic",
      "https://www.youtube.com/@empowr.cic"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Empowr Heroes",
    "url": "https://heroes.empowrcic.org",
    "description": "Empowr Heroes is the fundraising and donation platform for Empowr CIC, enabling individuals and organisations to support community programmes through direct giving."
  }
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <PostHogProvider>
          <Nav />
          {children}
          <Footer />
          <CookieBanner />
          {/* <CookieBannerFull /> */}
        </PostHogProvider>
      </body>
    </html>
  )
}
