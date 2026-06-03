import { ImageResponse } from 'next/og';

// OG image padrão do site (1200×630) — usada no compartilhamento social de toda
// página que não define a sua própria. Gerada por código (sem arquivo estático).
export const runtime = 'edge';
export const alt = 'Pistaviva — Mototurismo, Rotas e Cultura sobre Duas Rodas';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: 'linear-gradient(135deg, #0e1311 0%, #16161a 100%)',
          color: '#f3ede1',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 26, letterSpacing: 8, color: '#9a948a', fontWeight: 700 }}>
          MOTOTURISMO · BRASIL
        </div>
        <div style={{ display: 'flex', fontSize: 128, fontWeight: 900, letterSpacing: -4, marginTop: 16, lineHeight: 1 }}>
          PISTA<span style={{ color: '#ff5a00' }}>VIVA</span>
        </div>
        <div style={{ display: 'flex', fontSize: 40, color: '#cfc8bb', marginTop: 24, maxWidth: 900 }}>
          Rotas, paradas, eventos e cultura sobre duas rodas.
        </div>
        <div style={{ display: 'flex', marginTop: 40, height: 8, width: 180, background: '#ff5a00', borderRadius: 4 }} />
      </div>
    ),
    { ...size }
  );
}
