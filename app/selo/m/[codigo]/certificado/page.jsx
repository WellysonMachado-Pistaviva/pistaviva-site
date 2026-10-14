import Link from 'next/link';
import { notFound } from 'next/navigation';
import { perfilPorCodigo } from '../../../../lib/selo/store';
import { conquistaDoAno } from '../../../../lib/selo/conquistas.mjs';
import { ESTACOES, estacaoDe } from '../../../../lib/selo/estacao.mjs';
import { formatarNumero, CORUJA } from '../../../../lib/selo/constantes.mjs';
import ImprimirCertificado from '../../../ImprimirCertificado';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Certificado · Conquistador de Itajubá', robots: { index: false, follow: false } };
const data = (v) => new Date(v).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

export default async function Certificado({ params, searchParams }) {
  const { codigo } = await params;
  const busca = await searchParams;
  const ano = Number(busca.ano || estacaoDe().ano);
  const p = await perfilPorCodigo(codigo);
  if (!p || !Number.isInteger(ano)) notFound();
  const conquista = conquistaDoAno(p.visitas, ano);
  if (!conquista.completa) notFound();
  return <div className="selo-wrap selo-pilha selo-certificado-wrap">
    <Link className="selo-nao-imprimir" href={`/selo/m/${codigo}`}>← Minha coleção de Itajubá</Link>
    <article className="selo-certificado">
      <img src={CORUJA} alt="" width={72} height={72} />
      <span className="selo-kicker">Itajubá nas 4 Estações · {ano}</span>
      <h1>Conquistador de Itajubá</h1>
      <p>Certificado de conclusão da coleção anual do Parque da Cidade</p>
      <h2>{p.nome}</h2>
      <p>Colecionador nº <strong>{formatarNumero(p.numero)}</strong> · {p.cidade}/{p.uf}</p>
      <p>Concluiu as quatro visitas presenciais de {ano}, com entrega dos adesivos confirmada pela equipe do balcão.</p>
      <ul>{conquista.etapas.map((e) => <li key={e.estacao}><strong>{ESTACOES[e.estacao].nome}</strong><span>Confirmada em {data(e.confirmadoEm)}</span></li>)}</ul>
      <p>Conquista concluída em {data(conquista.concluidoEm)}.</p>
      <small>Certificação da coleção do Parque da Cidade de Itajubá. O passaporte físico é da Rota Biker; este certificado registra a conclusão da coleção do Parque.</small>
    </article>
    <ImprimirCertificado />
  </div>;
}
