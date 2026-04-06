'use client'

import { usePathname } from 'next/navigation'

export default function Mantra() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <div className="mantra-outer">
      <div className="mantra-inner">
        <p className="tagline">
          <span style={{ color: 'var(--red)' }}>Live by growing.</span>{' '}
          <span style={{ color: 'var(--blue)' }}>Grow by learning.</span>{' '}
          <span style={{ color: 'var(--black)' }}>Learn by doing.</span>
          {isHome && (
            <>
              <br />
              Together, we move wellbeing forward — one action at a time.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
