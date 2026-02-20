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
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
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
              'linear-gradient(rgba(148,163,184,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.05) 1px, transparent 1px)',
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
            height: '3px',
            background: 'linear-gradient(90deg, transparent, #22d3ee, transparent)',
          }}
        />

        {/* Icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}
        >
          <svg width="72" height="72" viewBox="0 0 64 64" fill="none">
            <rect x="4" y="14" width="56" height="36" rx="4" fill="#3B82F6" />
            <path d="M4 18l28 18 28-18" stroke="#1E40AF" strokeWidth="2" fill="none" />
            <path d="M8 18l24 15 24-15" stroke="#BFDBFE" strokeWidth="1.5" fill="none" />
            <circle cx="48" cy="42" r="12" fill="#22C55E" />
            <path d="M42 42l4 4 8-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: '64px',
            fontWeight: 700,
            color: '#f1f5f9',
            letterSpacing: '-0.02em',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          mail-check
          <span style={{ fontSize: '28px', color: '#94a3b8', fontWeight: 400, marginLeft: '4px' }}>
            by t21.dev
          </span>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: '24px',
            color: '#94a3b8',
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
                border: '1px solid rgba(34,211,238,0.2)',
                backgroundColor: 'rgba(34,211,238,0.08)',
                color: '#22d3ee',
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
            color: '#475569',
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
