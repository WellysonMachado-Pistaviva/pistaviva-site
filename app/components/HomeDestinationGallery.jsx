'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Cover from './Cover';
import { FOTOS_DESTINOS } from '../lib/destinosDiscovery.mjs';

const destinations = [
  { name: 'Serra do Rio do Rastro', region: 'Santa Catarina', tag: 'Curvas & horizontes', image: '/destinos/rio-do-rastro.webp', slug: 'serra-do-rio-do-rastro-de-moto', categories: ['Serras'] },
  { name: 'Serra da Mantiqueira', region: 'Minas Gerais · São Paulo · Rio de Janeiro', tag: 'Paradas que valem a viagem', image: '/motosul/mantiqueira.jpg', slug: 'serra-da-mantiqueira-de-moto', categories: ['Serras', 'Gastronomia'] },
  { name: 'Serra da Canastra', region: 'Minas Gerais', tag: 'Queijo, terra & cachoeira', image: '/destinos/canastra.webp', slug: 'serra-da-canastra-de-moto', categories: ['Gastronomia', 'Natureza'] },
  { name: 'Serra do Espinhaço', region: 'Minas Gerais', tag: 'Horizonte aberto', image: '/destinos/espinhaco.webp', slug: 'serra-do-espinhaco-de-moto', categories: ['Serras', 'Natureza'] },
];

export default function DestinationGallery() {
  const [category, setCategory] = useState('Todos');
  const filtered = destinations.filter(destination => category === 'Todos' || destination.categories.includes(category));
  return <section className="study-container study-discover" id="descobrir" aria-labelledby="study-discover-title">
    <header className="study-heading"><div><p className="study-kicker">Escolha pelo que move você</p><h2 id="study-discover-title">Seu próximo<br /><em>horizonte.</em></h2></div><p>Curvas, sabores ou um pouco de silêncio.<br />Encontre o lugar que combina com sua vontade.</p></header>
    <div className="study-filters" role="group" aria-label="Filtrar destinos por interesse">{['Todos', 'Serras', 'Gastronomia', 'Natureza'].map(item => <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
    <p className="study-result" role="status">{filtered.length} destinos para explorar</p>
    <div className="study-destinations">{filtered.map(destination => <Link className="study-destination" key={destination.slug} href={`/destinos/${destination.slug}`}><div className="study-destination-photo"><Cover src={destination.image} alt={destination.name} sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" /><span>{destination.tag}</span></div><div className="study-destination-copy"><small>{destination.region}</small><h3>{destination.name}</h3><span>Explorar destino <ArrowUpRight size={18} aria-hidden="true" /></span></div></Link>)}</div>
    <div className="study-discover-foot"><span>O destino inspira. O caminho completa.</span><Link href="/destinos">Ver todos os destinos <ArrowUpRight size={18} aria-hidden="true" /></Link></div>
    <details className="study-credits">
      <summary>Créditos das fotografias</summary>
      <ul>{destinations.filter(destination => FOTOS_DESTINOS[destination.slug]).map(destination => {
        const photo = FOTOS_DESTINOS[destination.slug];
        return <li key={destination.slug}>{destination.name}: <a href={photo.fonte} target="_blank" rel="noopener noreferrer">{photo.autor}</a> · <a href={photo.licencaUrl} target="_blank" rel="noopener noreferrer">{photo.licenca}</a> · recorte de exibição</li>;
      })}</ul>
    </details>
  </section>;
}
