export const ANALYTICS_PAGE_SIZE = 1_000;

export async function collectAllPages(fetchPage, pageSize = ANALYTICS_PAGE_SIZE) {
  const rows = [];
  let page = 0;

  while (true) {
    const batch = await fetchPage({
      page,
      from: page * pageSize,
      to: (page + 1) * pageSize - 1,
      pageSize,
    });
    if (!Array.isArray(batch)) throw new Error('Página analítica inválida.');
    rows.push(...batch);
    if (batch.length < pageSize) return rows;
    page += 1;
  }
}

export function buildMonthlySeries(users, now = new Date(), months = 12) {
  const buckets = new Map();
  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - offset, 1));
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    buckets.set(key, {
      label: `${String(date.getUTCMonth() + 1).padStart(2, '0')}/${String(date.getUTCFullYear()).slice(2)}`,
      value: 0,
    });
  }

  for (const user of users || []) {
    const date = new Date(user.created_at || user.createdAt || '');
    if (Number.isNaN(date.getTime())) continue;
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.value += 1;
  }
  return [...buckets.values()];
}

export function rankBy(rows, key, { limit = 6, include = () => true } = {}) {
  const counts = new Map();
  for (const row of rows || []) {
    const id = row?.[key];
    if (id == null || !include(row)) continue;
    counts.set(String(id), (counts.get(String(id)) || 0) + 1);
  }
  return [...counts.entries()]
    .map(([id, value]) => ({ id, value }))
    .sort((a, b) => b.value - a.value || a.id.localeCompare(b.id))
    .slice(0, limit);
}
