'use client';
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../../src/lib/supabaseClient';
import { adminGet, adminPost } from '../../lib/adminDb';
import { showToast } from '../../components/AuthProvider';
import { ESTACOES, diaSP, estacaoDe } from '../../lib/selo/estacao.mjs';
import { formatarNumero } from '../../lib/selo/constantes.mjs';
import { mascararWhatsapp } from '../../lib/selo/whatsapp.mjs';

const DIA_MS = 24 * 60 * 60 * 1000;
const PRESETS = [
  { id: 'hoje', label: 'Hoje', de: () => diaSP() },
  { id: '7', label: '7 dias', de: () => diaSP(Date.now() - 6 * DIA_MS) },
  { id: '30', label: '30 dias', de: () => diaSP(Date.now() - 29 * DIA_MS) },
  { id: 'ano', label: 'Este ano', de: () => `${diaSP().slice(0, 4)}-01-01` },
  { id: 'tudo', label: 'Tudo', de: () => '' },
];
const ABAS = [['painel', 'Painel'], ['fotos', 'Fotos'], ['balcao', 'Balcão'], ['beneficio', 'Benefício'], ['parceiros', 'Parceiros'], ['checkin', 'Check-in'], ['conquistas', 'Conquistadores']];
const METODO = { gps: 'GPS', foto: 'foto do passaporte' };
const dataHora = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
const qs = (o) => new URLSearchParams(Object.entries(o).filter(([, v]) => v)).toString();

async function token() {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token;
}

export default function SeloAdmin() {
  const [aba, setAba] = useState('painel');
  const [periodo, setPeriodo] = useState(() => ({ preset: '30', de: PRESETS[2].de(), ate: diaSP() }));
  const [modo, setModo] = useState(null);

  async function exportarCsv() {
    const t = await token();
    if (!t) return showToast('Sessão expirada. Entre de novo.', 'error');
    const r = await fetch(`/api/admin/selo?${qs({ acao: 'csv', de: periodo.de, ate: periodo.ate })}`, { headers: { Authorization: `Bearer ${t}` } });
    if (!r.ok) return showToast('Não exportou. Tente de novo.', 'error');
    const url = URL.createObjectURL(await r.blob());
    const a = Object.assign(document.createElement('a'), {
      href: url, download: `selo-visitas-${periodo.de || 'inicio'}-a-${periodo.ate || 'hoje'}.csv`,
    });
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="ig-screen sa">
      <div className="ig-pagehead">
        <div>
          <p className="eyebrow">Parque da Cidade · Itajubá</p>
          <h1>Selo da Estação</h1>
          <p>Visitas, entregas, autorizações e publicação dos conquistadores.</p>
        </div>
        <div className="ph-actions">
          <a className="ig-btn ig-btn--ghost" href="/selo/balcao" target="_blank" rel="noopener noreferrer">Imprimir QR do balcão</a>
          <a className="ig-btn ig-btn--ghost" href="/selo" target="_blank" rel="noopener noreferrer">Abrir formulário</a>
          <button type="button" className="ig-btn ig-btn--primary" onClick={exportarCsv}>Exportar CSV</button>
        </div>
      </div>

      {modo === 'local' && (
        <div className="ig-alert">
          <div className="at"><b>Modo local</b><span>Dados de teste em .selo-local/ nesta máquina. O Supabase não é usado.</span></div>
        </div>
      )}

      <div className="ig-tabs" role="tablist">
        {ABAS.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={aba === id} className={`ig-tab${aba === id ? ' active' : ''}`} onClick={() => setAba(id)}>{label}</button>
        ))}
      </div>

      {aba === 'painel' && <Painel periodo={periodo} setPeriodo={setPeriodo} onModo={setModo} />}
      {aba === 'fotos' && <Fotos />}
      {aba === 'balcao' && <Balcao />}
      {aba === 'beneficio' && <Beneficio />}
      {aba === 'parceiros' && <Parceiros />}
      {aba === 'checkin' && <CheckinLocais />}
      {aba === 'conquistas' && <Conquistas />}
    </div>
  );
}

