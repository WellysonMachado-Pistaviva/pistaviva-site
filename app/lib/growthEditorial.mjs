const REVISED = '2026-09-11';

// Corrections target the old wording only, so future CMS revisions remain intact.
export function reviseGrowthEditorial(post) {
  if (!post) return post;
  let body = post.body || '';
  let excerpt = post.excerpt;
  if (post.slug === 'bate-volta-de-moto-saindo-de-bh') {
    excerpt = excerpt?.replace('a até 130 km', 'com diferentes distâncias e perfis de passeio');
    body = body.replace('Bom pra treinar curva numa manhã.', 'Planeje o trajeto conforme sua experiência e as condições da via.');
  }
  if (post.slug === 'serra-do-rio-do-rastro-de-moto-guia') {
    body = body.replace(/Os meses de outono e inverno trazem dias mais secos e límpidos[^\n]*/g,
      'A escolha deve considerar a previsão dos dias da viagem, a visibilidade e a situação da rodovia. O inverno exige atenção especial ao frio e à possibilidade de gelo; horário ou estação não garantem pista seca. Consulte a Epagri/Ciram e os avisos rodoviários antes de sair.');
    body = body.replace(/Outono e inverno costumam ter dias mais secos e céu limpo[^\n]*/g,
      'Não existe mês que garanta pista seca e boa visibilidade. Escolha uma janela de tempo favorável, confira os avisos meteorológicos e as condições da SC-390. No inverno, considere especialmente o risco de frio intenso e gelo.');
    body = body.replace('Não é perigosa para quem pilota com bom senso.', 'A serra exige atenção mesmo de motociclistas experientes.');
    body = body.replace(/\[paradas\]\(\/paradas\)/g, '[destinos de viagem](/destinos)');
  }
  const datedRevision = ['bate-volta-de-moto-saindo-de-bh', 'serra-do-rio-do-rastro-de-moto-guia'].includes(post.slug)
    && body.includes('Revisão editorial: 11/09/2026.');
  if (body === (post.body || '') && excerpt === post.excerpt && !datedRevision) return post;
  return { ...post, body, excerpt,
    updated_at: post.updated_at && new Date(post.updated_at) > new Date(REVISED) ? post.updated_at : REVISED };
}
