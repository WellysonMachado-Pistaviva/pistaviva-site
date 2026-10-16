// URLs com credencial no caminho: o código do passaporte (/selo/m/{codigo}) e o
// token do parceiro (/selo/parceiro/{token}). Quem tem a URL abre a página, então
// ela nunca pode chegar a ferramentas de terceiros (Vercel Analytics, GA).
const PRIVADAS = [
  [/^(\/selo\/m\/)[^/?#]+/, '$1[codigo]'],
  [/^(\/selo\/parceiro\/)[^/?#]+/, '$1[token]'],
];
// Parâmetros que carregam a mesma credencial.
const PARAMS_PRIVADOS = ['codigo', 'token'];

export const rotaPrivada = (pathname) => PRIVADAS.some(([re]) => re.test(String(pathname || '')));

// Troca o segredo por um marcador. Mantém o resto para as métricas por rota.
export function redigirUrl(url) {
  let u;
  try { u = new URL(url, 'https://x.invalid'); } catch { return url; }
  let caminho = u.pathname;
  for (const [re, troca] of PRIVADAS) caminho = caminho.replace(re, troca);
  for (const p of PARAMS_PRIVADOS) if (u.searchParams.has(p)) u.searchParams.set(p, 'redigido');
  const relativo = !/^[a-z][a-z0-9+.-]*:/i.test(String(url));
  const busca = u.searchParams.toString();
  // Hash fica de fora: pode carregar dado da página e não serve à métrica.
  return `${relativo ? '' : u.origin}${caminho}${busca ? `?${busca}` : ''}`;
}

// Script inline do GA. Liga a flag oficial `ga-disable-<ID>` em rota privada,
// de forma síncrona: o pushState/replaceState embrulhado aqui é instalado antes
// do gtag.js, então a flag muda antes de o GA contar a troca de página.
export function scriptGa(gaId) {
  const id = JSON.stringify(String(gaId));
  const re = JSON.stringify(PRIVADAS.map(([r]) => r.source).join('|'));
  return `(function(){var r=new RegExp(${re}),f='ga-disable-'+${id};function s(p){window[f]=r.test(p)}s(location.pathname);`
    + `['pushState','replaceState'].forEach(function(k){var o=history[k];history[k]=function(a,b,u){if(u!=null){try{s(new URL(u,location.href).pathname)}catch(e){}}return o.apply(this,arguments)}});`
    + `addEventListener('popstate',function(){s(location.pathname)})})();`
    + `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config',${id});`;
}
