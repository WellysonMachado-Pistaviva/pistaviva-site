'use client';
export default function ImprimirCertificado() {
  return <button className="selo-btn selo-nao-imprimir" onClick={() => window.print()}>Imprimir / salvar em PDF</button>;
}
