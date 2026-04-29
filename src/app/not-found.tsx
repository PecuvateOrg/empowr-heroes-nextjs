import Link from 'next/link'

export const metadata = {
  title: 'Page Not Found — Empowr Heroes',
}

export default function NotFound() {
  return (
    <main className="page-content">
      <div className="wrap" style={{ textAlign: 'center', padding: '80px 24px' }}>

        <p style={{ fontSize: '7rem', fontWeight: 900, color: 'var(--blue)', lineHeight: 1, margin: '0 0 8px' }}>
          404
        </p>

        <h1 className="h1" style={{ marginBottom: '16px' }}>
          Page Not Found
        </h1>

        <p style={{ fontSize: '1.1rem', color: 'var(--mid)', lineHeight: 1.7, maxWidth: '480px', margin: '0 auto 40px' }}>
          The page you&apos;re looking for doesn&apos;t exist or may have moved.
          Let&apos;s get you back on track.
        </p>

        <div className="btn-row-inline" style={{ justifyContent: 'center' }}>
          <Link href="/" className="btn btn-outline">← Back to Home</Link>
          <Link href="/become" className="btn btn-blue">Become a Hero →</Link>
        </div>

      </div>
    </main>
  )
}
