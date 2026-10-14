import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CORUJA, formatarNumero } from '../../../lib/selo/constantes.mjs';
import { ESTACOES, estacaoDe, estadoSelo, proximaEstacao } from '../../../lib/selo/estacao.mjs';
import { alvoDoLocal } from '../../../lib/selo/geo.mjs';
import { conquistaDoAno } from '../../../lib/selo/conquistas.mjs';
import { perfilPorCodigo } from '../../../lib/selo/store';
import Colecao from '../../Colecao';
import SalvarNumero from '../../SalvarNumero';
import AutorizacaoMural from '../../AutorizacaoMural';
import VoltarItajuba from '../../VoltarItajuba';
import Checkin from '../../Checkin';
import Beneficio from '../../Beneficio';
import CompartilharCartao from '../../CompartilharCartao';
import CarimboCidade from '../../CarimboCidade';
import PassaporteCidades from '../../PassaporteCidades';
import AutorizacaoPassaporte from '../../AutorizacaoPassaporte';

const METODO = { gps: 'check-in por GPS', foto: 'foto do passaporte' };

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Minha coleção de Itajubá', robots: { index: false, follow: false } };
const data = (valor) => new Date(valor).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

export default async function MeuSeloPage({ params, searchParams }) {
  const { codigo } = await params;
  const { foto } = await searchParams;
  const p = await perfilPorCodigo(codigo);
  if (!p) notFound();
  const agora = new Date();
  const { estacao, ano } = estacaoDe(agora);
  const proxima = proximaEstacao({ estacao, ano });
  const atual = p.visitas.find((v) => v.estacao === estacao && v.ano === ano);
  const anos = [ano, ...new Set([proxima.ano, ...p.visitas.map((v) => v.ano)].filter((a) => a !== ano))];
  const progresso = conquistaDoAno(p.visitas, ano, agora);
  const estado = atual ? estadoSelo({ estacao, ano, visitas: p.visitas }, agora) : null;
  const digital = estado === 'liberado' || estado === 'conquistado';
  // Stats estilo passaporte: o que já é seu, quantas temporadas, quanto falta.
  const confirmados = p.visitas.filter((v) => v.retiradoEm).length;
  const liberados = p.visitas.filter((v) => v.liberadoEm || v.retiradoEm).length;
  const falta = 4 - progresso.total;
  return (
    <div className="selo-wrap selo-pilha selo-passaporte">
      <header className="selo-topo"><img src={CORUJA} alt="" width={56} height={56} /><div><span className="selo-kicker">Parque da Cidade · Itajubá</span><h1>Minha coleção de Itajubá</h1></div></header>
      <dl className="selo-stats">
        <div><dt>Selos digitais</dt><dd>{liberados}</dd></div>
        <div><dt>Confirmados no balcão</dt><dd>{confirmados}</dd></div>
        <div><dt>{ano}</dt><dd>{progresso.total}/4</dd></div>
      </dl>
      <section className="selo-digital" style={{ '--selo-cor': digital ? ESTACOES[estacao].cor : 'var(--pv-black-2)' }}>
        <span className="selo-kicker">{estado === 'conquistado' ? 'Visita presencial · confirmada' : estado === 'liberado' ? `Selo digital liberado · ${METODO[atual.checkinMetodo] || 'check-in'}` : atual ? 'Registro salvo · falta o check-in' : 'Sua coleção de estações'}</span>
        <img src={CORUJA} alt="" width={96} height={96} />
        <h2>{ESTACOES[estacao].nome} <span>{ano}</span></h2>
        <p>{p.nome}</p><p className="selo-numero">Colecionador nº <b>{formatarNumero(p.numero)}</b></p>
        <small>Seu número na coleção do Parque. O mesmo em todos os adesivos, junto ao passaporte físico da Rota Biker.</small>
        {atual && <small>Registrado em {data(atual.criadoEm)}</small>}
      </section>
      {estado === 'registrado' && <Checkin codigo={p.codigo} gps={Boolean(alvoDoLocal(atual.local))} />}
      {atual ? <>
        <section className="selo-cartao" aria-label="Retirada do adesivo físico">
          <span className="selo-kicker">Adesivo e carimbo · conquista presencial</span>
          <h2>{atual.retiradoEm ? 'Presença confirmada' : 'Confirme sua presença no balcão'}</h2>
          <p>{atual.retiradoEm ? `Entrega confirmada em ${data(atual.retiradoEm)}. Sua visita já conta para a certificação.` : `Mostre seu número ${formatarNumero(p.numero)} e o passaporte da Rota Biker no balcão. A equipe carimba, entrega o adesivo com seu número e confirma a visita no sistema.`}</p>
          <small>Uma entrega por pessoa nesta estação. O registro digital permanece na sua coleção.</small>
        </section>
        {digital && <a className="selo-btn" href={`/selo/m/${codigo}/adesivo`}>Baixar selo digital</a>}
      </> : <div className="selo-cartao"><p>Você ainda não registrou a estação atual. Visite o balcão do Parque e escaneie o QR Code para começar.</p><Link href="/selo">Registrar esta estação →</Link></div>}
      <section className="selo-cartao" aria-labelledby="selo-progresso">
        <span className="selo-kicker">Itajubá nas 4 Estações · {ano}</span>
        <h2 id="selo-progresso">{progresso.total} de 4 estações confirmadas</h2>
        {falta > 0 && progresso.total > 0 && <p><b>{falta === 1 ? 'Falta só uma estação.' : `Faltam ${falta} estações.`}</b></p>}
        <progress className="selo-progresso" value={progresso.total} max={4} aria-label={`Estações confirmadas em ${ano}`} />
        <p>Complete verão, outono, inverno e primavera no mesmo ano para receber seu certificado de Conquistador de Itajubá.</p>
        <small>Selos de outros anos ficam na coleção, mas não se somam para este certificado.</small>
      </section>
      {liberados > 0 && <section className="selo-cartao" aria-labelledby="selo-compartilhar-titulo">
        <span className="selo-kicker">Mostre sua coleção</span>
        <h2 id="selo-compartilhar-titulo">Seu passaporte nos Stories</h2>
        <CompartilharCartao imagem={`/selo/m/${p.codigo}/cartao?ano=${ano}`} link={`/selo?utm_source=passaporte&utm_medium=stories&utm_campaign=selo&ref=${p.numero}`}
          texto="Meu passaporte de motociclista em Itajubá. Bora colecionar as 4 estações?" />
        <small className="selo-dica">O cartão mostra seu primeiro nome, a inicial do sobrenome e seu nº. Não mostra o link da sua coleção.</small>
      </section>}
      <CarimboCidade codigo={p.codigo} />
      <PassaporteCidades entradas={p.entradas} />
      <AutorizacaoPassaporte codigo={p.codigo} numero={p.numero} publico={p.passaportePublico} />
      <section className="selo-cartao selo-proximo" aria-label="Próximo selo bloqueado">
        <span className="selo-kicker">Próximo selo · bloqueado</span>
        <h2>{ESTACOES[proxima.estacao].nome} {proxima.ano}</h2>
        <p>Só desbloqueia quando essa estação começar. Depois, registre uma nova visita no balcão para conquistar o selo com seu mesmo número de colecionador.</p>
      </section>
      {foto === '0' && <p role="status">Sua foto não foi enviada. Seu registro está salvo.</p>}
      <SalvarNumero codigo={p.codigo} numero={p.numero} />
      <Beneficio codigo={p.codigo} endereco={p.endereco} beneficio={p.beneficio} />
      {anos.map((a) => {
        const conquista = conquistaDoAno(p.visitas, a, agora);
        const publicacao = p.conquistas.find((c) => c.ano === a);
        return <section key={a} className="selo-pilha">
          <h2>Coleção {a}</h2><Colecao codigo={p.codigo} ano={a} agora={agora} nome={p.nome} numero={p.numero} visitas={p.visitas.filter((v) => v.ano === a)} />
          {conquista.completa && <section className="selo-cartao">
            <span className="selo-kicker">Quatro estações no mesmo ano</span><h2>Conquista {a} certificada</h2>
            <p>Você completou as quatro visitas presenciais de {a}. Sua história agora faz parte de Itajubá.</p>
            <Link className="selo-btn" href={`/selo/m/${codigo}/certificado?ano=${a}`}>Ver certificado de {a}</Link>
          </section>}
          {(conquista.total > 0 || publicacao?.autorizado_em) && <section className="selo-cartao">
            <span className="selo-kicker">Seu passaporte na comunidade · {a}</span>
            <h2>Entre para os Conquistadores</h2>
            <p>Mostre sua coleção, acompanhe o ranking e inspire a próxima visita de outros motociclistas.</p>
            <AutorizacaoMural key={`${a}-${Boolean(publicacao?.autorizado_em)}`} codigo={codigo} ano={a} autorizado={Boolean(publicacao?.autorizado_em)} publicado={Boolean(publicacao?.aprovado_em)} />
            {publicacao?.autorizado_em && publicacao?.aprovado_em && <Link href={`/selo/conquistadores/${p.numero}`}>Ver meu passaporte público →</Link>}
          </section>}
        </section>;
      })}
      <Link href="/selo/mural">Conhecer os Conquistadores de Itajubá →</Link>
      <VoltarItajuba />
      <p className="selo-dica">O passaporte físico é da Rota Biker. Esta coleção registra e certifica suas visitas ao Parque da Cidade. Guarde seu link pessoal; ele dá acesso à coleção e às autorizações de publicação.</p>
      <Link href="/selo">Voltar ao início</Link>
    </div>
  );
}
