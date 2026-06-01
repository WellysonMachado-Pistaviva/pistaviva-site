// Admin tab components: Overview, Events CRUD, Site Config
import React, { useState, useEffect } from 'react';
import {
  Users, Calendar, MessageSquare, MapPin, ShieldCheck, Plus,
  Trash2, Edit, Check, X, Save, BarChart3, Clock, Eye,
} from 'lucide-react';
import {
  getEvents, addEvent, updateEvent, deleteEvent as deleteEventStorage,
  getSiteConfig, saveSiteConfig, getPosts, getPartners, getStampsConfig,
} from '../services/storage';
import { getAllUsers } from '../services/auth';

const loadAsync = (fn, setter) => fn().then(setter).catch(() => {});

// ── OVERVIEW TAB ──────────────────────────────────────────────
export const OverviewTab = () => {
  const [data, setData] = useState({ users: 0, posts: 0, events: 0, partners: 0, stamps: 0, admins: 0, blocked: 0 });
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const [users, posts, events, partners, stamps] = await Promise.all([
        getAllUsers(), getPosts(), getEvents(), getPartners(), getStampsConfig(),
      ]);
      setData({
        users: users.length, posts: posts.length, events: events.length,
        partners: partners.length, stamps: stamps.length,
        admins: users.filter(u => u.isAdmin).length,
        blocked: users.filter(u => u.isBlocked).length,
      });
      setRecentUsers(users.slice(0, 5));
    };
    loadData();
  }, []);

  const kpis = [
    { label: 'Usuários', value: data.users, icon: <Users size={18} />, color: 'var(--accent)' },
    { label: 'Posts', value: data.posts, icon: <MessageSquare size={18} />, color: 'hsl(260,60%,60%)' },
    { label: 'Eventos', value: data.events, icon: <Calendar size={18} />, color: 'var(--success)' },
    { label: 'Parceiros', value: data.partners, icon: <MapPin size={18} />, color: 'hsl(200,80%,55%)' },
    { label: 'Selos', value: data.stamps, icon: <ShieldCheck size={18} />, color: 'var(--warning)' },
  ];

  return (
    <div>
      <h3 style={{ marginBottom: '16px', fontFamily: 'var(--display)' }}>📊 Visão Geral</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '12px', marginBottom: '24px' }}>
        {kpis.map(k => (
          <div key={k.label} style={{
            background: 'var(--bg4)', borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border)', padding: '16px', textAlign: 'center',
          }}>
            <div style={{ color: k.color, marginBottom: '8px' }}>{k.icon}</div>
            <div style={{ fontSize: '28px', fontWeight: '900', color: k.color, fontFamily: 'var(--display)' }}>{k.value}</div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: 'var(--bg4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: '900', color: 'hsl(239,84%,67%)' }}>{data.admins}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700' }}>ADMINS</div>
        </div>
        <div style={{ background: 'var(--bg4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--danger)' }}>{data.blocked}</div>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: '700' }}>BLOQUEADOS</div>
        </div>
      </div>

      <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--muted)', letterSpacing: '1px', marginBottom: '12px' }}>ÚLTIMOS CADASTROS</h4>
      {recentUsers.length === 0 ? (
        <p className="text-muted" style={{ textAlign: 'center', padding: '20px' }}>Nenhum usuário ainda.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {recentUsers.map(u => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '10px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)', fontSize: '13px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg,var(--accent),hsl(14,90%,48%))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: '900', color: '#fff',
              }}>{u.nome?.charAt(0)?.toUpperCase() || '?'}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700' }}>{u.nome}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)' }}>{u.estado} · {u.cidade || '—'}</div>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                {u.createdAt ? new Date(u.createdAt).toLocaleDateString('pt-BR') : '—'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── EVENTS TAB ────────────────────────────────────────────────
const EMPTY_EVENT = { title: '', category: 'Encontro', date: '', time: '', local: '', organizer: '', maxParticipants: 100, description: '', tags: '', type: 'open' };

export const EventsTab = ({ toast }) => {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(null); // null=closed, object=editing
  const [editId, setEditId] = useState(null);

  const reload = () => getEvents().then(setEvents);
  useEffect(() => { reload(); }, []);

  const openNew = () => { setForm({ ...EMPTY_EVENT }); setEditId(null); };
  const openEdit = (ev) => { setForm({ ...ev }); setEditId(ev.id); };
  const closeForm = () => { setForm(null); setEditId(null); };

  const handleSave = async () => {
    if (!form.title || !form.date) return;
    if (editId) {
      await updateEvent(editId, form);
      toast?.('Evento atualizado!');
    } else {
      await addEvent(form);
      toast?.('Evento criado!');
    }
    closeForm();
    reload();
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Excluir "${title}"?`)) return;
    await deleteEventStorage(id);
    toast?.('Evento excluído.');
    reload();
  };

  const statusOpts = [
    { value: 'open', label: 'Inscrições Abertas', color: 'var(--success)' },
    { value: 'soon', label: 'Em Breve', color: 'var(--accent)' },
    { value: 'full', label: 'Vagas Esgotadas', color: 'var(--danger)' },
  ];

  const F = ({ label, children }) => <div className="calc-field"><label>{label}</label>{children}</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ fontFamily: 'var(--display)' }}>📅 Eventos ({events.length})</h3>
        <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px' }} onClick={openNew}>
          <Plus size={14} /> NOVO EVENTO
        </button>
      </div>

      {/* Form modal */}
      {form && (
        <div style={{ padding: '20px', background: 'var(--bg4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '20px' }}>
          <h4 style={{ marginBottom: '14px' }}>{editId ? '✏️ Editar Evento' : '➕ Novo Evento'}</h4>
          <F label="Título *"><input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex: Encontro de Clássicas" /></F>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <F label="Data *"><input type="text" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} placeholder="15 Jun 2026" /></F>
            <F label="Horário"><input type="text" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} placeholder="09:00" /></F>
          </div>
          <F label="Local"><input type="text" value={form.local} onChange={e => setForm({ ...form, local: e.target.value })} placeholder="Praça da Liberdade, BH" /></F>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <F label="Categoria">
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {['Encontro', 'Expedição', 'Workshop', 'Rolê', 'Competição', 'Outro'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </F>
            <F label="Status">
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                {statusOpts.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </F>
          </div>
          <F label="Organizador"><input type="text" value={form.organizer} onChange={e => setForm({ ...form, organizer: e.target.value })} placeholder="Pista Viva" /></F>
          <F label="Vagas máximas"><input type="number" value={form.maxParticipants} onChange={e => setForm({ ...form, maxParticipants: parseInt(e.target.value) || 0 })} /></F>
          <F label="Descrição"><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Descreva o evento..." rows={3} /></F>
          <F label="Tags (separadas por vírgula)"><input type="text" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="Clássicas, Exposição, Família" /></F>
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
            <button className="btn-primary" style={{ flex: 2 }} onClick={handleSave} disabled={!form.title || !form.date}><Save size={14} /> SALVAR</button>
            <button className="btn-outline" style={{ flex: 1 }} onClick={closeForm}>CANCELAR</button>
          </div>
        </div>
      )}

      {/* Event list */}
      {events.length === 0 ? (
        <p className="text-muted" style={{ textAlign: 'center', padding: '40px' }}>Nenhum evento. Crie o primeiro!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {events.map(ev => {
            const st = statusOpts.find(s => s.value === ev.type) || statusOpts[0];
            return (
              <div key={ev.id} style={{
                padding: '14px 16px', background: 'var(--bg3)', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)', borderLeft: `4px solid ${st.color}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: '800', fontSize: '15px' }}>{ev.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                      📅 {ev.date} · ⏰ {ev.time || '—'} · 📍 {ev.local || '—'}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', color: st.color, padding: '2px 8px', borderRadius: '999px', background: `${st.color}18`, marginTop: '6px', display: 'inline-block' }}>{st.label}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                    <button onClick={() => openEdit(ev)} style={{ padding: '6px', background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', cursor: 'pointer', color: 'var(--accent)' }}><Edit size={14} /></button>
                    <button onClick={() => handleDelete(ev.id, ev.title)} style={{ padding: '6px', background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xs)', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ── CONFIG TAB ─────────────────────────────────────────────────
export const ConfigTab = ({ toast }) => {
  const [cfg, setCfg] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => { loadAsync(getSiteConfig, setCfg); }, []);

  const handleSave = async () => {
    await saveSiteConfig(cfg);
    setSaved(true);
    toast?.('Configurações salvas! Volte à Home para ver as mudanças.');
    setTimeout(() => setSaved(false), 2500);
  };

  if (!cfg) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Carregando...</div>;

  const F = ({ label, hint, children }) => (
    <div className="calc-field">
      <label>{label}</label>
      {hint && <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '4px' }}>{hint}</div>}
      {children}
    </div>
  );

  return (
    <div>
      <h3 style={{ fontFamily: 'var(--display)', marginBottom: '16px' }}>⚙️ Configurações do Site</h3>

      <div style={{ padding: '16px', background: 'var(--bg4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--accent)' }}>🏠 Textos da Página Inicial</h4>
        <F label="Título da Hero" hint="Cada linha vira uma quebra de linha. Ex: MOTOTURISMO\nEM MOVIMENTO">
          <textarea value={cfg.heroTitle || ''} onChange={e => setCfg({ ...cfg, heroTitle: e.target.value })} rows={2} />
        </F>
        <F label="Subtítulo da Hero" hint="Texto abaixo do título principal">
          <textarea value={cfg.heroSubtitle || ''} onChange={e => setCfg({ ...cfg, heroSubtitle: e.target.value })} rows={2} />
        </F>
      </div>

      <div style={{ padding: '16px', background: 'var(--bg4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--accent)' }}>📊 Estatísticas da Home</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          <F label="Destinos"><input type="number" value={cfg.statsDestinos || 0} onChange={e => setCfg({ ...cfg, statsDestinos: parseInt(e.target.value) || 0 })} /></F>
          <F label="KM Mapeados"><input type="number" value={cfg.statsKm || 0} onChange={e => setCfg({ ...cfg, statsKm: parseInt(e.target.value) || 0 })} /></F>
          <F label="Membros"><input type="number" value={cfg.statsMembros || 0} onChange={e => setCfg({ ...cfg, statsMembros: parseInt(e.target.value) || 0 })} /></F>
        </div>
      </div>

      <div style={{ padding: '16px', background: 'var(--bg4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--accent)' }}>📱 Contato</h4>
        <F label="WhatsApp" hint="Número com DDD, sem espaços. Ex: 5531999999999">
          <input type="text" value={cfg.whatsapp || ''} onChange={e => setCfg({ ...cfg, whatsapp: e.target.value })} placeholder="5531999999999" />
        </F>
      </div>

      <div style={{ padding: '16px', background: 'var(--bg4)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginBottom: '20px' }}>
        <h4 style={{ fontSize: '14px', marginBottom: '12px', color: 'var(--accent)' }}>🔧 Funcionalidades</h4>
        <F label="Nome do site">
          <input type="text" value={cfg.siteName || ''} onChange={e => setCfg({ ...cfg, siteName: e.target.value })} />
        </F>
        {[
          { key: 'feedEnabled', label: 'Feed da comunidade ativo' },
          { key: 'liveEnabled', label: 'Pista Ao Vivo ativa' },
        ].map(t => (
          <label key={t.key} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', cursor: 'pointer', fontSize: '14px' }}>
            <div onClick={() => setCfg({ ...cfg, [t.key]: !cfg[t.key] })} style={{
              width: '42px', height: '24px', borderRadius: '12px', position: 'relative', cursor: 'pointer',
              background: cfg[t.key] ? 'var(--accent)' : 'var(--bg3)', border: '1px solid var(--border)', transition: 'var(--transition)',
            }}>
              <div style={{
                width: '18px', height: '18px', borderRadius: '50%', background: '#fff', position: 'absolute',
                top: '2px', left: cfg[t.key] ? '20px' : '2px', transition: 'left .2s',
              }} />
            </div>
            {t.label}
          </label>
        ))}
      </div>

      <button className="btn-primary" onClick={handleSave} style={{ width: '100%' }}>
        <Save size={16} /> SALVAR CONFIGURAÇÕES
      </button>
      {saved && <div style={{ textAlign: 'center', color: 'var(--success)', fontWeight: '700', fontSize: '13px', marginTop: '12px' }}>✅ Salvo com sucesso!</div>}
    </div>
  );
};
