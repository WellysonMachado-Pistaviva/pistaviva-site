'use client';

import { useEffect, useRef, useState } from 'react';
import { CARIMBO, SELOS, formatarNumero } from '../lib/selo/constantes.mjs';
import { ESTACOES, estadoSelo } from '../lib/selo/estacao.mjs';

const MESES = { verao: 'Jan–Mar', outono: 'Abr–Jun', inverno: 'Jul–Set', primavera: 'Out–Dez' };

// Sem visitas, mostra uma vitrine ilustrativa. Na coleção, só aplica selos
// liberados ou confirmados; espaços futuros continuam vazios, mesmo com reduced motion.
export default function PassaporteMockup({ estacao, ano, visitas, agora, nome, numero }) {
  const [animation, setAnimation] = useState(0);
  const figure = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setAnimation(1); observer.disconnect(); }
    }, { threshold: .2 });
    if (figure.current) observer.observe(figure.current);
    return () => observer.disconnect();
  }, []);
  const pessoal = Array.isArray(visitas);
  const estados = Object.keys(ESTACOES).map((id) => ({
    id, estado: pessoal ? estadoSelo({ estacao: id, ano, visitas }, agora) : 'vitrine',
  }));
  const total = estados.filter(({ estado }) => estado === 'conquistado' || estado === 'liberado').length;
  return (
    <figure ref={figure} className={`pp${pessoal ? ' pp-pessoal' : ''}`} aria-label={pessoal ? `Seu passaporte de ${ano}: ${total} de 4 selos digitais` : `Demonstração do passaporte com os quatro selos de ${ano}`}>
      <div key={animation} className={`pp-livro${animation ? ' pp-animando' : ''}`} aria-hidden="true">
        <div className="pp-pag pp-esq">
          <span className="pp-topo">Rota Biker · Brasil</span>
          <span className="pp-documento">Passaporte<small>do motociclista</small></span>
          <img className="pp-carimbo" src={CARIMBO} alt="" width={160} height={160} />
          <dl className="pp-titular">
            <div><dt>Titular</dt><dd>{pessoal ? nome || 'Você' : 'Você'}</dd></div>
            <div><dt>Nº</dt><dd>{pessoal && numero != null ? formatarNumero(numero) : 'Seu número'}</dd></div>
          </dl>
          <span className="pp-rodape">Itajubá · MG <span>01</span></span>
        </div>
        <div className="pp-pag pp-dir">
          <span className="pp-topo">Estações {ano}</span>
          <ul className="pp-selos">
            {estados.map(({ id, estado }, i) => (
              <li key={id} data-estado={estado} className={id === estacao ? 'pp-agora' : undefined} style={{ '--pp-i': i }}>
                <span className="pp-vaga">{ESTACOES[id].nome}<small>{MESES[id]}</small>{pessoal && <small>{estado === 'bloqueado' ? 'Em breve' : estado === 'registrado' ? 'Falta check-in' : estado === 'encerrado' ? 'Não conquistado' : estado === 'disponivel' ? 'Sua próxima visita' : ''}</small>}</span>
                {SELOS[id] && (!pessoal || estado === 'conquistado' || estado === 'liberado') && <img src={SELOS[id]} alt="" width={120} height={120} />}
                {!pessoal && id === estacao && <b>Sua vez</b>}
                {pessoal && estado === 'conquistado' && <b>No passaporte</b>}
                {pessoal && estado === 'liberado' && <b>Digital liberado</b>}
              </li>
            ))}
          </ul>
          <span className="pp-rodape">Memórias da Mantiqueira <span>02</span></span>
        </div>
      </div>
      <button type="button" className="pp-replay" onClick={() => setAnimation(n => n + 1)}>↻ Abrir e carimbar novamente</button>
      <figcaption>{pessoal ? <><strong>{total === 0 ? 'Seu passaporte espera a primeira história.' : `${total} de 4 selos no seu passaporte digital.`}</strong> Os espaços vazios aguardam novas visitas. A confirmação no balcão registra a entrega do adesivo físico.</> : <>Quatro estações, um passaporte. Complete o ano e entre para os <strong>Conquistadores de Itajubá</strong>.<small>Demonstração da coleção. Cada selo depende da visita e da liberação da estação.</small></>}</figcaption>
    </figure>
  );
}
