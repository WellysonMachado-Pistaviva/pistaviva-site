'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '../../../src/lib/supabaseClient';
import { uploadPostImage } from '../../../src/services/storage';
import { useAuth, showToast } from '../../components/AuthProvider';

const slugify = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);

const EMPTY = { id: null, title: '', slug: '', excerpt: '', body: '', tags: '', cover_url: '', published: true };

export default function BlogAdmin() {
  const auth = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('pv_blog_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (!auth?.isAdmin) {
    return (
      <div className="wrap section" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48 }}>🔒</div>
        <h2 style={{ fontFamily: 'var(--display)' }}>Acesso Restrito</h2>
        <p className="text-muted">Apenas administradores podem gerenciar o blog.</p>
      </div>
    );
  }

  const edit = (p) => setForm({
    id: p.id, title: p.title, slug: p.slug, excerpt: p.excerpt || '',
    body: p.body || '', tags: (p.tags || []).join(', '), cover_url: p.cover_url || '',
    published: p.published,
  });
  const reset = () => setForm(EMPTY);

  const onImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const url = await uploadPostImage(reader.result, auth.user?.id || 'admin');
        if (url) { setForm(f => ({ ...f, cover_url: url })); showToast('Capa enviada ✓', 'success'); }
        else showToast('Falha no upload da imagem', 'error');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch { showToast('Erro no upload', 'error'); setUploading(false); }
  };

  // Sobe imagem e insere no corpo como [img:URL] (renderizado como <img> no post).
  const onBodyImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const url = await uploadPostImage(reader.result, auth.user?.id || 'admin');
      if (url) { setForm(f => ({ ...f, body: `${f.body}\n\n[img:${url}]\n\n` })); showToast('Imagem inserida no corpo ✓', 'success'); }
      else showToast('Falha no upload', 'error');
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    if (!form.title.trim()) { showToast('Título obrigatório', 'error'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: (form.slug.trim() || slugify(form.title)),
      excerpt: form.excerpt.trim() || null,
      body: form.body,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      cover_url: form.cover_url.trim() || null,
      author: auth.user?.nome || auth.user?.name || 'Pistaviva',
      published: form.published,
      published_at: form.published ? new Date().toISOString() : null,
    };
    let error;
    if (form.id) ({ error } = await supabase.from('pv_blog_posts').update(payload).eq('id', form.id));
    else ({ error } = await supabase.from('pv_blog_posts').insert(payload));
    setSaving(false);
    if (error) { showToast('Erro ao salvar: ' + error.message, 'error'); return; }
    showToast('Post salvo ✓', 'success');
    reset(); load();
  };

  const remove = async (id) => {
    if (!confirm('Excluir este post?')) return;
    const { error } = await supabase.from('pv_blog_posts').delete().eq('id', id);
    if (error) { showToast('Erro ao excluir', 'error'); return; }
    showToast('Post excluído', 'success'); load();
  };

  const inp = { width: '100%', padding: '10px 12px', marginBottom: 10, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontFamily: 'inherit' };

  return (
    <div className="wrap section" style={{ paddingTop: 'clamp(24px,4vw,48px)' }}>
      <div className="section-head">
        <div><p className="eyebrow eyebrow--moss">Admin</p><h2>Gerenciar Blog</h2></div>
        <Link className="link" href="/admin">← Painel</Link>
      </div>

      {/* FORM */}
      <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.4rem', marginBottom: '2rem' }}>
        <h3 style={{ fontFamily: 'var(--display)', marginBottom: 14 }}>{form.id ? 'Editar post' : 'Novo post'}</h3>
        <input style={inp} placeholder="Título" value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: f.id ? f.slug : slugify(e.target.value) }))} />
        <input style={inp} placeholder="slug-do-post" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
        <input style={inp} placeholder="Resumo (excerpt) — aparece nos cards e no SEO" value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} />
        <input style={inp} placeholder="Tags separadas por vírgula (ex: Big Trail, Mantiqueira)" value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
          <input style={{ ...inp, marginBottom: 0, flex: 1, minWidth: 220 }} placeholder="URL da capa (ou envie abaixo)" value={form.cover_url} onChange={e => setForm(f => ({ ...f, cover_url: e.target.value }))} />
          <label className="btn btn--ghost" style={{ cursor: 'pointer', margin: 0 }}>
            {uploading ? 'Enviando…' : 'Enviar imagem'}
            <input type="file" accept="image/*" hidden onChange={onImage} />
          </label>
        </div>
        {form.cover_url && <img src={form.cover_url} alt="" style={{ maxHeight: 140, borderRadius: 8, marginBottom: 10 }} />}
        <div style={{ marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <label className="btn btn--ghost" style={{ cursor: 'pointer', margin: 0, display: 'inline-flex' }}>
            🖼️ Inserir imagem no corpo
            <input type="file" accept="image/*" hidden onChange={onBodyImage} />
          </label>
          <button type="button" className="btn btn--ghost" onClick={() => setForm(f => ({
            ...f,
            excerpt: f.excerpt || 'Resumo da matéria em 1 ou 2 frases — aparece nos cards e no Google.',
            body: f.body && f.body.trim() ? f.body : `Abertura: um parágrafo forte que resume a matéria e prende o leitor logo de cara.\n\n## Primeiro tópico\nDesenvolva o ponto principal. Use parágrafos curtos e diretos.\n\n## Segundo tópico\nContinue a matéria. Você pode inserir uma imagem no corpo com o botão acima.\n\n## Dicas práticas\nListe o que o leitor precisa saber, item por item.\n\n## Conclusão\nFeche com um resumo e um convite pra comunidade Pistaviva.\n\n## Perguntas frequentes\n### Primeira pergunta que o leitor faria?\nResposta direta e completa (vira rich result no Google).\n### Segunda pergunta?\nOutra resposta clara.`,
          }))}>📋 Usar modelo</button>
        </div>
        <p style={{ fontSize: 11, color: 'var(--paper-mut)', marginBottom: 8, fontFamily: 'var(--mono)' }}>Formatação: linha em branco = novo parágrafo · <b>## </b>título de seção · <b>### </b>subtítulo · imagem vira <b>[img:URL]</b>.</p>
        <textarea style={{ ...inp, minHeight: 220, resize: 'vertical' }} placeholder="Corpo do post (parágrafos separados por linha em branco). Imagens viram [img:URL]." value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} />
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
          <input type="checkbox" checked={form.published} onChange={e => setForm(f => ({ ...f, published: e.target.checked }))} /> Publicado
        </label>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn--primary" onClick={save} disabled={saving}>{saving ? 'Salvando…' : (form.id ? 'Atualizar' : 'Publicar')}</button>
          {form.id && <button className="btn btn--ghost" onClick={reset}>Cancelar</button>}
        </div>
      </div>

      {/* LIST */}
      <h3 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Posts ({posts.length})</h3>
      {loading ? <div className="spinner-wrap"><span className="loading-spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {posts.map(p => (
            <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: p.published ? 'var(--moss)' : 'var(--paper-mut)', flex: '0 0 auto' }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</div>
                <div style={{ fontSize: 12, color: 'var(--paper-mut)', fontFamily: 'var(--mono)' }}>/{p.slug}{p.published ? '' : ' · rascunho'}</div>
              </div>
              <button className="btn btn--ghost" style={{ padding: '.5rem .9rem' }} onClick={() => edit(p)}>Editar</button>
              <button className="btn btn--ghost" style={{ padding: '.5rem .9rem', borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => remove(p.id)}>Excluir</button>
            </div>
          ))}
          {posts.length === 0 && <p style={{ color: 'var(--paper-dim)' }}>Nenhum post ainda. Crie o primeiro acima.</p>}
        </div>
      )}
    </div>
  );
}
