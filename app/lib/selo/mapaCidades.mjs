// Regras do mapa de carimbos e do check-in de cidade, sem banco nem rede:
// roda igual no servidor, no modo local e nos testes.
import { formatarNumero } from './constantes.mjs';

export const LIMITE_DENUNCIAS = 3;
// Check-in sem sinal: o celular guarda a leitura do GPS e envia depois.
export const OFFLINE_MAX_MS = 72 * 3600_000;
const RELOGIO_FOLGA_MS = 5 * 60_000;   // celular adiantado alguns minutos não é fraude
export const STATUS_FOTO = ['privada', 'publica', 'denunciada', 'oculta'];

// Quando o GPS leu a posição. Sem valor = agora (check-in online).
// { ok, quando: Date, offline } | { ok: false, motivo: 'futuro' | 'antigo' | 'invalido' }
export function horaDaCaptura(capturadoEm, agora = new Date()) {
  if (capturadoEm == null || capturadoEm === '') return { ok: true, quando: agora, offline: false };
  // Vem do cliente: só texto ISO. Objeto/array derrubava new Date() com TypeError.
  if (typeof capturadoEm !== 'string' || capturadoEm.length > 40) return { ok: false, motivo: 'invalido' };
  const t = Date.parse(capturadoEm);
  if (!Number.isFinite(t)) return { ok: false, motivo: 'invalido' };
  if (t > agora.getTime() + RELOGIO_FOLGA_MS) return { ok: false, motivo: 'futuro' };
  if (agora.getTime() - t > OFFLINE_MAX_MS) return { ok: false, motivo: 'antigo' };
  // Até 2 min de diferença é o próprio envio online, não fila offline.
  const offline = agora.getTime() - t > 2 * 60_000;
  return { ok: true, quando: offline ? new Date(t) : agora, offline };
}

// "Ana Maria Souza" → "Ana Maria S." — reconhecível sem expor o nome completo.
export function nomeCurto(nome, reserva = 'Motociclista') {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length < 2) return partes[0] || reserva;
  return [...partes.slice(0, -1).slice(0, 2), `${partes.at(-1)[0].toUpperCase()}.`].join(' ');
}

export const autorFoto = (nome, numero) => `${nomeCurto(nome)} · nº ${formatarNumero(numero)}`;

// Ponto para o marcador: centro da caixa do maior polígono do município.
// Basta para o mapa da rota; o check-in usa o contorno inteiro.
export function centroCidade(poligonos) {
  let maior = null;
  for (const [externo] of poligonos) {
    let a = 0;
    for (let i = 0, j = externo.length - 1; i < externo.length; j = i++) a += (externo[j][0] + externo[i][0]) * (externo[j][1] - externo[i][1]);
    if (!maior || Math.abs(a) > maior.area) maior = { area: Math.abs(a), anel: externo };
  }
  const lngs = maior.anel.map((p) => p[0]);
  const lats = maior.anel.map((p) => p[1]);
  const r = (v) => Math.round(v * 1e5) / 1e5;
  return { lat: r((Math.min(...lats) + Math.max(...lats)) / 2), lng: r((Math.min(...lngs) + Math.max(...lngs)) / 2) };
}

// Junta o catálogo com os totais do banco: toda cidade aparece, mesmo com zero.
export function cidadesDoMapa(cidades, totais = []) {
  const porSlug = new Map(totais.map((t) => [t.carimbo, t]));
  return cidades.map((c) => {
    const t = porSlug.get(c.slug) || {};
    return {
      slug: c.slug, nome: c.nome, uf: c.uf, ...centroCidade(c.poligonos),
      carimbos: Number(t.carimbos) || 0, pessoas: Number(t.pessoas) || 0, fotos: Number(t.fotos) || 0,
    };
  }).sort((a, b) => b.carimbos - a.carimbos || a.nome.localeCompare(b.nome, 'pt-BR'));
}

// Número de série do carimbo: ordem de chegada na cidade + letra de
// conferência tirada do id (estável, sem I e O para não confundir).
// "Nº 0007·K" — dá para sortear por número e letra e conferir o ganhador.
const LETRAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
export function letraSerie(id) {
  let h = 0x811c9dc5;
  for (const ch of String(id)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return LETRAS[h % LETRAS.length];
}
export const codigoSerie = (serie, id) => (serie ? `${String(serie).padStart(4, '0')}·${letraSerie(id)}` : null);
