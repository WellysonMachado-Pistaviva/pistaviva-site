'use client';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { gerarConquista } from './passaporte/artePassaporte';
import { carregarIdentidade } from './passaporte/recursosPassaporte';
import './conquista-pronta.css';

const FORMATOS = [['stories', 'Stories'], ['feed', 'Feed']];

const blobDoCanvas = (canvas) => new Promise((resolve, reject) => {
  canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('imagem'))), 'image/jpeg', 0.92);
});

function baixar(arquivo) {
  const url = URL.createObjectURL(arquivo);
  const a = document.createElement('a');
  a.href = url;
  a.download = arquivo.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Coleção (para "outras conquistas") e identificação da pessoa: só no navegador,
// com o mesmo segredo do passaporte. Sem rede, a imagem sai só com o carimbo.
async function carregarContexto(codigo) {
  const r = await fetch('/api/selo/passaporte', { headers: { Authorization: `Bearer ${codigo}` }, cache: 'no-store' });
  const colecao = r.ok ? await r.json() : null;
  const pessoa = { nome: colecao?.nome || '', cidade: colecao?.cidade || '', uf: colecao?.uf || '', numero: colecao?.numero ?? null };
  const { dados, fotoSrc } = await carregarIdentidade({ pessoa, privado: true, codigo });
  return { carimbos: colecao?.carimbos || [], numero: pessoa.numero, dados, fotoSrc };
}

// A moto andando na estrada enquanto a imagem é montada no celular.
function Motinha() {
  return (
    <div className="conquista-gerando" role="status">
      <div className="conquista-estrada" aria-hidden="true">
        <svg className="conquista-moto" viewBox="0 0 64 36" width="64" height="36">
          <circle cx="13" cy="27" r="7" fill="none" stroke="currentColor" strokeWidth="3.5" />
          <circle cx="51" cy="27" r="7" fill="none" stroke="currentColor" strokeWidth="3.5" />
          <path d="M13 27 24 16h14l6 6h7M30 16l-4-6h-6M38 16l5-7h6" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M24 16h14l-3 7H27Z" fill="currentColor" />
        </svg>
      </div>
      <span>Gerando sua conquista…</span>
    </div>
  );
}

// Imagem da conquista pronta para postar, no mesmo lugar do carimbo: sem
// abrir outra página. Gera Stories e Feed de uma vez; o arquivo fica pronto
// antes do toque para o compartilhamento nativo funcionar no celular.
// carimbo: { entradaId, slug, nome, uf, dia, serie, src }.
export default function ConquistaPronta({ codigo, carimbo, personalizar = null }) {
  const [formato, setFormato] = useState('stories');
  const [estado, setEstado] = useState({ chave: null, arquivos: null, erro: false });
  const [mensagem, setMensagem] = useState('');
  const chave = `${carimbo.entradaId}|${carimbo.src}`;

  useEffect(() => {
    let ativo = true;
    (async () => {
      try {
        const ctx = await carregarContexto(codigo).catch(() => ({ carimbos: [], numero: null, dados: { piloto: '', garupa: '', origem: '', assinatura: '' }, fotoSrc: null }));
        const daColecao = ctx.carimbos.find((c) => c.entradaId === carimbo.entradaId);
        const destaque = { ...carimbo, visita: daColecao?.visita || 1 };
        const outros = ctx.carimbos.filter((c) => c.entradaId !== carimbo.entradaId).reverse();
        const nome = `conquista-${carimbo.slug}-${carimbo.dia}`;
        const arquivos = {};
        for (const [f] of FORMATOS) {
          const tela = await gerarConquista({ destaque, outros, dados: ctx.dados, fotoSrc: ctx.fotoSrc, numero: ctx.numero, formato: f });
          arquivos[f] = new File([await blobDoCanvas(tela)], `${nome}-${f}.jpg`, { type: 'image/jpeg' });
          if (!ativo) return;
          setEstado({ chave, arquivos: { ...arquivos }, erro: false });
        }
      } catch {
        if (ativo) setEstado({ chave, arquivos: null, erro: true });
      }
    })();
    return () => { ativo = false; };
  }, [codigo, chave]); // eslint-disable-line react-hooks/exhaustive-deps -- chave já cobre o carimbo e a arte

  const atual = estado.chave === chave ? estado : { arquivos: null, erro: false };
  const arquivo = atual.arquivos?.[formato] || null;
  const previa = useMemo(() => (arquivo ? URL.createObjectURL(arquivo) : null), [arquivo]);
  useEffect(() => () => { if (previa) URL.revokeObjectURL(previa); }, [previa]);
  const podeCompartilhar = typeof navigator !== 'undefined' && arquivo && navigator.canShare?.({ files: [arquivo] });

  async function compartilhar() {
    setMensagem('');
    try {
      await navigator.share({ files: [arquivo], title: `Estive em ${carimbo.nome}`, text: 'Minha história tem estrada. Conectando pessoas a lugares.' });
    } catch (e) {
      if (e.name !== 'AbortError') { baixar(arquivo); setMensagem('Não abriu o compartilhamento; a imagem foi baixada.'); }
    }
  }

  return (
    <section className="conquista-pronta" aria-label="Imagem da sua conquista">
      <div className="conquista-topo">
        <b>Sua conquista pronta para postar</b>
        <div className="conquista-formatos" role="tablist" aria-label="Formato">
          {FORMATOS.map(([id, rotulo]) => (
            <button key={id} type="button" role="tab" aria-selected={formato === id} onClick={() => setFormato(id)}>{rotulo}</button>
          ))}
        </div>
      </div>
      {atual.erro ? (
        <p className="selo-erro" role="alert">Não deu para montar a imagem agora. O carimbo já está no passaporte; tente de novo mais tarde.</p>
      ) : !previa ? <Motinha /> : (
        <>
          <img className={`conquista-previa ${formato}`} src={previa} alt={`Imagem da conquista em ${carimbo.nome} para ${formato === 'feed' ? 'o feed' : 'os Stories'}`} />
          <div className="conquista-acoes">
            {podeCompartilhar && <button type="button" className="selo-btn" onClick={compartilhar}>Compartilhar</button>}
            <button type="button" className={`selo-btn${podeCompartilhar ? ' secundario' : ''}`} onClick={() => baixar(arquivo)}>Baixar imagem</button>
          </div>
          {mensagem && <p className="selo-dica" role="status">{mensagem}</p>}
        </>
      )}
      {personalizar && (typeof personalizar === 'function'
        ? <button type="button" className="selo-text-link conquista-personalizar" onClick={personalizar}>Personalizar com foto, garupa e layout →</button>
        : <Link className="selo-text-link conquista-personalizar" href={personalizar}>Personalizar com foto, garupa e layout →</Link>)}
    </section>
  );
}
