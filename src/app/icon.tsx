import { ImageResponse } from 'next/og'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        border: '2px solid #22c55e',
        borderRadius: '8px',
        flexDirection: 'column',
      }}
    >
      <span
        style={{
          color: '#22c55e',
          fontSize: 20,
          fontWeight: 800,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          lineHeight: 1,
          marginTop: '-1px',
        }}
      >
        $
      </span>
    </div>,
    { width: 32, height: 32 },
  )
}
