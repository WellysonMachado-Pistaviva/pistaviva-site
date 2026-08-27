'use client';

export default function ParqueDaCidadeError({ reset }) {
  return (
    <main style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: 32, textAlign: 'center' }}>
      <div>
        <strong style={{ display: 'block', fontSize: 24 }}>Guia indisponível agora.</strong>
        <p>Falha temporária ao carregar informações.</p>
        <button type="button" onClick={reset}>Tentar novamente</button>
      </div>
    </main>
  );
}
