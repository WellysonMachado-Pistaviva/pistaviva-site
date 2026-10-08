import { MONUMENTOS, ESTADOS_BIKERS, STATUS_BIKERS } from './monumentosBikers.mjs';

export const BASE_MONUMENTOS = 'https://www.pistavivamototurismo.com.br';
export const MONUMENTOS_HREF = '/destinos/roteiros/monumentos-bikers';

const SLUGS = { BA: 'bahia', DF: 'distrito-federal', GO: 'goias', MG: 'minas-gerais', PB: 'paraiba', PR: 'parana', RS: 'rio-grande-do-sul', SC: 'santa-catarina', SP: 'sao-paulo', PY: 'paraguai' };
// "em São Paulo", "no Paraná", "na Bahia": a preposição muda com o estado.
const EM = { BA: 'na', DF: 'no', GO: 'em', MG: 'em', PB: 'na', PR: 'no', RS: 'no', SC: 'em', SP: 'em', PY: 'no' };

export const estadoHref = uf => `/destinos/monumentos/${SLUGS[uf]}`;
export const noEstado = uf => `${EM[uf]} ${ESTADOS_BIKERS[uf]}`;
export const comoChegar = m => `https://www.google.com/maps/dir/?api=1&destination=${m.coordinates.join(',')}`;

// Só estados com monumento identificado ganham página.
export const ESTADOS_COM_MONUMENTOS = Object.keys(SLUGS)
  .map(uf => ({ uf, slug: SLUGS[uf], nome: ESTADOS_BIKERS[uf], monumentos: MONUMENTOS.filter(m => m.uf === uf) }))
  .filter(e => e.monumentos.length)
  .sort((a, b) => b.monumentos.length - a.monumentos.length || a.nome.localeCompare(b.nome, 'pt-BR'));

export const getEstado = slug => ESTADOS_COM_MONUMENTOS.find(e => e.slug === slug);

export function resumoEstado({ uf, monumentos }) {
  const prontos = monumentos.filter(m => m.status === 'pronto').length;
  const cidades = [...new Set(monumentos.map(m => m.cidade))];
  const lista = cidades.length > 1 ? `${cidades.slice(0, -1).join(', ')} e ${cidades.at(-1)}` : cidades[0];
  const curta = cidades.length > 3 ? `${cidades.slice(0, 3).join(', ')} e mais ${cidades.length - 3} cidades` : lista;
  return { prontos, cidades, lista, curta, total: monumentos.length, texto: `${monumentos.length} ${monumentos.length === 1 ? 'monumento' : 'monumentos'} da Rota Biker ${noEstado(uf)}, em ${lista}. ${prontos} ${prontos === 1 ? 'está pronto' : 'estão prontos'} e carimbando o passaporte.` };
}

// Cada monumento vira um TouristAttraction com cidade e coordenadas:
// é o que ajuda o Google a ligar a página a buscas locais e "perto de mim".
export function atracaoLd(m, url) {
  return {
    '@type': 'TouristAttraction',
    name: `Monumento Rota Biker nº ${m.id} — ${m.nome}`,
    description: `Monumento do cumprimento biker em ${m.cidade}${m.uf && m.uf !== 'PY' ? `, ${ESTADOS_BIKERS[m.uf]}` : ''}. ${STATUS_BIKERS[m.status]}.`,
    url,
    touristType: 'Motociclistas',
    address: { '@type': 'PostalAddress', addressLocality: m.cidade, ...(m.uf && m.uf !== 'PY' ? { addressRegion: m.uf, addressCountry: 'BR' } : { addressCountry: 'PY' }) },
    ...(m.coordinates ? { geo: { '@type': 'GeoCoordinates', latitude: m.coordinates[0], longitude: m.coordinates[1] }, hasMap: comoChegar(m) } : {}),
    ...(m.contato ? { sameAs: [m.contato] } : {}),
  };
}

export function listaLd(name, url, monumentos, itemUrl = m => `${url}#monumento-${m.id}`) {
  return {
    '@type': 'ItemList', name, url, numberOfItems: monumentos.length,
    itemListElement: monumentos.map((m, i) => ({ '@type': 'ListItem', position: i + 1, item: atracaoLd(m, itemUrl(m)) })),
  };
}
