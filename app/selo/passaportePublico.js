import 'server-only';
import { montarPassaporte } from '../lib/selo/passaporteUnico.mjs';
import { montarRanking } from '../lib/selo/ranking.mjs';
import { listarConquistas, passaportePublico } from '../lib/selo/store';

// O único passaporte público. Abre se a pessoa autorizou o passaporte
// (cidades + estações) OU publicou ao menos um ano nos Conquistadores
// (só as estações daquele ano, aprovadas pela equipe).
export async function carregarPassaportePublico(numero) {
  const [p, conquistas] = await Promise.all([passaportePublico(Number(numero)), listarConquistas(true)]);
  const ranking = montarRanking(conquistas).find((x) => String(x.numero) === numero) || null;
  if (!p && !ranking) return null;
  const base = p || ranking;
  const estacoes = p ? p.estacoes : ranking.anos.flatMap((a) => a.etapas.filter((e) => e.confirmadoEm).map((e) => ({ estacao: e.estacao, ano: a.ano, confirmadoEm: e.confirmadoEm })));
  return {
    pessoa: { nome: base.nome, numero: base.numero, cidade: base.cidade, uf: base.uf },
    modelo: montarPassaporte({ entradas: p?.entradas || [], estacoes }),
    posicao: ranking?.posicao || null,
    estacoes,
  };
}
