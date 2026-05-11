import type { Metadata } from 'next'
import { Nunito } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CookieBanner from '@/components/CookieBanner'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>
        <Nav />
        {children}
        <Footer />
        <CookieBanner />
        {/* <CookieBannerFull /> */}
      </body>
    </html>
  )
}
