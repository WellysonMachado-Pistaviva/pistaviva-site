import { ExternalLink, Phone, ShoppingBag } from 'lucide-react';

const STORE_URL = 'https://www.pistaviva.com.br/pistaviva';
const WA_URL    = 'https://wa.me/5535984316992?text=Oi!%20Vi%20a%20loja%20no%20app%20Pista%20Viva%20e%20quero%20saber%20mais!';

const Store = () => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px 24px', textAlign: 'center' }}>
    <div style={{ fontSize: '56px', marginBottom: '20px' }}>👕</div>

    <h2 style={{ fontFamily: 'var(--display)', fontSize: '26px', fontWeight: 900, letterSpacing: '2px', marginBottom: '8px' }}>
      LOJA <span style={{ color: 'var(--accent)' }}>PISTA VIVA</span>
    </h2>
    <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7, marginBottom: '32px', maxWidth: '320px' }}>
      Camisetas exclusivas para quem vive a estrada. Veste a identidade, mostra que é da tribo.
    </p>

    <button
      className="btn-primary"
      onClick={() => window.open(STORE_URL, '_blank')}
      style={{ width: '100%', maxWidth: '300px', marginBottom: '14px', gap: '10px', fontSize: '16px', padding: '16px' }}
    >
      <ShoppingBag size={20} /> ACESSAR A LOJA
    </button>

    <button
      className="btn-whatsapp"
      onClick={() => window.open(WA_URL, '_blank')}
      style={{ width: '100%', maxWidth: '300px', gap: '10px' }}
    >
      <Phone size={16} /> FALAR NO WHATSAPP
    </button>

    <p style={{ marginTop: '24px', fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
      <ExternalLink size={11} /> pistaviva.com.br/pistaviva
    </p>
  </div>
);

export default Store;
