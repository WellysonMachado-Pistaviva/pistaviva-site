import { useState, useEffect } from 'react';
import { MessageSquare, Heart, Camera, Send, Share2, X, Image as ImageIcon } from 'lucide-react';
import { getPosts, addPost, likePost, addComment, uploadPostImage, reportContent } from '../services/storage';
import PhotoCarousel from '../../app/components/PhotoCarousel';

const showErr = (msg) => {
  const el = document.getElementById('app-toast');
  if (el) { el.textContent = msg; el.className = 'toast error'; el.style.display = 'block'; setTimeout(() => { el.style.display = 'none'; }, 4000); }
};

const SkeletonPost = () => (
  <div style={{ padding: '20px', borderRadius: 'var(--radius)', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
    <div className="skeleton skeleton-card" style={{ height: '200px', marginBottom: '16px' }} />
    <div className="skeleton skeleton-text w-60" />
    <div className="skeleton skeleton-text w-80" />
    <div className="skeleton skeleton-text w-40" />
  </div>
);

const FEED_FILTERS = [
  { key: 'todos',      label: '🔥 Todos' },
  { key: 'viagem',    label: '🏍️ Viagem' },
  { key: 'bateevolta',label: '↩️ Bate e Volta' },
  { key: 'trilha',    label: '🌿 Trilha' },
  { key: 'evento',    label: '🎉 Evento' },
];

const Feed = ({ deviceId = 'anon', identity, promptIdentity }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [newPost, setNewPost] = useState({ name: identity?.nome || '', originCity: identity?.cidade || '', originUf: identity?.uf || '', city: '', uf: '', category: 'viagem', comment: '', images: [] });
  const [commentInputs, setCommentInputs] = useState({});
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [likedPosts, setLikedPosts] = useState({});
  const [activeFilter, setActiveFilter] = useState('todos');

  const loadPosts = async () => {
    setLoading(true);
    const data = await getPosts(deviceId);
    setPosts(data);
    const liked = {};
    data.forEach(p => { if (p.likedByCurrentUser) liked[p.id] = true; });
    setLikedPosts(liked);
    setLoading(false);
  };

  useEffect(() => {
    (async () => { await loadPosts(); })();
    // carrega uma vez na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLocationSuggestions = async (query) => {
    if (query.length < 3) { setLocationSuggestions([]); return; }
    try {
      const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&language=pt&count=5`);
      const data = await res.json();
      setLocationSuggestions(data.results || []);
      setShowSuggestions(true);
    } catch { /* silent */ }
  };

  const selectLocation = (loc) => {
    setNewPost({ ...newPost, city: `${loc.name}${loc.admin1 ? ', ' + loc.admin1 : ''}`, uf: loc.admin1 || '' });
    setShowSuggestions(false);
    setLocationSuggestions([]);
  };

  const handleShare = async (post) => {
    const url = `${window.location.origin}/comunidade/${post.id}`;
    const title = `${categoryLabels[post.category] || 'Relato'} em ${post.city || 'na estrada'}`;
    const data = { title, text: post.comment, url };
    if (navigator.share) {
      try { await navigator.share(data); } catch { /* compartilhamento cancelado */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      const el = document.getElementById('app-toast');
      if (el) { el.textContent = 'Link copiado'; el.className = 'toast'; el.style.display = 'block'; setTimeout(() => { el.style.display = 'none'; }, 2500); }
    } catch { showErr('Não foi possível copiar o link.'); }
  };

  const handlePost = async () => {
    if (!newPost.name || !newPost.city || !newPost.comment || !newPost.images?.length) return;
    setIsPosting(false); // Hide immediately for better UX
    const urls = [];
    for (const im of newPost.images) {
      let u = im;
      if (u.startsWith('data:')) u = (await uploadPostImage(u, deviceId)) || u;
      urls.push(u);
    }
    const origin = [newPost.originCity?.trim(), newPost.originUf?.trim()].filter(Boolean).join('/');
    const signature = origin ? `${newPost.name.trim()} · ${origin}` : newPost.name.trim();
    const result = await addPost({ ...newPost, images: urls, image: urls[0], user: signature }, deviceId);
    if (result?.ok) {
      setNewPost({ name: newPost.name, originCity: newPost.originCity, originUf: newPost.originUf, city: '', uf: '', category: 'viagem', comment: '', images: [] });
      loadPosts(); // Refresh feed
    } else {
      showErr('Erro ao publicar. Verifique sua conexão e tente novamente.');
      setIsPosting(true); // Reopen form so user can try again
    }
  };

  const handleLike = async (id) => {
    const isLiked = likedPosts[id];

    // Optimistic UI update
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p));
    setLikedPosts(prev => ({ ...prev, [id]: !isLiked }));

    await likePost(id, deviceId);
  };

  const handleReport = async (post) => {
    const reason = window.prompt('Por que está denunciando este post? (spam, ofensa, etc.)');
    if (reason === null) return;
    const ok = await reportContent('post', post.id, `${post.user}: ${(post.comment || '').slice(0, 50)}`, reason, { id: deviceId, nome: identity?.nome || 'Anônimo' });
    const el = document.getElementById('app-toast');
    if (el) { el.textContent = ok ? 'Denúncia enviada. Obrigado!' : 'Erro ao denunciar.'; el.className = `toast ${ok ? 'success' : 'error'}`; el.style.display = 'block'; setTimeout(() => { el.style.display = 'none'; }, 3000); }
  };

  const handleAddComment = async (postId) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    // Pega um nome: identidade da sessão ou pede na hora.
    let nome = identity?.nome;
    if (!nome) { const id = await promptIdentity?.(); if (!id) return; nome = id.nome; }

    // Optimistic UI update
    setPosts(prev => prev.map(p => {
      if (p.id !== postId) return p;
      return { ...p, comments: [...p.comments, { id: Date.now(), user: nome, text }] };
    }));
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    await addComment(postId, deviceId, nome, text);
  };

  const categoryLabels = { viagem: '🏍️ Viagem', bateevolta: '↩️ Bate e Volta', trilha: '🌿 Trilha', evento: '🎉 Evento' };

  const visiblePosts = activeFilter === 'todos'
    ? posts
    : posts.filter(p => p.category === activeFilter);

  return (
    <div className="feed-page">
      <div className="page-header">
        <h1 className="page-title">COMUNIDADE</h1>
        <p className="page-subtitle">Aventuras compartilhadas pelos membros</p>
      </div>

      {/* Category filter bar */}
      <div className="filter-bar" style={{ marginBottom: '4px' }}>
        {FEED_FILTERS.map(f => (
          <button
            key={f.key}
            className={`filter-chip ${activeFilter === f.key ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px' }}>
        {/* Post CTA */}
        {!isPosting ? (
          <button
            onClick={() => setIsPosting(true)}
            style={{
              width: '100%', padding: '18px 24px', borderRadius: '4px',
              background: 'var(--bg2)', border: '1px solid var(--border)',
              color: 'var(--muted)', textAlign: 'left', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '12px', transition: 'var(--transition)',
              fontFamily: 'var(--font)', fontSize: '15px',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <Camera size={20} color="var(--accent)" />
            Compartilhe sua estrada...
          </button>
        ) : (
          <div className="calc-card glass reveal visible" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800 }}>NOVO POST</h3>
              <button className="btn-ghost" onClick={() => setIsPosting(false)}><X size={20} /></button>
            </div>

            {/* Image upload — múltiplas fotos (até 5, viram carrossel) */}
            <div className="calc-field">
              <label>Fotos da galeria (até 5)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {newPost.images.map((src, i) => (
                  <div key={i} style={{ position: 'relative', aspectRatio: '1/1', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button type="button" onClick={() => setNewPost(p => ({ ...p, images: p.images.filter((_, k) => k !== i) }))}
                      style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.7)', color: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center' }} aria-label="Remover foto"><X size={13} /></button>
                    {i === 0 && <span style={{ position: 'absolute', bottom: 4, left: 4, fontSize: 9, fontWeight: 800, background: 'var(--accent)', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>CAPA</span>}
                  </div>
                ))}
                {newPost.images.length < 5 && (
                  <div onClick={() => document.getElementById('file-upload').click()}
                    style={{ aspectRatio: '1/1', border: '2px dashed var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, background: 'rgba(255,255,255,.02)' }}>
                    <ImageIcon size={28} color="var(--accent)" />
                    <p style={{ fontSize: '11px', color: 'var(--muted)' }}>Adicionar</p>
                  </div>
                )}
              </div>
              <input id="file-upload" type="file" accept="image/*" multiple style={{ display: 'none' }}
                onChange={e => {
                  const files = Array.from(e.target.files || []);
                  files.forEach(file => {
                    const reader = new FileReader();
                    reader.onload = ev => setNewPost(p => (p.images.length >= 5 ? p : { ...p, images: [...p.images, ev.target.result].slice(0, 5) }));
                    reader.readAsDataURL(file);
                  });
                  e.target.value = '';
                }} />
            </div>

            {/* Identificação — nome + de onde é (sem login) */}
            <div className="calc-field">
              <label>Seu nome</label>
              <input type="text" placeholder="Como assinar o post" value={newPost.name}
                onChange={e => setNewPost({ ...newPost, name: e.target.value })} />
            </div>
            <div className="calc-field">
              <label>De onde você é <span style={{ color: 'var(--muted)', fontWeight: 400 }}>(opcional)</span></label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="text" placeholder="Cidade" style={{ flex: 1 }} value={newPost.originCity || ''}
                  onChange={e => setNewPost({ ...newPost, originCity: e.target.value })} />
                <input type="text" placeholder="UF" maxLength={2} style={{ width: 70 }} value={newPost.originUf || ''}
                  onChange={e => setNewPost({ ...newPost, originUf: e.target.value.toUpperCase() })} />
              </div>
            </div>

            {/* Location */}
            <div className="calc-field" style={{ position: 'relative' }}>
              <label>Localização da viagem</label>
              <div style={{ position: 'relative' }}>
                <input type="text" placeholder="Ex: Tiradentes, MG"
                  value={newPost.city}
                  onChange={e => { setNewPost({ ...newPost, city: e.target.value }); fetchLocationSuggestions(e.target.value); }} />
                {showSuggestions && locationSuggestions.length > 0 && (
                  <ul className="autocomplete-list" style={{ position: 'absolute', width: '100%', zIndex: 50 }}>
                    {locationSuggestions.map((s, i) => (
                      <li key={i} onClick={() => selectLocation(s)}>{s.name} <small>{s.admin1 || s.country}</small></li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Category */}
            <div className="calc-field">
              <label>Categoria</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {Object.entries(categoryLabels).map(([k, v]) => (
                  <button key={k} onClick={() => setNewPost({ ...newPost, category: k })} style={{
                    padding: '8px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
                    fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.06em',
                    border: `1.5px solid ${newPost.category === k ? 'var(--accent)' : 'var(--border)'}`,
                    background: newPost.category === k ? 'var(--accent)' : 'transparent',
                    color: newPost.category === k ? '#fff' : 'var(--paper-dim)',
                    cursor: 'pointer', transition: '.15s'
                  }}>{v}</button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="calc-field">
              <label>Relato <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({newPost.comment.length}/280)</span></label>
              <textarea
                placeholder="Como foi a viagem? Alguma dica?"
                value={newPost.comment}
                maxLength={280}
                onChange={e => setNewPost({ ...newPost, comment: e.target.value })}
              />
            </div>

            <button className="btn-primary" onClick={handlePost} disabled={!newPost.name || !newPost.city || !newPost.image || !newPost.comment}>
              <Camera size={16} /> PUBLICAR NO FEED
            </button>
          </div>
        )}

        {/* Feed list */}
        {loading ? (
          [1, 2].map(i => <SkeletonPost key={i} />)
        ) : visiblePosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏍️</div>
            <p style={{ fontWeight: 700, marginBottom: '4px' }}>
              {posts.length === 0 ? 'Seja o primeiro a postar!' : 'Nenhum post nessa categoria ainda.'}
            </p>
            <p style={{ fontSize: '13px' }}>
              {posts.length === 0 ? 'Compartilhe sua aventura com a comunidade.' : 'Tente outro filtro ou publique algo novo!'}
            </p>
          </div>
        ) : visiblePosts.map(post => (
          <div key={post.id} className="dest-card featured glass" style={{ overflow: 'hidden' }}>
            {/* Foto(s) — carrossel quando tem mais de uma */}
            <div style={{ width: '100%', flexShrink: 0 }}>
              {(post.images && post.images.length > 1)
                ? <PhotoCarousel images={post.images} height={400} alt={post.city} radius={0} />
                : <div style={{ width: '100%', aspectRatio: '1/1', overflow: 'hidden' }}><img src={post.image} alt={post.city} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>}
            </div>
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '17px' }}>{post.city}</div>
                  <div className="text-muted" style={{ fontSize: '12px', marginTop: '2px' }}>
                    {post.user} · {post.date}
                  </div>
                </div>
                <span className="badge">{categoryLabels[post.category] || post.category}</span>
              </div>
              <p style={{ fontSize: '14px', lineHeight: '1.65', color: 'var(--text)', margin: '12px 0' }}>{post.comment}</p>

              {/* Actions */}
              <div className="post-actions-row">
                <button
                  className={`post-action-btn ${likedPosts[post.id] ? 'liked' : ''}`}
                  onClick={() => handleLike(post.id)}
                  style={{ transform: likedPosts[post.id] ? 'scale(1.15)' : 'scale(1)', transition: 'transform .2s' }}
                >
                  <Heart size={18} fill={likedPosts[post.id] ? 'var(--danger)' : 'none'} />
                  <span>{post.likes || 0}</span>
                </button>
                <div className="post-action-btn">
                  <MessageSquare size={18} />
                  <span>{(post.comments || []).length}</span>
                </div>
                <button className="post-action-btn" onClick={() => handleShare(post)} aria-label="Compartilhar relato">
                  <Share2 size={18} />
                  <span>Compartilhar</span>
                </button>
                <button className="post-action-btn" style={{ marginLeft: 'auto', color: 'var(--muted)' }} title="Denunciar"
                  onClick={() => handleReport(post)}>⚠</button>
              </div>

              {/* Always-visible comment box */}
              <div className="comment-box">
                <div style={{ maxHeight: '140px', overflowY: 'auto', marginBottom: '12px' }}>
                  {(post.comments || []).length === 0 ? (
                    <p className="text-muted" style={{ textAlign: 'center', padding: '8px 0' }}>Seja o primeiro a comentar!</p>
                  ) : (post.comments || []).map((c, idx) => (
                    <div key={c.id || idx} className="comment-item">
                      <strong style={{ color: 'var(--accent)', fontSize: '13px' }}>{c.user} </strong>
                      <span className="text-muted">{c.text}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="text" placeholder="Comentar..." style={{ fontSize: '13px', padding: '10px 14px' }}
                    value={commentInputs[post.id] || ''}
                    onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(post.id); } }}
                  />
                  <button className="btn-primary" style={{ width: '44px', height: '44px', padding: 0, flexShrink: 0 }}
                    onClick={() => handleAddComment(post.id)}>
                    <Send size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feed;
