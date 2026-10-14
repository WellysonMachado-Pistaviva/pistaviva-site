'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmarCarimbo, iniciarCarimbo } from './actions';
import { comTempo, comprimirFoto, subirFoto } from './fotoCliente';

const ERRO_GPS = {
  1: 'Localização bloqueada. Libere o acesso à localização para este site nas configurações do navegador.',
  2: 'O celular não encontrou sua posição. Vá para uma área aberta e tente de novo.',
  3: 'O GPS demorou a responder. Tente de novo em área aberta.',
};

function posicaoAtual() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject({ code: 2 });
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 });
  });
}

// Carimbo de cidade da Rota Biker: a foto abre a câmera (precisa do toque),
// depois o GPS diz em qual cidade a pessoa está. O servidor decide.
export default function CarimboCidade({ codigo }) {
  const router = useRouter();
  const [estado, setEstado] = useState('pronto');   // pronto | localizando | enviando
  const [msg, setMsg] = useState('');
  const [feito, setFeito] = useState(null);
  const ocupado = estado !== 'pronto';

  async function aoEscolher(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setMsg('');
    setFeito(null);
    try {
      setEstado('localizando');
      const [{ coords }, blob] = await Promise.all([posicaoAtual(), comprimirFoto(arquivo)]);
      setEstado('enviando');
      const pos = { lat: coords.latitude, lng: coords.longitude, precisao: coords.accuracy };
      const ini = await comTempo(iniciarCarimbo({ codigo, ...pos }), 20_000);
      if (!ini?.ok) { setMsg(ini?.erro || 'Não carimbou. Tente de novo.'); return; }
      await subirFoto(ini.upload, blob);
      const r = await comTempo(confirmarCarimbo({ codigo, carimbo: ini.cidade.slug, distancia: ini.distancia, precisao: pos.precisao }), 20_000);
      if (!r?.ok) { setMsg(r?.erro || 'Não carimbou. Tente de novo.'); return; }
      setFeito({ ...r.cidade, ja: r.ja });
      router.refresh();
    } catch (err) {
      setMsg(ERRO_GPS[err?.code] || 'A foto não subiu. Tente de novo.');
    } finally {
      setEstado('pronto');
    }
  }

  return (
    <section className="selo-cartao selo-checkin" aria-labelledby="selo-cidade-titulo" aria-busy={ocupado}>
      <span className="selo-kicker">Rota Biker · carimbo de cidade</span>
      <h2 id="selo-cidade-titulo">Chegou numa cidade da Rota?</h2>
      <p>Tire uma foto aí mesmo e permita a localização. Se você estiver dentro de uma cidade com monumento da Rota Biker, o carimbo dela entra no seu passaporte. Usamos só a distância até a divisa; sua posição não fica gravada.</p>
      <div className="selo-foto-botao">
        <span className="selo-btn" aria-hidden="true">
          {estado === 'localizando' ? 'Procurando sua localização…' : estado === 'enviando' ? 'Carimbando…' : 'Tirar foto e carimbar'}
        </span>
        <input type="file" accept="image/*" capture="environment" aria-label="Tirar foto e carimbar a cidade" onChange={aoEscolher} disabled={ocupado} />
      </div>
      {feito && <p role="status"><b>{feito.nome}/{feito.uf}</b> {feito.ja ? 'já estava carimbada hoje no seu passaporte.' : 'carimbada no seu passaporte!'}</p>}
      {msg && <p className="selo-erro" role="alert">{msg}</p>}
      <small className="selo-dica">Um carimbo por cidade por dia. Voltou outro dia? Carimba de novo e conta como nova visita.</small>
    </section>
  );
}
