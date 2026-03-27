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
    icon: '/empowr-favicon-logo.png',
    apple: '/empowr-favicon-logo.png',
  },
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
