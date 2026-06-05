export default function robots() {
  const BASE = 'https://www.pistavivamototurismo.com.br';
  return {
    // Sem bloquear /_next/ — Google precisa de CSS/JS pra renderizar (exigência do guia).
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/'],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
