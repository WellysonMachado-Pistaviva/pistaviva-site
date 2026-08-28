'use client';

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';

// O que o parque oferece no mesmo fim de semana do festival. Cada card é uma
// estrutura permanente do Parque da Cidade — nada aqui depende da programação
// da 3ª edição, que ainda está sendo anunciada.
const EXPERIENCIAS = [
  {
    tag: 'De graça',
    t: 'Pedalinho no lago',
    d: 'Cisne branco, amarelo ou azul no meio da água, sem pagar nada. Colete sai no píer e a fila cresce no fim da tarde.',
  },
  {
    tag: 'Motor',
    t: 'Kartódromo',
    d: 'Traçado próprio dentro do parque. Sábado e domingo das 9h às 12h e das 13h às 20h, com a última bateria às 19h30.',
  },
  {
    tag: 'Fim de tarde',
    t: 'Deck sobre o lago',
    d: 'O sol some atrás da Mantiqueira e a água vira espelho alaranjado. Mesa nessa hora se conquista chegando cedo.',
  },
  {
    tag: 'Cinema',
    t: 'Cine A Itajubá',
    d: 'Quatro salas com Dolby Atmos, 3D e 4K, movidas por usina solar própria e com certificação LEED.',
  },
  {
    tag: 'Arte',
    t: 'Escadaria do Mosaico',
    d: 'A história de Itajubá contada degrau a degrau por André Visoto, ligando o Teatro Municipal ao parque.',
  },
  {
    tag: 'Na areia',
    t: 'Beach tennis',
    d: 'Quadras de areia dentro do parque, onde acontecem as etapas da Liga Sul Mineira.',
  },
  {
    tag: 'Vertical',
    t: 'Parede de escalada',
    d: 'Boulder e vias com corda sob cobertura, com luz para escalar depois que escurece.',
  },
  {
    tag: 'Sabor',
    t: 'Praça de alimentação',
    d: 'De sushi a pastel, de café a beergarden: as operações que fazem o parque encher à noite.',
  },
  {
    tag: 'Família',
    t: 'Área kids e boliche',
    d: 'Playground à vista das mesas, fonte interativa para os dias quentes e o Bowl coberto ao lado.',
  },
];

export default function ExperienciasCarousel() {
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
    <div className="ms-xp" aria-labelledby="ms-xp-title" aria-roledescription="carrossel">
      <header className="ms-xp__head">
        <div>
          <span>No mesmo endereço</span>
          <h3 id="ms-xp-title">O parque não para quando o palco para.</h3>
        </div>
        <div className="ms-xp__controls">
          <button type="button" onClick={() => embla?.scrollPrev()} disabled={!canPrev} aria-label="Ver experiência anterior">←</button>
          <output aria-live="polite">{String(selected + 1).padStart(2, '0')} / {String(EXPERIENCIAS.length).padStart(2, '0')}</output>
          <button type="button" onClick={() => embla?.scrollNext()} disabled={!canNext} aria-label="Ver próxima experiência">→</button>
        </div>
      </header>

      <div className="ms-xp__viewport" ref={viewportRef} tabIndex="0" onKeyDown={onKeyDown} aria-label="Experiências do Parque da Cidade">
        <div className="ms-xp__track">
          {EXPERIENCIAS.map((x, i) => (
            <article className="ms-xp__card" key={x.t} aria-label={`${i + 1} de ${EXPERIENCIAS.length}: ${x.t}`}>
              <span className="ms-xp__n">{String(i + 1).padStart(2, '0')}</span>
              <span className="ms-xp__tag">{x.tag}</span>
              <h4>{x.t}</h4>
              <p>{x.d}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
