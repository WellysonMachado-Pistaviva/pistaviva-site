import { lerFotoPerfil } from '../perfilLocal.js';
import { carregarIdentificacao } from '../identificacaoCliente.js';

// Recursos únicos da arte aprovada, usados pela página e pelas exportações.
const BASE = '/selo/passaporte';
let fontes;
export function carregarFontes() {
  fontes ||= Promise.all([
    new FontFace('PassaporteSlab', `url(${BASE}/fontes/RobotoSlab.ttf)`, { weight: '100 900' }),
    new FontFace('PassaporteAssinatura', `url(${BASE}/fontes/MrsSaintDelafield.ttf)`),
    new FontFace('PassaporteCarimbo', `url(${BASE}/fontes/MailartRubberstamp.otf)`),
    new FontFace('PassaporteTitulo', `url(${BASE}/fontes/Impacted.ttf)`),
  ].map(async (f) => document.fonts.add(await f.load()))).catch((e) => { fontes = null; throw e; });
  return fontes;
}

const imagens = new Map();
export function carregarImagem(src) {
  if (!imagens.has(src)) {
    imagens.set(src, new Promise((ok, falha) => {
      const img = new Image();
      img.onload = () => ok(img);
      img.onerror = () => { imagens.delete(src); falha(new Error(src)); };
      img.src = src;
    }));
  }
  return imagens.get(src);
}

export function lerIdentidade({ pessoa, privado, codigo, demonstracao }) {
  const dados = { piloto: pessoa.nome, garupa: '', origem: [pessoa.cidade, pessoa.uf].filter(Boolean).join('/'), assinatura: pessoa.nome.split(' ')[0] };
  if (demonstracao) return { dados: { ...dados, piloto: 'Ana Souza', garupa: 'João Lima', origem: 'Itajubá/MG', assinatura: 'Ana' }, fotoSrc: '/motosul/g-fila-motos.jpg' };
  if (privado) {
    try {
      const p = JSON.parse(localStorage.getItem('selo:perfil') || 'null');
      if (p?.codigo === codigo && String(p.numero) === String(pessoa.numero)) {
        for (const chave of ['piloto', 'garupa', 'origem', 'assinatura']) if (typeof p.ficha?.[chave] === 'string' && p.ficha[chave].trim()) dados[chave] = p.ficha[chave];
        return { dados, fotoSrc: lerFotoPerfil(p) };
      }
    } catch { /* A ficha continua disponível sem armazenamento local. */ }
  }
  return { dados, fotoSrc: null };
}

export async function carregarIdentidade(opcoes) {
  const local = lerIdentidade(opcoes);
  if (!opcoes.privado || opcoes.demonstracao || !opcoes.codigo) return local;
  try {
    const p = JSON.parse(localStorage.getItem('selo:perfil') || 'null');
    const pendente = p?.codigo === opcoes.codigo && p.fichaPendente;
    const salva = await carregarIdentificacao(opcoes.codigo);
    if (pendente) return { dados: local.dados, fotoSrc: local.fotoSrc || (p.fotoRemovidaPendente ? null : salva.fotoSrc) };
    return salva.ficha ? { dados: salva.ficha, fotoSrc: salva.fotoSrc } : local;
  } catch { return local; }
}
