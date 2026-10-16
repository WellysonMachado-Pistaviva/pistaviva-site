// Acrescenta uma conta de prévia ao banco LOCAL; preserva os demais registros.
// Não usa Supabase, não envia mensagens, não publica passaporte.
import exemplos from '../app/selo/passaporte/previa/cidades-exemplo.json' with { type: 'json' };
import { criarStoreLocal } from '../app/lib/selo/storeLocal.mjs';
import { localPorSlug } from '../app/lib/selo/locais.mjs';

const s = criarStoreLocal();
const whatsapp = '11900004271';
const antigo = s.motociclistas().find((m) => m.whatsapp === whatsapp);
if (antigo && antigo.nome !== 'Ana Souza (prévia local)') throw new Error('Número já usado por outra conta local.');
const perfil = antigo || s.criarPassaporte({ nome: 'Ana Souza (prévia local)', whatsapp, cidade: 'Itajubá', uf: 'MG' });
for (const c of exemplos) {
  const local = localPorSlug(c.slug);
  s.carimbarCidade(perfil.codigo, { carimbo: c.slug, ibge: local.ibge, uf: c.uf, dia: c.dia, distancia: 0, precisao: 10 });
}
const primeira = s.entradas(s.motoPorCodigo(perfil.codigo).id).find((e) => e.carimbo === exemplos[0].slug);
if (primeira && !s.memoriaPorEntrada(perfil.codigo, primeira.id).relato) s.salvarMemoria(perfil.codigo, primeira.id, 'Cheguei pela serra no fim da tarde. Parei para um café antes de seguir viagem.');
console.log('Prévia pronta: http://127.0.0.1:3000/selo/passaporte/previa/jornada');
