'use client';
import { useState } from 'react';
import CarimbosVista from './CarimbosVista';
import MapaPessoal from './MapaPessoal';
import MemoriaCarimbo from './MemoriaCarimbo';
import './jornada-passaporte.css';

export default function JornadaPassaporte({ pessoa, carimbos, paginas, cidades, privado, codigo, demonstracao, vazio }) {
  const [aberto, setAberto] = useState(null);
  const [salvos, setSalvos] = useState({});
  const [rascunhos, setRascunhos] = useState({});
  return <>
    <section className="pu-secao" aria-labelledby="pu-carimbos">
      <header><h2 id="pu-carimbos">Carimbos</h2><span>{carimbos.length === 1 ? '1 carimbo' : `${carimbos.length} carimbos`}</span></header>
      {privado && carimbos.some((c) => c.tipo === 'cidade') && <p className="jornada-dica">Cada carimbo abre uma passagem: guarde foto e relato para lembrar depois.</p>}
      <CarimbosVista carimbos={carimbos} paginas={paginas} vazio={vazio} onAbrir={setAberto} salvos={salvos} />
    </section>
    <MapaPessoal pessoa={pessoa} cidades={cidades} privado={privado} codigo={codigo} demonstracao={demonstracao} onAbrir={setAberto} />
    {aberto && <MemoriaCarimbo key={aberto.chave} carimbo={aberto} codigo={privado ? codigo : null} rascunho={rascunhos[aberto.entradaId]}
      onRascunho={(texto) => setRascunhos((r) => ({ ...r, [aberto.entradaId]: texto }))}
      onFechar={() => setAberto(null)} onSalva={() => setSalvos((s) => ({ ...s, [aberto.entradaId]: true }))} />}
  </>;
}