/* ── Painel ─────────────────────────────────────────────────────────────── */

function Painel({ periodo, setPeriodo, onModo }) {
  const [r, setR] = useState(null);
  const [erro, setErro] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await adminGet(`/api/admin/selo?${qs({ acao: 'resumo', de: periodo.de, ate: periodo.ate })}`);
    if (error) { setErro(error.message); return; }
    setErro('');
    setR(data);
    onModo(data.modo);
  }, [periodo.de, periodo.ate, onModo]);
  useEffect(() => { (async () => { await load(); })(); }, [load]);

  const escolher = (p) => setPeriodo({ preset: p.id, de: p.de(), ate: p.id === 'tudo' ? '' : diaSP() });

  return (
    <>
      <div className="sa-filtro">
        {PRESETS.map((p) => (
          <button key={p.id} type="button" className={`ig-tab${periodo.preset === p.id ? ' active' : ''}`} onClick={() => escolher(p)}>{p.label}</button>
        ))}
        <label>De <input type="date" value={periodo.de} onChange={(e) => setPeriodo((x) => ({ ...x, preset: '', de: e.target.value }))} /></label>
        <label>Até <input type="date" value={periodo.ate} onChange={(e) => setPeriodo((x) => ({ ...x, preset: '', ate: e.target.value }))} /></label>
      </div>

      {erro && <div className="ig-alert danger"><div className="at"><b>Não carregou</b><span>{erro}</span></div></div>}
      {!r ? <div className="ig-empty">Carregando…</div> : (
        <>
          <div className="ig-statgrid sa-kpis">
            <Kpi v={r.total} k="Visitas no período" />
            <Kpi v={r.motociclistas} k="Motociclistas no período" />
            <Kpi v={r.hoje} k="Hoje" />
            <Kpi v={r.ultimos7} k="Últimos 7 dias" />
          </div>
          <div className="sa-grade">
            <Barras titulo="Por estação" itens={r.porEstacao.map((e) => ({ nome: e.nome, total: e.total, cor: ESTACOES[e.id].cor }))} />
            <Barras titulo="Por onde passou" itens={r.passouPor} />
            <Barras titulo="Top 10 cidades" itens={r.topCidades} />
            <Barras titulo="Por UF" itens={r.porUf} />
            <Barras titulo="Por local do QR" itens={r.porLocal} />
            <Barras titulo="Check-in" itens={r.porCheckin || []} />
            <Barras titulo="Visitas por dia" itens={r.porDia.map((d) => ({ nome: d.dia.split('-').reverse().join('/'), total: d.total }))} rolagem />
          </div>
        </>
      )}
    </>
  );
}

function Kpi({ v, k }) {
  return <div className="ig-stat"><div className="v">{v.toLocaleString('pt-BR')}</div><div className="k">{k}</div></div>;
}

