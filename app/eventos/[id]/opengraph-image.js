import { ImageResponse } from 'next/og';
import { getEventById } from '../../lib/events';

export const runtime = 'edge';
export const alt = 'Evento de moto na Pistaviva';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const firstImage = (event) => (
  Array.isArray(event?.images) && event.images.length
    ? event.images[0]
    : event?.image_url
);

export default async function EventOpenGraphImage({ params }) {
  const { id } = await params;
  const event = await getEventById(id);
  const cover = firstImage(event);
  const title = event?.title || 'Próximo encontro na estrada';
  const category = event?.category || 'Evento de moto';
  const details = [event?.date, event?.time].filter(Boolean).join(' · ');
  const place = event?.local || event?.address || 'Brasil';

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#111512', color: '#f7f1e7', fontFamily: 'sans-serif' }}>
        {cover && <img src={cover} alt="" width="1200" height="630" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', background: cover
          ? 'linear-gradient(90deg, rgba(10,14,11,.97) 0%, rgba(10,14,11,.86) 48%, rgba(10,14,11,.18) 100%)'
          : 'linear-gradient(135deg, #101713 0%, #25251f 100%)' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 14, display: 'flex', background: '#f25b22' }} />

        <div style={{ position: 'relative', width: 790, height: '100%', padding: '58px 68px 52px 78px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ display: 'flex', padding: '9px 14px', background: '#f25b22', color: '#fff', fontSize: 19, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>{category}</span>
            <span style={{ display: 'flex', fontSize: 19, fontWeight: 700, letterSpacing: 3, color: '#d6d0c5' }}>AGENDA PISTAVIVA</span>
          </div>

          <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: title.length > 52 ? 58 : 72, lineHeight: 1.02, letterSpacing: -2, fontWeight: 900, textWrap: 'balance' }}>{title}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, paddingTop: 22, borderTop: '2px solid rgba(247,241,231,.32)' }}>
            {details && <div style={{ display: 'flex', fontSize: 28, fontWeight: 800, color: '#f5a276' }}>{details}</div>}
            <div style={{ display: 'flex', alignItems: 'center', fontSize: 25, color: '#f7f1e7' }}>
              <span style={{ display: 'flex', marginRight: 14, color: '#9b978e', fontSize: 16, fontWeight: 800, letterSpacing: 2 }}>LOCAL</span>
              {place}
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', right: 46, bottom: 38, display: 'flex', alignItems: 'baseline', padding: '11px 17px', background: 'rgba(10,14,11,.84)', border: '1px solid rgba(255,255,255,.2)' }}>
          <span style={{ display: 'flex', fontSize: 29, fontWeight: 900, letterSpacing: -1 }}>PISTA</span>
          <span style={{ display: 'flex', fontSize: 29, fontWeight: 900, letterSpacing: -1, color: '#f25b22' }}>VIVA</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
