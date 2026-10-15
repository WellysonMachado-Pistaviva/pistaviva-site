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
import CarimboCidade, { FotoCarimbo } from '../../CarimboCidade';
import { localPorSlug } from '../../../lib/selo/locais.mjs';
import { autorFoto } from '../../../lib/selo/mapaCidades.mjs';
import PassaporteUnico from '../../PassaporteUnico';
import SeloNav from '../../SeloNav';
import { montarPassaporte } from '../../../lib/selo/passaporteUnico.mjs';
import AutorizacaoPassaporte from '../../AutorizacaoPassaporte';

const METODO = { gps: 'check-in por GPS', foto: 'foto do passaporte' };

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Meu passaporte', robots: { index: false, follow: false } };
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
  // Mesmo passaporte que o público vê (só estações confirmadas no balcão contam);
  // o selo digital da estação atual aparece no painel logo abaixo.
  const modelo = montarPassaporte({ entradas: p.entradas, estacoes: p.visitas.filter((v) => v.retiradoEm).map((v) => ({ estacao: v.estacao, ano: v.ano, confirmadoEm: v.retiradoEm })) }, { ano });
  // Carimbo sem foto (offline ou decidiu depois): dá para postar a foto aqui.
  const semFoto = p.entradas.filter((e) => !e.fotoStatus && localPorSlug(e.carimbo)).slice(0, 12);
  const publicado = p.passaportePublico || p.conquistas.some((c) => c.autorizado_em && c.aprovado_em);
  return (
    <>
    <SeloNav />
    <div className="selo-wrap selo-pilha selo-passaporte">
      <PassaporteUnico privado pessoa={p} modelo={modelo} acoes={<>
        <a className="selo-btn" href="#carimbar">Carimbar cidade</a>
        {publicado && <Link className="selo-btn secundario" href={`/selo/passaporte/${p.numero}`}>Ver como os outros veem</Link>}
      </>} />

      <section className="pu-painel" aria-labelledby="pu-painel-titulo">
        <h2 id="pu-painel-titulo">O que fazer agora</h2>
        <div id="carimbar"><CarimboCidade codigo={p.codigo} autor={autorFoto(p.nome, p.numero)} /></div>

        {semFoto.length > 0 && <details className="pu-grupo">
          <summary><span>Fotos das cidades<small>{semFoto.length === 1 ? '1 carimbo sem foto' : `${semFoto.length} carimbos sem foto`} · opcional, aparece no <Link href="/selo/mapa">mapa</Link></small></span></summary>
          <div>
            {semFoto.map((e) => {
              const { slug, nome, uf } = localPorSlug(e.carimbo);
              return <FotoCarimbo key={e.id} codigo={p.codigo} entradaId={e.id} cidade={{ slug, nome, uf }} autor={autorFoto(p.nome, p.numero)}
                titulo={`${nome}/${uf} · ${e.dia.split('-').reverse().join('/')}`} />;
            })}
          </div>
        </details>}

        <details className="pu-grupo" open={Boolean(atual) && estado !== 'conquistado'}>
          <summary><span>Estação no Parque · {ESTACOES[estacao].nome} {ano}<small>{estado === 'conquistado' ? 'Confirmada no balcão' : estado === 'liberado' ? 'Selo digital liberado · falta o balcão' : atual ? 'Registro salvo · falta o check-in' : `${progresso.total} de 4 estações confirmadas`}</small></span></summary>
          <div>
            <dl className="selo-stats">
              <div><dt>Selos digitais</dt><dd>{liberados}</dd></div>
              <div><dt>Confirmados no balcão</dt><dd>{confirmados}</dd></div>
              <div><dt>{ano}</dt><dd>{progresso.total}/4</dd></div>
            </dl>
            <section className="selo-digital" style={{ '--selo-cor': digital ? ESTACOES[estacao].cor : 'var(--pv-black-2)' }}>
              <span className="selo-kicker">{estado === 'conquistado' ? 'Visita presencial · confirmada' : estado === 'liberado' ? `Selo digital liberado · ${METODO[atual.checkinMetodo] || 'check-in'}` : atual ? 'Registro salvo · falta o check-in' : 'Sua coleção de estações'}</span>
              <img src={CORUJA} alt="" width={96} height={96} />
              <h2>{ESTACOES[estacao].nome} <span>{ano}</span></h2>
              <p className="selo-numero">Colecionador nº <b>{formatarNumero(p.numero)}</b></p>
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
            {falta > 0 && progresso.total > 0 && <p><b>{falta === 1 ? 'Falta só uma estação para o certificado.' : `Faltam ${falta} estações para o certificado.`}</b></p>}
            <p className="selo-dica">Próxima: {ESTACOES[proxima.estacao].nome} {proxima.ano}. Só desbloqueia quando a estação começar.</p>
          </div>
        </details>

        {liberados > 0 && <details className="pu-grupo">
          <summary><span>Postar nos Stories<small>Cartão com seus selos e cidades</small></span></summary>
          <div>
            <CompartilharCartao imagem={`/selo/m/${p.codigo}/cartao?ano=${ano}`} link={`/selo?utm_source=passaporte&utm_medium=stories&utm_campaign=selo&ref=${p.numero}`}
              texto="Meu passaporte de motociclista na Rota Biker. Bora colecionar?" />
            <small className="selo-dica">O cartão mostra seu primeiro nome, a inicial do sobrenome e seu nº. Não mostra o link do seu passaporte.</small>
            <Link className="selo-text-link" href="/selo/passaporte">Montar imagem com foto e página de identificação →</Link>
          </div>
        </details>}

        <details className="pu-grupo">
          <summary><span>Benefícios<small>Cafezinho, 10% e almoço ao fechar o ano</small></span></summary>
          <div><Beneficio codigo={p.codigo} endereco={p.endereco} beneficio={p.beneficio} /></div>
        </details>

        <details className="pu-grupo">
          <summary><span>Selos por ano e certificados<small>{anos.join(' · ')}</small></span></summary>
          <div>
            {anos.map((a) => {
              const conquista = conquistaDoAno(p.visitas, a, agora);
              return <section key={a} className="selo-pilha">
                <h2>Coleção {a}</h2><Colecao codigo={p.codigo} ano={a} agora={agora} nome={p.nome} numero={p.numero} visitas={p.visitas.filter((v) => v.ano === a)} />
                {conquista.completa && <Link className="selo-btn" href={`/selo/m/${codigo}/certificado?ano=${a}`}>Ver certificado de {a}</Link>}
              </section>;
            })}
          </div>
        </details>

        <details className="pu-grupo">
          <summary><span>Privacidade e publicação<small>{publicado ? 'Passaporte público aberto' : 'Só você vê este passaporte'}</small></span></summary>
          <div>
            <AutorizacaoPassaporte codigo={p.codigo} numero={p.numero} publico={p.passaportePublico} />
            {anos.map((a) => {
              const conquista = conquistaDoAno(p.visitas, a, agora);
              const publicacao = p.conquistas.find((c) => c.ano === a);
              if (!(conquista.total > 0 || publicacao?.autorizado_em)) return null;
              return <section key={a} className="selo-cartao">
                <span className="selo-kicker">Ranking dos Conquistadores · {a}</span>
                <AutorizacaoMural key={`${a}-${Boolean(publicacao?.autorizado_em)}`} codigo={codigo} ano={a} autorizado={Boolean(publicacao?.autorizado_em)} publicado={Boolean(publicacao?.aprovado_em)} />
              </section>;
            })}
            <SalvarNumero codigo={p.codigo} numero={p.numero} />
          </div>
        </details>
      </section>

      {foto === '0' && <p role="status">Sua foto não foi enviada. Seu registro está salvo.</p>}
      <VoltarItajuba />
      <p className="selo-dica">O passaporte físico é da Rota Biker. Guarde seu link pessoal: ele dá acesso ao passaporte e às autorizações de publicação.</p>
    </div>
    </>
  );
}
