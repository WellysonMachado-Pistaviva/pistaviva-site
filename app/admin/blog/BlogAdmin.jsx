'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../../src/lib/supabaseClient';
import { adminImportImageUrl, adminUploadDataUrl, adminWrite, shouldImportRemoteImageUrl } from '../../lib/adminDb';
import { prepareCoverImageDataUrl, preparePostImageDataUrl } from '../../../src/services/storage';
import { useAuth, showToast } from '../../components/AuthProvider';

const slugify = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const EMPTY = { id: null, title: '', slug: '', excerpt: '', body: '', tags: [], cover_url: '', published: false };

// blocos inseridos no corpo — no formato do nosso renderizador de blog
const SNIP = {
  title: '\n\n## Título da seção\n',
  sub: '\n\n### Subtítulo\n',
  bold: '**texto em negrito**',
  link: '[escreva o texto](/pagina)',
  faqq: '\n### Pergunta do leitor?\nResposta clara e direta.\n',
  faqblock: '\n\n## Perguntas frequentes\n### Primeira pergunta?\nResposta direta.\n### Segunda pergunta?\nOutra resposta.\n### Terceira pergunta?\nMais uma resposta.\n',
  tpl: 'Abertura: um parágrafo forte que resume a matéria e prende o leitor.\n\n## Primeiro tópico\nDesenvolva o ponto principal em parágrafos curtos.\n\n## Segundo tópico\nContinue a matéria. Clique "Imagem" pra inserir uma foto no meio.\n\n## Dicas de quem rodou\nListe o que o leitor precisa saber.\n\n## Conclusão\nFeche com um resumo e um convite pra comunidade Pistaviva.\n\n## Perguntas frequentes\n### Pergunta que o leitor faria?\nResposta completa (vira rich result no Google).\n### Segunda pergunta?\nOutra resposta clara.\n',
};

const Ico = ({ d }) => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{d}</svg>;

// Tamanho ideal da capa (mostrado no admin pra orientar o upload).
const COVER_SIZE = '1200 × 630 px (16:9)';

const readFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
  reader.readAsDataURL(file);
});

// Miniatura da capa com detecção de imagem quebrada — visão completa no admin.
function CoverThumb({ post, onStatus }) {
  const url = (post.cover_url || '').trim();
  const [st, setSt] = useState(url ? 'loading' : 'none');
  useEffect(() => {
    const s = url ? 'loading' : 'none';
    queueMicrotask(() => { setSt(s); if (!url) onStatus(post.id, 'none'); });
  }, [url, post.id, onStatus]);
  return (
    <span className={`ba-thumb ba-thumb--${st}`} title={url || 'Sem foto'}>
      {url && (
        <img
          src={url}
          alt=""
          loading="lazy"
          onLoad={() => { setSt('ok'); onStatus(post.id, 'ok'); }}
          onError={() => { setSt('broken'); onStatus(post.id, 'broken'); }}
        />
      )}
      {st === 'none' && <span className="ba-thumb__lbl">sem<br />foto</span>}
      {st === 'broken' && <span className="ba-thumb__lbl ba-thumb__lbl--err">quebrada</span>}
    </span>
  );
}

