'use client';

import { useState } from 'react';
import { Compass, Newspaper, Flame, ExternalLink, Search, Globe, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { id: 'Todos', label: 'Todos os Sites', icon: null },
  { id: 'Notícias', label: 'Notícias & Mercado', icon: <Newspaper size={16} /> },
  { id: 'Mototurismo', label: 'Mototurismo & Viagens', icon: <Compass size={16} /> },
  { id: 'Cultura', label: 'Cultura & Estilo de Vida', icon: <Flame size={16} /> }
];

const SITES = [
  {
    name: 'Motonline',
    url: 'https://www.motonline.com.br',
    category: 'Notícias',
    tags: ['Fórum', 'Classificados', 'Testes', 'Preços'],
    description: 'Um dos maiores e mais antigos portais de motos do Brasil. Destaca-se pelo seu fórum extremamente ativo de discussão, classificados de motos e guias detalhados de testes de lançamentos.'
  },
  {
    name: 'Revista Duas Rodas',
    url: 'https://www.revistaduasrodas.com.br',
    category: 'Notícias',
    tags: ['Revista', 'Avaliações', 'Compra', 'Histórico'],
    description: 'Referência jornalística histórica no setor de duas rodas. Oferece testes de performance rigorosos, comparativos de mercado e guias completos para o comprador de motocicletas.'
  },
  {
    name: 'Motociclismo Online',
    url: 'https://www.motociclismoonline.com.br',
    category: 'Notícias',
    tags: ['Novidades', 'Fichas Técnicas', 'Mercado'],
    description: 'Excelente portal de cobertura jornalística diária sobre o mercado nacional e internacional. Conta com fichas técnicas e testes detalhados de lançamentos.'
  },
  {
    name: 'MOTOO',
    url: 'https://www.motoo.com.br',
    category: 'Notícias',
    tags: ['Especificações', 'Preços', 'Comparativos'],
    description: 'Portal moderno focado em notícias de mercado, novidades industriais e ferramentas robustas de comparação de fichas técnicas e preços de motos zero km e usadas.'
  },
  {
    name: 'Infomoto',
    url: 'https://www.infomoto.com.br',
    category: 'Notícias',
    tags: ['Agência', 'Jornalismo', 'Testes Práticos'],
    description: 'Renomada agência de notícias especializada em motocicletas. Seus testes e artigos técnicos alimentam os maiores portais de notícias gerais do país.'
  },
  {
    name: 'Motor1 Brasil - Motos',
    url: 'https://motor1.uol.com.br/motorcycles/',
    category: 'Notícias',
    tags: ['UOL', 'Segredos', 'Lançamentos', 'Internacional'],
    description: 'Editoria dedicada ao motociclismo dentro do portal Motor1 da UOL. Traz segredos de fábrica, flagras de novos modelos e cobertura global.'
  },
  {
    name: 'Motomundo',
    url: 'https://www.motomundo.com.br',
    category: 'Notícias',
    tags: ['Esportes', 'MotoGP', 'Rally', 'Off-Road'],
    description: 'A principal plataforma brasileira focada na cobertura de esportes de duas rodas. Acompanhe notícias da MotoGP, MXGP, Rally Dakar e campeonatos nacionais.'
  },
  {
    name: 'Viagem de Moto',
    url: 'https://www.viagemdemoto.com',
    category: 'Mototurismo',
    tags: ['Relatos', 'Roteiros', 'Planejamento', 'Dicas'],
    description: 'A maior biblioteca de relatos de viagens e roteiros de moto no Brasil. Um ponto de partida essencial para quem planeja cruzar o país ou a América do Sul.'
  },
  {
    name: 'Motoviajeiros',
    url: 'https://www.motoviajeiros.com',
    category: 'Mototurismo',
    tags: ['Expedições', 'América do Sul', 'Dicas de Viagem'],
    description: 'Relatos inspiradores e detalhados de grandes expedições de moto. Traz guias sobre documentação, caminhos e preparação mecânica para longas distâncias.'
  },
  {
    name: 'Caminhos de Motos',
    url: 'https://www.caminhosdemotos.com.br',
    category: 'Mototurismo',
    tags: ['Serras', 'Estradas', 'Pilotagem', 'Rio de Janeiro'],
    description: 'Especializado em desbravar as serras e estradas mais sinuosas e cênicas do Brasil, oferecendo roteiros fotográficos e dicas de segurança para curvas.'
  },
  {
    name: 'Moto Adventure',
    url: 'https://www.motoadventure.com.br',
    category: 'Mototurismo',
    tags: ['Revista', 'Big Trail', 'Equipamentos', 'Turismo'],
    description: 'Revista online premium voltada para o segmento Big Trail e turismo de aventura. Testes de equipamentos para pilotos e relatos de destinos de tirar o fôlego.'
  },
  {
    name: 'Rota Brasil Mototurismo',
    url: 'https://www.rotabrasilmototurismo.com.br',
    category: 'Mototurismo',
    tags: ['Operadora', 'Viagens Guiadas', 'Estrada Real'],
    description: 'Operadora especializada na organização de viagens guiadas de moto. Perfeito para quem quer focar apenas na estrada, com infraestrutura de apoio completa.'
  },
  {
    name: 'Diário de Motocicleta',
    url: 'https://www.diariodemotocicleta.com.br',
    category: 'Mototurismo',
    tags: ['Diário', 'Fotos', 'América do Sul', 'Roteiros'],
    description: 'Um diário digital repleto de fotos e diários de bordo de aventuras de moto por todo o continente. Foco em detalhes logísticos e experiências locais.'
  },
  {
    name: 'Mototour',
    url: 'https://www.mototour.com.br',
    category: 'Cultura',
    tags: ['Eventos', 'Encontros', 'Moto Clubes', 'Utilidades'],
    description: 'Agenda centralizadora de encontros de motociclistas, eventos de moto rock e informações de apoio a viajantes no Brasil inteiro.'
  },
  {
    name: 'Rock & Road',
    url: 'https://www.rockandroad.com.br',
    category: 'Cultura',
    tags: ['Lifestyle', 'Música', 'Estrada', 'Custom'],
    description: 'Portal de estilo de vida que combina o amor pelas duas rodas com a cultura do rock, customização de motos e roteiros com alma estradeira.'
  }
];

