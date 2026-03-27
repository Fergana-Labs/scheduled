import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Scheduled - AI Email Scheduling Agent';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #43614a 0%, #527559 50%, #3a5440 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '40px',
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: '20px',
              fontSize: '36px',
            }}
          >
            S
          </div>
          <div
            style={{
              fontSize: '42px',
              fontWeight: 700,
              color: 'white',
              letterSpacing: '-0.02em',
            }}
          >
            Scheduled
          </div>
        </div>
        <div
          style={{
            fontSize: '56px',
            fontWeight: 700,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.2,
            letterSpacing: '-0.03em',
            marginBottom: '24px',
          }}
        >
          AI Email Scheduling Agent
        </div>
        <div
          style={{
            fontSize: '24px',
            color: 'rgba(255, 255, 255, 0.85)',
            textAlign: 'center',
            lineHeight: 1.5,
            maxWidth: '800px',
          }}
        >
          Reads your emails. Checks your calendar. Drafts perfect replies.
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.6)',
          }}
        >
          tryscheduled.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
