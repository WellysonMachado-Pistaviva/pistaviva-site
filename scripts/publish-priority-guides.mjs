import fs from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { resolveSupabaseAdminConfig } from '../app/lib/supabaseAdminConfig.mjs';
import { parseArticleBody } from '../app/lib/articleBody.mjs';
const dir = new URL('../docs/editorial/2026-10-06/demanda-pesquisa/', import.meta.url);
const manifest = JSON.parse(await fs.readFile(new URL('manifest.json', dir), 'utf8'));
const { url, key } = resolveSupabaseAdminConfig();
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: before, error: lookupError } = await sb.from('pv_blog_posts').select('*').in('slug', manifest.map(p => p.slug));
if (lookupError) throw new Error(lookupError.message);
if (before.length !== 3) throw new Error('Expected three existing guides');
for (const item of manifest) {
  const row = before.find(p => p.slug === item.slug);
  const body = (await fs.readFile(new URL(item.file, dir), 'utf8')).trim().split('\n\n').slice(2).join('\n\n');
  if (body !== row.body) throw new Error(`Editorial content changed: ${item.slug}`);
  if (!parseArticleBody(body).some(p => p.t === 'instagram')) throw new Error('Missing Instagram reference');
}
if (!process.argv.includes('--apply')) { console.log({ ready: true, guides: before.map(p => p.slug) }); process.exit(0); }
await fs.writeFile(new URL(`before-publication-${Date.now()}.json`, dir), JSON.stringify(before, null, 2));
const result = [];
// Last publication is the first guide in the editorial priority.
for (const number of [29, 35, 27]) {
  const row = before.find(p => p.slug.includes(`biker-${number}-`));
  const bytes = await fs.readFile(new URL(`capas/guia-${number}.png`, dir));
  const assetPath = `editorial/2026-10-06/guias/guia-${number}.png`;
  const { error: uploadError } = await sb.storage.from('post-images').upload(assetPath, bytes, { contentType: 'image/png', cacheControl: '31536000', upsert: false });
  if (uploadError && !['409', 409].includes(uploadError.statusCode)) throw new Error(uploadError.message);
  const cover_url = sb.storage.from('post-images').getPublicUrl(assetPath).data.publicUrl;
  const asset = await fetch(cover_url);
  if (!asset.ok || !Buffer.from(await asset.arrayBuffer()).equals(bytes)) throw new Error(`Asset failed verification: ${number}`);
  const { data, error } = await sb.from('pv_blog_posts').update({ published: true, published_at: row.published_at || new Date().toISOString(), cover_url }).eq('id', row.id).eq('body', row.body).select('id,slug,title,published,published_at,author,cover_url').single();
  if (error) throw new Error(error.message);
  result.push(data);
}
await fs.writeFile(new URL('published.json', dir), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result.map(p => ({ slug: p.slug, published: p.published, author: p.author })), null, 2));
