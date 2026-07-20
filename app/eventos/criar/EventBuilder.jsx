'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, showToast } from '../../components/AuthProvider';
import { addEvent, updateEvent, uploadPostImage, uploadCoverImage } from '../../../src/services/storage';
import LocationPicker from './LocationPicker';

const MES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const fmtDate = (v) => { if (!v) return ''; const [y, m, d] = v.split('-'); return `${d} ${MES[+m - 1]} ${y}`; };
// reverso de fmtDate: "15 Mai 2026" (ou intervalo / ISO) → "YYYY-MM-DD" pro input date.
const MES_I = { jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06', jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12' };
const toIso = (v) => {
  if (!v) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(v)) return v.slice(0, 10);
  const parts = String(v).replace(/\s*[–-]\s*\d{1,2}/, '').trim().split(/\s+/);
  if (parts.length >= 3) {
    const d = String(parseInt(parts[0], 10)).padStart(2, '0');
    const mo = MES_I[parts[1].toLowerCase().slice(0, 3)];
    if (mo && /^\d{4}$/.test(parts[2]) && d !== 'NaN') return `${parts[2]}-${mo}-${d}`;
  }
  return '';
};

// ícones inline (idênticos ao protótipo)
const I = {
  img: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="m5 17 4-4 3 3 3-3 4 4" /></svg>,
  info: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></svg>,
  doc: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4Z" /><path d="M9 8h6M9 12h5" /></svg>,
  music: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V6l10-2v12" /><circle cx="6.5" cy="18" r="2.5" /><circle cx="16.5" cy="16" r="2.5" /></svg>,
  gallery: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m4 16 4-4 5 5 3-3 4 4" /></svg>,
  user: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="3.4" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>,
  ticket: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16v4a2 2 0 0 0 0 2v4H4v-4a2 2 0 0 0 0-2Z" /></svg>,
  up: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 16V4M8 8l4-4 4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>,
  eye: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>,
  expand: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 8V4h4M16 4h4v4M20 16v4h-4M8 20H4v-4" /></svg>,
  x: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6 18 18M18 6 6 18" /></svg>,
  trash: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13" /></svg>,
  plus: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 5v14M5 12h14" /></svg>,
  cal: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>,
  pin: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg>,
  spec: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>,
};

const TYPES = ['Encontro', 'Expedição', 'Workshop', 'Rolê', 'Competição'];
const fileToDataUrl = (f) => new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(f); });

