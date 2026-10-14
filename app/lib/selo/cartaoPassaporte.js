import 'server-only';
import { readFile } from 'node:fs/promises';
import { ImageResponse } from 'next/og';
import { formatarNumero } from './constantes.mjs';
import { ESTACOES } from './estacao.mjs';

// Imagem de compartilhamento do passaporte: Stories (1080×1920) e prévia de
// link (1200×630). Gerada no servidor com as fontes e artes da marca, para
// sair igual no WhatsApp, Instagram e Facebook.
const COR = { fundo: '#0c0c0d', laranja: '#ff5a00', tinta: '#ffad7e', branco: '#ffffff', apoio: '#bfc0c3' };
const ORDEM = ['verao', 'outono', 'inverno', 'primavera'];
const MESES = { verao: 'JAN–MAR', outono: 'ABR–JUN', inverno: 'JUL–SET', primavera: 'OUT–DEZ' };

const arquivo = (nome) => readFile(new URL(`./${nome}`, import.meta.url));
const dataUri = async (nome) => `data:image/png;base64,${(await arquivo(`cartao/${nome}.png`)).toString('base64')}`;

let recursos;
async function carregar() {
  recursos ||= Promise.all([
    arquivo('fontes/SairaCondensed.ttf'), arquivo('fontes/Saira.ttf'),
    Promise.all([...ORDEM, 'mascote'].map(dataUri)),
  ]).then(([display, texto, imgs]) => ({
    fontes: [
      { name: 'Display', data: display, weight: 800, style: 'normal' },
      { name: 'Texto', data: texto, weight: 500, style: 'normal' },
    ],
    arte: Object.fromEntries([...ORDEM, 'mascote'].map((n, i) => [n, imgs[i]])),
  })).catch((e) => { recursos = null; throw e; });
  return recursos;
}

// "Ana Maria Souza" → "Ana Maria S." — reconhecível sem expor o nome completo.
export function nomeCartao(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length < 2) return partes[0] || 'Motociclista';
  return [...partes.slice(0, -1).slice(0, 2), `${partes.at(-1)[0].toUpperCase()}.`].join(' ');
}

export function fraseCartao(total) {
  if (total >= 4) return 'Ano completo. Conquistador de Itajubá.';
  if (total === 0) return 'A primeira estação me espera.';
  return 4 - total === 1 ? 'Falta 1 para fechar o ano.' : `Faltam ${4 - total} para fechar o ano.`;
}

function Selo({ id, tem, arte, tamanho }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: tamanho }}>
      <img src={arte[id]} width={tamanho} height={tamanho} style={{ opacity: tem ? 1 : 0.16 }} />
      <div style={{ display: 'flex', fontFamily: 'Display', fontSize: tamanho * 0.13, color: tem ? COR.branco : COR.apoio, letterSpacing: 2 }}>
        {tem ? ESTACOES[id].nome.toUpperCase() : MESES[id]}
      </div>
    </div>
  );
}

// conquistados: Set com as estações (verao/outono/…) que contam no cartão.
export async function cartaoPassaporte({ nome, numero, ano, conquistados, formato = 'story', site }) {
  const { fontes, arte } = await carregar();
  const total = ORDEM.filter((e) => conquistados.has(e)).length;
  const story = formato === 'story';
  const largura = story ? 1080 : 1200;
  const altura = story ? 1920 : 630;
  const s = story ? 1 : 0.42;
  const titulo = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', fontFamily: 'Texto', fontSize: story ? 30 : 20, color: COR.tinta, letterSpacing: story ? 6 : 4 }}>PASSAPORTE DO MOTOCICLISTA · ITAJUBÁ</div>
      <div style={{ display: 'flex', alignItems: 'baseline', fontFamily: 'Display', color: COR.branco, lineHeight: 0.9, marginTop: 16 * s }}>
        <span style={{ fontSize: story ? 240 : 150, color: COR.laranja }}>{total}</span>
        <span style={{ fontSize: story ? 104 : 64, marginLeft: 20 }}>DE 4</span>
      </div>
      <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 72 * s + (story ? 0 : 18), color: COR.branco }}>ESTAÇÕES {ano}</div>
      <div style={{ display: 'flex', fontFamily: 'Texto', fontSize: 36 * s + (story ? 0 : 10), color: COR.apoio, marginTop: 12 * s }}>{fraseCartao(total)}</div>
    </div>
  );
  const quem = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', fontFamily: 'Display', fontSize: story ? 64 : 34, color: COR.branco }}>{nomeCartao(nome)}</div>
      <div style={{ display: 'flex', fontFamily: 'Texto', fontSize: story ? 32 : 20, color: COR.tinta }}>Colecionador nº {formatarNumero(numero)}</div>
    </div>
  );
  const chamada = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      <div style={{ display: 'flex', fontFamily: 'Display', fontSize: story ? 52 : 30, color: COR.branco }}>COMECE O SEU</div>
      <div style={{ display: 'flex', fontFamily: 'Texto', fontSize: story ? 34 : 20, color: COR.laranja }}>{site}/selo</div>
    </div>
  );

  const corpo = story ? (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', padding: 80, justifyContent: 'space-between' }}>
      {titulo}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 24 }}>
        {ORDEM.map((id) => <Selo key={id} id={id} tem={conquistados.has(id)} arte={arte} tamanho={380} />)}
      </div>
      {quem}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <img src={arte.mascote} width={220} height={220} />
        {chamada}
      </div>
    </div>
  ) : (
    <div style={{ display: 'flex', width: '100%', height: '100%', padding: 48, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', width: 560 }}>
        {titulo}
        {quem}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', width: 420, justifyContent: 'space-between', rowGap: 4 }}>
          {ORDEM.map((id) => <Selo key={id} id={id} tem={conquistados.has(id)} arte={arte} tamanho={180} />)}
        </div>
        {chamada}
      </div>
    </div>
  );

  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: COR.fundo, borderTop: `${story ? 24 : 12}px solid ${COR.laranja}` }}>{corpo}</div>,
    { width: largura, height: altura, fonts: fontes },
  );
}
