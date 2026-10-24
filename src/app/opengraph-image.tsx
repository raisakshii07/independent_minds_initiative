import { ImageResponse } from 'next/og';

export const runtime = 'nodejs';
export const alt = 'Independent Minds Initiative — Think Freely. Learn Deeply. Act Meaningfully.';
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
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#071727',
          padding: '65px 75px',
          color: '#f4eddf',
          border: '12px solid #0c2033',
        }}
      >
        {/* Top Header / Branding */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '27px',
                border: '2px solid #d9bd78',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#d9bd78',
                fontSize: '20px',
                fontWeight: 'bold',
                marginRight: '18px',
              }}
            >
              IMI
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span
                style={{
                  fontSize: '15px',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: '#d9bd78',
                  fontWeight: 600,
                }}
              >
                Independent Minds Initiative
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: '#8fa3b0',
                  marginTop: '4px',
                }}
              >
                Intellectual Independence - Critical Inquiry - Civic Imagination
              </span>
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              padding: '6px 14px',
              border: '1px solid rgba(217, 189, 120, 0.4)',
              borderRadius: '20px',
              color: '#d9bd78',
              fontSize: '12px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Public Forum
          </div>
        </div>

        {/* Center Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '980px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '60px',
              lineHeight: 1.15,
              fontWeight: 400,
              color: '#f4eddf',
              marginBottom: '16px',
            }}
          >
            <span>Think Freely. Learn Deeply.</span>
            <span style={{ color: '#d9bd78', fontStyle: 'italic', marginTop: '6px' }}>
              Act Meaningfully.
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: '21px',
              lineHeight: 1.45,
              color: '#a3b8c7',
              maxWidth: '880px',
            }}
          >
            A youth-led platform creating space for independent thinking, open dialogue,
            and interdisciplinary inquiry across society, geopolitics, philosophy, and economics.
          </div>
        </div>

        {/* Bottom Metadata & Values */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(217, 189, 120, 0.25)',
            paddingTop: '24px',
            fontSize: '14px',
            color: '#8fa3b0',
          }}
        >
          <div style={{ display: 'flex' }}>
            <span style={{ marginRight: '24px' }}>* Curiosity</span>
            <span style={{ marginRight: '24px' }}>* Courage</span>
            <span style={{ marginRight: '24px' }}>* Community</span>
            <span>* Open Inquiry</span>
          </div>
          <div style={{ display: 'flex', color: '#d9bd78' }}>
            independent-minds-initiative.onrender.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
