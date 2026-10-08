import Image from 'next/image';
import { AtSign } from 'lucide-react';

// Reel oficial no Instagram. O endereço vem na forma /reels/, mas só a forma
// singular tem incorporação; normalizar evita um iframe vazio.
const REEL = 'https://www.instagram.com/reel/DFk4dUAx04Q/';
const PERFIL = 'escultura_personalizada';
const FONTE = 'https://motociclistasunidos.com.br/rota-bikers/';

export default function Sculptors() {
  return <section className="mb-shell mb-sculptors" aria-labelledby="mb-sculptors-title">
    <div className="mb-sculptors-copy">
      <p className="mb-kicker">Quem talha o gesto</p>
      <h2 id="mb-sculptors-title">Moisés e Adriana,<br />mão a mão.</h2>
      <p>Todas as esculturas da Rota Biker saem das mãos do mesmo casal: <strong>Moisés Rodrigues Ribas e Adriana Furtado</strong>, que trabalham em Araucária, no Paraná. São eles que modelam, escavam e acabam cada peça — do primeiro ponto de solda ao último retoque de tinta.</p>
      <p>A técnica é sempre a mesma: estrutura de aço revestida com concreto de alta resistência, moldada para reproduzir a anatomia de um braço e de uma mão no cumprimento biker. Cada monumento leva cerca de <strong>um mês</strong> para ficar pronto.</p>
      <p>O casal é o único responsável pelas peças da rede, mas a produção não é contratada diretamente com eles: quem quer receber um monumento fala com a organização da rota, que conduz o processo.</p>
      <div className="mb-source-links">
        <a href={`https://www.instagram.com/${PERFIL}/`} target="_blank" rel="noopener noreferrer"><AtSign size={15} aria-hidden="true" />{PERFIL} ↗</a>
        <a href={FONTE} target="_blank" rel="noopener noreferrer">Reportagem sobre o casal ↗</a>
      </div>
    </div>

    <div className="mb-sculptors-media">
      <figure>
        <Image src="/monumentos/escultores-trabalho.webp" alt="Escultor sentado sobre a mão de um monumento da Rota Biker ainda em acabamento, com lata de tinta na mão e serra ao fundo" width={461} height={1024} />
        <figcaption>O acabamento é feito na própria peça, já erguida no local.</figcaption>
      </figure>
      <figure>
        <iframe className="event-instagram" src={`${REEL}embed/`} title="Vídeo do trabalho dos escultores da Rota Biker no Instagram" loading="lazy" allow="encrypted-media; fullscreen; picture-in-picture" />
        <figcaption><a href={REEL} target="_blank" rel="noopener noreferrer">Ver o vídeo no Instagram ↗</a></figcaption>
      </figure>
    </div>
  </section>;
}
