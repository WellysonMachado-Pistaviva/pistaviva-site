import { ESTACOES, estacaoDe } from './estacao.mjs';

// A projeção pública é uma allowlist: nunca propaga código privado, telefone,
// endereço, fotos de comprovação ou identificadores internos do motociclista.
export function conquistasPublicas(lista) {
  return lista.filter((c) => c.autorizado_em && c.aprovado_em && c.total > 0)
    .map(({ id, nome, numero, cidade, uf, ano, total, etapas, concluidoEm }) => ({
      id, nome, numero, cidade, uf, ano, total, concluidoEm,
      etapas: etapas.map(({ estacao, confirmadoEm }) => ({ estacao, confirmadoEm })),
    }));
}

// Uma conquista por ano civil. Cadastro sozinho não comprova visita presencial.
export function conquistaDoAno(visitas, ano, agora = new Date()) {
  const atual = estacaoDe(agora);
  const ordem = Object.keys(ESTACOES);
  const confirmadas = visitas.filter((v) => {
    const retirada = v.retiradoEm || v.retirado_em;
    const instante = new Date(retirada || '').getTime();
    return v.ano === ano && ordem.includes(v.estacao) && Number.isFinite(instante)
      && instante <= agora.getTime()
      && ano * 4 + ordem.indexOf(v.estacao) <= atual.ano * 4 + ordem.indexOf(atual.estacao);
  });
  const etapas = ordem.map((estacao) => {
    const visita = confirmadas.filter((v) => v.estacao === estacao)
      .sort((a, b) => (a.retiradoEm || a.retirado_em).localeCompare(b.retiradoEm || b.retirado_em))[0];
    return { estacao, confirmadoEm: visita ? (visita.retiradoEm || visita.retirado_em) : null };
  });
  const total = etapas.filter((e) => e.confirmadoEm).length;
  return {
    ano, total, completa: total === 4, etapas,
    concluidoEm: total === 4 ? etapas.map((e) => e.confirmadoEm).sort().at(-1) : null,
  };
}

// Convite opcional. Não aceita links arbitrários nem cria grupo automaticamente.
export function conviteWhatsapp(valor) {
  try {
    const url = new URL(valor);
    if (url.protocol !== 'https:' || url.hostname !== 'chat.whatsapp.com' || url.port || url.username || url.password) return null;
    if (!/^\/[a-zA-Z0-9]{10,64}\/?$/.test(url.pathname)) return null;
    return `${url.origin}${url.pathname}`;
  } catch { return null; }
}
