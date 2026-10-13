import resumo from './aneisResumo.json' with { type: 'json' };
import { MONUMENTOS, ESTADOS_BIKERS } from './monumentosBikers.mjs';
import { distanceBetween } from './monumentosRoute.mjs';
import { estadoHref, getEstado } from './monumentosEstados.mjs';

const slug = s => s.replace(/['’]/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

// Só monumento com coordenada ganha página: sem local publicado (nº 2) não há o que mostrar.
export const MONUMENTOS_COM_PAGINA = MONUMENTOS.filter(m => m.coordinates);

export const monumentoSlug = m => slug(m.nome);
export const monumentoHref = m => `${estadoHref(m.uf)}/${monumentoSlug(m)}`;
export const ondeFica = m => m.uf === 'PY' ? `${m.cidade}, Paraguai` : `${m.cidade}, ${ESTADOS_BIKERS[m.uf]}`;

export function getMonumento(estadoSlug, monumento) {
  const e = getEstado(estadoSlug);
  return e && MONUMENTOS_COM_PAGINA.find(m => m.uf === e.uf && monumentoSlug(m) === monumento);
}

// Linha reta, não estrada: a página diz isso ao lado do número.
export function proximos(m, n = 3) {
  return MONUMENTOS_COM_PAGINA.filter(o => o.id !== m.id)
    .map(o => ({ monumento: o, km: Math.round(distanceBetween(m.coordinates, o.coordinates)) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, n);
}

// Mesma numeração "Rota 01…08" dos cards da página principal (ordem da trilha).
export function circuitosDe(m) {
  return resumo.trilha
    .map((etapa, i) => ({ posicao: i + 1, anel: resumo.aneis[etapa.anel] }))
    .filter(c => c.anel.monumentos.some(x => x.id === m.id))
    .map(({ posicao, anel }) => ({ posicao, faixa: anel.faixa, km: anel.km, horas: anel.horas, dias: anel.dias, paradas: anel.monumentos.length, ufs: anel.ufs }));
}

const rota = n => `Rota ${String(n).padStart(2, '0')}`;

// Perguntas montadas dos dados: o mesmo texto vai para a página e para o FAQPage.
export function perguntasDe(m) {
  const [vizinho] = proximos(m, 1);
  const circuitos = circuitosDe(m);
  const carimbo = {
    pronto: `Sim. O monumento ${m.nome} está pronto e carimbando o Passaporte Rota Biker. Confirme o horário de atendimento com o guardião antes de sair.`,
    construcao: `Ainda não. O monumento ${m.nome} está em construção e só passa a carimbar quando ficar pronto.`,
    atualizacao: `A situação do monumento ${m.nome} está em atualização no catálogo oficial. Confirme com o guardião antes de visitar.`,
  }[m.status];
  const perguntas = [
    { pergunta: `Onde fica o monumento ${m.nome}?`, resposta: `O monumento nº ${m.id} da Rota Biker fica em ${ondeFica(m)}, nas coordenadas ${m.coordinates.join(', ')}. Toque em “Como chegar” para abrir a rota no Google Maps.${m.nota ? ` ${m.nota}` : ''}` },
    { pergunta: `O monumento ${m.nome} carimba o passaporte?`, resposta: carimbo },
  ];
  if (vizinho) perguntas.push({ pergunta: `Qual monumento da Rota Biker fica mais perto do monumento ${m.nome}?`, resposta: `O monumento ${vizinho.monumento.nome}, nº ${vizinho.monumento.id}, em ${ondeFica(vizinho.monumento)}: cerca de ${vizinho.km} km em linha reta. Pela estrada a distância é maior.` });
  if (circuitos.length) perguntas.push({ pergunta: `Em qual circuito da Rota Biker o monumento ${m.nome} entra?`, resposta: `Em ${circuitos.length === 1 ? 'um circuito' : `${circuitos.length} circuitos`} sugeridos pela Pistaviva: ${circuitos.map(c => `${rota(c.posicao)} (${c.faixa.toLowerCase()}, ${c.km.toLocaleString('pt-BR')} km e ${c.paradas} paradas)`).join('; ')}.` });
  return perguntas;
}

export { rota as nomeDaRota };
