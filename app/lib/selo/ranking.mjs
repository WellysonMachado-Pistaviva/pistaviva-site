// Apenas conquistas públicas autorizadas devem chegar a este helper.
export function montarRanking(conquistas, { ano = 'todos', busca = '' } = {}) {
  const pessoas = new Map();
  for (const conquista of conquistas || []) {
    if (ano !== 'todos' && Number(conquista.ano) !== Number(ano)) continue;
    const numero = Number(conquista.numero);
    if (!Number.isSafeInteger(numero) || numero < 1) continue;
    const pessoa = pessoas.get(numero) || { numero, nome: conquista.nome, cidade: conquista.cidade, uf: conquista.uf, anos: [] };
    if (pessoa.anos.some((item) => item.ano === Number(conquista.ano))) continue;
    pessoa.anos.push({ ano: Number(conquista.ano), total: Math.max(0, Math.min(4, Number(conquista.total) || 0)), etapas: conquista.etapas || [], concluidoEm: conquista.concluidoEm || null });
    pessoas.set(numero, pessoa);
  }
  const ranking = [...pessoas.values()].map((pessoa) => ({ ...pessoa, anos: pessoa.anos.sort((a, b) => b.ano - a.ano), total: pessoa.anos.reduce((soma, item) => soma + item.total, 0) }))
    .sort((a, b) => b.total - a.total || a.nome.localeCompare(b.nome, 'pt-BR') || a.numero - b.numero);
  let posicao = 0;
  const normalizar = (valor) => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  const termo = normalizar(busca).trim();
  return ranking.map((pessoa, indice) => {
    if (!indice || pessoa.total !== ranking[indice - 1].total) posicao = indice + 1;
    return { ...pessoa, posicao };
  }).filter((pessoa) => !termo || normalizar(`${pessoa.nome} ${pessoa.cidade} ${pessoa.uf}`).includes(termo));
}
