export function getAdminRevalidationTargets({ table, data, rows = [] }) {
  if (['pv_site_config', 'pv_banners'].includes(table)) return [{ path: '/' }];
  if (table === 'pv_destinos') return [{ path: '/' }, { path: '/destinos' }, { path: '/destinos/[slug]', type: 'page' }, { path: '/sitemap.xml' }];
  if (table === 'pv_events') return [{ path: '/' }, { path: '/eventos' }, { path: '/eventos/[id]', type: 'page' }, { path: '/sitemap.xml' }];
  if (table !== 'pv_blog_posts') return [];

  const slugs = new Set(
    [data?.slug, ...rows.map(row => row?.slug)]
      .filter(Boolean)
      .map(slug => String(slug).trim())
      .filter(Boolean)
  );

  const targets = [
    { path: '/' },
    { path: '/blog' },
    { path: '/sitemap.xml' },
    { path: '/comunidade' },
    { path: '/blog/[slug]', type: 'page' },
  ];

  for (const slug of slugs) targets.push({ path: `/blog/${slug}` });
  return targets;
}