// `initial` (evento existente, shape do toEvent) → modo edição. `onDone`/`onClose`
// usados quando embarcado no painel admin; sem eles, comporta como /eventos/criar.
export default function EventBuilder({ initial = null, onDone = null, onClose = null } = {}) {
  const auth = useAuth();
  const router = useRouter();
  const bannerInput = useRef(null);
  const galInput = useRef(null);
  const isEdit = !!initial?.id;
  const imgs0 = initial?.images || [];

  const [f, setF] = useState({
    title: initial?.title || '', type: initial?.category || 'Encontro', cat: initial?.tags || '',
    dateIso: toIso(initial?.date), time: initial?.time || '', local: initial?.local || '', addr: initial?.address || '',
    desc: initial?.description || '', org: initial?.organizer || '', ig: initial?.organizerIg || '',
    entry: (initial?.price ? 'paid' : 'free'), price: initial?.price || '',
  });
  const [banner, setBanner] = useState(imgs0[0] || initial?.imageUrl || '');
  const [gallery, setGallery] = useState(imgs0.slice(1));
  const [lineup, setLineup] = useState(initial?.lineup?.length ? initial.lineup.map(a => ({ time: a.time || '', name: a.name || '', image: a.image || '' })) : [{ time: '', name: '', image: '' }]);
  const [schedule, setSchedule] = useState(initial?.schedule?.length ? initial.schedule.map(s => ({ time: s.time || '', title: s.title || '' })) : []);
  const [coord, setCoord] = useState({ lat: initial?.lat ?? null, lng: initial?.lng ?? null });
  const [tog, setTog] = useState({ rsvp: true, count: true, share: true });
  const [status, setStatus] = useState(initial ? 'saved' : 'draft'); // draft | saved | published
  const [busy, setBusy] = useState(false);
  const [upBanner, setUpBanner] = useState(false);
  const [galUp, setGalUp] = useState(false);
  const [actUp, setActUp] = useState(-1);

  useEffect(() => {
    document.body.classList.add('evb-takeover');
    return () => document.body.classList.remove('evb-takeover');
  }, []);

  const set = (k, v) => setF(s => ({ ...s, [k]: v }));

  // exige login pra subir imagem (storage do Supabase pede sessão). Admin já está
  // autenticado (sessão Supabase) — não precisa da identificação da comunidade.
  const needLogin = () => { if (auth?.isAdmin) return false; if (!auth?.user) { showToast('Entre na sua conta pra enviar imagens'); auth?.openAuthModal?.('login'); return true; } return false; };
  const uid = () => auth?.user?.id || 'admin';

  const onBannerFile = async (file) => {
    if (!file) return;
    if (needLogin()) return;
    setUpBanner(true);
    const url = await uploadCoverImage(await fileToDataUrl(file), uid());
    if (url) setBanner(url); else showToast('Falha no upload da capa. Tente outra imagem.');
    setUpBanner(false);
  };
  const onGalleryFile = async (file) => {
    if (!file) return;
    if (needLogin()) return;
    setGalUp(true);
    const url = await uploadPostImage(await fileToDataUrl(file), uid());
    if (url) setGallery(g => [...g, url]); else showToast('Falha no upload da imagem.');
    setGalUp(false);
  };

  const addAct = () => setLineup(l => [...l, { time: '', name: '', image: '' }]);
  const updAct = (i, k, v) => setLineup(l => l.map((a, idx) => idx === i ? { ...a, [k]: v } : a));
  const rmAct = (i) => setLineup(l => l.filter((_, idx) => idx !== i));

  const addSch = () => setSchedule(s => [...s, { time: '', title: '' }]);
  const updSch = (i, k, v) => setSchedule(s => s.map((a, idx) => idx === i ? { ...a, [k]: v } : a));
  const rmSch = (i) => setSchedule(s => s.filter((_, idx) => idx !== i));
  const onActFile = async (i, file) => {
    if (!file) return;
    if (needLogin()) return;
    setActUp(i);
    const url = await uploadPostImage(await fileToDataUrl(file), uid());
    if (url) updAct(i, 'image', url); else showToast('Falha no upload da foto.');
    setActUp(-1);
  };

  const save = () => { setStatus('saved'); showToast('Rascunho salvo'); };

  const publish = async () => {
    if (!f.title.trim()) { showToast('Preencha o nome do evento'); return; }
    if (!isEdit && !f.dateIso) { showToast('Preencha a data do evento'); return; }
    setBusy(true);
    const imgs = [banner, ...gallery].filter(Boolean);
    const payload = {
      title: f.title.trim(), category: f.type,
      date: f.dateIso ? fmtDate(f.dateIso) : (initial?.date || ''), time: f.time.trim(),
      local: f.local.trim(), address: f.addr.trim(),
      organizer: f.org.trim() || (auth?.user?.nome || auth?.user?.name || 'Comunidade'),
      organizerIg: f.ig.trim(),
      description: f.desc.trim(), tags: f.cat.trim(),
      price: f.entry === 'paid' ? f.price.trim() : '',
      lineup: lineup.filter(a => a.name?.trim() || a.time?.trim()),
      schedule: schedule.filter(s => s.title?.trim() || s.time?.trim()),
      imageUrl: imgs[0] || null, images: imgs,
      lat: coord.lat, lng: coord.lng,
      maxParticipants: initial?.maxParticipants || 100, type: initial?.type || 'open',
    };
    if (isEdit) {
      const ok = await updateEvent(initial.id, payload);
      setBusy(false);
      if (ok) { setStatus('published'); showToast('Evento atualizado ✓'); if (onDone) onDone({ id: initial.id }); else router.push(`/eventos/${initial.id}`); }
      else showToast('Erro ao salvar evento');
    } else {
      const ev = await addEvent(payload);
      setBusy(false);
      if (ev?.id) { setStatus('published'); showToast('Evento publicado ✓'); if (onDone) onDone(ev); else setTimeout(() => router.push(`/eventos/${ev.id}`), 700); }
      else showToast('Erro ao publicar evento');
    }
  };

  const pricePreview = f.entry === 'free' ? 'Grátis' : ('R$ ' + (f.price || '0'));
  const pill = status === 'published'
    ? { c: 'var(--ok)', t: 'Publicado' } : status === 'saved'
      ? { c: 'var(--warn)', t: 'Rascunho salvo' } : { c: 'var(--mut)', t: 'Rascunho' };

  return (
    <div className="evb">
      {/* TOP BAR */}
      <header className="topbar">
        <span className="brand"><span className="spark" />PISTAVIVA</span>
        <span className="crumb"><a href="/eventos">Eventos</a><span>/</span><span className="now">{isEdit ? 'Editar evento' : 'Criar evento'}</span></span>
        <span className="sp" />
        <span className="pill"><span className="d" style={{ background: pill.c }} />{pill.t}</span>
        {onClose && <button className="btn btn--ghost btn--sm" onClick={onClose}>Fechar</button>}
        {!isEdit && <button className="btn btn--ghost btn--sm" onClick={save}>Salvar</button>}
        <button className="btn btn--primary btn--sm" onClick={publish} disabled={busy}>{busy ? 'Salvando…' : (isEdit ? 'Salvar alterações' : 'Publicar evento')}</button>
      </header>

      <div className="wrap">
        {/* ============ FORM ============ */}
        <main>
          <div className="steps">
            <div className="step active"><span className="n">1</span> Informações</div>
            <div className="step"><span className="n">2</span> Página</div>
            <div className="step"><span className="n">3</span> Publicação</div>
          </div>

          {/* CAPA */}
          <section className="card">
            <div className="ch"><span className="ci">{I.img}</span><h2>Arte do evento</h2><span className="opt">1080 × 1350 px · 4:5</span></div>
            <div className="cb">
              <div className={`dropzone ${banner ? 'has' : ''}`} role="button" tabIndex={0}
                onClick={() => bannerInput.current?.click()}
                onDragOver={e => { e.preventDefault(); }}
                onDrop={e => { e.preventDefault(); onBannerFile(e.dataTransfer.files?.[0]); }}>
                <button className="rm" type="button" onClick={e => { e.preventDefault(); e.stopPropagation(); setBanner(''); if (bannerInput.current) bannerInput.current.value = ''; }}>{I.x}</button>
                {banner && <img src={banner} alt="" />}
                <span className="ph" style={{ display: 'contents' }}>
                  <span className="di">{upBanner ? '…' : I.up}</span>
                  <b>{upBanner ? 'Enviando…' : 'Enviar a arte do evento'}</b>
                  <span>Arraste aqui ou clique · formato retrato (em pé)</span>
                </span>
                <span className="dimtag">{I.expand}1080 × 1350 px · 4:5</span>
                <input ref={bannerInput} type="file" accept="image/*" hidden onChange={e => { onBannerFile(e.target.files?.[0]); e.target.value = ''; }} />
              </div>
              <div className="specline"><span className="si">{I.spec}</span><div className="st"><b>Onde aparece: <em>card do evento</em> (home e agenda) + topo da página</b><span>Use <em>1080 × 1350 px (4:5, em pé)</em> — JPG ou PNG. É o formato de flyer; assim a arte aparece inteira, quase sem corte. Quadrado (1080×1080) também serve.</span></div></div>
            </div>
          </section>

          {/* INFORMAÇÕES */}
          <section className="card">
            <div className="ch"><span className="ci">{I.info}</span><h2>Informações básicas</h2></div>
            <div className="cb">
              <div className="field"><span className="lbl">Nome do evento</span><input className="in" placeholder="Ex: Encontro de Clássicas 2026" value={f.title} onChange={e => set('title', e.target.value)} /></div>
              <div className="two">
                <div className="field"><span className="lbl">Tipo</span><select className="sel" value={f.type} onChange={e => set('type', e.target.value)}>{TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div className="field"><span className="lbl">Categoria</span><input className="in" placeholder="Ex: Clássicas" value={f.cat} onChange={e => set('cat', e.target.value)} /></div>
              </div>
              <div className="two">
                <div className="field"><span className="lbl">Data</span><input className="in" type="date" value={f.dateIso} onChange={e => set('dateIso', e.target.value)} /></div>
                <div className="field"><span className="lbl">Horário</span><input className="in" type="time" value={f.time} onChange={e => set('time', e.target.value)} /></div>
              </div>
              <div className="field"><span className="lbl">Local</span><input className="in" placeholder="Ex: Praça da Liberdade, BH" value={f.local} onChange={e => set('local', e.target.value)} /></div>
              <div className="field"><span className="lbl">Endereço completo</span><input className="in" placeholder="Av., número, bairro, cidade/UF" value={f.addr} onChange={e => set('addr', e.target.value)} /></div>
              <div className="field" style={{ marginBottom: 0 }}>
                <span className="lbl">Ponto exato no mapa <span className="opt" style={{ fontWeight: 400 }}>— usado no “Como chegar” do evento</span></span>
                <LocationPicker lat={coord.lat} lng={coord.lng} query={f.addr || f.local} onChange={(lat, lng) => setCoord({ lat, lng })} />
              </div>
            </div>
          </section>

          {/* DESCRIÇÃO */}
          <section className="card">
            <div className="ch"><span className="ci">{I.doc}</span><h2>Descrição</h2></div>
            <div className="cb">
              <div className="field" style={{ marginBottom: 0 }}><span className="lbl">Sobre o evento <span className="counter">{f.desc.length} caracteres</span></span>
                <textarea className="in" rows={5} placeholder="Conte tudo sobre o evento: o que vai rolar, atrações, regras…" value={f.desc} onChange={e => set('desc', e.target.value)} />
              </div>
            </div>
          </section>

          {/* ATRAÇÕES */}
          <section className="card">
            <div className="ch"><span className="ci">{I.music}</span><h2>Atrações &amp; bandas</h2><span className="opt">foto 600 × 600 px</span></div>
            <div className="cb">
              <div className="specline" style={{ marginTop: 0, marginBottom: 13 }}><span className="si">{I.img}</span><div className="st"><b>Atração: <em>foto (600×600) + horário + nome</em></b><span>Clique no quadrado pra enviar a foto. Aparece nos cards do line-up na página do evento.</span></div></div>
              <div>
                {lineup.map((a, i) => (
                  <div className="actrow" key={i}>
                    <label className="ai-pic" title="Foto da atração (opcional)">
                      {a.image ? <img src={a.image} alt="" /> : (actUp === i ? '…' : I.img)}
                      <input type="file" accept="image/*" hidden onChange={e => { onActFile(i, e.target.files?.[0]); e.target.value = ''; }} />
                    </label>
                    <input className="in ai-time" placeholder="12h" value={a.time} onChange={e => updAct(i, 'time', e.target.value)} />
                    <input className="in ai-name" placeholder="Nome da atração" value={a.name} onChange={e => updAct(i, 'name', e.target.value)} />
                    <button className="del" type="button" onClick={() => rmAct(i)}>{I.trash}</button>
                  </div>
                ))}
              </div>
              <button className="addrow" onClick={addAct}>{I.plus}Adicionar atração</button>
            </div>
          </section>

          {/* PROGRAMAÇÃO */}
          <section className="card">
            <div className="ch"><span className="ci">{I.cal}</span><h2>Programação</h2><span className="opt">opcional</span></div>
            <div className="cb">
              <div className="specline" style={{ marginTop: 0, marginBottom: 13 }}><span className="si">{I.cal}</span><div className="st"><b>Horário + o que acontece</b><span>Monta a agenda do dia. Aparece na seção Programação da página do evento.</span></div></div>
              <div>
                {schedule.map((s, i) => (
                  <div className="actrow" key={i}>
                    <input className="in ai-time" placeholder="14h" value={s.time} onChange={e => updSch(i, 'time', e.target.value)} />
                    <input className="in ai-name" placeholder="Ex: Abertura dos portões" value={s.title} onChange={e => updSch(i, 'title', e.target.value)} />
                    <button className="del" type="button" onClick={() => rmSch(i)}>{I.trash}</button>
                  </div>
                ))}
              </div>
              <button className="addrow" onClick={addSch}>{I.plus}Adicionar item</button>
            </div>
          </section>

          {/* GALERIA */}
          <section className="card">
            <div className="ch"><span className="ci">{I.gallery}</span><h2>Galeria de imagens</h2><span className="opt">1080 × 1080 px</span></div>
            <div className="cb">
              <div className="specline" style={{ marginTop: 0, marginBottom: 12 }}><span className="si">{I.gallery}</span><div className="st"><b>Fotos da galeria: <em>1080 × 1080 px (quadrada)</em></b><span>Adicione quantas quiser — aparecem na seção Galeria da página do evento.</span></div></div>
              <div className="gal-mini">
                {gallery.map((src, i) => (
                  <div className="gm" key={i}>
                    <img src={src} alt="" />
                    <button className="gx" type="button" onClick={() => setGallery(g => g.filter((_, k) => k !== i))}>{I.x}</button>
                  </div>
                ))}
                {[0, 1, 2, 3].map(n => <div className="gm" key={'add' + n} onClick={() => galInput.current?.click()}>{galUp && n === 0 ? '…' : I.plus}</div>)}
              </div>
              <input ref={galInput} type="file" accept="image/*" hidden onChange={e => { onGalleryFile(e.target.files?.[0]); e.target.value = ''; }} />
            </div>
          </section>

          {/* ORGANIZADOR */}
          <section className="card">
            <div className="ch"><span className="ci">{I.user}</span><h2>Organizador</h2></div>
            <div className="cb">
              <div className="field"><span className="lbl">Nome / clube</span><input className="in" placeholder="Ex: Clube Clássicos BH" value={f.org} onChange={e => set('org', e.target.value)} /></div>
              <div className="field" style={{ marginBottom: 0 }}><span className="lbl">Instagram</span>
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--ink-3)', border: '1px solid var(--line-2)', borderRadius: 6, overflow: 'hidden' }}>
                  <span style={{ padding: '12px 0 12px 13px', color: 'var(--mut-2)', fontFamily: 'var(--semi)', fontSize: 14 }}>@</span>
                  <input style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', padding: '12px 13px 12px 3px', fontSize: 14.5, color: 'var(--accent-2)', fontFamily: 'var(--semi)' }} placeholder="seu_perfil" value={f.ig} onChange={e => set('ig', e.target.value.replace(/^@/, ''))} />
                </div>
                <div className="hint">O botão “Ver organizador” na página leva direto pro seu Instagram.</div>
              </div>
            </div>
          </section>

          {/* INSCRIÇÃO */}
          <section className="card" style={{ marginBottom: 0 }}>
            <div className="ch"><span className="ci">{I.ticket}</span><h2>Inscrição &amp; opções</h2></div>
            <div className="cb">
              <div className="field"><span className="lbl">Tipo de entrada</span>
                <select className="sel" value={f.entry} onChange={e => set('entry', e.target.value)}><option value="free">Gratuito</option><option value="paid">Pago</option></select>
              </div>
              {f.entry === 'paid' && <div className="field"><span className="lbl">Valor (R$)</span><input className="in" type="number" placeholder="0,00" value={f.price} onChange={e => set('price', e.target.value)} /></div>}
              <div className="toggle-row"><div className="t"><b>Confirmação “Eu vou”</b><span>Pilotos confirmam presença</span></div><button className={`sw ${tog.rsvp ? 'on' : ''}`} onClick={() => setTog(t => ({ ...t, rsvp: !t.rsvp }))} /></div>
              <div className="toggle-row"><div className="t"><b>Mostrar nº de confirmados</b><span>Exibe contador na página</span></div><button className={`sw ${tog.count ? 'on' : ''}`} onClick={() => setTog(t => ({ ...t, count: !t.count }))} /></div>
              <div className="toggle-row"><div className="t"><b>Permitir compartilhar</b><span>Botões de compartilhar e copiar link</span></div><button className={`sw ${tog.share ? 'on' : ''}`} onClick={() => setTog(t => ({ ...t, share: !t.share }))} /></div>
            </div>
          </section>
        </main>

        {/* ============ SIDEBAR PREVIEW ============ */}
        <aside className="side">
          <div className="previewbox">
            <div className="pvh"><span className="lbl">Como aparece na aba Eventos</span><span className="tag">Pré-visualização</span></div>
            <div className="pvb">
              <div className="evcard">
                <div className={`ec-pic ${banner ? 'has' : ''}`}>
                  {banner && <img src={banner} alt="" />}
                  <div className="ec-ph">Sua capa aqui</div>
                  <span className="ec-badge">Inscrições abertas</span>
                  <span className="ec-type">{f.type}</span>
                </div>
                <div className="ec-b">
                  <h3>{f.title || 'Nome do evento'}</h3>
                  <div className="ec-meta">
                    <span>{I.cal}<span>{fmtDate(f.dateIso) || 'Data'}</span></span>
                    <span>{I.pin}<span>{f.local || 'Local'}</span></span>
                  </div>
                  <div className="ec-foot">
                    <span className="price">{pricePreview}</span>
                    <span className="going">Clique para ver a página →</span>
                  </div>
                </div>
              </div>
              <p className="pv-note">No site, o piloto abre a <b>página completa do evento</b>.</p>
            </div>
          </div>

          <div className="pub-actions">
            <button className="btn btn--ghost btn--block" onClick={() => showToast('Publique o evento pra ver a página completa.')}>{I.eye}Pré-visualizar página</button>
            <button className="btn btn--primary btn--block" onClick={publish} disabled={busy}>{busy ? 'Publicando…' : 'Publicar evento'}</button>
          </div>
          <p className="helper">Suas imagens são enviadas na hora. Publique quando quiser — o evento entra na agenda.</p>
        </aside>
      </div>
    </div>
  );
}
