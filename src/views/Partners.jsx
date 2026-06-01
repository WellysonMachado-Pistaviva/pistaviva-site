import { useState, useEffect } from 'react';
import { Store, Shield, Wrench, Coffee, Fuel, Hotel, ExternalLink, Phone } from 'lucide-react';
import { getPartners } from '../services/storage';

const CATEGORY_ICONS = {
  'Oficina': { icon: <Wrench size={22} />, color: 'hsl(24,94%,53%)', bg: 'hsla(24,94%,53%,.1)' },
  'Café / Alimentação': { icon: <Coffee size={22} />, color: 'hsl(142,71%,45%)', bg: 'hsla(142,71%,45%,.1)' },
  'Seguro': { icon: <Shield size={22} />, color: 'hsl(239,84%,67%)', bg: 'hsla(239,84%,67%,.1)' },
  'Combustível': { icon: <Fuel size={22} />, color: 'hsl(45,96%,53%)', bg: 'hsla(45,96%,53%,.1)' },
  'Hospedagem': { icon: <Hotel size={22} />, color: 'hsl(200,80%,55%)', bg: 'hsla(200,80%,55%,.1)' },
  'Outro': { icon: <Store size={22} />, color: 'var(--muted)', bg: 'rgba(255,255,255,.05)' },
};

const detectCategory = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('oficina') || t.includes('moto') || t.includes('mecân')) return 'Oficina';
  if (t.includes('café') || t.includes('comida') || t.includes('parada') || t.includes('restaur')) return 'Café / Alimentação';
  if (t.includes('seguro') || t.includes('corretora')) return 'Seguro';
  if (t.includes('combust') || t.includes('posto')) return 'Combustível';
  if (t.includes('hosped') || t.includes('pousad') || t.includes('hotel')) return 'Hospedagem';
  return 'Outro';
};

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [activeFilter, setActiveFilter] = useState('Todos');

  useEffect(() => {
    getPartners().then(setPartners);
  }, []);

  const categories = ['Todos', ...Object.keys(CATEGORY_ICONS)];

  const filtered = activeFilter === 'Todos'
    ? partners
    : partners.filter(p => detectCategory(p.type) === activeFilter);

  const getCfg = (type) => CATEGORY_ICONS[detectCategory(type)] || CATEGORY_ICONS['Outro'];

  return (
    <div className="partners-page">
      <div className="page-header">
        <h2 className="page-title">PARCEIROS</h2>
        <p className="page-subtitle">Benefícios exclusivos para a comunidade Pista Viva</p>
      </div>

      {/* Filter bar */}
      <div className="filter-bar" style={{ marginBottom: '20px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`filter-chip ${activeFilter === cat ? 'active' : ''}`}
            onClick={() => setActiveFilter(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🔍</div>
          <p style={{ fontWeight: 700, marginBottom: '4px' }}>Nenhum parceiro nessa categoria ainda.</p>
          <p style={{ fontSize: '13px' }}>Em breve mais parceiros por aqui!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((par, i) => {
            const cfg = getCfg(par.type);
            return (
              <div
                key={par.id || i}
                style={{
                  display: 'flex', gap: '16px', padding: '18px 20px',
                  background: 'var(--bg2)', borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)', alignItems: 'center',
                  transition: 'var(--transition)',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = cfg.color + '60'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = ''; }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px', flexShrink: 0,
                  background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: cfg.color, border: `1px solid ${cfg.color}30`,
                }}>
                  {cfg.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 800, fontSize: '15px' }}>{par.name}</span>
                    <span style={{
                      padding: '2px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 700,
                      letterSpacing: '1px', color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}30`,
                    }}>{detectCategory(par.type).toUpperCase()}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', lineHeight: '1.5' }}>{par.desc}</p>
                </div>

                <a
                  href={par.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '40px', height: '40px', borderRadius: 'var(--radius-xs)', flexShrink: 0,
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--muted)', transition: 'var(--transition)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                  title="Contato"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            );
          })}
        </div>
      )}

      {/* CTA para novos parceiros */}
      <div style={{
        marginTop: '32px', padding: '28px 24px', borderRadius: 'var(--radius)',
        background: 'var(--bg2)', border: '1px solid var(--border)', textAlign: 'center',
      }}>
        <div style={{
          width: '56px', height: '56px', borderRadius: '16px', margin: '0 auto 16px',
          background: 'var(--accent-subtle)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', color: 'var(--accent)', border: '1px solid rgba(249,115,22,.2)',
        }}>
          <Store size={26} />
        </div>
        <h3 style={{ fontFamily: 'var(--display)', marginBottom: '8px' }}>QUER SER PARCEIRO?</h3>
        <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '20px', lineHeight: '1.6' }}>
          Divulgue seu estabelecimento para milhares de motociclistas ativos.
        </p>
        <button
          className="btn-whatsapp"
          style={{ maxWidth: '280px', margin: '0 auto' }}
          onClick={() => window.open('https://wa.me/5531999999999?text=Ol%C3%A1%2C+gostaria+de+ser+parceiro+Pista+Viva!', '_blank')}
        >
          <Phone size={16} /> FALAR NO WHATSAPP
        </button>
      </div>
    </div>
  );
};

export default Partners;
