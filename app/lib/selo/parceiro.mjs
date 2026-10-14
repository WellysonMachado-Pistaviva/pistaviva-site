// Painel do parceiro (Parque e estabelecimentos): link secreto por parceiro,
// /selo/parceiro/{token}. Sem login: o token é a credencial e pode ser revogado
// no admin. O parceiro só vê o mínimo para decidir o desconto.
import { ESTACOES } from './estacao.mjs';
import { almocoStatus, beneficioApto, enderecoCompleto } from './beneficio.mjs';

export const tokenValido = (t) => /^[A-Za-z0-9_-]{32}$/.test(String(t || ''));

// 24 bytes → 32 caracteres base64url.
export function gerarToken(bytes = (n) => globalThis.crypto.getRandomValues(new Uint8Array(n))) {
  return Buffer.from(bytes(24)).toString('base64url');
}

export function validarNomeParceiro(valor) {
  const nome = String(valor || '').replace(/\s+/g, ' ').trim();
  return nome.length >= 2 && nome.length <= 80 ? nome : null;
}

// "Ana Maria Souza" → "Ana S." Suficiente para conferir com a pessoa no caixa.
export function nomeCurto(nome) {
  const partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
  if (partes.length < 2) return partes[0] || '';
  return `${partes[0]} ${partes.at(-1)[0].toUpperCase()}.`;
}

const metodoCarimbo = (v) => (v.retirado_em ? 'balcão' : v.checkin_metodo === 'gps' ? 'GPS' : v.checkin_metodo === 'foto' ? 'foto do passaporte' : 'check-in');

// Resposta pública do painel. r = { moto, visitas, usos } de buscarPorCupom.
export function resumoParceiro(r, parceiroId) {
  if (!r) return { valido: false, motivo: 'Código não encontrado.' };
  const { moto, visitas, usos } = r;
  const carimbos = visitas
    .filter((v) => v.liberado_em || v.retirado_em)
    .map((v) => ({ estacao: ESTACOES[v.estacao]?.nome || v.estacao, ano: v.ano, metodo: metodoCarimbo(v), em: v.retirado_em || v.liberado_em }))
    .sort((a, b) => b.em.localeCompare(a.em));
  const dados = enderecoCompleto(moto);
  const apto = beneficioApto(moto, visitas);
  // Usos antigos (antes do almoço existir) não têm tipo: eram desconto.
  const aqui = usos.filter((u) => u.parceiro_id === parceiroId && (u.tipo || 'desconto') === 'desconto');
  const almoco = almocoStatus(visitas, usos);
  return {
    valido: apto,
    motivo: apto ? null : !dados ? 'Cadastro incompleto.' : 'Ainda sem carimbo no Parque.',
    pessoa: { nome: nomeCurto(moto.nome), numero: moto.numero },
    etapas: { dados, carimbo: carimbos.length > 0, beneficio: apto },
    ultimoCarimbo: carimbos[0] || null,
    usosAqui: aqui.length,
    ultimoUsoAqui: aqui[0]?.usado_em || null,
    // Almoço depende de cadastro completo (o código só existe com ele).
    almoco: { disponivel: dados && almoco.disponivel, ano: almoco.ano, usadoEm: almoco.usadoEm },
  };
}