export default function DiretorioClient() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos');

  const filteredSites = SITES.filter(site => {
    const matchesCategory = category === 'Todos' || site.category === category;
    const matchesSearch = site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.description.toLowerCase().includes(search.toLowerCase()) ||
      site.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="wrap" style={{ paddingBottom: '80px' }}>
      <style jsx>{`
        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          margin-bottom: 24px;
          max-width: 480px;
          width: 100%;
        }
        .search-input {
          width: 100%;
          padding: 14px 16px 14px 44px;
          border-radius: 8px;
          border: 1px solid var(--snow-line);
          background: var(--snow-2);
          color: var(--ink);
          font-family: var(--font);
          font-size: 15px;
          transition: all 0.2s ease;
        }
        .search-input:focus {
          border-color: var(--clay);
          background: var(--snow);
          box-shadow: 0 0 0 3px rgba(255, 90, 0, 0.1);
          outline: none;
        }
        .search-icon {
          position: absolute;
          left: 14px;
          color: var(--ink-soft);
          pointer-events: none;
        }
        .controls-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--snow-line);
          padding-bottom: 20px;
        }
        .filter-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .filter-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--mono);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .06em;
          font-size: 11.5px;
          padding: 10px 16px;
          background: var(--snow-2);
          border: 1.5px solid var(--snow-line);
          color: var(--ink-soft);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .filter-btn:hover {
          border-color: var(--clay);
          color: var(--clay);
        }
        .filter-btn.active {
          background: var(--clay);
          border-color: var(--clay);
          color: #fff;
        }
        .results-count {
          font-family: var(--mono);
          font-size: 12px;
          color: var(--ink-soft);
          text-transform: uppercase;
          letter-spacing: .05em;
        }
        .directory-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 980px) {
          .directory-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .directory-grid {
            grid-template-columns: 1fr;
          }
          .controls-row {
            flex-direction: column;
            align-items: flex-start;
          }
          .filter-buttons {
            width: 100%;
          }
          .filter-btn {
            flex: 1 1 auto;
            justify-content: center;
          }
        }
        .site-card {
          background: var(--snow);
          border: 1px solid var(--snow-line);
          border-radius: 8px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          transition: all 0.25s cubic-bezier(0.2, 0.7, 0.2, 1);
          box-shadow: 0 2px 8px rgba(0,0,0,0.02);
          min-height: 250px;
        }
        .site-card:hover {
          transform: translateY(-4px);
          border-color: var(--clay);
          box-shadow: 0 16px 40px rgba(10, 11, 13, 0.08);
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }
        .card-category {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: var(--mono);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .08em;
          font-size: 9.5px;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(255, 90, 0, 0.08);
          color: var(--clay);
          border: 1px solid rgba(255, 90, 0, 0.15);
        }
        .site-title {
          font-family: var(--display);
          font-weight: 800;
          font-size: 24px;
          color: var(--ink);
          text-transform: uppercase;
          margin: 0 0 6px 0;
          line-height: 1.1;
          letter-spacing: -0.01em;
          transition: color 0.2s ease;
        }
        .site-card:hover .site-title {
          color: var(--clay);
        }
        .site-description {
          font-family: var(--font);
          font-size: 14px;
          color: var(--ink-soft);
          line-height: 1.6;
          margin: 0 0 20px 0;
          flex: 1;
        }
        .tag-container {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 20px;
        }
        .tag-pill {
          font-family: var(--font);
          font-size: 11px;
          color: var(--ink-soft);
          background: var(--snow-2);
          border: 1px solid var(--snow-line);
          padding: 3px 8px;
          border-radius: 4px;
          font-weight: 500;
        }
        .visit-link {
          font-family: var(--mono);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .08em;
          font-size: 11px;
          color: var(--ink);
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: auto;
          transition: all 0.2s ease;
          border-top: 1px solid var(--snow-line);
          padding-top: 14px;
          width: 100%;
        }
        .visit-link svg {
          transition: transform 0.25s ease;
          color: var(--ink-soft);
        }
        .site-card:hover .visit-link {
          color: var(--clay);
        }
        .site-card:hover .visit-link svg {
          transform: translate(2px, -2px);
          color: var(--clay);
        }
        .no-results {
          grid-column: 1 / -1;
          text-align: center;
          padding: 64px 20px;
          background: var(--snow-2);
          border: 1px solid var(--snow-line);
          border-radius: 8px;
          color: var(--ink-soft);
        }
        .no-results-icon {
          font-size: 40px;
          margin-bottom: 12px;
          display: block;
        }
        .no-results h3 {
          font-family: var(--display);
          font-size: 20px;
          color: var(--ink);
          margin-bottom: 4px;
        }
        .cta-section {
          margin-top: 56px;
          background: var(--snow-2);
          border: 1px solid var(--snow-line);
          border-radius: 8px;
          padding: 32px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }
        @media (max-width: 680px) {
          .cta-section {
            flex-direction: column;
            text-align: center;
          }
        }
        .cta-title {
          font-family: var(--display);
          font-weight: 800;
          font-size: 24px;
          margin: 0 0 6px 0;
          color: var(--ink);
          text-transform: uppercase;
        }
        .cta-desc {
          font-family: var(--font);
          font-size: 14px;
          color: var(--ink-soft);
          margin: 0;
          max-width: 50ch;
          line-height: 1.5;
        }
        .cta-btn {
          font-family: var(--mono);
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .08em;
          font-size: 12.5px;
          padding: 14px 24px;
          background: var(--clay);
          color: #fff;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .cta-btn:hover {
          background: #e84e00;
          transform: translateY(-1px);
        }
      `}</style>

      {/* SEARCH AND CONTROLS */}
      <div style={{ marginTop: '32px' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Pesquisar por nome, palavra-chave ou tag..."
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="controls-row">
          <div className="filter-buttons">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`filter-btn ${category === cat.id ? 'active' : ''}`}
                onClick={() => setCategory(cat.id)}
              >
                {cat.icon}
                {cat.label}
              </button>
            ))}
          </div>
          <div className="results-count">
            {filteredSites.length} {filteredSites.length === 1 ? 'site encontrado' : 'sites encontrados'}
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="directory-grid">
        {filteredSites.length > 0 ? (
          filteredSites.map((site, index) => (
            <div key={index} className="site-card">
              <div className="card-header">
                <span className="card-category">
                  {site.category === 'Notícias' && <Newspaper size={11} style={{ marginRight: 4 }} />}
                  {site.category === 'Mototurismo' && <Compass size={11} style={{ marginRight: 4 }} />}
                  {site.category === 'Cultura' && <Flame size={11} style={{ marginRight: 4 }} />}
                  {site.category}
                </span>
                <Globe size={16} style={{ color: 'var(--snow-line)' }} />
              </div>
              <h3 className="site-title">{site.name}</h3>
              <p className="site-description">{site.description}</p>
              <div className="tag-container">
                {site.tags.map((tag, idx) => (
                  <span key={idx} className="tag-pill">{tag}</span>
                ))}
              </div>
              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="visit-link"
              >
                Acessar Website <ExternalLink size={13} />
              </a>
            </div>
          ))
        ) : (
          <div className="no-results">
            <span className="no-results-icon" role="img" aria-label="Lupa">🔍</span>
            <h3>Nenhum site encontrado</h3>
            <p style={{ margin: 0, fontSize: 13 }}>Tente alterar os termos de busca ou filtros selecionados.</p>
          </div>
        )}
      </div>

      {/* CALL TO ACTION */}
      <div className="cta-section">
        <div>
          <h3 className="cta-title">Quer fazer parte do Diretório?</h3>
          <p className="cta-desc">
            Se você gerencia um portal, blog de viagens ou canal ativo sobre o ecossistema de duas rodas no Brasil, envie sua sugestão para nossa comunidade.
          </p>
        </div>
        <button
          className="cta-btn"
          onClick={() => window.open('https://wa.me/5531999999999?text=Olá,%20gostaria%20de%20sugerir%20um%20site%20para%20o%20Diretório%20Pista%20Viva!', '_blank')}
        >
          Sugerir Site <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
