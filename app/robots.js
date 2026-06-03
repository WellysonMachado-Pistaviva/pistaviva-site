export default function robots() {
  const BASE = 'https://www.pistavivamototurismo.com.br';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/perfil'] }],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
