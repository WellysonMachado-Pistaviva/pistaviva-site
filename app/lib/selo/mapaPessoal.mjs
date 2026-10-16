// Projeção única para o mapa na tela e para a imagem compartilhada.
export const MAPA_LARGURA = 640;
export const MAPA_ALTURA = 600;
export function projetarBrasil(lng, lat) {
  return [+(24 + (lng + 74) / 40 * 592).toFixed(2), +(24 + (6 - lat) / 40 * 552).toFixed(2)];
}

// Uma cidade no mapa; cada passagem continua sendo uma memória independente.
export function agruparCidades(carimbos) {
  const cidades = new Map();
  for (const c of carimbos) {
    if (c.tipo !== 'cidade' || !c.slug) continue;
    const cidade = cidades.get(c.slug) || { slug: c.slug, nome: c.nome, uf: c.uf, visitas: [] };
    cidade.visitas.push(c);
    cidades.set(c.slug, cidade);
  }
  return [...cidades.values()].map((c) => ({ ...c, visitas: c.visitas.sort((a, b) => b.dia.localeCompare(a.dia)) }))
    .sort((a, b) => b.visitas[0].dia.localeCompare(a.visitas[0].dia) || a.nome.localeCompare(b.nome, 'pt-BR'));
}
