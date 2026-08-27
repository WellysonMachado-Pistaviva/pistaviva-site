import CineProgramacaoTabs from './CineProgramacaoTabs';
import { parseCineaProgramacao } from '../lib/cineaProgramacaoParser.mjs';

export const CINEA_PROGRAM_URL = 'https://cinea.com.br/cine-a-itajuba/programacao';

async function getProgramacao() {
  try {
    const response = await fetch(CINEA_PROGRAM_URL, {
      headers: {
        Accept: 'text/html,application/xhtml+xml',
        Cookie: 'cinemaEscolhido=cine-a-itajuba',
        'User-Agent': 'Pistaviva/1.0 (+https://www.pistavivamototurismo.com.br)',
      },
      next: { revalidate: 1800, tags: ['cinea-itajuba'] },
      signal: AbortSignal.timeout(7000),
    });

    if (!response.ok) return { days: [], updatedAt: null };

    const days = parseCineaProgramacao(await response.text(), { limitDays: 5 });
    const updatedAt = new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
      timeZone: 'America/Sao_Paulo',
    }).format(new Date());

    return { days, updatedAt };
  } catch {
    return { days: [], updatedAt: null };
  }
}

export function CineProgramacaoLoading() {
  return (
    <div className="pq-cartaz pq-cartaz--loading" aria-live="polite" aria-busy="true">
      <span className="pq-cartaz__pulse" aria-hidden="true" />
      <p>Buscando programação oficial do Cine A…</p>
    </div>
  );
}

export default async function CineProgramacao() {
  const { days, updatedAt } = await getProgramacao();

  return (
    <div className="pq-cartaz" aria-labelledby="pq-cartaz-titulo">
      <div className="pq-cartaz__cabecalho">
        <div>
          <span className="pq-cartaz__agora">Programação oficial</span>
          <h3 id="pq-cartaz-titulo">Filmes em cartaz e horários</h3>
          <p>Escolha o dia, veja sala e versão, depois compre direto no Cine A.</p>
        </div>
        {updatedAt ? <small>Atualizado em {updatedAt}</small> : null}
      </div>

      {days.length ? (
        <CineProgramacaoTabs days={days} />
      ) : (
        <div className="pq-cartaz__fallback">
          <strong>Programação indisponível neste momento.</strong>
          <p>Cine A pode estar atualizando sessões. Consulte horários direto na fonte oficial.</p>
        </div>
      )}

      <div className="pq-cartaz__fonte">
        <p>Horários, disponibilidade e classificação vêm do Cine A e podem mudar sem aviso.</p>
        <a href={CINEA_PROGRAM_URL} target="_blank" rel="noopener noreferrer">
          Ver programação completa no Cine A
          <span aria-hidden="true">↗</span>
        </a>
      </div>
    </div>
  );
}
