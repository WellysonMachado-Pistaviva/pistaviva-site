import { ArrowRight, Navigation, AtSign } from 'lucide-react';
import { mapsDirections } from '../caminho-dos-diamantes/route-utils.mjs';
import resumo from '../../lib/aneisResumo.json' with { type: 'json' };

// Circuitos fechados ligando só monumentos prontos, na ordem da trilha: quem
// fecha um anel já tem paradas do próximo. A silhueta de cada card é um caminho
// SVG pré-calculado (scripts/build-aneis-resumo.mjs) — oito mapas sem mapa.
export default function RingCards() {
  // A escada vale enquanto cada nível acrescenta coleção de verdade. Abaixo de
  // dois monumentos novos vira variação do mesmo chão, não próximo nível.
  const campanha = resumo.trilha.filter(t => t.novos >= 2);
  const variacoes = resumo.trilha.filter(t => t.novos < 2);
  const kmCampanha = campanha.reduce((total, t) => total + resumo.aneis[t.anel].km, 0);
  const conquistados = campanha.at(-1)?.acumulado ?? 0;

  // Etapas de navegação: o Google Maps aceita poucos pontos por link, então o
  // anel é quebrado em trechos com até três paradas intermediárias.
  const etapasDeNavegacao = anel => {
    const volta = [...anel.monumentos, anel.monumentos[0]];
    const trechos = [];
    for (let i = 0; i < volta.length - 1; i += 4) {
      const parte = volta.slice(i, i + 5);
      if (parte.length < 2) break;
      const params = new URLSearchParams({
        api: '1', travelmode: 'driving',
        origin: `${parte[0].lat},${parte[0].lng}`,
        destination: `${parte.at(-1).lat},${parte.at(-1).lng}`,
      });
      if (parte.length > 2) params.set('waypoints', parte.slice(1, -1).map(p => `${p.lat},${p.lng}`).join('|'));
      trechos.push({ de: parte[0].cidade, para: parte.at(-1).cidade, url: `https://www.google.com/maps/dir/?${params}` });
    }
    return trechos;
  };

  const card = (etapa, posicao) => {
    const anel = resumo.aneis[etapa.anel];
    const comMonumento = anel.municipios.filter(m => m.m).length;
    const primeira = anel.monumentos[0];
    const trechos = etapasDeNavegacao(anel);
    return <article className="mb-ring" key={etapa.anel}>
      <header>
        <span className="mb-ring-nivel">{posicao ? `Nível ${posicao}` : 'Variação'}</span>
        <h3>{anel.ufs.join(' · ')}</h3>
        <p>{anel.faixa} · {anel.dias} dias a 300 km/dia</p>
      </header>

      <svg className="mb-ring-mapa" viewBox="0 0 100 100" role="img" aria-label={`Silhueta do circuito de ${anel.km} quilômetros ligando ${anel.monumentos.length} monumentos`}>
        <path d={anel.silhueta} fill="none" />
        {anel.pontos.map(([x, y], i) => <circle key={i} cx={x} cy={y} r="2.1" />)}
      </svg>

      <dl className="mb-ring-numeros">
        <div><dt>Distância</dt><dd>{anel.km.toLocaleString('pt-BR')} km</dd></div>
        <div><dt>Monumentos</dt><dd>{anel.monumentos.length}</dd></div>
        <div><dt>Municípios</dt><dd>{anel.municipios.length}</dd></div>
        <div><dt>Ao guidão</dt><dd>{anel.horas} h</dd></div>
      </dl>

      <div className="mb-ring-paradas">
        <h4>As paradas, na ordem</h4>
        <ol>{anel.monumentos.map(m => <li key={m.id}>
          <b>{String(m.id).padStart(2, '0')}</b>
          <span>{m.cidade}<small>{m.uf}</small></span>
          {m.ig && <a href={`https://www.instagram.com/${m.ig}/`} target="_blank" rel="noopener noreferrer" aria-label={`Instagram de ${m.nome}`}><AtSign size={13} aria-hidden="true" />{m.ig}</a>}
        </li>)}</ol>
      </div>

      <div className="mb-ring-ir">
        {/* Sem origem na URL, o Maps traça a partir de onde a pessoa está. */}
        <a className="mb-ring-botao" href={mapsDirections(null, [primeira.lat, primeira.lng])} target="_blank" rel="noopener noreferrer">
          <Navigation size={16} aria-hidden="true" />Traçar daqui até a 1ª parada
        </a>
        <details>
          <summary>Navegar o anel por etapas · {trechos.length}</summary>
          <p>O Maps aceita poucas paradas por link. Abra uma etapa de cada vez; ele recalcula as estradas e pode mostrar distância diferente.</p>
          <ol>{trechos.map((t, i) => <li key={t.url}>
            <a href={t.url} target="_blank" rel="noopener noreferrer"><b>{i + 1}</b> {t.de} → {t.para}</a>
          </li>)}</ol>
        </details>
      </div>

      <details className="mb-ring-municipios">
        <summary>Os {anel.municipios.length} municípios do caminho</summary>
        <p>{comMonumento} deles têm monumento. Os demais são passagem — é onde a viagem acontece entre um carimbo e o outro.</p>
        <p className="mb-ring-lista">{anel.municipios.map((m, i) => <span key={`${m.n}-${i}`}>{i > 0 && ' · '}{m.m ? <b>{m.n}/{m.u}</b> : `${m.n}/${m.u}`}</span>)}</p>
      </details>

      {etapa.repetidos > 0 && <p className="mb-ring-liga"><ArrowRight size={14} aria-hidden="true" />{etapa.repetidos} {etapa.repetidos === 1 ? 'parada já estará' : 'paradas já estarão'} no seu passaporte do nível anterior.</p>}
    </article>;
  };

  return <section className="mb-rings" aria-labelledby="mb-rings-title">
    <p className="mb-kicker">Circuitos fechados</p>
    <h2 id="mb-rings-title">Fechou um anel,<br />entra no próximo.</h2>
    <p className="mb-rings-lead">
      {campanha.length} circuitos que saem e voltam ao mesmo ponto, ligando apenas os monumentos prontos — os que carimbam.
      Cada nível reaproveita paradas do anterior: são {kmCampanha.toLocaleString('pt-BR')} km somados para chegar
      a {conquistados} dos {resumo.totalProntos} monumentos em operação.
    </p>

    <div className="mb-rings-grid">{campanha.map((etapa, i) => card(etapa, i + 1))}</div>

    {variacoes.length > 0 && <>
      <h3 className="mb-rings-sub">Outras voltas pelo mesmo chão</h3>
      <p className="mb-rings-lead">Estes não acrescentam monumentos novos à coleção — percorrem a mesma região por outro desenho. Servem para repetir a viagem sem repetir o caminho.</p>
      <div className="mb-rings-grid">{variacoes.map(etapa => card(etapa, null))}</div>
    </>}

    <p className="mb-rings-nota">
      Ordem sugerida por proximidade rodoviária, otimizada e editável no planejador acima. Distâncias e tempos vêm do
      traçado para automóveis, sem trânsito em tempo real nem promessa de piso. Seis monumentos prontos ficam fora dos
      circuitos por estarem isolados demais para fechar anel: seguem como ida e volta.
    </p>
  </section>;
}
