'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../src/lib/supabaseClient';
import { uploadPostImage } from '../../src/services/storage';
import { useAuth, showToast } from '../components/AuthProvider';
import Stepper, { Step } from '../components/Stepper';
import { slugify } from '../lib/spotMeta';

const EMPTY = { nome: '', cidade: '', uf: '', local: '', instagram: '', site_url: '', whatsapp: '', descricao: '', lat: null, lng: null, cover_url: '', horario_dias: [], horario_inicio: '', horario_fim: '' };
const DIAS = [['Dom', 0], ['Seg', 1], ['Ter', 2], ['Qua', 3], ['Qui', 4], ['Sex', 5], ['Sáb', 6]];
const UF_MAP = { 'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM', 'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES', 'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS', 'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR', 'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ', 'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS', 'Rondônia': 'RO', 'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE', 'Tocantins': 'TO' };

export default function NewPhotographerForm() {
  const auth = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [f, setF] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [geo, setGeo] = useState('');
  const [uploading, setUploading] = useState(false);
  const [citySug, setCitySug] = useState([]);
  const [showSug, setShowSug] = useState(false);
  const inp = { width: '100%', padding: '10px 12px', marginBottom: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit' };

  const buscarCidade = async (q) => {
    if (q.length < 3) { setCitySug([]); return; }
    try { const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&language=pt&count=8`); const d = await res.json(); setCitySug((d.results || []).filter(r => r.country_code === 'BR')); setShowSug(true); } catch { /* */ }
  };
  const pickCidade = (r) => { setF(s => ({ ...s, cidade: r.name, uf: UF_MAP[r.admin1] || s.uf, lat: s.lat ?? r.latitude, lng: s.lng ?? r.longitude })); setShowSug(false); setCitySug([]); };

  if (!open) {
    return (
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.4rem', textAlign: 'center' }}>
        <h3 style={{ fontFamily: 'var(--display)', marginBottom: 8 }}>É fotógrafo de estrada?</h3>
        <p style={{ color: 'var(--paper-dim)', marginBottom: 14 }}>Cadastre seu ponto e horário — e apareça pra quem passa por lá. Sem login.</p>
        <button className="btn btn--primary" onClick={() => setOpen(true)}>+ Cadastrar fotógrafo</button>
      </div>
    );
  }

  const pegarGeo = () => {
    if (!navigator.geolocation) { setGeo('GPS indisponível'); return; }
    setGeo('localizando…');
    navigator.geolocation.getCurrentPosition(
      p => { setF(s => ({ ...s, lat: p.coords.latitude, lng: p.coords.longitude })); setGeo(`✓ ${p.coords.latitude.toFixed(4)}, ${p.coords.longitude.toFixed(4)}`); },
      () => setGeo('não foi possível obter o GPS'), { enableHighAccuracy: true, timeout: 8000 });
  };
  const onImage = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const r = new FileReader();
    r.onload = async () => { const url = await uploadPostImage(r.result, auth.user?.id || 'foto'); if (url) setF(s => ({ ...s, cover_url: url })); setUploading(false); };
    r.readAsDataURL(file);
  };
  const salvar = async () => {
    if (!f.nome.trim()) { showToast('Informe o nome', 'error'); return; }
    if (f.lat == null) { showToast('Marque a localização (GPS) do ponto', 'error'); return; }
    setSaving(true);
    const { error } = await supabase.from('pv_photographers').insert({
      slug: slugify(f.nome) + '-' + Math.random().toString(36).slice(2, 6),
      nome: f.nome.trim(), cidade: f.cidade.trim() || null, uf: f.uf ? f.uf.toUpperCase() : null,
      local: f.local.trim() || null, lat: f.lat, lng: f.lng,
      instagram: f.instagram.trim() || null, site_url: f.site_url.trim() || null, whatsapp: f.whatsapp.trim() || null,
      descricao: f.descricao.trim() || null, cover_url: f.cover_url || null,
      horario_dias: f.horario_dias.length ? f.horario_dias : null,
      horario_inicio: f.horario_inicio || null, horario_fim: f.horario_fim || null,
      author_id: String(auth.user?.id || ''), published: true,
    });
    setSaving(false);
    if (error) { showToast('Erro: ' + error.message, 'error'); return; }
    showToast('Fotógrafo cadastrado ✓', 'success');
    setF(EMPTY); setGeo(''); setOpen(false); router.refresh();
  };

  const validateStep = (i) => {
    if (i === 0 && !f.nome.trim()) { showToast('Informe seu nome', 'error'); return false; }
    if (i === 2 && f.lat == null) { showToast('Marque a localização (GPS) do ponto', 'error'); return false; }
    return true;
  };

  return (
    <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontFamily: 'var(--display)' }}>Cadastrar fotógrafo</h3>
        <button className="btn btn--ghost" style={{ padding: '.4rem .8rem' }} type="button" onClick={() => setOpen(false)}>Cancelar</button>
      </div>

      <Stepper validate={validateStep} onComplete={salvar} busy={saving} completeText={saving ? 'Salvando…' : 'Publicar'}>
        {/* 1 — Você */}
        <Step>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>1. Você e o ponto</div>
          <input style={inp} placeholder="Seu nome / estúdio" value={f.nome} onChange={e => setF(s => ({ ...s, nome: e.target.value }))} />
          <input style={inp} placeholder="Trecho/ponto (ex: Serra do Rio do Rastro)" value={f.local} onChange={e => setF(s => ({ ...s, local: e.target.value }))} />
          <div style={{ position: 'relative' }}>
            <input style={inp} placeholder="Cidade — escolha na lista" value={f.cidade}
              onChange={e => { setF(s => ({ ...s, cidade: e.target.value })); buscarCidade(e.target.value); }} />
            {showSug && citySug.length > 0 && (
              <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 50, marginTop: -8 }}>
                {citySug.map((r, i) => <li key={i} onClick={() => pickCidade(r)}>{r.name} <small>{r.admin1}{UF_MAP[r.admin1] ? ` · ${UF_MAP[r.admin1]}` : ''}</small></li>)}
              </ul>
            )}
          </div>
          {f.cidade && f.uf && <p style={{ fontSize: 12, color: 'var(--moss)', marginTop: -4 }}>✓ {f.cidade} / {f.uf}</p>}
        </Step>

        {/* 2 — Contato */}
        <Step>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>2. Contato e galeria</div>
          <input style={inp} placeholder="Instagram (@ ou link)" value={f.instagram} onChange={e => setF(s => ({ ...s, instagram: e.target.value }))} />
          <input style={inp} placeholder="Link do site/galeria de fotos" value={f.site_url} onChange={e => setF(s => ({ ...s, site_url: e.target.value }))} />
          <input style={inp} placeholder="WhatsApp (opcional)" value={f.whatsapp} onChange={e => setF(s => ({ ...s, whatsapp: e.target.value }))} />
          <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' }} placeholder="Descrição (opcional)" value={f.descricao} onChange={e => setF(s => ({ ...s, descricao: e.target.value }))} />
        </Step>

        {/* 3 — Local + foto */}
        <Step>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>3. Localização e foto</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
            <button className="btn btn--ghost" type="button" onClick={pegarGeo}>📍 Marcar localização</button>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--paper-dim)' }}>{geo}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <label className="btn btn--ghost" style={{ cursor: 'pointer', margin: 0 }}>{uploading ? 'Enviando…' : '📷 Foto de capa'}<input type="file" accept="image/*" hidden onChange={onImage} /></label>
            {f.cover_url && <img src={f.cover_url} alt="" style={{ height: 50, borderRadius: 6 }} />}
          </div>
        </Step>

        {/* 4 — Horário */}
        <Step>
          <div style={{ fontWeight: 800, marginBottom: 10 }}>4. Horário no ponto</div>
          <p style={{ fontSize: 13, color: 'var(--paper-mut)', marginBottom: 10 }}>Dentro do horário, seu perfil mostra <b>"No ponto agora"</b> automático.</p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
            {DIAS.map(([lbl, n]) => {
              const on = f.horario_dias.includes(n);
              return (
                <button key={n} type="button" onClick={() => setF(s => ({ ...s, horario_dias: on ? s.horario_dias.filter(d => d !== n) : [...s.horario_dias, n] }))}
                  style={{ padding: '7px 11px', borderRadius: 100, fontFamily: 'var(--mono)', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: `1.5px solid ${on ? 'var(--accent)' : 'var(--border)'}`, background: on ? 'var(--accent)' : 'transparent', color: on ? '#fff' : 'var(--paper-dim)' }}>{lbl}</button>
              );
            })}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <div><label style={{ fontSize: 11, color: 'var(--paper-mut)' }}>Início</label><input type="time" style={inp} value={f.horario_inicio} onChange={e => setF(s => ({ ...s, horario_inicio: e.target.value }))} /></div>
            <div><label style={{ fontSize: 11, color: 'var(--paper-mut)' }}>Fim</label><input type="time" style={inp} value={f.horario_fim} onChange={e => setF(s => ({ ...s, horario_fim: e.target.value }))} /></div>
          </div>
        </Step>
      </Stepper>
    </div>
  );
}
