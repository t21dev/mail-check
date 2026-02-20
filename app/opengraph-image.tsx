import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'mail-check by t21.dev — Verify if email addresses exist'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#ffffff',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        {/* Top accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #0891b2, transparent)',
          }}
        />

        {/* Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '28px',
          }}
        >
          <svg width="96" height="96" viewBox="0 0 64 64" fill="none">
            <rect x="4" y="14" width="56" height="36" rx="4" fill="#0891b2" />
            <path d="M4 18l28 18 28-18" stroke="#065986" strokeWidth="2" fill="none" />
            <path d="M8 18l24 15 24-15" stroke="#a5f3fc" strokeWidth="1.5" fill="none" />
            <circle cx="48" cy="42" r="12" fill="#16a34a" />
            <path d="M42 42l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          mail-check
          <span style={{ fontSize: '28px', color: '#64748b', fontWeight: 400, marginLeft: '4px' }}>
            by t21.dev
          </span>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '24px',
            color: '#475569',
            marginTop: '16px',
            maxWidth: '600px',
            textAlign: 'center',
          }}
        >
          Verify if email addresses exist — without sending them.
        </div>

        {/* Feature pills */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '40px',
          }}
        >
          {['MX Lookup', 'SMTP Probe', 'Catch-All Detection', 'Disposable Check'].map((label) => (
            <div
              key={label}
              style={{
                padding: '8px 16px',
                borderRadius: '9999px',
                border: '1px solid rgba(8,145,178,0.2)',
                backgroundColor: 'rgba(8,145,178,0.06)',
                color: '#0891b2',
                fontSize: '14px',
                fontWeight: 500,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '32px',
            fontSize: '16px',
            color: '#94a3b8',
            fontFamily: 'monospace',
          }}
        >
          mail-check.t21.dev
        </div>
      </div>
    ),
    { ...size }
  )
}
