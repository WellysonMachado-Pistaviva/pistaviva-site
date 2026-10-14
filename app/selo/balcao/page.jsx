'use client';
import { useSyncExternalStore, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { PV } from '../../../src/palette';
const subscribe = () => () => {};
const origin = () => window.location.origin;
const serverOrigin = () => ''; 
import { CORUJA } from '../../lib/selo/constantes.mjs';

export default function CartazBalcao() {
  const [base, setBase] = useState(null);
  const origemAtual = useSyncExternalStore(subscribe, origin, serverOrigin);
  const [qr, setQr] = useState('');
  const [url, setUrl] = useState('');
  const [erro, setErro] = useState('');

  async function gerar(e) {
    e.preventDefault();
    setQr(''); setUrl(''); setErro('');
    try {
      const origem = new URL(base ?? origemAtual);
      if (!['https:', 'http:'].includes(origem.protocol) || origem.username || origem.password) throw new Error('url');
      if (['localhost', '127.0.0.1', '::1', '[::1]'].includes(origem.hostname)) {
        setErro('Use o endereço público do site ou o IP desta máquina na rede. Localhost não abre no celular do visitante.');
        return;
      }
      const destino = `${origem.origin}/selo?local=parque`;
      const imagem = await QRCode.toDataURL(destino, { width: 720, margin: 4, errorCorrectionLevel: 'M', color: { dark: PV.textDark, light: PV.white } });
      setUrl(destino); setQr(imagem);
    } catch { setErro('Informe um endereço válido, começando com https:// ou http://.'); }
  }

  return <div className="selo-wrap selo-pilha selo-cartaz-wrap">
    <div className="selo-nao-imprimir selo-pilha">
      <Link href="/admin/selo">← Painel do selo</Link>
      <h1>QR do balcão</h1>
      <p>Informe o endereço que os visitantes conseguem abrir no celular. O mesmo QR serve para todas as estações.</p>
      <form onSubmit={gerar} className="selo-form"><label htmlFor="selo-endereco">Endereço do site</label><input id="selo-endereco" className="selo-input" type="url" required value={base ?? origemAtual} onChange={(e) => { setBase(e.target.value); setQr(''); setUrl(''); }} /><button className="selo-btn">Gerar cartaz</button></form>
      {erro && <p className="selo-erro" role="alert">{erro}</p>}
    </div>
    {qr && <>
      <section className="selo-cartaz">
        <img src={CORUJA} width={72} height={72} alt="" />
        <span className="selo-kicker">Parque da Cidade · Itajubá</span>
        <h2>Carimbou?<br />Leve seu selo.</h2>
        <p>Aponte a câmera, preencha seus dados e mostre seu número no balcão.</p>
        <img className="selo-qr" src={qr} width={300} height={300} alt="QR Code para cadastrar sua visita e receber o selo" />
        <a href={url}>{url}</a>
        <p><strong>Adesivo físico + versão digital</strong><br />Um por pessoa, por estação do ano.</p>
      </section>
      <button className="selo-btn selo-nao-imprimir" onClick={() => window.print()}>Imprimir cartaz</button>
    </>}
  </div>;
}