function Barras({ titulo, itens, rolagem }) {
  const max = Math.max(1, ...itens.map((i) => i.total));
  return (
    <section className="ig-card">
      <div className="ch"><h2>{titulo}</h2></div>
      <div className={`cbody${rolagem ? ' sa-rolagem' : ''}`}>
        {itens.length === 0 ? <p className="sa-vazio">Sem visitas no período.</p> : (
          <ul className="sa-barras">
            {itens.map((i) => (
              <li key={i.nome}>
                <span className="n">{i.nome}</span>
                <span className="t" aria-hidden="true"><span style={{ '--p': (i.total / max) * 100, '--cor': i.cor }} /></span>
                <b>{i.total}</b>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

/* ── Fotos ──────────────────────────────────────────────────────────────── */

const STATUS = [['pendente', 'Pendentes'], ['aprovada', 'Aprovadas'], ['recusada', 'Recusadas']];

function Fotos() {
  const [status, setStatus] = useState('pendente');
  const [fotos, setFotos] = useState(null);

  const load = useCallback(async () => {
    setFotos(null);
    const { data, error } = await adminGet(`/api/admin/selo?acao=fotos&status=${status}`);
    if (error) { showToast(`Erro ao carregar fotos: ${error.message}`, 'error'); setFotos([]); return; }
    setFotos(data.fotos);
  }, [status]);
  useEffect(() => { (async () => { await load(); })(); }, [load]);

  async function mudar(f, novo) {
    const { error } = await adminPost('/api/admin/selo', { acao: 'foto', id: f.id, status: novo });
    if (error) return showToast(error.message, 'error');
    setFotos((lista) => lista.filter((x) => x.id !== f.id));
    showToast(novo === 'aprovada' ? 'Foto aprovada para uso autorizado.' : novo === 'recusada' ? 'Foto recusada.' : 'Foto voltou para a fila.');
  }

  async function baixar(f) {
    const { data, error } = await adminGet(`/api/admin/selo?acao=baixar&id=${f.id}`);
    if (error) return showToast(error.message, 'error');
    window.location.href = data.url;
  }

  async function copiar(f) {
    try {
      await navigator.clipboard.writeText(f.legenda);
      showToast('Legenda copiada.');
    } catch {
      window.prompt('Copie a legenda:', f.legenda);
    }
  }

  return (
    <>
      <div className="sa-filtro">
        {STATUS.map(([id, label]) => (
          <button key={id} type="button" className={`ig-tab${status === id ? ' active' : ''}`} onClick={() => setStatus(id)}>{label}</button>
        ))}
      </div>
      {!fotos ? <div className="ig-empty">Carregando…</div> : fotos.length === 0 ? (
        <div className="ig-empty">{status === 'pendente' ? 'Nenhuma foto esperando aprovação.' : 'Nenhuma foto aqui.'}</div>
      ) : (
        <ul className="sa-fotos">
          {fotos.map((f) => (
            <li key={f.id} className="ig-card">
              {f.url ? <img src={f.url} alt={`Foto de ${f.nome}`} loading="lazy" /> : <div className="sa-semfoto">Arquivo não encontrado</div>}
              <div className="sa-info">
                <b>{f.nome}</b>
                <span>nº {formatarNumero(f.numero)} · {f.cidade}/{f.uf} · {ESTACOES[f.estacao]?.nome}</span>
                <span>{dataHora.format(new Date(f.criado_em))}</span>
                {!f.autorizada && <span className="sa-tag">Sem autorização de uso: não vai para mural nem redes</span>}
              </div>
              <div className="sa-acoes">
                {status === 'pendente' && (
                  <>
                    <button type="button" className="ig-btn ig-btn--primary ig-btn--sm" disabled={!f.autorizada} onClick={() => mudar(f, 'aprovada')}>Aprovar</button>
                    <button type="button" className="ig-btn ig-btn--danger ig-btn--sm" onClick={() => mudar(f, 'recusada')}>Recusar</button>
                  </>
                )}
                {status === 'aprovada' && (
                  <>
                    <button type="button" className="ig-btn ig-btn--ghost ig-btn--sm" onClick={() => baixar(f)}>Baixar</button>
                    <button type="button" className="ig-btn ig-btn--ghost ig-btn--sm" onClick={() => copiar(f)}>Copiar legenda</button>
                    <button type="button" className="ig-btn ig-btn--danger ig-btn--sm" onClick={() => mudar(f, 'recusada')}>Tirar do mural</button>
                  </>
                )}
                {status === 'recusada' && (
                  <button type="button" className="ig-btn ig-btn--ghost ig-btn--sm" onClick={() => mudar(f, 'pendente')}>Voltar para a fila</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ── Balcão: achar o número de quem esqueceu; excluir dados (LGPD) ─────── */

function Balcao() {
  const [q, setQ] = useState('');
  const [pessoas, setPessoas] = useState(null);
  const [entregando, setEntregando] = useState(null);
  const { estacao, ano } = estacaoDe();

  async function entregar(p, v) {
    if (!window.confirm(`Conferiu o passaporte da Rota Biker carimbado de ${p.nome} e o adesivo físico de colecionador nº ${formatarNumero(p.numero)}? Confirmar entrega de um adesivo de ${ESTACOES[v.estacao].nome} ${v.ano}?`)) return;
    setEntregando(v.id);
    try {
      const { error } = await adminPost('/api/admin/selo', { acao: 'retirar', id: v.id });
      if (error) showToast(error.message, 'error');
      else showToast('Entrega registrada. Não é permitida outra retirada nesta estação.');
      await buscar();
    } finally { setEntregando(null); }
  }

  async function revogar(p, v) {
    if (!window.confirm(`Recusar o check-in de ${p.nome} (${METODO[v.checkin_metodo] || 'check-in'})? O selo digital volta a ficar pendente até novo check-in ou confirmação no balcão.`)) return;
    const { error } = await adminPost('/api/admin/selo', { acao: 'revogar', id: v.id });
    if (error) return showToast(error.message, 'error');
    showToast('Check-in recusado.');
    await buscar();
  }

  async function buscar(e) {
    e?.preventDefault();
    const { data, error } = await adminGet(`/api/admin/selo?acao=buscar&q=${encodeURIComponent(q)}`);
    if (error) return showToast(error.message, 'error');
    setPessoas(data.pessoas);
  }

  async function excluir(p) {
    const ok = window.confirm(`Apagar TODOS os dados de ${p.nome} (nº ${formatarNumero(p.numero)}): visitas e fotos? Não dá para desfazer.`);
    if (!ok) return;
    const { error } = await adminPost('/api/admin/selo', { acao: 'excluir', id: p.id });
    if (error) return showToast(error.message, 'error');
    setPessoas((lista) => lista.filter((x) => x.id !== p.id));
    showToast('Dados apagados.');
  }

  return (
    <>
      <form className="sa-busca" onSubmit={buscar}>
        <label htmlFor="sa-q">Nº, WhatsApp ou nome</label>
        <div>
          <input id="sa-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="0347 · (35) 99999-8888 · Ana" autoComplete="off" />
          <button type="submit" className="ig-btn ig-btn--primary">Buscar</button>
        </div>
      </form>
      {pessoas && (pessoas.length === 0 ? <div className="ig-empty">Ninguém encontrado.</div> : (
        <ul className="sa-pessoas">
          {pessoas.map((p) => (
            <li key={p.id} className="ig-card">
              <div className="sa-num">Colecionador nº {formatarNumero(p.numero)}</div>
              <div className="sa-info">
                <b>{p.nome}</b>
                <span>{p.cidade}/{p.uf}{p.whatsapp ? ` · ${mascararWhatsapp(p.whatsapp)}` : ' · sem WhatsApp'}</span>
                <span>{p.visitas.length} visita(s): {p.visitas.map((v) => `${ESTACOES[v.estacao]?.nome} ${v.ano}`).join(', ') || '—'}</span>
              </div>
              <div className="sa-acoes">
                {p.visitas.filter((v) => v.estacao === estacao && v.ano === ano).map((v) => (
                  <div key={v.id} className="sa-checkin">
                    {v.liberado_em
                      ? <span>Check-in por {METODO[v.checkin_metodo] || '—'} em {dataHora.format(new Date(v.liberado_em))}{v.checkin_distancia_m != null ? ` · ${v.checkin_distancia_m} m do ponto (±${v.checkin_precisao_m} m)` : ''}</span>
                      : <span className="sa-tag">Sem check-in digital</span>}
                    {v.prova_url && <a href={v.prova_url} target="_blank" rel="noopener noreferrer"><img src={v.prova_url} alt={`Passaporte enviado por ${p.nome}`} loading="lazy" /></a>}
                    {v.retirado_em ? <span role="status">Adesivo entregue em {dataHora.format(new Date(v.retirado_em))}</span>
                      : <button type="button" className="ig-btn ig-btn--primary ig-btn--sm" disabled={Boolean(entregando)} onClick={() => entregar(p, v)}>{entregando === v.id ? 'Confirmando…' : 'Confirmar entrega do adesivo'}</button>}
                    {v.liberado_em && !v.retirado_em && <button type="button" className="ig-btn ig-btn--ghost ig-btn--sm" onClick={() => revogar(p, v)}>Recusar check-in</button>}
                  </div>
                ))}
                {!p.visitas.some((v) => v.estacao === estacao && v.ano === ano) && <span>Sem selo da estação atual.</span>}
                <a className="ig-btn ig-btn--ghost ig-btn--sm" href={`/selo/m/${p.codigo}`} target="_blank" rel="noopener noreferrer">Abrir selo</a>
                <button type="button" className="ig-btn ig-btn--danger ig-btn--sm" onClick={() => excluir(p)}>Excluir dados</button>
              </div>
            </li>
          ))}
        </ul>
      ))}
    </>
  );
}


function Conquistas() {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [ocupado, setOcupado] = useState(null);
  const load = useCallback(async () => {
    const { data, error } = await adminGet('/api/admin/selo?acao=conquistas');
    if (error) { setErro(error.message); return; }
    setErro(''); setLista(data.conquistas);
  }, []);
  useEffect(() => { (async () => { await load(); })(); }, [load]);
  async function publicar(c, valor) {
    setOcupado(c.id);
    const { error } = await adminPost('/api/admin/selo', { acao: 'conquista', id: c.id, publicar: valor });
    if (error) showToast(error.message, 'error');
    else showToast(valor ? 'Conquista publicada no mural e no feed.' : 'Conquista retirada do mural e do feed.');
    await load(); setOcupado(null);
  }
  return <div className="selo-admin-conquistas">
    <p>Participantes com ao menos uma estação confirmada no balcão. A pessoa autoriza cada ano pela coleção pessoal. Publicação mostra nome, cidade/UF, número, datas e progresso no ranking e no perfil público. Certificação exige quatro estações.</p>
    {erro && <p role="alert">{erro}</p>}
    <button type="button" className="ig-btn ig-btn--ghost" onClick={load}>Atualizar conquistas</button>
    {!lista ? <p>Carregando…</p> : !lista.length ? <div className="ig-empty">Nenhuma conquista enviada para o mural.</div> : <ul className="sa-pessoas">{lista.map((c) => <li key={c.id} className="ig-card">
      <div className="sa-info"><b>{c.nome} · {c.ano} · {c.total}/4 estações</b><span>Colecionador nº {formatarNumero(c.numero)} · {c.cidade}/{c.uf}</span><span>{c.aprovado_em ? 'Publicado no mural e no feed' : c.autorizado_em ? 'Autorizado · aguardando aprovação' : 'Sem autorização de publicação'}</span></div>
      <div className="sa-acoes"><button type="button" className="ig-btn ig-btn--primary" disabled={Boolean(ocupado) || !c.autorizado_em} onClick={() => publicar(c, !c.aprovado_em)}>{ocupado === c.id ? 'Salvando…' : c.aprovado_em ? 'Retirar do mural e feed' : 'Publicar no mural e feed'}</button></div>
    </li>)}</ul>}
  </div>;
}

/* ── Benefício: valida o código exclusivo que a pessoa mostra ─────────────── */

function Beneficio() {
  const [q, setQ] = useState('');
  const [r, setR] = useState(null);
  const [nota, setNota] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function validar(e) {
    e?.preventDefault();
    const { data, error } = await adminGet(`/api/admin/selo?acao=beneficio&q=${encodeURIComponent(q)}`);
    if (error) return showToast(error.message, 'error');
    setR(data);
  }

  async function registrar() {
    if (!window.confirm(`Registrar uso do benefício por ${r.pessoa.nome} (nº ${formatarNumero(r.pessoa.numero)})?`)) return;
    setSalvando(true);
    try {
      const { error } = await adminPost('/api/admin/selo', { acao: 'beneficio-uso', id: r.pessoa.id, nota });
      if (error) return showToast(error.message, 'error');
      showToast('Uso registrado.');
      setNota('');
      await validar();
    } finally { setSalvando(false); }
  }

  return (
    <>
      <form className="sa-busca" onSubmit={validar}>
        <label htmlFor="sa-cupom">Código do colecionador</label>
        <div>
          <input id="sa-cupom" value={q} onChange={(e) => setQ(e.target.value.toUpperCase())} placeholder="K7QM-3XPA" autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={12} />
          <button type="submit" className="ig-btn ig-btn--primary">Validar</button>
        </div>
      </form>
      {r && !r.valido && <div className="ig-alert danger"><div className="at"><b>Código inválido</b><span>{r.motivo}</span></div></div>}
      {r?.valido && (
        <div className="ig-card sa-beneficio">
          <div className={`sa-veredito${r.apto ? ' ok' : ''}`}>{r.apto ? 'Válido' : 'Cadastro incompleto'}</div>
          <div className="sa-info">
            <b>{r.pessoa.nome}</b>
            <span>Colecionador nº {formatarNumero(r.pessoa.numero)} · {r.pessoa.cidade}/{r.pessoa.uf}{r.pessoa.bairro ? ` · ${r.pessoa.bairro}` : ''}</span>
            <span>Check-ins: {r.checkins.map((c) => `${ESTACOES[c.estacao]?.nome} ${c.ano}${c.balcao ? ' (balcão)' : ''}`).join(', ') || 'nenhum'}</span>
            <span>{r.usos.length ? `Usado ${r.usos.length}×. Último: ${dataHora.format(new Date(r.usos[0].usado_em))}${r.usos[0].nota ? ` · ${r.usos[0].nota}` : ''}` : 'Nenhum uso registrado.'}</span>
          </div>
          {r.apto && (
            <div className="sa-acoes">
              <input className="sa-nota" value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Nota (opcional): ex. 10% lanchonete" maxLength={120} aria-label="Nota do uso" />
              <button type="button" className="ig-btn ig-btn--primary ig-btn--sm" disabled={salvando} onClick={registrar}>{salvando ? 'Registrando…' : 'Registrar uso'}</button>
              <a className="ig-btn ig-btn--ghost ig-btn--sm" href={`/selo/m/${r.pessoa.codigo}`} target="_blank" rel="noopener noreferrer">Abrir coleção</a>
            </div>
          )}
        </div>
      )}
    </>
  );
}

/* ── Check-in: status do geofence e captura da coordenada no local ─────── */

function CheckinLocais() {
  const [locais, setLocais] = useState(null);
  const [pos, setPos] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error } = await adminGet('/api/admin/selo?acao=geo');
      if (error) return showToast(error.message, 'error');
      setLocais(data.locais);
    })();
  }, []);

  function capturar() {
    setMsg('Procurando localização…');
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => { setPos(coords); setMsg(''); },
      () => setMsg('Não obteve a localização. Libere o acesso e tente em área aberta.'),
      { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 },
    );
  }

  const linha = (l) => `${l.env}=${pos.latitude.toFixed(6)},${pos.longitude.toFixed(6)},300`;

  return (
    <div className="selo-admin-conquistas">
      <p>O check-in por GPS libera o selo digital quando a pessoa está no raio do ponto. Sem coordenada configurada, o ponto aceita só foto do passaporte. Adesivo físico e certificado seguem exigindo a confirmação no Balcão.</p>
      {!locais ? <p>Carregando…</p> : (
        <ul className="sa-pessoas">
          {locais.map((l) => (
            <li key={l.id} className="ig-card">
              <div className="sa-info"><b>{l.nome}</b><span>?local={l.id} · {l.configurado ? `GPS ativo · raio ${l.raio} m` : `GPS desligado · defina ${l.env}`}</span></div>
            </li>
          ))}
        </ul>
      )}
      <section className="ig-card sa-geo">
        <div className="sa-info">
          <b>Capturar coordenada</b>
          <span>Fique no centro do ponto (ex.: balcão do Parque), toque em capturar e copie a linha para as variáveis de ambiente do servidor. Depois publique de novo.</span>
        </div>
        <div className="sa-acoes">
          <button type="button" className="ig-btn ig-btn--primary ig-btn--sm" onClick={capturar}>Capturar minha localização</button>
          {msg && <span role="status">{msg}</span>}
        </div>
        {pos && locais && (
          <div className="sa-info">
            <span>Precisão: ±{Math.round(pos.accuracy)} m{pos.accuracy > 50 ? ' (fraca: tente de novo em área aberta)' : ''}</span>
            {locais.map((l) => <code key={l.id}>{linha(l)}</code>)}
          </div>
        )}
      </section>
    </div>
  );
}

/* ── Parceiros: link secreto por estabelecimento para conferir códigos ──── */

function Parceiros() {
  const [lista, setLista] = useState(null);
  const [nome, setNome] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const link = (p) => `${window.location.origin}/selo/parceiro/${p.token}`;

  const load = useCallback(async () => {
    const { data, error } = await adminGet('/api/admin/selo?acao=parceiros');
    if (error) return showToast(error.message, 'error');
    setLista(data.parceiros);
  }, []);
  useEffect(() => { (async () => { await load(); })(); }, [load]);

  async function criar(e) {
    e.preventDefault();
    setOcupado(true);
    try {
      const { error } = await adminPost('/api/admin/selo', { acao: 'parceiro-criar', nome });
      if (error) return showToast(error.message, 'error');
      setNome('');
      showToast('Parceiro criado. Copie o link e envie ao responsável.');
      await load();
    } finally { setOcupado(false); }
  }

  async function ativar(p, ativo) {
    if (!ativo && !window.confirm(`Desativar o link de ${p.nome}? Ele para de funcionar na hora.`)) return;
    const { error } = await adminPost('/api/admin/selo', { acao: 'parceiro-ativo', id: p.id, ativo });
    if (error) return showToast(error.message, 'error');
    showToast(ativo ? 'Link reativado.' : 'Link desativado.');
    await load();
  }

  async function copiar(p) {
    try { await navigator.clipboard.writeText(link(p)); showToast('Link copiado.'); }
    catch { window.prompt('Copie o link:', link(p)); }
  }

  return (
    <div className="selo-admin-conquistas">
      <p>Cada parceiro (Parque, restaurante, posto…) recebe um link próprio para conferir o código do colecionador: cadastro completo, carimbo e benefício válido. O parceiro vê só primeiro nome, inicial e nº. Se um link vazar, desative e crie outro.</p>
      <form className="sa-busca" onSubmit={criar}>
        <label htmlFor="sa-parceiro">Novo parceiro</label>
        <div>
          <input id="sa-parceiro" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Parque da Cidade · Lanchonete" maxLength={80} autoComplete="off" />
          <button type="submit" className="ig-btn ig-btn--primary" disabled={ocupado || nome.trim().length < 2}>Criar link</button>
        </div>
      </form>
      {!lista ? <p>Carregando…</p> : !lista.length ? <div className="ig-empty">Nenhum parceiro ainda.</div> : (
        <ul className="sa-pessoas">
          {lista.map((p) => (
            <li key={p.id} className="ig-card">
              <div className="sa-info">
                <b>{p.nome}</b>
                <span>{p.ativo ? 'Link ativo' : 'Link desativado'} · {p.usos} desconto(s) registrado(s)</span>
              </div>
              <div className="sa-acoes">
                {p.ativo && <>
                  <button type="button" className="ig-btn ig-btn--primary ig-btn--sm" onClick={() => copiar(p)}>Copiar link</button>
                  <a className="ig-btn ig-btn--ghost ig-btn--sm" href={link(p)} target="_blank" rel="noopener noreferrer">Abrir</a>
                </>}
                <button type="button" className={`ig-btn ig-btn--sm ${p.ativo ? 'ig-btn--danger' : 'ig-btn--ghost'}`} onClick={() => ativar(p, !p.ativo)}>{p.ativo ? 'Desativar' : 'Reativar'}</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
