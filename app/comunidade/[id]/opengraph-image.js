import { ImageResponse } from 'next/og';
import { getCommunityPostById } from '../../lib/community';

export const runtime = 'edge';
export const alt = 'Relato da comunidade Pistaviva';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const CATEGORY = { viagem: 'Diário de viagem', bateevolta: 'Bate e volta', trilha: 'Trilha', evento: 'Encontro' };

export default async function CommunityOpenGraphImage({ params }) {
  const { id } = await params;
  const post = await getCommunityPostById(id);
  const place = [post?.city, post?.uf].filter(Boolean).join(' / ') || 'Na estrada';
  const quote = post?.comment || 'História real de quem vive a estrada sobre duas rodas.';

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', position: 'relative', overflow: 'hidden', background: '#131713', color: '#f7f1e7', fontFamily: 'sans-serif' }}>
        {post?.image && <img src={post.image} alt="" width="650" height="630" style={{ position: 'absolute', left: 0, top: 0, width: 650, height: 630, objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', left: 0, top: 0, width: 650, height: 630, display: 'flex', background: post?.image ? 'linear-gradient(90deg, rgba(8,11,9,.06), rgba(8,11,9,.18) 60%, #131713 100%)' : '#222820' }} />
        <div style={{ position: 'absolute', left: 610, top: 0, width: 590, height: 630, display: 'flex', background: '#131713' }} />

        <div style={{ position: 'absolute', left: 56, top: 48, display: 'flex', padding: '10px 14px', background: '#f25b22', color: '#fff', fontSize: 18, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase' }}>
          {CATEGORY[post?.category] || 'Direto da estrada'}
        </div>

        <div style={{ position: 'absolute', left: 650, right: 54, top: 52, bottom: 48, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', fontSize: 24, fontWeight: 900, letterSpacing: -.5 }}>
            PISTA<span style={{ display: 'flex', color: '#f25b22' }}>VIVA</span>
            <span style={{ display: 'flex', marginLeft: 13, color: '#918f86', fontSize: 15, fontWeight: 700, letterSpacing: 2 }}>COMUNIDADE</span>
          </div>
          <div style={{ display: 'flex', marginTop: 50, color: '#f5a276', fontSize: 23, fontWeight: 800, letterSpacing: 1 }}>{place}</div>
          <div style={{ display: 'flex', flex: 1, alignItems: 'center' }}>
            <div style={{ display: 'flex', fontSize: quote.length > 150 ? 34 : 42, lineHeight: 1.22, fontWeight: 700, textWrap: 'balance' }}>“{quote.slice(0, 210)}{quote.length > 210 ? '…' : ''}”</div>
          </div>
          <div style={{ display: 'flex', paddingTop: 22, borderTop: '2px solid #353a34', color: '#c9c6bc', fontSize: 21 }}>Relato de&nbsp;<strong>{post?.author || 'piloto da comunidade'}</strong></div>
        </div>
      </div>
    ),
    { ...size }
  );
}
