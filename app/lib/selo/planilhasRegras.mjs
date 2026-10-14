// Regras puras da cópia em planilha (testáveis sem Google).
import { diaSP } from './estacao.mjs';

export const ABA_VISITAS = 'Visitas';
export const ABA_EVENTOS = 'Eventos';
export const PREFIXO_COPIA = 'Cópia ';
export const COPIAS_GUARDADAS = 7;
export const TIPOS_EVENTO = ['cadastro', 'checkin-gps', 'checkin-foto', 'entrega-balcao', 'checkin-revogado'];

export const nomeCopia = (agora = new Date()) => `${PREFIXO_COPIA}${diaSP(agora)}`;

// Mantém as N cópias diárias mais recentes; nunca toca nas abas fixas.
export function copiasParaApagar(abas, manter = COPIAS_GUARDADAS) {
  return abas
    .filter((a) => a.title.startsWith(PREFIXO_COPIA) && /^\d{4}-\d{2}-\d{2}$/.test(a.title.slice(PREFIXO_COPIA.length)))
    .sort((a, b) => b.title.localeCompare(a.title))
    .slice(manter)
    .map((a) => a.sheetId);
}

// Id de planilha do Google: letras, números, - e _ (evita injetar caminho na URL).
export const idPlanilhaValido = (id) => /^[A-Za-z0-9_-]{20,100}$/.test(String(id || ''));

// LGPD: remove da aba Eventos quem não existe mais no banco (excluído no admin).
// Linhas: [quando, evento, numero, ...]. Mantém cabeçalho e linhas sem número.
export function eventosSemExcluidos(linhas, numerosAtivos) {
  if (!linhas.length) return linhas;
  const [cabecalho, ...resto] = linhas;
  const col = cabecalho.indexOf('numero');
  if (col < 0) return linhas;
  return [cabecalho, ...resto.filter((l) => numerosAtivos.has(String(l[col] ?? '').replace(/^'/, '')))];
}
