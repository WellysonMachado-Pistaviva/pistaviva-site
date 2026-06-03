// Header server-side (H1 + texto) renderizado no HTML inicial, ACIMA das views SPA
// que sobem com ssr:false. Garante que o Google encontre H1 + conteúdo indexável
// mesmo antes do JS rodar. Componente de servidor (sem 'use client').
export default function SpaIntro({ eyebrow, title, children }) {
  return (
    <header className="spa-intro">
      <div className="wrap">
        {eyebrow && <p className="eyebrow eyebrow--moss">{eyebrow}</p>}
        <h1>{title}</h1>
        {children && <p className="spa-intro__lead">{children}</p>}
      </div>
    </header>
  );
}
