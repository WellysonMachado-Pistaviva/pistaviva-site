export default function robots() {
  const BASE = 'https://moto.pistaviva.com.br';
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/perfil', '/role'] }],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
