import { useState, useEffect } from 'react';
import { ExternalLink, MapPin, RefreshCw } from 'lucide-react';
import { getExpeditions } from '../services/storage';

const EXPEDITIONS_FALLBACK = [
  {
    id: 'up2',
    operator: { name: 'UPSERRA', badge: 'PARCEIRO VERIFICADO', color: '#ff6200', instagram: 'https://instagram.com/upserraoficial', site: 'https://upserra.com.br' },
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800',
    difficulty: 'AVANÇADO',
    diffColor: '#ef4444',
    stats: [
      { label: 'Distância', value: '580', unit: 'km' },
      { label: 'Alt. Máx.', value: '1.800', unit: 'm' },
      { label: 'Duração', value: '5', unit: 'dias' },
    ],
    title: 'Caminhos da Serra Catarinense',
    region: 'Santa Catarina',
    desc: 'Circuito completo pelas serras de SC: Rio do Rastro, Graciosa, Urubici e São Joaquim. Frio, neblina e paisagens únicas no sul do Brasil.',
    tags: ['Circuito', 'SC', 'Frio', 'Off-road'],
  },
  {
    id: 'up3',
    operator: { name: 'UPSERRA', badge: 'PARCEIRO VERIFICADO', color: '#ff6200', instagram: 'https://instagram.com/upserraoficial', site: 'https://upserra.com.br' },
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    difficulty: 'FÁCIL',
    diffColor: '#22c55e',
    stats: [
      { label: 'Distância', value: '180', unit: 'km' },
      { label: 'Vagas', value: '8', unit: 'rest.' },
      { label: 'Duração', value: '2', unit: 'dias' },
    ],
    title: 'Estrada da Graciosa — PR-410',
    region: 'Morretes, PR',
    desc: 'PR-410 histórica, proibida para caminhões. Mata Atlântica densa e vista da Serra do Mar. Almoço de barreado em Morretes incluído.',
    tags: ['Graciosa', 'PR', 'Iniciante', 'Weekend'],
  },

  // ── MOTO NOMADS ──────────────────────────────────────────────
  {
    id: 'mn1',
    operator: { name: 'MOTONOMADS', badge: 'EXPEDIÇÃO AVENTURA', color: '#fff', instagram: 'https://instagram.com/motonomads', site: 'https://motonomads.com' },
    image: 'https://images.unsplash.com/photo-1591637333184-19aa84b3e01f?auto=format&fit=crop&q=80&w=800',
    difficulty: 'EXPERT',
    diffColor: '#ef4444',
    stats: [
      { label: 'Distância', value: '2.840', unit: 'km' },
      { label: 'Alt. Máx.', value: '4.800', unit: 'm' },
      { label: 'Off-Road', value: '40', unit: '%' },
    ],
    title: 'Deserto do Atacama — GS Edition',
    region: 'Chile / Bolívia',
    desc: 'O deserto mais árido do mundo em uma expedição de alto nível. Telemetria avançada, suporte técnico completo e rota exclusiva para big trails.',
    tags: ['Internacional', 'Atacama', 'Big Trail', 'Expert'],
  },
  {
    id: 'mn2',
    operator: { name: 'MOTONOMADS', badge: 'EXPEDIÇÃO AVENTURA', color: '#fff', instagram: 'https://instagram.com/motonomads', site: 'https://motonomads.com' },
    image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800',
    difficulty: 'AVANÇADO',
    diffColor: '#ef4444',
    stats: [
      { label: 'Distância', value: '1.200', unit: 'km' },
      { label: 'Alt. Máx.', value: '2.800', unit: 'm' },
      { label: 'Duração', value: '7', unit: 'dias' },
    ],
    title: 'Rota da Fé — Nordeste Extremo',
    region: 'CE / PI / MA',
    desc: 'Lençóis Maranhenses, Serra da Ibiapaba e litoral nordestino em uma expedição que mistura aventura, cultura e paisagens únicas do Brasil.',
    tags: ['Nordeste', 'Lençóis', 'Aventura', 'Multi-dia'],
  },
  {
    id: 'mn3',
    operator: { name: 'MOTONOMADS', badge: 'EXPEDIÇÃO AVENTURA', color: '#fff', instagram: 'https://instagram.com/motonomads', site: 'https://motonomads.com' },
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=800',
    difficulty: 'INTERMEDIÁRIO',
    diffColor: '#ff6200',
    stats: [
      { label: 'Distância', value: '900', unit: 'km' },
      { label: 'Off-Road', value: '25', unit: '%' },
      { label: 'Duração', value: '5', unit: 'dias' },
    ],
    title: 'Chapada dos Veadeiros — GO',
    region: 'Alto Paraíso, GO',
    desc: 'Cerrado, cachoeiras e asfalto de qualidade. Rota que passa por Pirenópolis, Alto Paraíso e pelos cânions do Parque Nacional da Chapada.',
    tags: ['GO', 'Cerrado', 'Cachoeiras', 'Natureza'],
  },
]; // fim do fallback EXPEDITIONS_FALLBACK

