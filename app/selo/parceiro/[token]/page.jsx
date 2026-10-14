import { notFound } from 'next/navigation';
import { CORUJA } from '../../../lib/selo/constantes.mjs';
import { tokenValido } from '../../../lib/selo/parceiro.mjs';
import { parceiroPorToken } from '../../../lib/selo/store';
import PainelParceiro from './PainelParceiro';
import SeloEditor from './SeloEditor';
import { COR_PADRAO } from '../../../lib/selo/seloParceiro.mjs';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Conferir benefício', robots: { index: false, follow: false }, referrer: 'no-referrer' };

export default async function ParceiroPage({ params }) {
  const { token } = await params;
  const parceiro = tokenValido(token) ? await parceiroPorToken(token) : null;
  if (!parceiro) notFound();
  return (
    <div className="selo-wrap selo-pilha">
      <header className="selo-topo">
        <img src={CORUJA} alt="" width={56} height={56} />
        <div><span className="selo-kicker">Parceiro do Selo · {parceiro.nome}</span><h1>Conferir benefício</h1></div>
      </header>
      <p className="selo-dica">Digite o código que o colecionador mostrar na coleção dele. O sistema confere cadastro, carimbo e benefício.</p>
      <PainelParceiro token={token} />
      <SeloEditor token={token} nome={parceiro.nome}
        inicial={{ cor: parceiro.selo_cor || COR_PADRAO, local: parceiro.selo_local || parceiro.nome.slice(0, 32), codigo: parceiro.selo_codigo || null }} />
      <small className="selo-dica">Link exclusivo de {parceiro.nome}. Não compartilhe fora da equipe. Se vazar, peça um novo à equipe do Selo.</small>
    </div>
  );
}
