export default function ParqueDaCidadeLoading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 32, textAlign: 'center' }}
    >
      <div>
        <strong style={{ display: 'block', fontSize: 24 }}>Carregando guia de Itajubá…</strong>
        <span>Mapa, atrações e programação local.</span>
      </div>
    </main>
  );
}
