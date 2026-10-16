export function contextoPassaporte(pathname = '') {
  return pathname === '/selo' || /^\/selo\/(?:passaporte|m|mapa|cidade|meu-numero|mural|conquistadores|privacidade)(?:\/|$)/.test(pathname) || /^\/selos(?:\/|$)/.test(pathname);
}

export function destinosPassaporte(pathname = '', perfil) {
  const naPagina = /^\/selo\/m\/([a-f0-9]{12})(?:\/|$)/.exec(pathname)?.[1];
  const codigo = naPagina || (/^[a-f0-9]{12}$/.test(perfil?.codigo || '') ? perfil.codigo : null);
  const passaporte = codigo ? `/selo/m/${codigo}` : '/selo/passaporte';
  return {
    passaporte,
    carimbar: codigo ? `${passaporte}#carimbar` : '/selo/passaporte#criar-passaporte',
    privacidade: codigo ? `${passaporte}#privacidade` : '/selo/privacidade',
  };
}
