import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Edit, Image as ImageIcon, MapPin } from 'lucide-react';
import { getSiteConfig, saveSiteConfig, getPresetRoutes, savePresetRoutes } from '../services/storage';

const F = ({ label, hint, children }) => (
  <div className="calc-field" style={{ marginBottom: '16px' }}>
    <label>{label}</label>
    {hint && <div style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: '6px' }}>{hint}</div>}
    {children}
  </div>
);

export const CmsTab = ({ toast }) => {
  const [activeSection, setActiveSection] = useState('home'); // 'home' | 'routes'
  const [cfg, setCfg] = useState(getSiteConfig());
  const [routes, setRoutes] = useState([]);
  
  // Route Form State
  const EMPTY_ROUTE = { name: '', region: '', dest: '', distance: '', duration: '', difficulty: 'Fácil', diffColor: '#22c55e', highlights: '', tip: '', emoji: '🏍️', tags: '' };
  const [routeForm, setRouteForm] = useState(null);
  const [editRouteId, setEditRouteId] = useState(null);

  useEffect(() => {
    queueMicrotask(() => setRoutes(getPresetRoutes() || []));
  }, []);

  const handleSaveConfig = () => {
    saveSiteConfig(cfg);
    toast?.('Página Inicial atualizada com sucesso!');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setCfg({ ...cfg, heroBgImage: ev.target.result });
      reader.readAsDataURL(file);
    }
  };

  // ── Routes Handlers ──
  const openNewRoute = () => { setRouteForm({ ...EMPTY_ROUTE }); setEditRouteId(null); };
  const openEditRoute = (r) => { 
    setRouteForm({ 
      ...r, 
      highlights: (r.highlights || []).join('\n'),
      tags: (r.tags || []).join(', ')
    }); 
    setEditRouteId(r.id); 
  };
  const closeRouteForm = () => { setRouteForm(null); setEditRouteId(null); };

  const handleSaveRoute = () => {
    if (!routeForm.name || !routeForm.dest) return;
    
    const formattedRoute = {
      ...routeForm,
      highlights: routeForm.highlights.split('\n').map(h => h.trim()).filter(Boolean),
      tags: routeForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      diffColor: routeForm.difficulty === 'Fácil' ? '#22c55e' : routeForm.difficulty === 'Intermediário' ? '#f97316' : '#ef4444'
    };

    let updated;
    if (editRouteId) {
      updated = routes.map(r => r.id === editRouteId ? { ...formattedRoute, id: editRouteId } : r);
      toast?.('Roteiro atualizado!');
    } else {
      updated = [{ ...formattedRoute, id: 'r_' + Date.now() }, ...routes];
      toast?.('Roteiro oficial criado!');
    }
    
    savePresetRoutes(updated);
    setRoutes(updated);
    closeRouteForm();
  };

  const handleDeleteRoute = (id, name) => {
    if (!window.confirm(`Excluir permanentemente o roteiro "${name}"?`)) return;
    const updated = routes.filter(r => r.id !== id);
    savePresetRoutes(updated);
    setRoutes(updated);
    toast?.('Roteiro removido do app.');
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--display)' }}>📝 Gestão de Conteúdo (CMS)</h3>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>Altere a fachada e os roteiros do app sem mexer em código.</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        <button 
          onClick={() => setActiveSection('home')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeSection === 'home' ? 'var(--accent)' : 'var(--bg4)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
        >
          <ImageIcon size={14} style={{ display: 'inline', marginRight: '6px' }} /> Página Inicial
        </button>
        <button 
          onClick={() => setActiveSection('routes')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeSection === 'routes' ? 'var(--accent)' : 'var(--bg4)', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}
        >
          <MapPin size={14} style={{ display: 'inline', marginRight: '6px' }} /> Roteiros Oficiais ({routes.length})
        </button>
      </div>

      {/* ── SECTION: HOME PAGE ── */}
      {activeSection === 'home' && (
        <div style={{ background: 'var(--bg3)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <h4 style={{ marginBottom: '16px', color: 'var(--accent)' }}>Banner Principal</h4>
          
          <F label="Imagem de Fundo" hint="A imagem grandona que aparece logo que entra no app. Dê preferência a fotos escuras.">
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <input type="text" value={cfg.heroBgImage || ''} onChange={e => setCfg({ ...cfg, heroBgImage: e.target.value })} placeholder="URL da Imagem (Ex: https://...)" />
                <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--muted)' }}>OU envie do computador:</div>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ marginTop: '4px' }} />
              </div>
              {cfg.heroBgImage && (
                <div style={{ width: '120px', height: '80px', borderRadius: '8px', background: `url(${cfg.heroBgImage}) center/cover`, border: '2px solid var(--border)' }} />
              )}
            </div>
          </F>

          <F label="Título Principal" hint="Cada linha vira uma quebra de linha.">
            <textarea value={cfg.heroTitle || ''} onChange={e => setCfg({ ...cfg, heroTitle: e.target.value })} rows={2} style={{ fontSize: '18px', fontWeight: 'bold' }} />
          </F>
          
          <F label="Subtítulo" hint="Texto de apoio abaixo do título.">
            <textarea value={cfg.heroSubtitle || ''} onChange={e => setCfg({ ...cfg, heroSubtitle: e.target.value })} rows={2} />
          </F>

          <button className="btn-primary" onClick={handleSaveConfig} style={{ marginTop: '10px' }}><Save size={16} /> SALVAR PÁGINA INICIAL</button>
        </div>
      )}

      {/* ── SECTION: ROUTES ── */}
      {activeSection === 'routes' && (
        <div>
          {!routeForm ? (
            <>
              <button className="btn-primary" onClick={openNewRoute} style={{ marginBottom: '16px' }}><Plus size={16} /> ADICIONAR ROTEIRO OFICIAL</button>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {routes.map(r => (
                  <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg3)', padding: '16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', borderLeft: `4px solid ${r.diffColor}` }}>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{r.emoji} {r.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>Destino: {r.dest} · {r.distance}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => openEditRoute(r)} style={{ background: 'var(--bg4)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--accent)', cursor: 'pointer' }}><Edit size={16} /></button>
                      <button onClick={() => handleDeleteRoute(r.id, r.name)} style={{ background: 'var(--bg4)', border: '1px solid var(--border)', padding: '8px', borderRadius: '8px', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ background: 'var(--bg3)', padding: '20px', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
              <h4 style={{ marginBottom: '16px', color: 'var(--accent)' }}>{editRouteId ? '✏️ Editar Roteiro' : '➕ Novo Roteiro'}</h4>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <F label="Nome do Roteiro *"><input type="text" value={routeForm.name} onChange={e => setRouteForm({...routeForm, name: e.target.value})} placeholder="Serra do Rio do Rastro" /></F>
                <F label="Destino Final *"><input type="text" value={routeForm.dest} onChange={e => setRouteForm({...routeForm, dest: e.target.value})} placeholder="Bom Jardim da Serra, SC" /></F>
                <F label="Região / Estado"><input type="text" value={routeForm.region} onChange={e => setRouteForm({...routeForm, region: e.target.value})} placeholder="Santa Catarina" /></F>
                <F label="Distância"><input type="text" value={routeForm.distance} onChange={e => setRouteForm({...routeForm, distance: e.target.value})} placeholder="±350 km ao destino" /></F>
                <F label="Tempo Médio"><input type="text" value={routeForm.duration} onChange={e => setRouteForm({...routeForm, duration: e.target.value})} placeholder="5–7h de pilotagem" /></F>
                <F label="Dificuldade">
                  <select value={routeForm.difficulty} onChange={e => setRouteForm({...routeForm, difficulty: e.target.value})}>
                    <option value="Fácil">Fácil (Verde)</option>
                    <option value="Intermediário">Intermediário (Laranja)</option>
                    <option value="Avançado">Avançado (Vermelho)</option>
                  </select>
                </F>
                <F label="Emoji (Ícone)"><input type="text" value={routeForm.emoji} onChange={e => setRouteForm({...routeForm, emoji: e.target.value})} placeholder="⛰️" /></F>
                <F label="Tags (separadas por vírgula)"><input type="text" value={routeForm.tags} onChange={e => setRouteForm({...routeForm, tags: e.target.value})} placeholder="Serra, Curvas, Frio" /></F>
              </div>

              <F label="Dica de Pilotagem"><input type="text" value={routeForm.tip} onChange={e => setRouteForm({...routeForm, tip: e.target.value})} placeholder="Evite dias de chuva forte..." /></F>
              
              <F label="Destaques / Paradas (Um por linha)">
                <textarea value={routeForm.highlights} onChange={e => setRouteForm({...routeForm, highlights: e.target.value})} rows={4} placeholder="Mirante 1\nCachoeira X\nParada para Café Y" />
              </F>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <button className="btn-primary" onClick={handleSaveRoute} style={{ flex: 2 }}><Save size={16} /> SALVAR ROTEIRO</button>
                <button className="btn-outline" onClick={closeRouteForm} style={{ flex: 1 }}>CANCELAR</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CmsTab;
