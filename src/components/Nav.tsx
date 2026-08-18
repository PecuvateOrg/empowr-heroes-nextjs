'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { LINKS } from '@/lib/links'

export default function Nav() {
  const pathname = usePathname()

  if (pathname.startsWith('/thankyou')) return null

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav>
      <div className="nav-logo">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Image
            src={LINKS.assets.logo}
            alt="Empowr"
            width={120}
            height={48}
            priority
            style={{ height: '48px', width: 'auto', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--black)' }}>Heroes</span>
        </Link>
      </div>
      <ul className="nav-links">
        <li>
          <Link href="/" className={isActive('/') ? 'active' : ''}>Our Mission</Link>
        </li>
        <li>
          <Link href="/projects" className={isActive('/projects') ? 'active' : ''}>Support a Project</Link>
        </li>
        <li>
          <Link href="/become" className={isActive('/become') ? 'active' : ''}>Become a Hero</Link>
        </li>
        <li>
          <Link href="/tiers" className={isActive('/tiers') ? 'active' : ''}>Hero Tiers</Link>
        </li>
      </ul>
    </nav>
  )
}
