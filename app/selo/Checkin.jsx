'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { confirmarProvaPassaporte, fazerCheckin, urlProvaPassaporte } from './actions';
import { comTempo, comprimirFoto, subirFoto } from './fotoCliente';

const ERRO_GPS = {
  1: 'Localização bloqueada. Libere o acesso à localização para este site nas configurações do navegador, ou envie a foto do passaporte.',
  2: 'O celular não encontrou sua posição. Vá para uma área aberta e tente de novo.',
  3: 'O GPS demorou a responder. Tente de novo em área aberta.',
};

function posicaoAtual() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject({ code: 2 });
    navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 20_000, maximumAge: 0 });
  });
}

// Selo registrado e ainda sem check-in: GPS no Parque ou foto do passaporte carimbado.
export default function Checkin({ codigo, gps }) {
  const router = useRouter();
  const [estado, setEstado] = useState('pronto');   // pronto | localizando | enviando
  const [msg, setMsg] = useState('');
  const ocupado = estado !== 'pronto';

  async function porGps() {
    setMsg('');
    setEstado('localizando');
    try {
      const { coords } = await posicaoAtual();
      setEstado('enviando');
      const r = await comTempo(fazerCheckin({ codigo, lat: coords.latitude, lng: coords.longitude, precisao: coords.accuracy }), 20_000);
      if (!r?.ok) { setMsg(r?.erro || 'Não registrou o check-in. Tente de novo.'); return; }
      router.refresh();
    } catch (e) {
      setMsg(ERRO_GPS[e?.code] || 'Não registrou o check-in. Tente de novo.');
    } finally {
      setEstado('pronto');
    }
  }

  async function porFoto(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setMsg('');
    setEstado('enviando');
    try {
      const blob = await comprimirFoto(arquivo);
      const u = await urlProvaPassaporte(codigo);
      if (!u?.ok) throw new Error(u?.erro || 'sem url');
      await subirFoto(u.upload, blob);
      const r = await confirmarProvaPassaporte(codigo);
      if (!r?.ok) throw new Error(r?.erro || 'sem confirmação');
      router.refresh();
    } catch (err) {
      setMsg(err?.message && !/^(sem|upload|tempo)/.test(err.message) ? err.message : 'A foto não subiu. Tente de novo ou confirme no balcão.');
    } finally {
      setEstado('pronto');
    }
  }

  return (
    <section className="selo-cartao selo-checkin" aria-labelledby="selo-checkin-titulo" aria-busy={ocupado}>
      <span className="selo-kicker">Passo 2 · check-in</span>
      <h2 id="selo-checkin-titulo">Libere seu selo digital</h2>
      <p>{gps ? 'Dentro do Parque, toque no botão e permita a localização. Só usamos a distância até o Parque; sua posição não fica gravada.' : 'Envie uma foto do seu passaporte da Rota Biker carimbado no Parque.'}</p>
      {gps && (
        <button type="button" className="selo-btn" onClick={porGps} disabled={ocupado}>
          {estado === 'localizando' ? 'Procurando sua localização…' : estado === 'enviando' ? 'Confirmando…' : 'Fazer check-in pelo GPS'}
        </button>
      )}
      {gps && <span className="selo-ou" aria-hidden="true">ou</span>}
      <div className="selo-foto-botao">
        <span className={`selo-btn ${gps ? 'secundario' : ''}`} aria-hidden="true">{estado === 'enviando' && !gps ? 'Enviando…' : 'Enviar foto do passaporte carimbado'}</span>
        <input type="file" accept="image/*" capture="environment" aria-label="Enviar foto do passaporte carimbado" onChange={porFoto} disabled={ocupado} />
      </div>
      {msg && <p className="selo-erro" role="alert">{msg}</p>}
      <small className="selo-dica">O adesivo físico e a certificação continuam sendo confirmados pela equipe no balcão.</small>
    </section>
  );
}
