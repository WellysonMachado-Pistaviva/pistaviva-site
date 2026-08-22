'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

const PLACES = [
  {
    marker: '2º no mundo',
    time: '1 hora',
    kind: 'fé, arquitetura e vista',
    name: 'Santuário da Agonia',
    image: '/motosul/roteiros/santuario-agonia.jpg',
    alt: 'Santuário Nossa Senhora da Agonia visto do pé da colina, com a cúpula prateada acima do mato',
    width: 548,
    height: 364,
    intro: 'No alto da colina, o santuário recebe missas, peregrinos e quem sobe para ver Itajubá cercada pelas montanhas. A cúpula aparece de longe, de vários pontos da cidade.',
    facts: [
      'A devoção veio de Viana do Castelo, em Portugal.',
      'É o segundo santuário do mundo dedicado a Nossa Senhora da Agonia e o primeiro da América Latina.',
      'A cúpula e os painéis azuis formam uma arquitetura fácil de reconhecer de vários pontos da cidade.',
    ],
    chapter: '#roteiro-1h',
  },
  {
    marker: 'km 6',
    time: 'meio dia',
    kind: 'natureza',
    name: 'Cachoeira da Estância',
    image: '/motosul/roteiros/cachoeira-estancia.jpg',
    alt: 'Cachoeira da Estância em Itajubá com um cavalo bebendo água diante da queda',
    width: 1200,
    height: 675,
    intro: "Uma queda d'água na zona rural, acessada pela rodovia Itajubá a Lorena, na altura do km 6.",
    facts: [
      'Reserve meio dia para ir, ficar um pouco e voltar sem correr.',
      'Confirme funcionamento, cobrança e condição do acesso antes de sair.',
      'O caminho vale como parte do passeio, especialmente de moto.',
    ],
    chapter: '#roteiro-meio-dia',
    credit: 'Py4nf',
    source: 'https://commons.wikimedia.org/wiki/File:Horse_waterfall_estancia_brazil.jpg',
    license: 'https://creativecommons.org/licenses/by-sa/4.0/',
    licenseLabel: 'CC BY-SA 4.0',
  },
  {
    marker: 'azeite',
    time: '1 dia',
    kind: 'frio e olivais',
    name: 'Maria da Fé',
    image: '/motosul/roteiros/maria-da-fe-estacao.jpg',
    alt: 'Locomotiva histórica preservada no centro de Maria da Fé, Minas Gerais',
    width: 1200,
    height: 675,
    intro: 'A cidade de altitude virou referência brasileira em cultivo de oliveiras e produção de azeite.',
    facts: [
      'O frio faz parte da identidade local e muda o clima da viagem.',
      'A locomotiva 225 guarda parte da memória ferroviária da cidade.',
      'Produtores e olivais podem exigir agendamento para visita.',
    ],
    chapter: '#roteiro-1-dia',
    credit: 'Rodney Damián',
    source: 'https://commons.wikimedia.org/wiki/File:Estaci%C3%B3n_Ferroviaria_-_Maria_da_F%C3%A9_-_Minas_Gerais_-_panoramio.jpg',
    license: 'https://creativecommons.org/licenses/by-sa/3.0/',
    licenseLabel: 'CC BY-SA 3.0',
  },
  {
    marker: 'café',
    time: '1 dia',
    kind: 'serra e casario',
    name: 'Cristina',
    image: '/motosul/roteiros/cristina.jpg',
    alt: 'Vista do centro de Cristina entre montanhas do Sul de Minas',
    width: 1200,
    height: 900,
    intro: 'Cristina fica entre cafezais e montanhas, com ruas antigas que pedem uma parada antes da volta.',
    facts: [
      'A região é conhecida pela produção de cafés especiais.',
      'O centro reúne casario e memória da antiga ferrovia.',
      'É a segunda parada da volta que começa em Maria da Fé e termina em Itajubá.',
    ],
    chapter: '#roteiro-1-dia',
    credit: 'Daniel',
    source: 'https://commons.wikimedia.org/wiki/File:Cristinamg.jpg',
    license: 'https://creativecommons.org/licenses/by-sa/3.0/',
    licenseLabel: 'CC BY-SA 3.0',
  },
];

export default function PlacesCarousel() {
  const [viewportRef, embla] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' });
  const [selected, setSelected] = useState(0);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const sync = useCallback((api) => {
    if (!api) return;
    setSelected(api.selectedScrollSnap());
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!embla) return undefined;
    queueMicrotask(() => sync(embla));
    embla.on('select', sync);
    embla.on('reInit', sync);
    return () => {
      embla.off('select', sync);
      embla.off('reInit', sync);
    };
  }, [embla, sync]);

  const onKeyDown = (event) => {
    if (!embla) return;
    if (event.key === 'ArrowLeft') embla.scrollPrev();
    if (event.key === 'ArrowRight') embla.scrollNext();
  };

  return (
    <section className="ms-place-carousel" aria-labelledby="ms-place-carousel-title" aria-roledescription="carrossel">
      <header className="ms-place-carousel__head">
        <div>
          <span>Paradas da Mantiqueira</span>
          <h3 id="ms-place-carousel-title">Veja o lugar. Depois escolha a rota.</h3>
        </div>
        <div className="ms-place-carousel__controls">
          <button type="button" onClick={() => embla?.scrollPrev()} disabled={!canPrev} aria-label="Ver lugar anterior">←</button>
          <output aria-live="polite">{String(selected + 1).padStart(2, '0')} / {String(PLACES.length).padStart(2, '0')}</output>
          <button type="button" onClick={() => embla?.scrollNext()} disabled={!canNext} aria-label="Ver próximo lugar">→</button>
        </div>
      </header>

      <div className="ms-place-carousel__viewport" ref={viewportRef} tabIndex="0" onKeyDown={onKeyDown} aria-label="Lugares para visitar perto do Motosul">
        <div className="ms-place-carousel__track">
          {PLACES.map((place, index) => (
            <article className="ms-place-carousel__slide" key={place.name} aria-label={`${index + 1} de ${PLACES.length}: ${place.name}`}>
              <figure>
                <div className="ms-place-carousel__media">
                  <img src={place.image} alt={place.alt} width={place.width} height={place.height} loading="lazy" sizes="(max-width: 640px) 86vw, (max-width: 1100px) 62vw, 42vw" />
                  <strong>{place.marker}</strong>
                </div>
                <figcaption>
                  <span>{place.time} · {place.kind}</span>
                  <h4>{place.name}</h4>
                  <p>{place.intro}</p>
                  <ul>
                    {place.facts.map((fact) => <li key={fact}>{fact}</li>)}
                  </ul>
                  <div className="ms-place-carousel__footer">
                    <a className="ms-place-carousel__route" href={place.chapter}>Ver roteiro ↓</a>
                    {place.credit ? (
                      <small>
                        Foto: <a href={place.source} target="_blank" rel="noopener noreferrer">{place.credit}</a>, <a href={place.license} target="_blank" rel="noopener noreferrer">{place.licenseLabel}</a>. Exibição recortada.
                      </small>
                    ) : null}
                  </div>
                </figcaption>
              </figure>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
