'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { carimbarAqui, escolherArteCarimbo, prepararFotoCidade, publicarFotoCidade } from './actions';
import { comTempo, comprimirFoto, subirFoto } from './fotoCliente';
import { appendReading, readQueue, queueKey } from '../../public/pwa/store.mjs';

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
function lerFila(codigo) {
  try { return readQueue(localStorage, codigo); } catch { return []; }
}
function gravarFila(codigo, lista) {
  if (lista.length) localStorage.setItem(queueKey(codigo), JSON.stringify(lista));
  else localStorage.removeItem(queueKey(codigo));
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
  const envioEmCurso = useRef(false);

  const avisar = useCallback(() => {
    if (onCarimbo) onCarimbo();
    else router.refresh();
  }, [onCarimbo, router]);

  const enviarFila = useCallback(async () => {
    const pendentes = lerFila(codigo);
    if (!pendentes.length || !navigator.onLine || envioEmCurso.current) return;
    envioEmCurso.current = true;
    setSincronizando(true);
    const concluidos = new Set();
    const feitos = [];
    for (const p of pendentes) {
      try {
        const r = await comTempo(carimbarAqui({ codigo, ...p }), 20_000);
        if (r?.ok || r?.definitivo) {
          concluidos.add(JSON.stringify(p));
          feitos.push(r.ok ? r : { ok: false, erro: r.erro });
        }
      } catch {
        // Preserve reading for the next attempt.
      }
    }
    // Keep readings added by another tab while requests were in flight.
    const ficam = lerFila(codigo).filter((p) => !concluidos.has(JSON.stringify(p)));
    let falhaStorage = false;
    try { gravarFila(codigo, ficam); } catch { falhaStorage = true; }
    setFila(falhaStorage ? lerFila(codigo) : ficam);
    envioEmCurso.current = false;
    setSincronizando(false);
    const ok = feitos.filter((r) => r.ok);
    if (ok.length) {
      setMsg('');
      setFeito(ok.at(-1));
      avisar();
    }
    const falha = feitos.find((r) => !r.ok);
    if (falha) setMsg(`Um check-in guardado não valeu: ${falha.erro}`);
    if (falhaStorage) setMsg('Não foi possível atualizar as pendências neste aparelho. Os registros guardados serão conferidos de novo na próxima tentativa.');
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
      try {
        setFila(appendReading(localStorage, codigo, leitura));
      } catch {
        setMsg('Não foi possível guardar a passagem neste celular. Verifique o armazenamento e tente de novo quando tiver conexão.');
      }
    } finally {
      setEstado('pronto');
    }
  }

  return (
    <section className={`selo-cartao selo-checkin carimbo-cidade${compacto ? ' compacto' : ''}`} aria-labelledby={compacto ? undefined : 'selo-cidade-titulo'} aria-label={compacto ? 'Carimbar pelo GPS' : undefined}>
      {!compacto && <>
        <span className="selo-kicker">Passaporte · carimbo de cidade</span>
        <h2 id="selo-cidade-titulo">Chegou numa cidade? Carimbe.</h2>
        <p>Permita a localização para carimbar a cidade onde você está, com data e número de série. Vale em todo o Brasil.</p>
      </>}
      <button type="button" className="selo-btn" onClick={carimbar} disabled={ocupado || sincronizando}>
        {estado === 'localizando' ? 'Procurando sua localização…' : estado === 'carimbando' ? 'Carimbando…' : sincronizando ? 'Enviando carimbos guardados…' : 'Carimbar esta cidade'}
      </button>

      <p className="carimbo-andamento" role="status" aria-atomic="true">
        {estado === 'localizando' ? 'Buscando sua posição pelo GPS. Isso pode levar até 20 segundos.'
          : estado === 'carimbando' ? 'Localização encontrada. Confirmando seu carimbo…'
          : sincronizando ? 'Enviando os carimbos guardados neste celular…' : ''}
      </p>
      {!compacto && <small className="selo-dica">O GPS só é consultado quando você toca em carimbar. Sua posição não fica gravada no servidor; só a cidade.</small>}

      {fila.length > 0 && (
        <div className="carimbo-pendente" role="status">
          <span className="carimbo-pendente-selo" aria-hidden="true" />
          <div>
            <b>{fila.length === 1 ? '1 passagem aguardando confirmação' : `${fila.length} passagens aguardando confirmação`}</b>
            <span>Guardada neste aparelho. Abra o passaporte com internet em até 72 horas para confirmar. Não limpe os dados do navegador.</span>
          </div>
          <button type="button" className="selo-btn secundario" onClick={enviarFila} disabled={sincronizando}>{sincronizando ? 'Enviando…' : 'Enviar agora'}</button>
        </div>
      )}

      {feito && esperado && feito.cidade?.slug !== esperado.slug && (
        <p className="selo-dica" role="status">Você está em {feito.cidade.nome}/{feito.cidade.uf}, não em {esperado.nome}. Carimbamos a cidade onde você está.</p>
      )}
      {feito && <Carimbado key={feito.entradaId} codigo={codigo} feito={feito} autor={autor} onStory={onStory} onArte={avisar} compacto={compacto} />}
      {msg && <p className="selo-erro" role="alert">{msg}</p>}
      <small className="selo-dica">Um carimbo por cidade por dia. Voltou outro dia? Carimba de novo e conta como nova visita. <Link href="/selo/mapa">Ver o mapa de carimbos →</Link></small>
    </section>
  );
}

