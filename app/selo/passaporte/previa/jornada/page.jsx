import { notFound } from 'next/navigation';
import { perfilPorCodigo, storeLocal } from '../../../../lib/selo/store';
import { montarPassaporte } from '../../../../lib/selo/passaporteUnico.mjs';
import PassaporteUnico from '../../../PassaporteUnico';
import SeloNav from '../../../SeloNav';
import '../../../selo-publico.css';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Prévia local · mapa e memórias', robots: { index: false, follow: false } };

export default async function PreviaJornadaPage() {
  if (process.env.NODE_ENV !== 'development' || !storeLocal) notFound();
  const conta = storeLocal.motociclistas().find((m) => m.whatsapp === '11900004271' && m.nome === 'Ana Souza (prévia local)');
  if (!conta) return <main className="selo-wrap"><p>Prévia ainda não preparada. Execute: node scripts/selo-seed-jornada.mjs</p></main>;
  const p = await perfilPorCodigo(conta.codigo);
  const modelo = montarPassaporte({ entradas: p.entradas });
  return <><SeloNav /><main className="selo-wrap selo-pilha selo-passaporte">
    <p className="selo-dica">Prévia local · cidades e memórias de exemplo para testar. Esta coleção não foi publicada.</p>
    <PassaporteUnico privado demonstracao pessoa={p} modelo={modelo} />
  </main></>;
}
