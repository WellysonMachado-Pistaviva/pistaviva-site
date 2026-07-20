import { ExternalLink, Phone, ShoppingBag } from 'lucide-react';

const STORE_URL = 'https://www.pistaviva.com.br/pistaviva';
const WA_URL    = 'https://wa.me/5535984316992?text=Oi!%20Vi%20a%20loja%20no%20app%20Pista%20Viva%20e%20quero%20saber%20mais!';

const Store = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '64vh', padding: '56px 24px', textAlign: 'center' }}>
    <span style={{ fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '.22em', fontSize: 12, color: 'var(--accent)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <span style={{ width: 26, height: 2, background: 'var(--accent)' }} /> Vestuário de estrada
    </span>

    <h2 style={{ fontFamily: 'var(--display)', fontSize: 'clamp(40px,8vw,72px)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-.01em', lineHeight: .92, marginBottom: 16 }}>
      Loja <span style={{ color: 'var(--accent)' }}>Pistaviva</span>
    </h2>
    <p style={{ fontFamily: 'var(--font)', color: 'var(--paper-dim)', fontSize: 16, lineHeight: 1.55, marginBottom: 34, maxWidth: '40ch' }}>
      Roupa técnica e casual pra quem passa o dia no banco da moto. Veste a identidade, mostra que é da tribo.
    </p>

    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
      <button className="btn-primary" onClick={() => window.open(STORE_URL, '_blank')} style={{ gap: 10, padding: '16px 28px' }}>
        <ShoppingBag size={18} /> Acessar a loja <ExternalLink size={14} />
      </button>
      <button className="btn-outline" onClick={() => window.open(WA_URL, '_blank')} style={{ gap: 10, padding: '15px 26px' }}>
        <Phone size={16} /> Falar no WhatsApp
      </button>
    </div>

    <p style={{ marginTop: 26, fontFamily: 'var(--mono)', fontSize: 12, letterSpacing: '.06em', color: 'var(--paper-mut)', display: 'flex', alignItems: 'center', gap: 5 }}>
      <ExternalLink size={11} /> pistaviva.com.br/pistaviva
    </p>
  </div>
);

export default Store;
