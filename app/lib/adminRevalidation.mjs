export function getAdminRevalidationTargets({ table, data, rows = [] }) {
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
    { path: '/comunidade' },
    { path: '/blog/[slug]', type: 'page' },
  ];

  for (const slug of slugs) targets.push({ path: `/blog/${slug}` });
  return targets;
}
