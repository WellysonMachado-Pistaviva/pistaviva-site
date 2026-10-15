// Ícone do passaporte (livreto com globo): header desktop, app bar e menu mobile.
export default function PassaporteIcone({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2.5" width="14" height="19" rx="2" />
      <circle cx="12" cy="10" r="3.6" />
      <path d="M8.4 10h7.2M12 6.4c-1.4 1.1-1.4 6.1 0 7.2M12 6.4c1.4 1.1 1.4 6.1 0 7.2M9 17.5h6" />
    </svg>
  );
}
