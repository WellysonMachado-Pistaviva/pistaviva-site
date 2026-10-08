import fs from 'node:fs/promises';
import { createClient } from '@supabase/supabase-js';
import { resolveSupabaseAdminConfig } from '../app/lib/supabaseAdminConfig.mjs';
import { parseArticleBody } from '../app/lib/articleBody.mjs';

const slug = 'wellyson-pistaviva-bmw-motorrad-fest-2026';
const directory = new URL('../docs/editorial/2026-10-06/', import.meta.url);
const text = await fs.readFile(new URL('wellyson-bmw-motorrad-fest.md', directory), 'utf8');
const [heading, excerpt, ...sections] = text.trim().split('\n\n');
const files = [
  ['bmw-motorrad-fest-2026.webp', 'cover'],
  ['wellyson-pistaviva.webp', 'portrait'],
];
const assets = new Map();
for (const [file, role] of files) assets.set(role, await fs.readFile(new URL(file, directory)));
const draftBody = sections.join('\n\n').replace('4000x6000', '1600x2400');
if (!heading.startsWith('# ') || !excerpt || !draftBody.includes('{{PORTRAIT_URL}}')) throw new Error('Invalid editorial input');
if (parseArticleBody(draftBody).filter(block => block.t === 'img').length !== 1) throw new Error('Missing article image');
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ slug, title: heading.slice(2), excerpt, assets: [...assets].map(([role, bytes]) => ({role, bytes: bytes.length})), ready: true }, null, 2));
  process.exit(0);
}
const { url, key } = resolveSupabaseAdminConfig();
if (!url || !key) throw new Error('Missing Supabase admin configuration');
const sb = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const { data: existing, error: lookupError } = await sb.from('pv_blog_posts').select('id,slug,published').eq('slug', slug).maybeSingle();
if (lookupError) throw new Error(lookupError.message);
if (existing) throw new Error(`Article already exists: ${existing.slug}; inspect before retrying`);
const urls = {};
for (const [file, role] of files) {
  const path = `editorial/2026-10-06/${file}`;
  const { error } = await sb.storage.from('post-images').upload(path, assets.get(role), { contentType: 'image/webp', cacheControl: '31536000', upsert: false });
  if (error && error.statusCode !== '409' && error.statusCode !== 409) throw new Error(error.message);
  urls[role] = sb.storage.from('post-images').getPublicUrl(path).data.publicUrl;
  const response = await fetch(urls[role]);
  if (!response.ok) throw new Error(`Asset verification failed: ${role} ${response.status}`);
  const remote = Buffer.from(await response.arrayBuffer());
  if (!remote.equals(assets.get(role))) throw new Error(`Asset differs: ${role}`);
}
const post = {
  slug, title: heading.slice(2), excerpt,
  body: draftBody.replace('{{PORTRAIT_URL}}', urls.portrait),
  cover_url: urls.cover, author: 'Pistaviva',
  tags: ['Eventos', 'BMW Motorrad', 'Mototurismo', 'Pistaviva'],
  published: true, published_at: new Date().toISOString(),
};
const { data, error } = await sb.from('pv_blog_posts').insert(post).select('id,slug,title,published,published_at').single();
if (error) throw new Error(error.message);
const result = { ...data, url: `https://www.pistavivamototurismo.com.br/blog/${slug}`, assets: urls };
await fs.writeFile(new URL('publication.json', directory), `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
