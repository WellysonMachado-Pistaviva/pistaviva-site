'use client';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { redigirUrl } from '../lib/urlPrivada.mjs';

const limpar = (event) => ({ ...event, url: redigirUrl(event.url) });

// Vercel Analytics e Speed Insights com a credencial da URL trocada por marcador.
// O GA é desligado nas rotas privadas pelo script inline do layout (scriptGa).
export default function Analiticos() {
  return <>
    <Analytics beforeSend={limpar} />
    <SpeedInsights beforeSend={limpar} />
  </>;
}
