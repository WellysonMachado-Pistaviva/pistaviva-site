import Link from 'next/link';
import { formatarCodigo, normalizarCodigo } from '../../../lib/selo/beneficio.mjs';
import { parceiroPorSelo } from '../../../lib/selo/store';
import DestinationRoute from '../../../components/DestinationRoute';
import '../../selo-publico.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Parada oficial · Verificar selo', robots: { index: false, follow: false } };
const data = (v) => new Date(v).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

export default async function VerificarSelo({ params }) {
  const codigo = normalizarCodigo((await params).codigo);
  const p = codigo && await parceiroPorSelo(codigo);
  const valido = Boolean(p?.ativo && p.selo_local);
  return <div className="pv-study selo-public-page">
    <div className="study-container selo-publico">
      <nav className="selo-publico-voltar" aria-label="Você está em"><Link href="/selos">Selos colecionáveis</Link> / Parada oficial</nav>
      {valido ? <>
        <article className="selo-parada-editorial">
          <div className="selo-parada-arte"><img src={`/selo/v/${codigo}/selo.svg`} alt={`Selo oficial ${p.selo_local}`} width={462} height={652} /></div>
          <div><p className="study-kicker">Pistaviva / Paradas da Mantiqueira</p><h1>{p.selo_local}</h1><p className="selo-parada-lead">Um lugar no caminho.<br />Mais uma história no passaporte.</p><p>{p.nome}</p>
            <p className="selo-parada-status">✓ Selo autêntico · parada oficial</p>
            <p className="selo-dica">Selo nº {formatarCodigo(codigo)} · desde {data(p.criado_em)}. Uso exclusivo deste parceiro.</p>
            <a className="study-button" href="#parada-mapa">Planejar minha chegada ↗</a>
          </div>
        </article>
        <section id="parada-mapa" className="selo-parada-mapa" aria-labelledby="parada-mapa-titulo">
          <header className="study-heading"><div><p className="study-kicker">Sua próxima parada</p><h2 id="parada-mapa-titulo">De onde você está.<br />Até a próxima história.</h2></div><p>Veja sua posição no mapa e calcule o tempo pela estrada. Confira o ponto de chegada antes de sair.</p></header>
          <DestinationRoute name={p.selo_local} query={`${p.selo_local}, Brasil`} />
          <p className="selo-dica">O cadastro desta parada informa o nome do local. Confirme o ponto de encontro com {p.nome}.</p>
        </section>
      </> : <section className="selo-parada-ausente"><p className="study-kicker">Verificação de autenticidade</p><h1>{!p ? 'Selo não encontrado' : 'Selo revogado'}</h1><p>{!p ? 'Confira o número ou escaneie novamente o QR Code.' : `Este selo pertencia a ${p.nome} e não está mais ativo. Não vale como parada oficial.`}</p><Link className="study-button" href="/selos">Explorar os selos ↗</Link></section>}
    </div>
  </div>;
}
