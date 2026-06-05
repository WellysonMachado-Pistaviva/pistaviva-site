// Estados do Brasil — base dos hubs /mototurismo/[uf]
export const UF_NAMES = {
  ac: 'Acre', al: 'Alagoas', ap: 'Amapá', am: 'Amazonas', ba: 'Bahia',
  ce: 'Ceará', df: 'Distrito Federal', es: 'Espírito Santo', go: 'Goiás',
  ma: 'Maranhão', mt: 'Mato Grosso', ms: 'Mato Grosso do Sul', mg: 'Minas Gerais',
  pa: 'Pará', pb: 'Paraíba', pr: 'Paraná', pe: 'Pernambuco', pi: 'Piauí',
  rj: 'Rio de Janeiro', rn: 'Rio Grande do Norte', rs: 'Rio Grande do Sul',
  ro: 'Rondônia', rr: 'Roraima', sc: 'Santa Catarina', sp: 'São Paulo',
  se: 'Sergipe', to: 'Tocantins',
};

export const UF_LIST = Object.keys(UF_NAMES); // ['ac','al',...]

export const ufName = (uf) => UF_NAMES[String(uf || '').toLowerCase()] || null;

// Slug de cidade pros hubs /mototurismo/[uf]/[cidade] — tira acento, espaço vira hífen
export const citySlug = (c) =>
  String(c || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
