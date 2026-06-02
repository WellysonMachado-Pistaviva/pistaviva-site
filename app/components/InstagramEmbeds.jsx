'use client';
import { useEffect } from 'react';

// Embeds oficiais do Instagram (posts e reels/vídeos). urls = lista de permalinks.
export default function InstagramEmbeds({ urls = [] }) {
  useEffect(() => {
    const ID = 'instagram-embed-js';
    const process = () => window.instgrm?.Embeds?.process();
    if (document.getElementById(ID)) { process(); return; }
    const s = document.createElement('script');
    s.id = ID; s.src = 'https://www.instagram.com/embed.js'; s.async = true;
    s.onload = process;
    document.body.appendChild(s);
  }, [urls]);

  if (!urls.length) return null;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
      {urls.map((url, i) => (
        <blockquote
          key={i}
          className="instagram-media"
          data-instgrm-permalink={url}
          data-instgrm-version="14"
          style={{ background: '#fff', border: 0, borderRadius: 12, margin: 0, padding: 0, width: '100%', minWidth: 0 }}
        />
      ))}
    </div>
  );
}