export default function BlogAdmin() {
  const auth = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [posts, setPosts] = useState([]);
  const [coverStatus, setCoverStatus] = useState({}); // id -> 'ok' | 'broken' | 'none' | 'loading'
  const reportCover = useCallback((id, s) => setCoverStatus(m => (m[id] === s ? m : { ...m, [id]: s })), []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const slugTouched = useRef(false);
  const bodyRef = useRef(null);
  const posRef = useRef(0);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('pv_blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []); setLoading(false);
  }, []);
  useEffect(() => { (async () => { await load(); })(); }, [load]);

  if (!auth?.isAdmin) return null; // a shell do painel já protege

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const onTitle = (v) => setForm(f => ({ ...f, title: v, slug: (f.id || slugTouched.current) ? f.slug : slugify(v) }));

  const trackPos = () => { if (bodyRef.current) posRef.current = bodyRef.current.selectionStart; };
  const insertAtCursor = (snippet) => {
    setForm(f => {
      const cur = f.body || '';
      const pos = Math.min(posRef.current ?? cur.length, cur.length);
      const next = cur.slice(0, pos) + snippet + cur.slice(pos);
      const np = pos + snippet.length; posRef.current = np;
      requestAnimationFrame(() => { const ta = bodyRef.current; if (ta) { ta.focus(); ta.setSelectionRange(np, np); } });
      return { ...f, body: next };
    });
  };

  const onCover = async (file, input = null) => {
    if (!file) return;
    setUploading(true);
    try {
      const source = await readFile(file);
      const prepared = await prepareCoverImageDataUrl(source);
      const { url, error } = await adminUploadDataUrl({ dataUrl: prepared, kind: 'covers' });
      if (error) throw new Error(error.message);
      set('cover_url', url);
      showToast('Imagem pronta. Publique a matéria para salvar.', 'success');
    } catch (error) {
      showToast('Erro no upload: ' + error.message, 'error');
    } finally {
      setUploading(false);
      if (input) input.value = '';
    }
  };
  const onBodyImage = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    try {
      const source = await readFile(file);
      const prepared = await preparePostImageDataUrl(source);
      const { url, error } = await adminUploadDataUrl({ dataUrl: prepared, kind: 'body' });
      if (error) throw new Error(error.message);
      insertAtCursor(`\n\n[img:${url}]\n\n`);
      showToast('Imagem inserida na matéria.', 'success');
    } catch (error) {
      showToast('Erro no upload: ' + error.message, 'error');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const addTag = (raw) => { const v = raw.trim().replace(/,$/, ''); if (v && !form.tags.includes(v)) set('tags', [...form.tags, v]); setTagInput(''); };

  const edit = (p) => { slugTouched.current = true; setForm({ id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt || '', body: p.body || '', tags: p.tags || [], cover_url: p.cover_url || '', published: p.published }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const reset = () => { slugTouched.current = false; setForm(EMPTY); };

  const save = async (publishNow) => {
    if (uploading) { showToast('Aguarde o envio da imagem terminar.', 'error'); return; }
    if (!form.title.trim()) { showToast('Dê um título à matéria', 'error'); return; }
    const pub = publishNow != null ? publishNow : form.published;
    setSaving(true);
    let coverUrl = form.cover_url.trim();
    if (shouldImportRemoteImageUrl(coverUrl)) {
      const imported = await adminImportImageUrl({ url: coverUrl, kind: 'covers' });
      if (imported.error) {
        setSaving(false);
        showToast('Erro ao copiar imagem: ' + imported.error.message, 'error');
        return;
      }
      coverUrl = imported.url;
      set('cover_url', coverUrl);
    }
    const payload = {
      title: form.title.trim(), slug: (form.slug.trim() || slugify(form.title)),
      excerpt: form.excerpt.trim() || null, body: form.body,
      tags: form.tags, cover_url: coverUrl || null,
      author: auth.user?.nome || auth.user?.name || 'Pistaviva',
      published: pub, published_at: pub ? new Date().toISOString() : null,
    };
    const res = form.id
      ? await adminWrite({ table: 'pv_blog_posts', op: 'update', data: payload, match: { id: form.id } })
      : await adminWrite({ table: 'pv_blog_posts', op: 'insert', data: payload });
    setSaving(false);
    if (res.error) { showToast('Erro: ' + res.error.message, 'error'); return; }
    showToast(pub ? 'Matéria publicada ✓' : 'Rascunho salvo ✓', 'success');
    reset(); load();
  };

  const remove = async (id) => { if (!confirm('Excluir esta matéria?')) return; const { error } = await adminWrite({ table: 'pv_blog_posts', op: 'delete', match: { id } }); if (error) return showToast('Erro ao excluir', 'error'); showToast('Excluído', 'success'); load(); };

  const cv = Object.values(coverStatus);
  const cOk = cv.filter(s => s === 'ok').length;
  const cNone = cv.filter(s => s === 'none').length;
  const cBroken = cv.filter(s => s === 'broken').length;

  const words = form.body.trim().split(/\s+/).filter(Boolean).length;
  const readMin = Math.max(1, Math.round(words / 200));
  const exLen = form.excerpt.length;
  const live = form.published;
  const tb = (ins) => () => insertAtCursor(SNIP[ins]);

  return (
    <div className="wrap section post-editor" style={{ paddingTop: 'clamp(20px,3vw,36px)' }}>
      {/* TOP BAR */}
      <div className="pe-top">
        <span className="pe-crumb">Blog / <b>{form.id ? 'Editar' : 'Novo post'}</b></span>
        <span className="pe-sp" />
        <span className={`pe-pill${live ? ' live' : ''}`}><span className="d" />{live ? 'Publicado' : 'Rascunho'}</span>
        <button className="pe-btn pe-btn--ghost" onClick={() => save(false)} disabled={saving || uploading}>Salvar rascunho</button>
        <button className="pe-btn pe-btn--primary" onClick={() => save(true)} disabled={saving || uploading}>{uploading ? 'Enviando imagem…' : saving ? '...' : 'Publicar'}</button>
      </div>

      <div className="pe-grid">
        {/* COLUNA PRINCIPAL */}
        <main>
          {/* título + slug */}
          <section className="pe-card"><div className="pe-cb">
            <input className="pe-title-in" placeholder="Título da matéria" value={form.title} onChange={e => onTitle(e.target.value)} />
            <div className="pe-slug">
              <span className="pre">/blog/</span>
              <input placeholder="slug-do-post" value={form.slug} onChange={e => { slugTouched.current = true; set('slug', e.target.value); }} />
            </div>
          </div></section>

          {/* editor */}
          <section className="pe-card">
            <div className="pe-ch">
              <span className="ci"><Ico d={<path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 0-2 2V4Z" />} /></span>
              <h2>Corpo da matéria</h2>
              <span className="opt">{words} {words === 1 ? 'palavra' : 'palavras'}</span>
            </div>
            <div className="pe-toolbar">
              <button className="pe-tbtn" onClick={tb('title')}>H2 Título</button>
              <button className="pe-tbtn" onClick={tb('sub')}>H3 Subtítulo</button>
              <span className="pe-tdiv" />
              <button className="pe-tbtn" onClick={tb('bold')}>Negrito</button>
              <button className="pe-tbtn" onClick={tb('link')}>Link</button>
              <label className="pe-tbtn" style={{ cursor: 'pointer' }}>{uploading ? 'Enviando…' : 'Imagem'}<input type="file" accept="image/*" hidden onChange={onBodyImage} onClick={trackPos} /></label>
              <span className="pe-tdiv" />
              <button className="pe-tbtn faq" onClick={tb('faqq')}>Pergunta FAQ</button>
              <button className="pe-tbtn faq" onClick={tb('faqblock')}>Bloco FAQ</button>
              <button className="pe-tbtn tpl" onClick={() => setForm(f => ({ ...f, body: f.body && f.body.trim() ? f.body : SNIP.tpl }))}>Usar modelo</button>
            </div>
            <div className="pe-tip">Clique no texto onde quer inserir, depois no botão. <b>Linha em branco = novo parágrafo.</b></div>
            <textarea ref={bodyRef} className="pe-body" placeholder="Comece a escrever a matéria aqui…" value={form.body} onChange={e => set('body', e.target.value)} onSelect={trackPos} onClick={trackPos} onKeyUp={trackPos} />
          </section>
        </main>

        {/* SIDEBAR */}
        <aside className="pe-side">
          {/* publicação */}
          <section className="pe-card">
            <div className="pe-ch"><span className="ci"><Ico d={<><path d="M12 21s-7-6.3-7-11a7 7 0 0 1 14 0c0 4.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></>} /></span><h2>Publicação</h2></div>
            <div className="pe-cb">
              <div className="pe-row">
                <span className="k">Status</span>
                <div className="pe-seg">
                  <button className={!live ? 'on' : ''} onClick={() => set('published', false)}>Rascunho</button>
                  <button className={live ? 'on' : ''} onClick={() => set('published', true)}>Publicado</button>
                </div>
              </div>
              <div className="pe-row"><span className="k">Data</span><span className="v">{form.id ? 'Editando' : 'Agora'}</span></div>
              <div className="pe-row"><span className="k">Leitura</span><span className="v">~{readMin} min</span></div>
              <div className="pe-pubacts">
                <button className="pe-btn pe-btn--primary" onClick={() => save(true)} disabled={saving || uploading}>{uploading ? 'Enviando imagem…' : form.id ? 'Atualizar e publicar' : 'Publicar matéria'}</button>
                {form.id && form.slug && <a className="pe-btn pe-btn--ghost" href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>Pré-visualizar</a>}
                {form.id && <button className="pe-btn pe-btn--ghost" onClick={reset}>Novo post</button>}
              </div>
            </div>
          </section>

          {/* capa */}
          <section className="pe-card">
            <div className="pe-ch"><span className="ci"><Ico d={<><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="10" r="1.5" /><path d="m5 17 4-4 3 3 3-3 4 4" /></>} /></span><h2>Imagem de capa</h2></div>
            <div className="pe-cb">
              <label className="pe-drop"
                onDragOver={e => { e.preventDefault(); }} onDrop={e => { e.preventDefault(); onCover(e.dataTransfer.files?.[0]); }}>
                {form.cover_url && <button className="rm" type="button" onClick={e => { e.preventDefault(); set('cover_url', ''); }}>×</button>}
                {form.cover_url
                  ? <img src={form.cover_url} alt="" />
                  : <><span className="di"><Ico d={<><path d="M12 16V4M8 8l4-4 4 4" /><path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></>} /></span><b>{uploading ? 'Enviando…' : 'Enviar imagem'}</b><small>Arraste aqui ou clique · JPG, PNG</small></>}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={e => onCover(e.target.files?.[0], e.target)} />
              </label>
              <div className="pe-or">ou cole uma URL</div>
              <input className="pe-in" placeholder="https://..." value={form.cover_url} onChange={e => set('cover_url', e.target.value)} />
              <div className="pe-cover-hint">📐 Tamanho ideal: <b>{COVER_SIZE}</b> · JPG, PNG, WebP ou GIF · URL externa será copiada para o Supabase ao salvar</div>
              {form.cover_url.trim() && (
                <div className="pe-cover-test">
                  Pré-visualização:
                  <CoverThumb post={{ id: '_form', cover_url: form.cover_url }} onStatus={() => {}} />
                </div>
              )}
            </div>
          </section>

          {/* SEO & meta */}
          <section className="pe-card">
            <div className="pe-ch"><span className="ci"><Ico d={<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>} /></span><h2>SEO &amp; Meta</h2></div>
            <div className="pe-cb">
              <div className="pe-field">
                <span className="pe-lbl">Resumo (excerpt) <span className={`pe-counter${exLen > 160 ? ' warn' : ''}`}>{exLen}/160</span></span>
                <textarea className="pe-in" rows={3} placeholder="Aparece nos cards e na busca do Google." value={form.excerpt} onChange={e => set('excerpt', e.target.value)} />
              </div>
              <div className="pe-field">
                <span className="pe-lbl">Tags</span>
                <div className="pe-tags">{form.tags.map((t, i) => <span key={i} className="pe-tag">{t}<button onClick={() => set('tags', form.tags.filter((_, k) => k !== i))}>×</button></span>)}</div>
                <input className="pe-in" placeholder="Digite e tecle Enter (ex: Big Trail)" value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput); } if (e.key === 'Backspace' && !tagInput && form.tags.length) set('tags', form.tags.slice(0, -1)); }} />
              </div>
              <div className="pe-seoprev">
                <div className="u">pistavivamototurismo.com.br › blog › {form.slug || 'slug-do-post'}</div>
                <div className="t">{form.title || 'Título da matéria'}</div>
                <div className="d">{form.excerpt || 'O resumo da matéria aparece aqui, do jeito que o Google mostra nos resultados de busca.'}</div>
              </div>
            </div>
          </section>
        </aside>
      </div>

      {/* LISTA DE POSTS — com visão de capas */}
      <div className="pe-postlist">
        <h3 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Matérias ({posts.length})</h3>

        {/* visão completa: contagem de capas + tamanho ideal */}
        {!loading && posts.length > 0 && (
          <div className="ba-overview">
            <span className="ba-stat ok">✓ {cOk} com foto</span>
            <span className="ba-stat none">○ {cNone} sem foto</span>
            <span className="ba-stat err">⚠ {cBroken} quebrada{cBroken === 1 ? '' : 's'}</span>
            <span className="ba-hint">Capa ideal: <b>{COVER_SIZE}</b></span>
          </div>
        )}

        {loading ? <div className="spinner-wrap"><span className="loading-spinner" /></div> : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {posts.map(p => {
              const st = coverStatus[p.id];
              const rowFlag = !p.cover_url?.trim() ? 'none' : (st === 'broken' ? 'broken' : '');
              return (
                <div key={p.id} className={`ba-row${rowFlag ? ' ba-row--' + rowFlag : ''}`} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.published ? 'var(--moss)' : 'var(--paper-mut)', flex: '0 0 auto' }} />
                  <CoverThumb post={p} onStatus={reportCover} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--paper-mut)', fontFamily: 'var(--mono)' }}>
                      /{p.slug}{p.published ? '' : ' · rascunho'}
                      {rowFlag === 'none' && <span className="ba-tag ba-tag--none"> · sem foto</span>}
                      {rowFlag === 'broken' && <span className="ba-tag ba-tag--err"> · foto quebrada</span>}
                    </div>
                  </div>
                  <button className="btn btn--ghost" style={{ padding: '.5rem .9rem' }} onClick={() => edit(p)}>Editar</button>
                  <button className="btn btn--ghost" style={{ padding: '.5rem .9rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => remove(p.id)}>Excluir</button>
                </div>
              );
            })}
            {posts.length === 0 && <p style={{ color: 'var(--paper-dim)' }}>Nenhuma matéria ainda.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
