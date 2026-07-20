import Link from 'next/link';
import { Calendar, MapPin, Flame } from 'lucide-react';
import EmblaCarousel from './EmblaCarousel';

// Rail de eventos na home — card IDÊNTICO ao da aba /eventos (.ig-evcard): capa
// 4/5, badge de status, categoria, contador de dias, data, título, local, preço e
// confirmados. Clica → página do evento.
const MONTH_MAP = { jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5, jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11 };
const parseEventDate = (str) => {
  if (!str) return null;
  const parts = str.replace(/–.+/, '').trim().split(' ');
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]), month = MONTH_MAP[parts[1].toLowerCase()], year = parseInt(parts[2]);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  return new Date(year, month, day);
};
const daysUntil = (dateStr) => {
  const d = parseEventDate(dateStr);
  if (!d) return null;
  const diff = Math.ceil((d - Date.now()) / 86400000);
  return diff < 0 || diff > 45 ? null : diff;
};
const STATUS_LABEL = { open: 'INSCRIÇÕES ABERTAS', soon: 'EM BREVE', full: 'VAGAS ESGOTADAS' };
const priceLabel = (p) => {
  const s = (p ?? '').toString().trim();
  if (!s || /^gr[aá]tis$/i.test(s) || s === '0') return 'Grátis';
  return /^r\$/i.test(s) ? s : `R$ ${s}`;
};

export default function EventsRail({ items = [], going = {} }) {
  const list = (items || []).filter(Boolean);
  if (list.length === 0) return null;

  const slides = list.map((e, i) => {
    const type = e.type || 'open';
    const go = going[e.id] || 0;
    const cover = (e.images && e.images[0]) || e.image_url;
    const dleft = daysUntil(e.date);
    return (
      <Link key={e.id || i} className="ig-evcard" href={`/eventos/${e.id}`}>
        <div className="ig-evcover">
          {cover
            ? <img src={cover} alt={e.title} loading="lazy" />
            : <span className="ig-evcover-empty"><Calendar size={34} /></span>}
          <span className={`ig-badge ${type}`}>{STATUS_LABEL[type] || STATUS_LABEL.open}</span>
          {e.category && <span className="ig-type">{e.category}</span>}
          {dleft !== null && (
            <span className="ig-count"><Flame size={12} />{dleft === 0 ? 'é hoje' : `faltam ${dleft}d`}</span>
          )}
        </div>
        <div className="ig-evbody">
          <div className="ig-datechip"><Calendar size={13} />{[e.date, e.time].filter(Boolean).join(' · ')}</div>
          <h3 className="ig-evtitle">{e.title}</h3>
          {e.local && <div className="ig-loc"><MapPin size={14} />{e.local}</div>}
          <div className="ig-foot">
            <span className="ig-price">{priceLabel(e.price)}</span>
            <span className="ig-going"><span className="dot" /><b>{go}</b> confirmados</span>
          </div>
        </div>
      </Link>
    );
  });

  return <EmblaCarousel slides={slides} basis="clamp(240px,76vw,300px)" gap={14} />;
}
