'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../src/lib/supabaseClient';
import { uploadPostImage } from '../../src/services/storage';
import { useAuth, showToast } from './AuthProvider';
import CertificadoDesafio from './CertificadoDesafio';

// Gamificação do desafio: bate foto em cada checkpoint (com comentário opcional),
// barra de progresso enche e o certificado SÓ libera com todos os pontos batidos.
// Progresso por aparelho (deviceId anônimo do AuthProvider — padrão do site).
// Check-ins viram galeria pública na página ("quem tá rodando").

export default function DesafioCheckin({ desafio, checkpoints }) {
  const auth = useAuth();
  const [meus, setMeus] = useState(null);       // meus check-ins (este aparelho)
  const [galera, setGalera] = useState([]);     // últimos check-ins públicos
  const [aberto, setAberto] = useState(null);   // índice do checkpoint com form aberto
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  const total = checkpoints.length;
  const feitos = new Set((meus || []).map((c) => c.checkpoint));
  const completo = meus !== null && feitos.size >= total;

  useEffect(() => {
    if (!auth?.deviceId) return;
    let cancel = false;
    (async () => {
      try {
        const [{ data: m }, { data: g }] = await Promise.all([
          supabase.from('pv_desafio_checkins').select('checkpoint, foto_url, created_at')
            .eq('desafio_slug', desafio.slug).eq('device_key', auth.deviceId),
          supabase.from('pv_desafio_checkins').select('id, checkpoint_nome, autor, cidade, uf, foto_url, comentario, created_at')
            .eq('desafio_slug', desafio.slug).order('created_at', { ascending: false }).limit(12),
        ]);
        if (!cancel) { setMeus(m || []); setGalera(g || []); }
      } catch {
        if (!cancel) setMeus([]);
      }
    })();
    return () => { cancel = true; };
  }, [auth?.deviceId, desafio.slug]);

  const baterPonto = async (i, e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    // identifica o piloto (nome) — modal padrão do site, sem login
    let user = auth.user;
    if (!user) {
      const id = await auth.promptIdentity();
      if (!id) return;
      user = { id: auth.deviceId, nome: id.nome, cidade: id.cidade, uf: id.uf };
    }

    setEnviando(true);
    try {
      const dataUrl = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); });
      const url = await uploadPostImage(dataUrl, auth.deviceId || 'desafio');
      if (!url) { showToast('Não consegui subir a foto. Tenta de novo.', 'error'); setEnviando(false); return; }

      const row = {
        desafio_slug: desafio.slug,
        checkpoint: i,
        checkpoint_nome: checkpoints[i].nome,
        device_key: auth.deviceId,
        autor: user.nome || 'Piloto',
        cidade: user.cidade || null,
        uf: user.uf ? String(user.uf).slice(0, 2).toUpperCase() : null,
        foto_url: url,
        comentario: comentario.trim() || null,
      };
      const { error } = await supabase.from('pv_desafio_checkins').upsert(row, { onConflict: 'desafio_slug,checkpoint,device_key' });
      if (error) { showToast('Erro ao salvar: ' + error.message, 'error'); setEnviando(false); return; }

      setMeus((m) => [...(m || []).filter((x) => x.checkpoint !== i), { checkpoint: i, foto_url: url }]);
      setGalera((g) => [{ id: `tmp-${i}`, checkpoint_nome: checkpoints[i].nome, autor: row.autor, cidade: row.cidade, uf: row.uf, foto_url: url, comentario: row.comentario, created_at: new Date().toISOString() }, ...g].slice(0, 12));
      setComentario('');
      setAberto(null);
      const restam = total - new Set([...feitos, i]).size;
      showToast(restam > 0 ? `✓ ${checkpoints[i].nome} carimbado! Faltam ${restam}.` : '🏆 Desafio completo! Certificado liberado.', 'success');
    } finally {
      setEnviando(false);
    }
  };

  const pct = total ? Math.round((feitos.size / total) * 100) : 0;

  return (
    <div id="checkin">
      {/* ── Progresso ── */}
      <div style={{ border: '1px solid var(--snow-line)', borderRadius: 16, padding: 'clamp(16px, 4vw, 24px)', background: 'linear-gradient(180deg, rgba(255,90,0,.05), transparent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
          <h2 style={{ fontFamily: 'var(--display)', margin: 0 }}>🏁 Seu desafio</h2>
          <span style={{ fontFamily: 'var(--mono)', fontWeight: 800, fontSize: 14, color: completo ? '#2e7d32' : 'var(--clay)' }}>
            {meus === null ? '…' : `${feitos.size}/${total} checkpoints`}
          </span>
        </div>
        <p style={{ color: 'var(--ink-soft)', fontSize: 14, margin: '6px 0 14px', lineHeight: 1.5 }}>
          Bata uma foto em cada checkpoint (você + moto no local). Carimbou todos, o certificado libera aqui embaixo. Vale comentário de como foi o trecho!
        </p>

        {/* barra de progresso */}
        <div style={{ height: 12, borderRadius: 100, background: 'var(--snow-line)', overflow: 'hidden', marginBottom: 18 }} role="progressbar" aria-valuenow={feitos.size} aria-valuemin={0} aria-valuemax={total} aria-label="Progresso do desafio">
          <div style={{ height: '100%', width: `${pct}%`, borderRadius: 100, background: completo ? '#2e7d32' : 'linear-gradient(90deg, #ff5a00, #ff7a1a)', transition: 'width .5s ease' }} />
        </div>

        {/* checkpoints */}
        <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
          {checkpoints.map((c, i) => {
            const ok = feitos.has(i);
            const foto = (meus || []).find((x) => x.checkpoint === i)?.foto_url;
            return (
              <li key={i} style={{ border: `1.5px solid ${ok ? 'rgba(46,125,50,.45)' : 'var(--snow-line)'}`, borderRadius: 12, padding: '12px 14px', background: ok ? 'rgba(46,125,50,.06)' : 'transparent' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ display: 'grid', placeItems: 'center', width: 32, height: 32, borderRadius: '50%', background: ok ? '#2e7d32' : 'var(--clay)', color: '#fff', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                    {ok ? '✓' : i + 1}
                  </span>
                  {foto && <img src={foto} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <strong style={{ display: 'block', fontSize: 15 }}>{c.nome}</strong>
                    {c.detalhe && <span style={{ color: 'var(--ink-soft)', fontSize: 13 }}>{c.detalhe}</span>}
                  </div>
                  {!ok && (
                    <button className="ig-btn ig-btn--ghost" style={{ padding: '10px 14px', fontSize: 14, whiteSpace: 'nowrap' }} disabled={enviando}
                      onClick={() => setAberto(aberto === i ? null : i)}>
                      📷 Check-in
                    </button>
                  )}
                </div>

                {/* form do check-in: comentário + foto (câmera direto no mobile) */}
                {aberto === i && !ok && (
                  <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
                    <textarea
                      value={comentario}
                      onChange={(e) => setComentario(e.target.value)}
                      placeholder="Como foi esse trecho? (opcional)"
                      maxLength={280}
                      style={{ width: '100%', minHeight: 64, padding: '12px 14px', fontSize: 16, borderRadius: 12, border: '1px solid var(--snow-line)', background: '#fff', color: 'var(--ink)', resize: 'vertical', fontFamily: 'inherit' }}
                    />
                    <label className="ig-btn ig-btn--primary" style={{ cursor: 'pointer', textAlign: 'center', padding: '14px 18px', fontSize: 16 }}>
                      {enviando ? 'Enviando…' : 'Bater a foto e carimbar'}
                      <input type="file" accept="image/*" capture="environment" hidden disabled={enviando} onChange={(e) => baterPonto(i, e)} />
                    </label>
                    <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: 0 }}>Foto sua/da moto no ponto. Ela aparece na galeria do desafio.</p>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* ── Certificado: trancado até completar ── */}
      <div id="certificado" style={{ marginTop: 16, border: '1px solid var(--snow-line)', borderRadius: 16, padding: 'clamp(16px, 4vw, 24px)', background: completo ? 'linear-gradient(180deg, rgba(46,125,50,.07), transparent)' : 'transparent' }}>
        {completo ? (
          <>
            <h2 style={{ fontFamily: 'var(--display)', marginBottom: 6 }}>🏆 Desafio completo — seu certificado</h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, marginBottom: 16, maxWidth: 600, lineHeight: 1.5 }}>
              Todos os checkpoints carimbados com foto. Gera, baixa e posta com <strong>#DesafioPistaviva</strong> — repostamos os finishers.
            </p>
            <CertificadoDesafio desafio={desafio} nomeInicial={auth?.user?.nome || ''} />
          </>
        ) : (
          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 34 }} aria-hidden="true">🔒</span>
            <div>
              <strong style={{ display: 'block', fontFamily: 'var(--display)', fontSize: 17 }}>Certificado bloqueado</strong>
              <span style={{ color: 'var(--ink-soft)', fontSize: 14, lineHeight: 1.5 }}>
                {meus === null ? 'Carregando seu progresso…' : `Carimbe os ${total - feitos.size} checkpoint${total - feitos.size > 1 ? 's' : ''} que faltam pra liberar.`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ── Galeria: quem tá rodando ── */}
      {galera.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Quem tá rodando esse desafio</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
            {galera.map((g) => (
              <figure key={g.id} style={{ margin: 0, border: '1px solid var(--snow-line)', borderRadius: 12, overflow: 'hidden' }}>
                <img src={g.foto_url} alt={`Check-in de ${g.autor} — ${g.checkpoint_nome}`} loading="lazy" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }} />
                <figcaption style={{ padding: '8px 10px' }}>
                  <strong style={{ display: 'block', fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.autor}{(g.cidade || g.uf) ? ` · ${[g.cidade, g.uf].filter(Boolean).join('/')}` : ''}</strong>
                    <span style={{ fontSize: 11.5, color: 'var(--ink-soft)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>📍 {g.checkpoint_nome}</span>
                  {g.comentario && <span style={{ fontSize: 12, color: 'var(--ink)', display: 'block', marginTop: 4, lineHeight: 1.35 }}>{g.comentario}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