const OPERATORS = ['Todos', 'UPSERRA', 'MOTONOMADS'];
const DIFFICULTIES = ['Todas', 'FÁCIL', 'INTERMEDIÁRIO', 'AVANÇADO', 'EXPERT'];

// ── Card de Expedição ─────────────────────────────────────────
const ExpeditionCard = ({ exp }) => {
  const op = exp.operator;
  return (
    <article style={{ background: '#111', border: '1px solid #1f1f1f', marginBottom: '2px' }}>

      {/* Operador */}
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ width: '34px', height: '34px', border: `1.5px solid ${op.color}`, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 900, color: op.color, flexShrink: 0 }}>
          {op.name.slice(0, 2)}
        </div>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 900, letterSpacing: '.5px' }}>{op.name}</div>
          <div style={{ fontSize: '10px', color: op.color, fontWeight: 700, letterSpacing: '1px' }}>● {op.badge}</div>
        </div>
      </div>

      {/* Imagem */}
      <div style={{ position: 'relative', height: '220px', overflow: 'hidden' }}>
        <img
          src={exp.image} alt={exp.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.target.style.background = '#1a1a1a'; e.target.style.display = 'none'; }}
        />
        <div style={{ position: 'absolute', bottom: 0, left: 0, background: exp.diffColor, color: exp.diffColor === '#22c55e' ? '#000' : '#fff', padding: '5px 14px', fontSize: '10px', fontWeight: 900, letterSpacing: '1.5px' }}>
          {exp.difficulty}
        </div>
        <div style={{ position: 'absolute', bottom: 0, right: 0, background: 'rgba(0,0,0,.7)', color: '#fff', padding: '5px 12px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={11} /> {exp.region}
        </div>
      </div>

      {/* Telemetria */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', borderBottom: '1px solid #1a1a1a' }}>
        {exp.stats.map((s, i) => (
          <div key={i} style={{ padding: '12px 16px', borderRight: i < 2 ? '1px solid #1a1a1a' : 'none' }}>
            <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '.5px', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '20px', fontWeight: 900, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
              {s.value}<span style={{ fontSize: '11px', color: '#666', fontWeight: 700 }}>{s.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Corpo */}
      <div style={{ padding: '16px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 900, margin: '0 0 6px', lineHeight: 1.1, textTransform: 'uppercase', letterSpacing: '-.5px' }}>
          {exp.title}
        </h2>
        <p style={{ fontSize: '13px', color: '#888', marginBottom: '14px', lineHeight: 1.5 }}>{exp.desc}</p>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {exp.tags.map(t => (
            <span key={t} style={{ padding: '3px 9px', border: '1px solid #2a2a2a', fontSize: '10px', fontWeight: 700, color: '#888', letterSpacing: '.5px' }}>
              {t}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <a
            href={op.instagram} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '13px', background: 'transparent', border: '1px solid #2a2a2a', color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}
          >
            📸 INSTAGRAM
          </a>
          <a
            href={op.site} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '13px', background: '#ff6200', border: '1px solid #ff6200', color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}
          >
            <ExternalLink size={14} /> VER ROTEIRO
          </a>
        </div>
      </div>
    </article>
  );
};

// ── Página principal ──────────────────────────────────────────
const Expeditions = () => {
  const [data, setData]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [opFilter, setOpFilter]     = useState('Todos');
  const [diffFilter, setDiffFilter] = useState('Todas');

  useEffect(() => {
    getExpeditions()
      .then(d => { setData(d.length ? d : EXPEDITIONS_FALLBACK); setLoading(false); })
      .catch(() => { setData(EXPEDITIONS_FALLBACK); setLoading(false); });
  }, []);

  // Operadores dinâmicos a partir dos dados
  const operators = ['Todos', ...new Set(data.map(e => e.operator.name))];

  const filtered = data.filter(e =>
    (opFilter === 'Todos' || e.operator.name === opFilter) &&
    (diffFilter === 'Todas' || e.difficulty === diffFilter)
  );

  return (
    <div style={{ background: '#000', minHeight: '100vh', paddingBottom: '100px' }}>

      {/* Header editorial */}
      <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid #1a1a1a' }}>
        <div style={{ fontSize: '11px', color: '#555', fontWeight: 700, letterSpacing: '2px', marginBottom: '6px' }}>
          PISTA<span style={{ color: '#ff6200' }}>VIVA</span> × PARCEIROS
        </div>
        <h2 style={{ fontFamily: 'var(--display)', fontSize: '28px', fontWeight: 900, letterSpacing: '-1px', lineHeight: 1, margin: 0 }}>
          EXPEDIÇÕES
        </h2>
        <p style={{ fontSize: '12px', color: '#555', marginTop: '6px', letterSpacing: '.3px' }}>
          Destinos épicos com operadores verificados
        </p>
      </div>

      {/* Filtros — scrolláveis, sem corte */}
      <div style={{ display:'flex', overflowX:'auto', padding:'10px 12px', gap:'7px', borderBottom:'1px solid #1a1a1a', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
        {operators.map(op => (
          <button key={op} onClick={() => setOpFilter(op)} style={{
            padding:'6px 14px', border:`1px solid ${opFilter===op?'#ff6200':'#222'}`,
            background: opFilter===op ? '#ff6200' : 'transparent',
            color: opFilter===op ? '#fff' : '#666',
            fontSize:'11px', fontWeight:800, letterSpacing:'1px',
            textTransform:'uppercase', whiteSpace:'nowrap', cursor:'pointer', flexShrink:0,
          }}>{op}</button>
        ))}
      </div>
      <div style={{ display:'flex', overflowX:'auto', padding:'8px 12px', gap:'6px', borderBottom:'1px solid #1a1a1a', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
        {DIFFICULTIES.map(d => (
          <button key={d} onClick={() => setDiffFilter(d)} style={{
            padding:'5px 11px', border:`1px solid ${diffFilter===d?'#fff':'#1f1f1f'}`,
            background: diffFilter===d ? '#fff' : 'transparent',
            color: diffFilter===d ? '#000' : '#555',
            fontSize:'10px', fontWeight:800, letterSpacing:'.5px',
            textTransform:'uppercase', whiteSpace:'nowrap', cursor:'pointer', flexShrink:0,
          }}>{d}</button>
        ))}
      </div>

      {/* Parceiros destaque */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1a1a1a', borderBottom: '1px solid #1a1a1a', borderTop: '1px solid #1a1a1a' }}>
        {[
          { name: 'UPSERRA', sub: 'Serra Catarinense', url: 'https://upserra.com.br', ig: 'https://instagram.com/upserraoficial' },
          { name: 'MOTONOMADS', sub: 'Expedições Adventure', url: 'https://motonomads.com', ig: 'https://instagram.com/motonomads' },
        ].map(p => (
          <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', flexDirection: 'column', padding: '14px 16px', background: '#080808', textDecoration: 'none', borderRight: '1px solid #1a1a1a' }}>
            <div style={{ fontSize: '13px', fontWeight: 900, color: '#fff', letterSpacing: '.5px' }}>{p.name}</div>
            <div style={{ fontSize: '11px', color: '#ff6200', fontWeight: 700, marginTop: '2px' }}>{p.sub}</div>
            <div style={{ fontSize: '10px', color: '#444', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ExternalLink size={9} /> {p.url.replace('https://', '')}
            </div>
          </a>
        ))}
      </div>

      {/* Cards */}
      <div style={{ marginTop: '1px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#444' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏍️</div>
            <p style={{ fontWeight: 700 }}>Nenhuma expedição para esse filtro.</p>
          </div>
        ) : (
          filtered.map(exp => <ExpeditionCard key={exp.id} exp={exp} />)
        )}
      </div>

      {/* Banner parceria */}
      <div style={{ margin: '2px 0 0', padding: '24px 16px', background: '#0a0a0a', borderTop: '1px solid #1a1a1a', textAlign: 'center' }}>
        <div style={{ fontSize: '10px', color: '#444', fontWeight: 700, letterSpacing: '2px', marginBottom: '8px' }}>QUER SER PARCEIRO?</div>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px', lineHeight: 1.6 }}>
          Sua empresa de expedições ou mototurismo pode aparecer aqui para milhares de pilotos.
        </p>
        <a
          href="https://wa.me/5535984316992?text=Olá!%20Quero%20ser%20parceiro%20Pista%20Viva%20—%20Expedições"
          target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: '#25d366', color: '#fff', textDecoration: 'none', fontSize: '12px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase' }}
        >
          FALAR NO WHATSAPP
        </a>
      </div>
    </div>
  );
};

export default Expeditions;
