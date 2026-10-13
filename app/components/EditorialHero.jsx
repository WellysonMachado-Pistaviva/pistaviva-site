import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import Cover from './Cover';

// Shared visual structure. Content supplies words/media, never its own theme.
export default function EditorialHero({
  id, eyebrow, title, children, image, imageAlt = '', media,
  action, footer, compact = false, className = '', contentClassName = '',
}) {
  return <header className={`pv-study study-hero editorial-hero${compact ? ' editorial-hero--compact' : ''} ${className}`} aria-labelledby={id}>
    {media || (image && <Cover src={image} alt={imageAlt} priority />)}
    {(media || image) && <div className="study-hero-shade" aria-hidden="true" />}
    <div className={`study-container study-hero-content ${contentClassName}`}>
      {eyebrow && <p className="study-kicker">{eyebrow}</p>}
      <h1 id={id}>{title}</h1>
      {children && <div className="editorial-hero-lead">{children}</div>}
      {action && <Link className="study-button" href={action.href}>{action.label}<ArrowUpRight size={20} aria-hidden="true" /></Link>}
      {footer && <div className="study-hero-foot">{footer}</div>}
    </div>
  </header>;
}
