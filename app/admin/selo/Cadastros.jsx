'use client';
import { useEffect, useState } from 'react';
import { adminGet } from '../../lib/adminDb';
import { supabase } from '../../../src/lib/supabaseClient';

async function arquivoPrivado(query) {
  let { data } = await supabase.auth.getSession();
  let token = data?.session?.access_token;
  if (!token) throw new Error('Sessão expirada. Entre novamente.');
  const get = (t) => fetch(`/api/admin/selo/cadastros?${query}`, { cache: 'no-store', headers: { Authorization: `Bearer ${t}` } });
  let r = await get(token);
  if (r.status === 401) {
    ({ data } = await supabase.auth.refreshSession());
    token = data?.session?.access_token;
    if (token) r = await get(token);
  }
  if (!r.ok) throw new Error((await r.json()).error || 'Arquivo indisponível.');
  return r.blob();
}

function Retrato({ pessoa }) {
  const [url, setUrl] = useState(null);
  const [erro, setErro] = useState('');
  const [abrir, setAbrir] = useState(false);
  useEffect(() => {
    if (!abrir) return;
    let ativo = true;
    let temporaria;
    arquivoPrivado(new URLSearchParams({ foto: pessoa.id })).then((blob) => {
      if (!ativo) return;
      temporaria = URL.createObjectURL(blob);
      setUrl(temporaria);
    }).catch((e) => { if (ativo) setErro(e.message); });
    return () => { ativo = false; if (temporaria) URL.revokeObjectURL(temporaria); };
  }, [abrir, pessoa.id]);
  return <div>
    {!abrir && <button type="button" className="ig-btn ig-btn--ghost" onClick={() => setAbrir(true)}>Ver foto de identificação</button>}
    {url && <><img className="sa-cadastro-retrato" src={url} alt={`Foto de identificação de ${pessoa.nome}`} width={160} height={190} /><a className="ig-btn ig-btn--ghost" href={url} download={`identificacao-${pessoa.numero}.jpg`}>Baixar foto</a></>}
    {abrir && !url && !erro && <p role="status">Carregando foto…</p>}
    {erro && <p role="alert">{erro}</p>}
  </div>;
}

export default function Cadastros({ buscaInicial = '', onModo }) {
  const [texto, setTexto] = useState(buscaInicial);
  const [busca, setBusca] = useState(buscaInicial);
  const [pagina, setPagina] = useState(1);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState('');
  const [exportando, setExportando] = useState(false);
  const [revisao, setRevisao] = useState(0);
  useEffect(() => {
    let ativo = true;
    (async () => {
      const { data, error } = await adminGet(`/api/admin/selo/cadastros?${new URLSearchParams({ q: busca, pagina: String(pagina) })}`);
      if (!ativo) return;
      setErro(error?.message || '');
      setResultado(data);
      if (data) onModo(data.modo);
    })();
    return () => { ativo = false; };
  }, [busca, pagina, onModo, revisao]);

  async function exportar() {
    setExportando(true);
    setErro('');
    try {
      const blob = await arquivoPrivado('formato=csv');
      const url = URL.createObjectURL(blob);
      Object.assign(document.createElement('a'), { href: url, download: 'passaporte-cadastros.csv' }).click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { setErro(e.message); }
    finally { setExportando(false); }
  }

  return <section className="sa-cadastros" aria-label="Cadastros do passaporte">
    <div className="ig-card cbody">
      <h2>Todos os cadastros</h2>
      <p>Inclui pessoas sem visitas. Dados ficam no banco; fotos, em armazenamento privado. CSV abre no Excel e pode ser importado no Google Planilhas. Fotos podem ser consultadas e baixadas aqui.</p>
      <form className="sa-cadastro-busca" onSubmit={(e) => { e.preventDefault(); setResultado(null); setPagina(1); setBusca(texto.trim()); setRevisao((r) => r + 1); }}>
        <label htmlFor="sa-busca-cadastro">Nome, telefone, cidade ou número<input id="sa-busca-cadastro" value={texto} maxLength={80} onChange={(e) => setTexto(e.target.value)} /></label>
        <button type="submit" className="ig-btn ig-btn--primary">Buscar cadastros</button>
        <button type="button" className="ig-btn ig-btn--ghost" disabled={exportando} onClick={exportar}>{exportando ? 'Exportando…' : 'Exportar todos os cadastros (CSV)'}</button>
      </form>
      <p>Exportação contém dados pessoais. Guarde em local restrito à equipe. Senhas, códigos de recuperação e links pessoais não entram na planilha.</p>
    </div>
    {erro && <p role="alert" className="ig-alert danger">{erro}</p>}
    {!resultado && !erro && <p role="status">Consultando cadastros…</p>}
    {resultado && <>
      <p role="status">{resultado.total} cadastro(s) encontrado(s) · página {pagina}</p>
      <div className="sa-cadastro-lista">{resultado.cadastros.map((m) => <article className="ig-card cbody" key={m.id}>
        <h3>#{String(m.numero).padStart(4, '0')} · {m.nome}</h3>
        <p>{m.whatsapp || 'Sem telefone'} · {m.cidade}/{m.uf}</p>
        <p>Cadastro: {new Date(m.criadoEm).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} · {m.visitas} visita(s) · {m.carimbos} carimbo(s) de cidade</p>
        {m.ficha ? <dl>{[['Piloto', m.ficha.piloto], ['Garupa', m.ficha.garupa], ['Origem', m.ficha.origem], ['Assinatura', m.ficha.assinatura]].map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v || '—'}</dd></div>)}</dl> : <p>Identificação personalizada ainda não salva.</p>}
        {m.temFoto ? <Retrato pessoa={m} /> : <p>Sem foto de identificação salva.</p>}
      </article>)}</div>
      <nav className="sa-cadastro-busca" aria-label="Páginas de cadastros">
        <button type="button" className="ig-btn ig-btn--ghost" disabled={pagina === 1} onClick={() => { setResultado(null); setPagina((p) => p - 1); }}>Anterior</button>
        <button type="button" className="ig-btn ig-btn--ghost" disabled={pagina * resultado.limite >= resultado.total} onClick={() => { setResultado(null); setPagina((p) => p + 1); }}>Próxima</button>
      </nav>
    </>}
  </section>;
}
