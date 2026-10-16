// Lembra no celular quem já veio (localStorage): número, link pessoal e dados
// para preencher o formulário na próxima estação. Só existe neste aparelho.
import { SNAPSHOT_KEY, queueKey } from '../../public/pwa/store.mjs';

const CHAVE = 'selo:perfil';
const FOTO = 'selo:foto';
const EVENTO = 'selo:perfil-atualizado';

function avisar() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(EVENTO));
}

export function perfilSalvo() {
  try { return localStorage.getItem(CHAVE); } catch { return null; }
}

export function assinarPerfil(callback) {
  const storage = (event) => { if (event.key === CHAVE || event.key === null) callback(); };
  window.addEventListener(EVENTO, callback);
  window.addEventListener('storage', storage);
  return () => { window.removeEventListener(EVENTO, callback); window.removeEventListener('storage', storage); };
}

export function lerPerfil() {
  try { return JSON.parse(perfilSalvo() || 'null'); } catch { return null; }
}

// Passaporte de outra pessoa no mesmo aparelho substitui o perfil inteiro:
// misturar deixaria o WhatsApp e a ficha de uma pessoa no link de outra.
export function salvarPerfil(dados) {
  try {
    const atual = lerPerfil();
    const outraPessoa = dados?.codigo && atual?.codigo && dados.codigo !== atual.codigo;
    if (outraPessoa) {
      localStorage.removeItem(FOTO);
      localStorage.removeItem(SNAPSHOT_KEY);
    }
    localStorage.setItem(CHAVE, JSON.stringify(outraPessoa ? { ...dados } : { ...atual, ...dados }));
    avisar();
  } catch { /* storage bloqueado */ }
}

// A foto pertence ao perfil que a escolheu, inclusive em aparelhos compartilhados.
// Fotos antigas sem dono não são reutilizadas: é preciso selecioná-las novamente.
export function lerFotoPerfil(perfil) {
  try {
    if (!perfil?.codigo || lerPerfil()?.codigo !== perfil.codigo) return null;
    const foto = JSON.parse(localStorage.getItem(FOTO) || 'null');
    return foto?.codigo === perfil.codigo && String(foto.numero) === String(perfil.numero) && typeof foto.src === 'string' && foto.src.startsWith('data:image/jpeg;base64,') ? foto.src : null;
  } catch { return null; }
}

export function salvarFotoPerfil(src, perfil) {
  try {
    if (!perfil?.codigo || lerPerfil()?.codigo !== perfil.codigo || typeof src !== 'string' || !src.startsWith('data:image/jpeg;base64,')) return false;
    localStorage.setItem(FOTO, JSON.stringify({ codigo: perfil.codigo, numero: perfil.numero, src }));
    return true;
  } catch { return false; }
}

// "Esquecer este celular": apaga perfil, resumo offline e passagens guardadas.
export function esquecerPerfil() {
  try {
    const codigo = lerPerfil()?.codigo;
    localStorage.removeItem(CHAVE);
    localStorage.removeItem(FOTO);
    localStorage.removeItem(SNAPSHOT_KEY);
    if (codigo) localStorage.removeItem(queueKey(codigo));
    try { if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('selo:rascunho'); } catch { /* Outros dados já foram removidos. */ }
    avisar();
    return true;
  } catch { return false; }
}
