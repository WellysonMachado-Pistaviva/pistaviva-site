'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth, showToast } from '../../components/AuthProvider';
import { getEventsAdmin, updateEvent, deleteEvent } from '../../../src/services/storage';
import EventBuilder from '../../eventos/criar/EventBuilder';

// Gestão completa de eventos no admin: mesma ferramenta da página do site
// (EventBuilder) em modo editar, com todos os campos (lineup, programação,
// galeria, endereço, @ig, preço). Lista inclui eventos ocultos.
export default function EventsAdmin() {
  const auth = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(undefined); // undefined = lista; null = novo; obj = editar

  const load = useCallback(async () => {
    setLoading(true);
    setRows(await getEventsAdmin());
    setLoading(false);
  }, []);
  useEffect(() => { if (auth?.isAdmin) load(); }, [auth?.isAdmin, load]);

  if (!auth?.isAdmin) return null; // a shell do painel já protege

  const toggleHide = async (ev) => {
    const ok = await updateEvent(ev.id, { ...ev, hidden: !ev.hidden });
    if (ok === false) return showToast('Erro ao atualizar', 'error');
    showToast(ev.hidden ? 'Evento visível ✓' : 'Evento oculto', 'success');
    load();
  };
  const remove = async (ev) => {
    if (!confirm(`Excluir o evento "${ev.title}"? Não dá pra desfazer.`)) return;
    await deleteEvent(ev.id);
    showToast('Evento excluído', 'success');
    load();
  };

  if (editing !== undefined) {
    return (
      <EventBuilder
        initial={editing || null}
        onDone={() => { setEditing(undefined); load(); }}
        onClose={() => setEditing(undefined)}
      />
    );
  }

  return (
    <div style={{ padding: '0 0 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--display)', margin: 0 }}>Eventos</h1>
          <p style={{ color: 'var(--paper-mut)', margin: '4px 0 0', fontSize: 14 }}>Crie, edite e oculte eventos — mesmos campos da página do site.</p>
        </div>
        <button className="btn btn--primary" onClick={() => setEditing(null)}>+ Novo evento</button>
      </div>

      {loading ? (
        <div className="spinner-wrap"><span className="loading-spinner" /></div>
      ) : rows.length === 0 ? (
        <p style={{ color: 'var(--paper-mut)' }}>Nenhum evento ainda. Clique em “Novo evento”.</p>
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {rows.map(ev => {
            const cover = ev.images?.[0] || ev.imageUrl;
            return (
              <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 10, border: '1px solid var(--border)', borderRadius: 10, opacity: ev.hidden ? 0.55 : 1 }}>
                <div style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {cover ? <img src={cover} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 22 }}>🏍️</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {ev.title}{ev.hidden && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--paper-mut)' }}>· oculto</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--paper-mut)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {[ev.date, ev.local, ev.category].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <a className="btn btn--ghost" style={{ padding: '.45rem .8rem' }} href={`/eventos/${ev.id}`} target="_blank" rel="noreferrer">Ver</a>
                  <button className="btn btn--ghost" style={{ padding: '.45rem .8rem' }} onClick={() => setEditing(ev)}>Editar</button>
                  <button className="btn btn--ghost" style={{ padding: '.45rem .8rem' }} onClick={() => toggleHide(ev)}>{ev.hidden ? 'Mostrar' : 'Ocultar'}</button>
                  <button className="btn btn--ghost" style={{ padding: '.45rem .8rem', color: 'var(--danger)' }} onClick={() => remove(ev)}>Excluir</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
