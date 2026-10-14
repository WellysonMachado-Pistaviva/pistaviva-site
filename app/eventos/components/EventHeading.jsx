import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Route, Users, ArrowUpRight } from 'lucide-react';
import EditorialHero from '../../components/EditorialHero';
import Cover from '../../components/Cover';
import EventHero from '../[id]/EventHero';

const STATUS = { open: 'Inscrições abertas', soon: 'Em breve', full: 'Vagas esgotadas' };
// Editorial artwork overrides change imagery only; all events keep one layout.
const EDITORIAL_IMAGES = {
  'cbb79f85-3cbf-4dea-8dda-1df38d2c0261': { src: '/motosul/mantiqueira.jpg', alt: 'Paisagem da Serra da Mantiqueira, região do encontro' },
};

export default function EventHeading({ event, cover, heroImages = [], going = 0, departuresEnabled = false, hasSchedule = false, hasLocation = false }) {
  const [lead, ...rest] = (event.title || 'Nome do evento').split(' — ');
  const editorialImage = EDITORIAL_IMAGES[event.id];
  const media = heroImages.length ? <EventHero images={heroImages} alt={event.title} />
    : editorialImage ? <Cover src={editorialImage.src} alt={editorialImage.alt} priority />
      : cover ? <Image src={cover} alt={event.title || 'Arte do evento'} fill priority sizes="100vw" className="event-hero-art" /> : null;
  return <>
    <EditorialHero id="event-title" className="event-hero" contentClassName="event-hero-content"
      eyebrow={`Pistaviva / ${event.category || 'Encontros na estrada'}`}
      title={<>{lead}{rest.length > 0 && <><br /><em>{rest.join(' — ')}</em></>}</>}
      media={media && <div className="event-hero-media">{media}</div>}
      action={{ href: departuresEnabled ? '#saidas' : '#participar', label: departuresEnabled ? 'Combinar minha saída' : 'Participar do evento' }}
      footer={<><span>{departuresEnabled ? 'Encontro de motociclistas' : STATUS[event.type] || STATUS.open}</span><Link href="/eventos">Ver agenda de encontros ↗</Link></>}>
      {event.local || 'Um encontro para colocar no seu caminho.'}
    </EditorialHero>
    <nav className="study-container study-shortcuts" aria-label="Planeje sua ida ao evento">
      {[
        { href: hasSchedule ? '#programacao' : '#sobre', icon: Calendar, label: '01 / MARQUE NA AGENDA', title: event.date || 'Data a definir', subtitle: event.time ? `${event.time} · Horário de Brasília` : 'Confira a programação' },
        { href: hasLocation ? '#como-chegar' : '#sobre', icon: Route, label: '02 / SIGA O CAMINHO', title: 'Como chegar', subtitle: event.local || 'Consulte o local do encontro' },
        { href: '#participar', icon: Users, label: '03 / ENCONTRE SUA TURMA', title: `${going} ${going === 1 ? 'confirmado' : 'confirmados'}`, subtitle: 'Confirme presença e compartilhe' },
      ].map(({ href, icon: Icon, label, title, subtitle }) => <a key={label} href={href}><Icon aria-hidden="true" /><span><small>{label}</small><strong>{title}</strong><span>{subtitle}</span></span><ArrowUpRight aria-hidden="true" /></a>)}
    </nav>
  </>;
}
