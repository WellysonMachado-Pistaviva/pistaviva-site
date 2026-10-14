import EditorialHero from './EditorialHero';

// Collections and tools share the Home identity. Compact keeps forms nearby.
export default function PageIntro({ eyebrow, title, children, image, imageAlt = '', action, compact = false }) {
  return <EditorialHero eyebrow={eyebrow} title={title} image={image} imageAlt={imageAlt} action={action} compact={compact || !image}>
    {children}
  </EditorialHero>;
}
