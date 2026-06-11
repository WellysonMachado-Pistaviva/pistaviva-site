'use client';
import { useRef, useState } from 'react';

// Gerador de certificado de conclusão — grátis, client-side (html2canvas).
// Mobile-first: tenta Web Share API com arquivo (abre o share sheet nativo do
// iOS/Android pra postar direto no Instagram/WhatsApp); fallback = download PNG.
// 1080×1350 (4:5) — formato de feed do Instagram.

const hoje = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export default function CertificadoDesafio({ desafio }) {
  const certRef = useRef(null);
  const [nome, setNome] = useState('');
  const [moto, setMoto] = useState('');
  const [data, setData] = useState(hoje());
  const [busy, setBusy] = useState(false);
  const [img, setImg] = useState(null); // dataURL de preview
  const [erro, setErro] = useState('');

  const gerar = async () => {
    if (!nome.trim()) { setErro('Coloca seu nome pra sair no certificado.'); return; }
    setErro(''); setBusy(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(certRef.current, { scale: 1, backgroundColor: '#0e1311', useCORS: true });
      setImg(canvas.toDataURL('image/png'));
    } catch {
      setErro('Não consegui gerar a imagem. Tenta de novo.');
    } finally {
      setBusy(false);
    }
  };

  const arquivo = async () => {
    const blob = await (await fetch(img)).blob();
    return new File([blob], `certificado-${desafio.slug}.png`, { type: 'image/png' });
  };

  const compartilhar = async () => {
    try {
      const file = await arquivo();
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Concluí o ${desafio.nome}!`,
          text: `Concluí o ${desafio.nome} 🏍️ #DesafioPistaviva @pistavivaoficial`,
        });
        return;
      }
    } catch { /* usuário cancelou o share — ok */ }
    baixar();
  };

  const baixar = () => {
    const a = document.createElement('a');
    a.href = img;
    a.download = `certificado-${desafio.slug}.png`;
    a.click();
  };

  const inputStyle = {
    width: '100%', padding: '13px 14px', fontSize: 16, borderRadius: 12,
    border: '1px solid var(--snow-line)', background: '#fff', color: 'var(--ink)',
  };

  return (
    <div>
      {!img ? (
        <div style={{ display: 'grid', gap: 10, maxWidth: 480 }}>
          <input style={inputStyle} placeholder="Seu nome (sai no certificado)" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={40} aria-label="Seu nome" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px', gap: 10 }}>
            <input style={inputStyle} placeholder="Sua moto (opcional)" value={moto} onChange={(e) => setMoto(e.target.value)} maxLength={32} aria-label="Sua moto" />
            <input style={inputStyle} value={data} onChange={(e) => setData(e.target.value)} maxLength={10} aria-label="Data de conclusão" />
          </div>
          {erro && <p style={{ color: '#c0392b', fontSize: 14, margin: 0 }}>{erro}</p>}
          <button className="ig-btn ig-btn--primary" onClick={gerar} disabled={busy} style={{ padding: '14px 18px', fontSize: 16 }}>
            {busy ? 'Gerando…' : '🏁 Gerar meu certificado grátis'}
          </button>
          <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
            Certificado de conclusão na base da confiança: ele vale pelas suas fotos nos checkpoints. Gerado no seu aparelho — nada é enviado pra gente.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12, maxWidth: 480 }}>
          {/* preview do certificado gerado */}
          <img src={img} alt={`Certificado de conclusão do ${desafio.nome}`} style={{ width: '100%', borderRadius: 14, border: '1px solid var(--snow-line)' }} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="ig-btn ig-btn--primary" onClick={compartilhar} style={{ flex: 1, minWidth: 150, padding: '14px 18px', fontSize: 16 }}>📲 Compartilhar</button>
            <button className="ig-btn ig-btn--ghost" onClick={baixar} style={{ flex: 1, minWidth: 130, padding: '14px 18px', fontSize: 16 }}>⬇️ Baixar PNG</button>
          </div>
          <button className="ig-btn ig-btn--ghost" onClick={() => setImg(null)} style={{ fontSize: 14 }}>↩︎ Editar dados</button>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: 0 }}>
            Poste com <strong>#DesafioPistaviva</strong> e marque <strong>@pistavivaoficial</strong> — repostamos os finishers. 🏍️
          </p>
        </div>
      )}

      {/* arte do certificado — renderizada fora da tela, html2canvas fotografa daqui */}
      <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden="true">
        <div ref={certRef} style={{ width: 1080, height: 1350, background: 'linear-gradient(160deg, #0e1311 0%, #161e1a 55%, #0e1311 100%)', color: '#f3ede1', fontFamily: 'var(--sans), system-ui, sans-serif', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, boxSizing: 'border-box' }}>
          {/* moldura */}
          <div style={{ position: 'absolute', inset: 28, border: '2px solid rgba(255,90,0,.55)', borderRadius: 24 }} />
          <div style={{ position: 'absolute', inset: 40, border: '1px solid rgba(243,237,225,.18)', borderRadius: 18 }} />

          <div style={{ position: 'relative', textAlign: 'center', paddingTop: 28 }}>
            <div style={{ fontSize: 30, letterSpacing: '.42em', fontWeight: 800, color: '#ff5a00' }}>PISTAVIVA</div>
            <div style={{ fontSize: 19, letterSpacing: '.3em', marginTop: 14, color: 'rgba(243,237,225,.75)' }}>CERTIFICADO DE CONCLUSÃO</div>
          </div>

          <div style={{ position: 'relative', textAlign: 'center', padding: '0 60px' }}>
            <div style={{ fontSize: 26, color: 'rgba(243,237,225,.7)', marginBottom: 18 }}>🏁 DESAFIO</div>
            <div style={{ fontFamily: 'var(--display), "Arial Narrow", sans-serif', fontSize: 74, lineHeight: 1.04, fontWeight: 800, textTransform: 'uppercase' }}>{desafio.nome}</div>
            <div style={{ fontSize: 27, color: '#ff7a1a', marginTop: 20, fontWeight: 700 }}>{desafio.distancia} · {desafio.regiao}</div>
          </div>

          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div style={{ fontSize: 24, color: 'rgba(243,237,225,.65)' }}>concluído por</div>
            <div style={{ fontFamily: 'var(--display), "Arial Narrow", sans-serif', fontSize: 58, fontWeight: 800, marginTop: 10, textTransform: 'uppercase' }}>{nome || 'SEU NOME'}</div>
            {moto ? <div style={{ fontSize: 28, marginTop: 12, color: 'rgba(243,237,225,.85)' }}>🏍️ {moto}</div> : null}
            <div style={{ fontSize: 26, marginTop: 16, color: 'rgba(243,237,225,.7)' }}>{data}</div>
          </div>

          <div style={{ position: 'relative', textAlign: 'center', paddingBottom: 26 }}>
            <div style={{ width: 130, height: 4, background: '#ff5a00', margin: '0 auto 24px', borderRadius: 4 }} />
            <div style={{ fontSize: 22, color: 'rgba(243,237,225,.75)', lineHeight: 1.6 }}>
              Conclusão, não velocidade. Quem roda sabe.<br />
              <strong style={{ color: '#f3ede1' }}>pistavivamototurismo.com.br/desafios</strong> · #DesafioPistaviva
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