// Depois do carimbo: escolha da arte, story e a foto opcional.
function Carimbado({ codigo, feito, autor, onStory, onArte, compacto }) {
  const { cidade } = feito;
  const [arte, setArte] = useState(feito.arte);
  const imagem = feito.artes?.find((a) => a.id === arte)?.imagem || feito.imagem;
  return (
    <div className="carimbo-feito" role="status">
      <img className="carimbo-feito-arte" src={imagem} alt={`Carimbo de ${cidade.nome}/${cidade.uf}`} width={160} height={160} />
      <div className="carimbo-feito-texto">
        <b>{cidade.nome}/{cidade.uf}</b>
        <span>{feito.ja ? `Já estava carimbada em ${dataCurta(feito.dia)} no seu passaporte.` : `Carimbada no seu passaporte · ${dataCurta(feito.dia)}`}</span>
        {feito.serie && <span className="carimbo-feito-serie">Nº {feito.serie}</span>}
      </div>
      <EscolherArte codigo={codigo} feito={feito} arte={arte} onEscolhida={(id) => { setArte(id); onArte?.(); }} />
      {onStory
        ? <button type="button" className="selo-btn carimbo-feito-story" onClick={() => onStory(feito.entradaId)}>Compartilhar nos Stories</button>
        : <Link className="selo-btn carimbo-feito-story" href={`/selo/passaporte?story=${feito.entradaId}`}>Compartilhar nos Stories</Link>}
      <FotoCarimbo codigo={codigo} entradaId={feito.entradaId} cidade={cidade} autor={autor} publicaInicial />
      {!compacto && <Link className="selo-btn secundario carimbo-feito-mapa" href="/selo/mapa">Ver outros carimbos no mapa</Link>}
    </div>
  );
}

// Opções de arte da cidade (com a data e o nº desta passagem). A pessoa toca
// numa e confirma no OK; só então o passaporte troca a arte do carimbo.
function EscolherArte({ codigo, feito, arte, onEscolhida }) {
  const [marcada, setMarcada] = useState(arte);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  if (!feito.artes || feito.artes.length < 2) return null;
  async function confirmar() {
    setSalvando(true);
    setErro('');
    try {
      const r = await comTempo(escolherArteCarimbo({ codigo, entradaId: feito.entradaId, arte: marcada }), 20_000);
      if (!r?.ok) { setErro(r?.erro || 'Não salvou a escolha. Tente de novo.'); return; }
      onEscolhida(marcada);
    } catch {
      setErro('Sem conexão agora. Seu carimbo continua na arte anterior; tente de novo.');
    } finally {
      setSalvando(false);
    }
  }
  return (
    <fieldset className="carimbo-artes">
      <legend>Escolha seu carimbo</legend>
      <p>{feito.artes.length} artes de {feito.cidade.nome}. Toque na que você quer e confirme: ela vai para o seu passaporte.</p>
      <div className="carimbo-artes-opcoes">
        {feito.artes.map((a) => (
          <label key={a.id} className="carimbo-arte" data-marcada={a.id === marcada || undefined}>
            <input type="radio" name={`arte-${feito.entradaId}`} value={a.id} checked={a.id === marcada} onChange={() => setMarcada(a.id)} />
            <img src={a.mini} alt="" width={96} height={96} loading="lazy" />
            <span>{a.nome}{a.id === arte && <small>no passaporte</small>}</span>
          </label>
        ))}
      </div>
      <button type="button" className="selo-btn" onClick={confirmar} disabled={salvando || marcada === arte}>
        {salvando ? 'Salvando…' : marcada === arte ? 'Este é o seu carimbo ✓' : 'OK, usar este carimbo'}
      </button>
      {erro && <p className="selo-erro" role="alert">{erro}</p>}
    </fieldset>
  );
}

// Foto opcional de um carimbo: logo depois de carimbar ou mais tarde, pelo
// passaporte (quem estava sem sinal posta quando a internet voltar).
export function FotoCarimbo({ codigo, entradaId, cidade, autor, titulo = 'Quer guardar uma foto daqui? (opcional)', publicaInicial = false, onEnviada }) {
  const [foto, setFoto] = useState('nenhuma');   // nenhuma | enviando | publica | privada
  const [publica, setPublica] = useState(publicaInicial);
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
      onEnviada?.(r.status);
    } catch {
      setErro(navigator.onLine ? FALHA_FOTO : 'Sem sinal agora. O carimbo já está no passaporte; poste a foto quando a internet voltar.');
      setFoto('nenhuma');
    }
  }

  return (
    <>
      {foto === 'publica' || foto === 'privada' ? (
        <p className="carimbo-feito-foto">
          {foto === 'publica' ? <>Foto na página de {cidade.nome}. <Link href={`/selo/cidade/${cidade.slug}`}>Ver a cidade →</Link></> : 'Foto guardada só no seu passaporte.'}
        </p>
      ) : (
        <div className="carimbo-feito-foto">
          <span className="selo-legenda">{titulo}</span>
          <label className="selo-check">
            <input type="checkbox" checked={publica} onChange={(e) => setPublica(e.target.checked)} />
            Mostrar na página de {cidade.nome}{autor ? `, como ${autor}` : ''}
          </label>
          <div className="selo-foto-botao">
            <span className="selo-btn secundario" aria-hidden="true">{foto === 'enviando' ? 'Enviando a foto…' : 'Escolher ou tirar foto'}</span>
            <input type="file" accept="image/*" aria-label={`Postar foto de ${cidade.nome}`} onChange={enviar} disabled={foto === 'enviando'} />
          </div>
          <small className="selo-dica">Foto pública aparece na hora na página da cidade e no mapa. Qualquer pessoa pode denunciar foto imprópria. Sem rosto de terceiros sem autorização.</small>
          {erro && <p className="selo-erro" role="alert">{erro}</p>}
        </div>
      )}
    </>
  );
}
