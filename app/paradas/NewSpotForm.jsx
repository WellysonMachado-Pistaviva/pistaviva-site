'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../src/lib/supabaseClient';
import { uploadPostImage } from '../../src/services/storage';
import { useAuth, showToast } from '../components/AuthProvider';
import { SELOS, CATEGORIAS, slugify } from '../lib/spotMeta';

const EMPTY = { nome: '', categoria: 'pousada', cidade: '', uf: '', descricao: '', lat: null, lng: null, cover_url: '' };

export default function NewSpotForm() {
  const auth = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selos, setSelos] = useState({});
  const [saving, setSaving] = useState(false);
  const [geo, setGeo] = useState('');
  const [uploading, setUploading] = useState(false);

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const url = await uploadPostImage(reader.result, auth.user?.id || 'spot');
      if (url) { setForm(f => ({ ...f, cover_url: url })); showToast('Foto enviada ✓', 'success'); }
      else showToast('Falha no upload', 'error');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const inp = { width: '100%', padding: '10px 12px', marginBottom: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit' };

  if (!auth?.user) {
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.4rem', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--display)', marginBottom: 8 }}>Conhece um bom ponto?</h3>
        <p style={{ color: 'var(--paper-dim)', marginBottom: 14 }}>Entre para cadastrar paradas e indicar comodidades pra comunidade.</p>
        <button className="btn btn--primary" onClick={() => auth?.openAuthModal('login')}>Entrar para cadastrar</button>
      </div>
    );
  }

  if (!open) {
    return <button className="btn btn--primary" onClick={() => setOpen(true)}>+ Cadastrar parada</button>;
  }

  const pegarGeo = () => {
    if (!navigator.geolocation) { setGeo('GPS indisponível'); return; }
    setGeo('localizando…');
    navigator.geolocation.getCurrentPosition(
      p => { setForm(f => ({ ...f, lat: p.coords.latitude, lng: p.coords.longitude })); setGeo(`✓ ${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)} (±${Math.round(p.coords.accuracy)}m)`); },
      () => setGeo('não foi possível obter o GPS'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const toggle = (id) => setSelos(s => ({ ...s, [id]: !s[id] }));

  const salvar = async () => {
    if (!form.nome.trim() || !form.cidade.trim() || form.uf.length !== 2) {
      showToast('Preencha nome, cidade e UF (2 letras)', 'error'); return;
    }
    setSaving(true);
    const payload = {
      slug: slugify(form.nome) + '-' + Math.random().toString(36).slice(2, 7),
      nome: form.nome.trim(),
      categoria: form.categoria,
      descricao: form.descricao.trim() || null,
      cidade: form.cidade.trim(),
      uf: form.uf.toUpperCase(),
      lat: form.lat, lng: form.lng,
      cover_url: form.cover_url || null,
      selos: Object.keys(selos).filter(k => selos[k]),
      author: auth.user?.nome || auth.user?.name || 'Piloto',
      author_id: String(auth.user?.id || ''),
      published: true,
    };
    const { error } = await supabase.from('pv_spots').insert(payload);
    setSaving(false);
    if (error) { showToast('Erro ao salvar: ' + error.message, 'error'); return; }
    showToast('Parada cadastrada ✓', 'success');
    setForm(EMPTY); setSelos({}); setGeo(''); setOpen(false);
    router.refresh();
  };

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.4rem' }}>
      <h3 style={{ fontFamily: 'var(--display)', marginBottom: 14 }}>Cadastrar parada</h3>
      <input style={inp} placeholder="Nome do ponto (ex: Queijaria do Zé)" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} maxLength={60} />
      <select style={inp} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
        {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px', gap: 8 }}>
        <input style={inp} placeholder="Cidade" value={form.cidade} onChange={e => setForm(f => ({ ...f, cidade: e.target.value }))} />
        <input style={inp} placeholder="UF" maxLength={2} value={form.uf} onChange={e => setForm(f => ({ ...f, uf: e.target.value.toUpperCase() }))} />
      </div>
      <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="Descrição (opcional)" maxLength={240} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <button className="btn btn--ghost" onClick={pegarGeo} type="button">📍 Usar minha localização</button>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--paper-dim)' }}>{geo}</span>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <label className="btn btn--ghost" style={{ cursor: 'pointer', margin: 0 }}>
          {uploading ? 'Enviando…' : '📷 Enviar foto'}
          <input type="file" accept="image/*" hidden onChange={onImage} />
        </label>
        {form.cover_url && <img src={form.cover_url} alt="" style={{ height: 56, borderRadius: 6 }} />}
      </div>

      <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--paper-mut)', marginBottom: 8 }}>Comodidades (toque pra marcar)</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
        {SELOS.map(s => (
          <button key={s.id} type="button" onClick={() => toggle(s.id)}
            style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border)', background: selos[s.id] ? 'var(--clay)' : 'transparent', color: selos[s.id] ? 'var(--ink)' : 'var(--text)' }}>
            <div style={{ fontWeight: 800, fontFamily: 'var(--display)' }}>{s.nome}</div>
            <div style={{ fontSize: 11, opacity: .8 }}>{s.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button className="btn btn--primary" onClick={salvar} disabled={saving}>{saving ? 'Salvando…' : 'Publicar parada'}</button>
        <button className="btn btn--ghost" onClick={() => setOpen(false)} type="button">Cancelar</button>
      </div>
    </div>
  );
}
