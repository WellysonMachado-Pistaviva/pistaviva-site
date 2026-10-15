'use client';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { carimbarAqui, prepararFotoCidade, publicarFotoCidade } from './actions';
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

// Estrada sem sinal: a leitura do GPS fica no celular e vai quando a rede
// voltar (o servidor aceita até 72 h e carimba no dia da leitura).
const chaveFila = (codigo) => `selo:pendentes:${codigo}`;
function lerFila(codigo) {
  try { return JSON.parse(localStorage.getItem(chaveFila(codigo)) || '[]'); } catch { return []; }
}
function gravarFila(codigo, lista) {
  try {
    if (lista.length) localStorage.setItem(chaveFila(codigo), JSON.stringify(lista));
    else localStorage.removeItem(chaveFila(codigo));
  } catch { /* storage bloqueado: segue sem fila */ }
}

const FALHA_FOTO = 'A foto não subiu. O carimbo já está no passaporte; tente a foto de novo.';
const dataCurta = (dia) => new Date(`${dia}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');

// Carimbo de cidade da Rota Biker: o GPS diz em qual município a pessoa está e
// o servidor decide. Foto é opcional, depois do carimbo; pública vai pro mapa.
// compacto: dentro do modal do card (sem título). esperado: cidade do card;
// se o GPS achar outra cidade da Rota, carimba a cidade onde a pessoa está.
export default function CarimboCidade({ codigo, autor, onCarimbo, onStory, compacto = false, esperado = null }) {
  const router = useRouter();
  const [estado, setEstado] = useState('pronto');   // pronto | localizando | carimbando
  const [msg, setMsg] = useState('');
  const [feito, setFeito] = useState(null);         // { cidade, entradaId, ja, dia, imagem }
  const [fila, setFila] = useState([]);
  const [sincronizando, setSincronizando] = useState(false);
  const ocupado = estado !== 'pronto';

  const avisar = useCallback(() => {
    if (onCarimbo) onCarimbo();
    else router.refresh();
  }, [onCarimbo, router]);

  const enviarFila = useCallback(async () => {
    const pendentes = lerFila(codigo);
    if (!pendentes.length || !navigator.onLine) return;
    setSincronizando(true);
    const ficam = [];
    const feitos = [];
    for (const p of pendentes) {
      try {
        const r = await comTempo(carimbarAqui({ codigo, ...p }), 20_000);
        if (r?.ok) feitos.push(r);
        else if (!r?.definitivo) ficam.push(p);
        else feitos.push({ ok: false, erro: r.erro });
      } catch {
        ficam.push(p);
      }
    }
    gravarFila(codigo, ficam);
    setFila(ficam);
    setSincronizando(false);
    const ok = feitos.filter((r) => r.ok);
    if (ok.length) {
      setMsg('');
      setFeito(ok.at(-1));
      avisar();
    }
    const falha = feitos.find((r) => !r.ok);
    if (falha) setMsg(`Um check-in guardado não valeu: ${falha.erro}`);
  }, [codigo, avisar]);

  useEffect(() => {
    // Lê a fila deste aparelho e tenta enviar assim que a página abre ou a rede volta.
    const id = setTimeout(() => { setFila(lerFila(codigo)); enviarFila(); }, 0);
    window.addEventListener('online', enviarFila);
    return () => { clearTimeout(id); window.removeEventListener('online', enviarFila); };
  }, [codigo, enviarFila]);

  async function carimbar() {
    setMsg('');
    setFeito(null);
    let leitura = null;
    try {
      setEstado('localizando');
      const { coords } = await posicaoAtual();
      leitura = { lat: coords.latitude, lng: coords.longitude, precisao: coords.accuracy, capturadoEm: new Date().toISOString() };
      if (!navigator.onLine) throw new Error('offline');
      setEstado('carimbando');
      const r = await comTempo(carimbarAqui({ codigo, ...leitura }), 20_000);
      if (!r?.ok) { setMsg(r?.erro || 'Não carimbou. Tente de novo.'); return; }
      setFeito(r);
      avisar();
    } catch (err) {
      if (!leitura) { setMsg(ERRO_GPS[err?.code] || 'Não conseguimos ler o GPS. Tente de novo.'); return; }
      // Leu o GPS mas não chegou no servidor: guarda e envia quando o sinal voltar.
      const nova = [...lerFila(codigo), leitura];
      gravarFila(codigo, nova);
      setFila(nova);
    } finally {
      setEstado('pronto');
    }
  }

  return (
    <section className={`selo-cartao selo-checkin carimbo-cidade${compacto ? ' compacto' : ''}`} aria-labelledby={compacto ? undefined : 'selo-cidade-titulo'} aria-label={compacto ? 'Carimbar pelo GPS' : undefined} aria-busy={ocupado || sincronizando}>
      {!compacto && <>
        <span className="selo-kicker">Passaporte · carimbo de cidade</span>
        <h2 id="selo-cidade-titulo">Chegou numa cidade? Carimbe.</h2>
        <p>Toque em carimbar e permita a localização. Vale em qualquer cidade do Brasil: o carimbo dela entra no seu passaporte na hora, com data e número de série. Sua posição não fica gravada; só a cidade.</p>
      </>}
      <button type="button" className="selo-btn" onClick={carimbar} disabled={ocupado}>
        {estado === 'localizando' ? 'Procurando sua localização…' : estado === 'carimbando' ? 'Carimbando…' : 'Carimbar esta cidade'}
      </button>

      {fila.length > 0 && (
        <div className="carimbo-pendente" role="status">
          <span className="carimbo-pendente-selo" aria-hidden="true" />
          <div>
            <b>{fila.length === 1 ? '1 carimbo guardado sem sinal' : `${fila.length} carimbos guardados sem sinal`}</b>
            <span>Vai sozinho quando a internet voltar (vale por 72 h). Não feche o navegador em modo anônimo.</span>
          </div>
          <button type="button" className="selo-btn secundario" onClick={enviarFila} disabled={sincronizando}>{sincronizando ? 'Enviando…' : 'Enviar agora'}</button>
        </div>
      )}

      {feito && esperado && feito.cidade?.slug !== esperado.slug && (
        <p className="selo-dica" role="status">Você está em {feito.cidade.nome}/{feito.cidade.uf}, não em {esperado.nome}. Carimbamos a cidade onde você está.</p>
      )}
      {feito && <Carimbado key={feito.entradaId} codigo={codigo} feito={feito} autor={autor} onStory={onStory} />}
      {msg && <p className="selo-erro" role="alert">{msg}</p>}
      <small className="selo-dica">Um carimbo por cidade por dia. Voltou outro dia? Carimba de novo e conta como nova visita. <Link href="/selo/mapa">Ver o mapa de carimbos →</Link></small>
    </section>
  );
}

// Depois do carimbo: arte da cidade e a foto opcional.
function Carimbado({ codigo, feito, autor, onStory }) {
  const { cidade } = feito;
  return (
    <div className="carimbo-feito" role="status">
      <img className="carimbo-feito-arte" src={feito.imagem} alt={`Carimbo de ${cidade.nome}/${cidade.uf}`} width={160} height={160} />
      <div className="carimbo-feito-texto">
        <b>{cidade.nome}/{cidade.uf}</b>
        <span>{feito.ja ? `Já estava carimbada em ${dataCurta(feito.dia)} no seu passaporte.` : `Carimbada no seu passaporte · ${dataCurta(feito.dia)}`}</span>
        {feito.serie && <span className="carimbo-feito-serie">Nº {feito.serie}</span>}
      </div>
      {onStory
        ? <button type="button" className="selo-btn carimbo-feito-story" onClick={() => onStory(feito.entradaId)}>Compartilhar nos Stories</button>
        : <Link className="selo-btn carimbo-feito-story" href={`/selo/passaporte?story=${feito.entradaId}`}>Compartilhar nos Stories</Link>}
      <FotoCarimbo codigo={codigo} entradaId={feito.entradaId} cidade={cidade} autor={autor} />
    </div>
  );
}

// Foto opcional de um carimbo: logo depois de carimbar ou mais tarde, pelo
// passaporte (quem estava sem sinal posta quando a internet voltar).
export function FotoCarimbo({ codigo, entradaId, cidade, autor, titulo = 'Quer postar uma foto daqui? (opcional)' }) {
  const [foto, setFoto] = useState('nenhuma');   // nenhuma | enviando | publica | privada
  const [publica, setPublica] = useState(true);
  const [erro, setErro] = useState('');

  async function enviar(e) {
    const arquivo = e.target.files?.[0];
    e.target.value = '';
    if (!arquivo) return;
    setErro('');
    setFoto('enviando');
    // Publicar é idempotente: se a resposta se perder na rede lenta, pergunta de novo.
    const publicar = async () => {
      try { return await comTempo(publicarFotoCidade({ codigo, entradaId: entradaId, publica }), 25_000); } catch { return null; }
    };
    try {
      const [blob, prep] = await Promise.all([comprimirFoto(arquivo), comTempo(prepararFotoCidade({ codigo, entradaId: entradaId }), 25_000)]);
      if (!prep?.ok) { setErro(prep?.erro || FALHA_FOTO); setFoto('nenhuma'); return; }
      await subirFoto(prep.upload, blob);
      const r = (await publicar()) || (await publicar());
      if (!r?.ok) { setErro(r?.erro || FALHA_FOTO); setFoto('nenhuma'); return; }
      setFoto(r.status);
    } catch {
      setErro(navigator.onLine ? FALHA_FOTO : 'Sem sinal agora. O carimbo já está no passaporte; poste a foto quando a internet voltar.');
      setFoto('nenhuma');
    }
  }

  return (
    <>
      {foto === 'publica' || foto === 'privada' ? (
        <p className="carimbo-feito-foto">
          {foto === 'publica' ? <>Foto no mapa de {cidade.nome}. <Link href={`/selo/cidade/${cidade.slug}`}>Ver a cidade →</Link></> : 'Foto guardada só no seu passaporte.'}
        </p>
      ) : (
        <div className="carimbo-feito-foto">
          <span className="selo-legenda">{titulo}</span>
          <label className="selo-check">
            <input type="checkbox" checked={publica} onChange={(e) => setPublica(e.target.checked)} />
            Mostrar no mapa de {cidade.nome}{autor ? `, como ${autor}` : ''}
          </label>
          <div className="selo-foto-botao">
            <span className="selo-btn secundario" aria-hidden="true">{foto === 'enviando' ? 'Enviando a foto…' : 'Escolher ou tirar foto'}</span>
            <input type="file" accept="image/*" aria-label={`Postar foto de ${cidade.nome}`} onChange={enviar} disabled={foto === 'enviando'} />
          </div>
          <small className="selo-dica">Foto pública aparece na hora para quem abrir o mapa. Qualquer pessoa pode denunciar foto imprópria. Sem rosto de terceiros sem autorização.</small>
          {erro && <p className="selo-erro" role="alert">{erro}</p>}
        </div>
      )}
    </>
  );
}
