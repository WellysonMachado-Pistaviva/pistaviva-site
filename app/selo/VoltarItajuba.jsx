import Link from 'next/link';
import { conviteWhatsapp } from '../lib/selo/conquistas.mjs';

export default function VoltarItajuba() {
  const grupo = conviteWhatsapp(process.env.SELO_WHATSAPP_GRUPO_URL);
  return <section className="selo-cartao selo-voltar">
    <span className="selo-kicker">Sua próxima visita começa aqui</span>
    <h2>Volte para viver Itajubá</h2>
    <p>Acompanhe a agenda do Parque e planeje sua próxima parada na cidade.</p>
    <Link href="/parque-da-cidade#eventos">Ver agenda do Parque →</Link>
    <Link href="/parque-da-cidade#visita">Conhecer o Parque e planejar a visita →</Link>
    {grupo && <><a className="selo-btn secundario" href={grupo} target="_blank" rel="noopener noreferrer">Entrar no grupo do Parque</a><small>Participação opcional. Você entra pelo WhatsApp; seu cadastro não adiciona você ao grupo. Seu número poderá ficar visível aos participantes.</small></>}
  </section>;
}
