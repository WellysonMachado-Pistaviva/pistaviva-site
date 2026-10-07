'use client';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Flag, MapPin, MessageCircle, Plus, Trash2, Users, X } from 'lucide-react';
import './event-departures.css';
const formatDate = value => new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
async function request(url, data) {
  const response = await fetch(url, data ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) } : { cache: 'no-store' });
  let result;
  try { result = await response.json(); } catch { throw new Error('Serviço indisponível. Tente novamente.'); }
  if (!response.ok) throw new Error(result.error || 'Não foi possível concluir.');
  return result;
}
// Busca os municípios do IBGE no servidor (/api/municipios). A pessoa não
// digita cidade livre: escolhe um município real e a UF vem junto. É isso que
// impede a mesma cidade de virar vários cards por causa de grafia ou acento.
function CityPicker({ value, onPick }) {
  const listId = useId();
  const [term, setTerm] = useState('');
  const [options, setOptions] = useState([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [failed, setFailed] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    const needle = term.trim();
    if (needle.length < 2) { setOptions([]); setFailed(false); return undefined; }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/municipios?q=${encodeURIComponent(needle)}`, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'falha');
        setOptions(result.cities || []);
        setActive(result.cities?.length ? 0 : -1);
        setFailed(false);
      } catch (error) {
        if (error.name !== 'AbortError') { setOptions([]); setFailed(true); }
      }
    }, 220);
    return () => { controller.abort(); clearTimeout(timer); };
  }, [term]);

  function pick(city) {
    onPick(city);
    setTerm('');
    setOptions([]);
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(event) {
    if (!options.length) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      setOpen(true);
      setActive(current => {
        const next = current + (event.key === 'ArrowDown' ? 1 : -1);
        return (next + options.length) % options.length;
      });
      return;
    }
    if (event.key === 'Enter' && open && active >= 0) { event.preventDefault(); pick(options[active]); return; }
    if (event.key === 'Escape') { setOpen(false); setActive(-1); }
  }

  const showList = open && options.length > 0;
  return <div className="departure-city" ref={box}>
    <label htmlFor={`${listId}-input`}>Cidade de saída</label>
    {value
      ? <div className="departure-city-picked">
          <span><MapPin size={15} /> {value.name} · {value.uf}</span>
          <button type="button" onClick={() => { onPick(null); setOpen(false); }}><X size={15} />Trocar cidade</button>
        </div>
      : <>
          <input
            id={`${listId}-input`}
            role="combobox"
            aria-expanded={showList}
            aria-controls={`${listId}-list`}
            aria-autocomplete="list"
            aria-activedescendant={showList && active >= 0 ? `${listId}-opt-${active}` : undefined}
            autoComplete="off"
            placeholder="Digite sua cidade, ex.: Itajubá"
            value={term}
            onChange={event => { setTerm(event.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            onBlur={event => { if (!box.current?.contains(event.relatedTarget)) setOpen(false); }}
            onKeyDown={onKeyDown}
          />
          {showList && <ul className="departure-city-list" role="listbox" id={`${listId}-list`}>
            {options.map((city, index) => <li key={city.code} id={`${listId}-opt-${index}`} role="option" aria-selected={index === active}>
              <button type="button" className={index === active ? 'is-active' : ''} onMouseEnter={() => setActive(index)} onClick={() => pick(city)}>{city.name} <span>· {city.uf}</span></button>
            </li>)}
          </ul>}
          <span className="departure-city-help">
            {failed ? 'Não foi possível buscar cidades agora. Tente novamente.'
              : term.trim().length >= 2 && !options.length ? 'Nenhum município encontrado com esse nome.'
              : 'Escolha um município da lista do IBGE — a UF é preenchida junto.'}
          </span>
        </>}
  </div>;
}

// Resumo por cidade. Agregado: mostra o volume por cidade sem expor nome,
// horário ou ponto de encontro de ninguém.
function CityCards({ cities, filter, onFilter }) {
  if (!cities.length) return null;
  return <div className="departure-cities">
    <h3><Users size={16} /> De onde a turma está saindo</h3>
    <div className="departure-cities-grid">
      {cities.map(city => {
        const selected = filter?.city === city.city && filter?.uf === city.uf;
        return <button
          key={city.city_ibge || `${city.city}-${city.uf}`}
          type="button"
          className={`departure-city-card${selected ? ' is-selected' : ''}`}
          aria-pressed={selected}
          onClick={() => onFilter(selected ? null : { city: city.city, uf: city.uf })}
        >
          <strong>{city.city} <span>· {city.uf}</span></strong>
          <span className="departure-city-people">{city.people} {city.people === 1 ? 'pessoa' : 'pessoas'}</span>
          <span className="departure-city-count">{city.departures} {city.departures === 1 ? 'saída combinada' : 'saídas combinadas'}</span>
        </button>;
      })}
    </div>
  </div>;
}

function Departure({ item, endpoint, onRemove, name, onName, revision }) {
  const [details, setDetails] = useState(null);
  const [comments, setComments] = useState([]);
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async (next = 0) => {
    const result = await request(`${endpoint}?departure=${item.id}&offset=${next}`);
    setDetails(result); setOffset(next);
    setComments(previous => next ? [...previous, ...result.comments.filter(c => !previous.some(p => p.id === c.id))] : result.comments);
  }, [endpoint, item.id]);
  useEffect(() => { load().catch(e => setError(e.message)); }, [load, revision]);
  async function act(action, extra = {}) {
    setBusy(true); setError('');
    try {
      await request(endpoint, { action, departure_id: item.id, name, ...extra });
      if (action === 'delete_departure') { onRemove(item.id); return; }
      if (action === 'comment') setBody('');
      await load();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }
  const past = new Date(item.departure_at) <= new Date();
  return <article className="departure" id={`saida-${item.id}`}>
    <header><div><span className="departure-eyebrow"><MapPin size={15} /> {item.city} · {item.uf}</span><h3>Saída em {formatDate(item.departure_at)}</h3></div>{item.mine && <span className="departure-mine">Sua saída</span>}</header>
    <p><strong>Ponto de encontro:</strong> {item.meeting_point}</p>
    <p className="departure-by">Combinado por {item.name}</p>
    {item.note && <p className="departure-text">{item.note}</p>}
    {details && <p className="departure-members"><strong>{details.totalMembers} {details.totalMembers === 1 ? 'pessoa marcou' : 'pessoas marcaram'} “Vou junto”</strong>{details.members.length > 0 && <span>{details.members.map(m => m.name).join(', ')}{details.totalMembers > details.members.length ? ` e mais ${details.totalMembers - details.members.length}` : ''}</span>}</p>}
    <div className="departure-actions">
      {!item.mine && <button type="button" className={details?.joined ? 'is-joined' : ''} aria-pressed={Boolean(details?.joined)} disabled={busy || !details || (past && !details?.joined)} onClick={() => { if (!details?.joined && name.trim().length < 2) { setOpen(true); setError('Informe seu nome abaixo para marcar “Vou junto”.'); return; } act(details?.joined ? 'leave' : 'join'); }}><Flag size={17} />{details?.joined ? 'Vou junto ✓ · Desmarcar' : past ? 'Saída realizada' : 'Vou junto'}</button>}
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)}><MessageCircle size={17} />{open ? 'Fechar conversa' : 'Combinar e comentar'}</button>
      {item.mine && <button type="button" disabled={busy} onClick={() => { if (window.confirm('Excluir sua saída e os comentários ligados a ela?')) act('delete_departure'); }}><Trash2 size={15} />Excluir saída</button>}
    </div>
    {error && <p className="departure-error" role="alert">{error} {!details && <button type="button" onClick={() => {setError('');load().catch(e=>setError(e.message));}}>Tentar novamente</button>}</p>}
    {open && <div className="departure-discussion">
      <form onSubmit={e => {e.preventDefault();act('comment',{body});}}>
        <label>Seu nome público<input name="name" required minLength={2} maxLength={60} autoComplete="given-name" value={name} onChange={e => onName(e.target.value)} /></label>
        {!item.mine && !details?.joined && !past && <button type="button" disabled={busy || name.trim().length < 2 || !details} onClick={() => act('join')}><Flag size={16} />Marcar “Vou junto”</button>}
        <label>Comentário<textarea name="comment" required maxLength={600} rows={3} placeholder="Combine o ponto de encontro ou tire uma dúvida sobre a saída." value={body} onChange={e => setBody(e.target.value)} /></label>
        <button className="departure-primary" disabled={busy || !body.trim()}>{busy ? 'Salvando…' : 'Publicar comentário'}</button>
      </form>
      <div className="departure-comments" aria-live="polite">
        {comments.length === 0 && <p>A conversa começa aqui. Combine os detalhes com a turma.</p>}
        {comments.map(c => <div key={c.id} className="departure-comment"><div><strong>{c.name}</strong><time dateTime={c.created_at}>{formatDate(c.created_at)}</time></div><p>{c.body}</p>{c.mine && <button type="button" disabled={busy} onClick={() => act('delete_comment', {comment_id:c.id})}>Excluir meu comentário</button>}</div>)}
        {details?.more && <button type="button" disabled={busy} onClick={async () => { setBusy(true);try { await load(offset + 20); } catch(e) {setError(e.message);} finally {setBusy(false);} }}>Ver comentários anteriores</button>}
      </div>
    </div>}
  </article>;
}
export default function EventDepartures({ eventId, eventDate }) {
  const endpoint = `/api/eventos/${eventId}/saidas`;
  const [rows, setRows] = useState([]);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [more, setMore] = useState(false);
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [city, setCity] = useState(null);
  const [cities, setCities] = useState([]);
  const [filter, setFilter] = useState(null);
  const [form, setForm] = useState({ date: eventDate, time: '', meeting_point: '', note: '' });
  const load = useCallback(async (next = 0) => {
    const result = await request(`${endpoint}?offset=${next}`);
    setRows(prev => next ? [...prev, ...result.departures.filter(d => !prev.some(p => p.id === d.id))] : result.departures);
    if (!next) setCities(result.cities || []);
    setOffset(next);setMore(result.more);setRevision(r=>r+1);
  }, [endpoint]);
  useEffect(() => {load().catch(e=>setError(e.message)).finally(()=>setLoading(false));}, [load]);
  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  async function create(e) {
    e.preventDefault();
    if (!city) { setError('Escolha sua cidade de saída na lista.'); return; }
    setBusy(true);setError('');setSuccess('');
    try { await request(endpoint, { action:'create', name, city:city.name, uf:city.uf, city_ibge:city.code, ...form }); await load();setOpen(false);setSuccess('Saída publicada. Compartilhe esta página para chamar a turma.'); }
    catch(err){setError(err.message);}finally{setBusy(false);}
  }
  const ended = eventDate < new Date(Date.now()-3*3600000).toISOString().slice(0,10);
  // O filtro age sobre as saídas já carregadas; "Carregar mais" segue disponível.
  const visible = filter ? rows.filter(row => row.city === filter.city && row.uf === filter.uf) : rows;
  return <section className="event-departures evpage-block" id="saidas" aria-labelledby="departures-title">
    <span className="departure-eyebrow">Quem sai com você?</span>
    <h2 id="departures-title">Combine sua saída</h2>
    <p>Conte de qual cidade vai sair, em que horário e onde encontrar a turma. Encontrou uma saída que combina com você? Marque “Vou junto” e deixe seu nome.</p>
    <p className="departure-help">Nome, saída e comentários ficam públicos. Use um ponto público de encontro. Você pode excluir suas publicações neste navegador; limpar os cookies remove esse acesso. As saídas são combinadas pelos participantes.</p>
    <div className="departure-toolbar"><button type="button" className="departure-primary" disabled={ended} aria-expanded={open} onClick={()=>setOpen(!open)}><Plus size={17}/>{ended ? 'Encontro encerrado' : open ? 'Fechar formulário' : 'Publicar minha saída'}</button><button type="button" disabled={loading} onClick={async()=>{setLoading(true);setError('');try{await load();}catch(e){setError(e.message);}finally{setLoading(false);}}}>Atualizar saídas</button></div>
    {open && <form className="departure-create" onSubmit={create}>
      <label>Seu nome público<input required minLength={2} maxLength={60} name="name" autoComplete="given-name" value={name} onChange={e=>setName(e.target.value)}/></label>
      <CityPicker value={city} onPick={setCity} />
      <div className="departure-fields"><label>Data da saída<input required name="date" type="date" max={eventDate} min={new Date(new Date(`${eventDate}T12:00:00Z`).getTime()-7*86400000).toISOString().slice(0,10)} value={form.date} onChange={e=>set('date',e.target.value)}/></label><label>Horário de Brasília<input required name="time" type="time" value={form.time} onChange={e=>set('time',e.target.value)}/></label></div>
      <label>Ponto de encontro<input required minLength={3} maxLength={160} name="meeting_point" placeholder="Ex.: posto ou praça, com endereço ou referência" value={form.meeting_point} onChange={e=>set('meeting_point',e.target.value)}/></label>
      <label>Recado para a turma (opcional)<textarea name="note" maxLength={600} rows={3} placeholder="Conte os detalhes para quem quiser ir junto." value={form.note} onChange={e=>set('note',e.target.value)}/></label>
      <button className="departure-primary" disabled={busy}>{busy ? 'Publicando…' : 'Publicar saída'}</button>
    </form>}
    {error && <p className="departure-error" role="alert">{error}</p>}
    {success && <p role="status">{success}</p>}
    {loading && <p role="status">Carregando saídas…</p>}
    {!loading && !error && rows.length===0 && <div className="departure-empty">Ainda não há saídas combinadas. Seja o primeiro a chamar a turma da sua cidade.</div>}
    <CityCards cities={cities} filter={filter} onFilter={setFilter} />
    {filter && <p className="departure-filter" role="status">Mostrando saídas de {filter.city} · {filter.uf}. <button type="button" onClick={()=>setFilter(null)}><X size={14}/>Ver todas</button></p>}
    {filter && !visible.length && rows.length > 0 && <p className="departure-empty">As saídas de {filter.city} estão em outra página da lista. Use “Carregar mais saídas” abaixo.</p>}
    <div className="departure-list">{visible.map(item=><Departure key={item.id} item={item} revision={revision} endpoint={endpoint} name={name} onName={setName} onRemove={id=>{setRows(prev=>prev.filter(p=>p.id!==id));setSuccess('Saída excluída.');}}/>)}</div>
    {more && <button type="button" disabled={loading} onClick={async()=>{setLoading(true);try{await load(offset+20);}catch(e){setError(e.message);}finally{setLoading(false);}}}>Carregar mais saídas</button>}
  </section>;
}
