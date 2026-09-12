'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          minHeight: '100vh',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          backgroundColor: '#09090b',
          color: '#fafafa',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Application error</h1>
          <p style={{ color: '#a1a1aa', marginBottom: '1.5rem' }}>
            A critical error occurred. Please reload the page.
          </p>
          <button
            onClick={reset}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              border: '1px solid #3f3f46',
              background: '#fafafa',
              color: '#18181b',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `console.error(${JSON.stringify(
              error.message ?? 'global error'
            ).replace(/</g, '\\u003c')})`,
          }}
        />
      </body>
    </html>
  )
}
