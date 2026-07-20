// Bloco de conteúdo editorial server-rendered pra páginas-ferramenta (comboio, mapa…).
// Garante texto único e substancial no HTML inicial — evita "thin content" pro Google/AdSense.
// Renderiza seções (h2 + parágrafos + lista opcional) e, se houver FAQs, emite FAQPage JSON-LD.

export default function SeoContent({ secoes = [], faqs = [], children }) {
  const faqLd = faqs.length ? {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  } : null;

  return (
    <section className="wrap" style={{ maxWidth: 760, marginInline: 'auto', padding: '8px 0 28px' }}>
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />}

      {secoes.map((s, i) => (
        <div key={i} style={{ marginBottom: 24 }}>
          <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(18px,3vw,22px)', marginBottom: 10 }}>{s.h}</h2>
          {s.p?.map((par, j) => (
            <p key={j} style={{ lineHeight: 1.6, color: 'var(--paper-dim)', margin: '0 0 12px' }}>{par}</p>
          ))}
          {s.lista && (
            <ul style={{ margin: '4px 0 0', paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {s.lista.map((item, j) => (
                <li key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', lineHeight: 1.5, color: 'var(--paper-dim)' }}>
                  <span style={{ color: 'var(--clay)', fontWeight: 800, flexShrink: 0 }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}

      {faqs.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <h2 style={{ fontFamily: 'var(--display)', marginBottom: 12 }}>Perguntas frequentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((f, i) => (
              <div key={i} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px' }}>
                <h3 style={{ fontFamily: 'var(--display)', fontSize: 16, marginBottom: 6 }}>{f.q}</h3>
                <p style={{ color: 'var(--paper-dim)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {children}
    </section>
  );
}
