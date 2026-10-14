import Link from 'next/link';
import { SELOS } from '../lib/selo/constantes.mjs';
import { ESTACOES, estadoSelo } from '../lib/selo/estacao.mjs';
import PassaporteMockup from './PassaporteMockup';

const ROTULOS = { conquistado: 'Confirmado', liberado: 'Digital liberado', registrado: 'Falta check-in', bloqueado: 'Bloqueado', disponivel: 'Disponível', encerrado: 'Não conquistado' };

export default function Colecao({ visitas, codigo, ano, agora, nome, numero }) {
  return (
    <>
    <PassaporteMockup ano={ano} visitas={visitas} agora={agora} nome={nome} numero={numero} />
    <ul className="selo-colecao" aria-label={`Seus selos de ${ano}`}>
      {Object.entries(ESTACOES).map(([id, { nome, cor }]) => {
        const estado = estadoSelo({ estacao: id, ano, visitas }, agora);
        const tem = estado === 'conquistado' || estado === 'liberado';
        const visita = visitas.find((v) => v.estacao === id && v.ano === ano);
        return (
          <li key={id} data-estado={estado}>
            <span className={`selo-carimbo${tem ? ' tem' : ''}${SELOS[id] ? ' arte' : ''}`} style={tem && !SELOS[id] ? { background: cor } : undefined}>
              {estado === 'bloqueado' ? <><svg aria-hidden="true" width="20" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /><path d="M12 14v3" /></svg><span>{nome}</span></> : SELOS[id] ? <img src={SELOS[id]} alt="" /> : nome}
            </span>
            <span><span className="sr-only">{nome}: </span>{ROTULOS[estado]}</span>
            {tem && <time className="selo-data" dateTime={visita.retiradoEm || visita.liberadoEm}>{new Date(visita.retiradoEm || visita.liberadoEm).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' })}</time>}
            {tem && codigo && <a className="selo-download" href={`/selo/m/${codigo}/adesivo?estacao=${id}&ano=${ano}`} aria-label={`Baixar selo de ${nome} ${ano}`}>Baixar</a>}
            {estado === 'registrado' && <a className="selo-download" href="#selo-checkin-titulo">Check-in</a>}
            {estado === 'disponivel' && <Link className="selo-download" href="/selo" aria-label={`Registrar visita de ${nome} ${ano}`}>Registrar</Link>}
          </li>
        );
      })}
    </ul>
    </>
  );
}
