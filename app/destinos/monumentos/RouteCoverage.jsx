import Image from 'next/image';
import cobertura from '../../lib/rotaMunicipios.json' with { type: 'json' };

// Símbolo da Rota Biker em preto, recortado do logotipo oficial por
// scripts/build-rota-biker-mark.mjs — o logotipo completo traz o lettering ao
// lado e fica ilegível no tamanho de um ícone de lista.
const marca = (size, className) => <Image className={className} src="/monumentos/rota-biker-marca.png" alt="" aria-hidden="true" width={Math.round(size / 2.008)} height={size} />;

// Estados e municípios por onde o traçado publicado realmente passa, apurados
// cruzando a linha da rota com a malha municipal do IBGE
// (scripts/build-rota-municipios.mjs). Renderizado no servidor: a lista é
// conteúdo de página, não depende de JavaScript no navegador.
export default function RouteCoverage() {
  const rota = cobertura.modos.todos;
  const comMonumento = rota.estados.reduce((total, estado) => total + estado.municipios.filter(m => m.monumento).length, 0);
  return <section className="mb-coverage" aria-labelledby="mb-coverage-title">
    <p className="mb-kicker">O caminho inteiro</p>
    <h2 id="mb-coverage-title">Por onde a rota passa</h2>
    <p className="mb-coverage-lead">
      Todo o traçado de {rota.distanciaKm.toLocaleString('pt-BR')} km ligando os {rota.ids.length} pontos,
      estado por estado, na ordem em que a estrada atravessa cada município.
    </p>
    <div className="mb-coverage-figures">
      <div><strong>{rota.totalEstados}</strong><span>estados</span></div>
      <div><strong>{rota.totalMunicipios}</strong><span>municípios</span></div>
      <div><strong>{comMonumento}</strong><span>com monumento</span></div>
    </div>
    <div className="mb-coverage-grid">
      {rota.estados.map(estado => <section key={estado.uf} className="mb-coverage-state">
        <h3>{estado.nome} <span>{estado.uf} · {estado.municipios.length}</span></h3>
        <ul>{estado.municipios.map(municipio => municipio.monumento ? <li key={municipio.codigo} className="is-monument">
          {marca(18, 'mb-coverage-mark')}
          <div>
            <strong>{municipio.nome}</strong>
            {municipio.monumentos.map(monumento => <span key={monumento.id} className="mb-coverage-monument">
              <b>Monumento {String(monumento.id).padStart(2, '0')}</b> · {monumento.nome}
              {monumento.status !== 'pronto' && <i> · em construção</i>}
              {monumento.instagram && <a href={monumento.instagram.url} target="_blank" rel="noopener noreferrer">@{monumento.instagram.handle} ↗</a>}
            </span>)}
          </div>
        </li> : <li key={municipio.codigo}>{municipio.nome}</li>)}</ul>
      </section>)}
    </div>
    <p className="mb-coverage-note">
      {marca(18, 'mb-coverage-mark')} marca os municípios que abrigam um monumento, com o número oficial e o perfil do guardião quando publicado.
      Os {rota.kmForaDoBrasil} km em que o traçado deixa o país — travessias pela Argentina e pelo Paraguai — não entram na contagem: a lista cobre a malha municipal brasileira.
      Apuração automática sobre o traçado rodoviário de {cobertura.geradoEm.split('-').reverse().join('/')}, varrido a cada 10 metros; mudar as paradas no planejador muda o caminho e, com ele, as cidades atravessadas.
    </p>
  </section>;
}
