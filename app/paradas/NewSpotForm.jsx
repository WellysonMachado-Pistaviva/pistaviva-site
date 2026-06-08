'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../src/lib/supabaseClient';
import { uploadPostImage } from '../../src/services/storage';
import { useAuth, showToast } from '../components/AuthProvider';
import Stepper, { Step } from '../components/Stepper';
import { SELOS, CATEGORIAS, slugify } from '../lib/spotMeta';

// Nome do estado (open-meteo) -> UF, pra padronizar.
const UF_MAP = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA', 'Ceará': 'CE',
  'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT',
  'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
  'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN',
  'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC',
  'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO',
};

const EMPTY = { nome: '', categoria: 'pousada', cidade: '', uf: '', descricao: '', lat: null, lng: null, fotos: [], maps_url: '', instagram: '' };

export default function NewSpotForm() {
  const auth = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [selos, setSelos] = useState({});
  const [saving, setSaving] = useState(false);
  const [geo, setGeo] = useState('');
  const [uploading, setUploading] = useState(false);
  const [citySug, setCitySug] = useState([]);
  const [showSug, setShowSug] = useState(false);

  // Autocomplete de cidade (open-meteo, só Brasil) — mantém o nome uniforme.
  const buscarCidade = async (q) => {
    if (q.length < 3) { setCitySug([]); return; }
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&language=pt&count=8`);
      const data = await res.json();
      setCitySug((data.results || []).filter(r => r.country_code === 'BR'));
      setShowSug(true);
    } catch { /* silencioso */ }
  };
  const pickCidade = (r) => {
    setForm(f => ({ ...f, cidade: r.name, uf: UF_MAP[r.admin1] || f.uf, lat: r.latitude, lng: r.longitude }));
    setShowSug(false); setCitySug([]);
  };

  const onAddFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (form.fotos.length >= 3) { showToast('Máximo de 3 fotos', 'error'); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const url = await uploadPostImage(reader.result, auth.user?.id || 'spot');
      if (url) { setForm(f => ({ ...f, fotos: [...f.fotos, url].slice(0, 3) })); showToast('Foto enviada ✓', 'success'); }
      else showToast('Falha no upload', 'error');
      setUploading(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };
  const removeFoto = (i) => setForm(f => ({ ...f, fotos: f.fotos.filter((_, k) => k !== i) }));

  const inp = { width: '100%', padding: '10px 12px', marginBottom: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit' };

  if (!open) {
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.4rem', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--display)', marginBottom: 8 }}>Conhece um bom ponto?</h3>
        <p style={{ color: 'var(--paper-dim)', marginBottom: 14 }}>Cadastre paradas, fotos e comodidades pra comunidade. Sem login.</p>
        <button className="btn btn--primary" onClick={() => setOpen(true)}>+ Cadastrar parada</button>
      </div>
    );
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
      showToast('Preencha nome e escolha a cidade', 'error'); return;
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
      fotos: form.fotos,
      cover_url: form.fotos[0] || null,
      maps_url: form.maps_url.trim() || null,
      instagram: form.instagram.trim() || null,
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

  const validateStep = (i) => {
    if (i === 0 && (!form.nome.trim() || !form.cidade.trim() || form.uf.length !== 2)) {
      showToast('Preencha o nome e escolha a cidade na lista', 'error');
      return false;
    }
    return true;
  };

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'var(--display)' }}>Cadastrar parada</h3>
        <button className="btn btn--ghost" style={{ padding: '.4rem .8rem' }} onClick={() => setOpen(false)} type="button">Cancelar</button>
      </div>

      <Stepper validate={validateStep} onComplete={salvar} busy={saving} completeText={saving ? 'Salvando…' : 'Publicar parada'}>
        {/* 1 — Básico + cidade por lista */}
        <Step>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>1. Sobre o ponto</div>
          <input style={inp} placeholder="Nome do ponto (ex: Queijaria do Zé)" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} maxLength={60} />
          <select style={inp} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
            {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
          <div style={{ position: 'relative' }}>
            <input style={inp} placeholder="Cidade — escolha na lista" value={form.cidade}
              onChange={e => { setForm(f => ({ ...f, cidade: e.target.value })); buscarCidade(e.target.value); }} />
            {showSug && citySug.length > 0 && (
              <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 50, marginTop: -8 }}>
                {citySug.map((r, i) => (
                  <li key={i} onClick={() => pickCidade(r)}>{r.name} <small>{r.admin1} {UF_MAP[r.admin1] ? `· ${UF_MAP[r.admin1]}` : ''}</small></li>
                ))}
              </ul>
            )}
          </div>
          {form.cidade && form.uf && <p style={{ fontSize: 12, color: 'var(--moss)', marginTop: -4 }}>✓ {form.cidade} / {form.uf}</p>}
        </Step>

        {/* 2 — Localização */}
        <Step>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>2. Localização exata</div>
          <p style={{ fontSize: 13, color: 'var(--paper-mut)', marginBottom: 12 }}>A cidade já marcou um ponto aproximado. Pra precisão (mapa/rotas), use o GPS no local.</p>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn--ghost" onClick={pegarGeo} type="button">📍 Usar minha localização</button>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--paper-dim)' }}>{geo || (form.lat ? `✓ ${form.lat.toFixed(3)}, ${form.lng.toFixed(3)}` : '')}</span>
          </div>
        </Step>

        {/* 3 — Fotos (até 3) */}
        <Step>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>3. Fotos (até 3)</div>
          <p style={{ fontSize: 13, color: 'var(--paper-mut)', marginBottom: 12 }}>A 1ª foto vira a capa. Boas fotos atraem mais gente.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
            {form.fotos.map((src, i) => (
              <div key={i} style={{ position: 'relative', aspectRatio: '1', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                {i === 0 && <span style={{ position: 'absolute', top: 4, left: 4, fontSize: 9, fontWeight: 800, background: 'var(--clay)', color: 'var(--ink)', padding: '2px 6px', borderRadius: 4 }}>CAPA</span>}
                <button type="button" onClick={() => removeFoto(i)} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', background: 'rgba(0,0,0,.7)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 800 }}>×</button>
              </div>
            ))}
            {form.fotos.length < 3 && (
              <label style={{ aspectRatio: '1', borderRadius: 8, border: '1.5px dashed var(--border)', display: 'grid', placeItems: 'center', cursor: 'pointer', color: 'var(--paper-mut)', fontSize: 13, textAlign: 'center' }}>
                {uploading ? '…' : <span>📷<br />Adicionar</span>}
                <input type="file" accept="image/*" hidden onChange={onAddFoto} disabled={uploading} />
              </label>
            )}
          </div>
        </Step>

        {/* 4 — Detalhes */}
        <Step>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>4. Detalhes</div>
          <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="Descrição (opcional)" maxLength={240} value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
          <input style={inp} type="url" inputMode="url" placeholder="Link do Google Maps do local" value={form.maps_url} onChange={e => setForm(f => ({ ...f, maps_url: e.target.value }))} />
          <input style={inp} type="text" placeholder="Instagram (opcional) — @perfil ou link" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--paper-mut)', margin: '6px 0 8px' }}>Comodidades (toque pra marcar)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {SELOS.map(s => (
              <button key={s.id} type="button" onClick={() => toggle(s.id)}
                style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 8, cursor: 'pointer', border: '1px solid var(--border)', background: selos[s.id] ? 'var(--clay)' : 'transparent', color: selos[s.id] ? 'var(--ink)' : 'var(--text)' }}>
                <div style={{ fontWeight: 800, fontFamily: 'var(--display)' }}>{s.nome}</div>
                <div style={{ fontSize: 11, opacity: .8 }}>{s.desc}</div>
              </button>
            ))}
          </div>
        </Step>
      </Stepper>
    </div>
  );
}
