import 'server-only';
import QRCode from 'qrcode';
import { montarSeloSvg } from './seloParceiroArte.mjs';

export const urlVerificacao = (origem, codigo) => `${origem}/selo/v/${codigo}`;

// Resposta SVG do selo. baixar: anexo com nome de arquivo; previa: marca d'água.
export async function respostaSelo({ parceiro, cor, local, origem, previa = false, baixar = false }) {
  const url = urlVerificacao(origem, parceiro.selo_codigo || 'XXXXXXXX');
  const qrSvg = await QRCode.toString(url, { type: 'svg', margin: 0, errorCorrectionLevel: 'M' });
  const svg = montarSeloSvg({ cor, local, codigo: parceiro.selo_codigo || 'XXXXXXXX', parceiro: parceiro.nome, url, qrSvg, previa });
  const headers = {
    'Content-Type': 'image/svg+xml; charset=utf-8',
    'Cache-Control': previa ? 'private, no-store' : 'public, max-age=300',
    'X-Content-Type-Options': 'nosniff',
    'Content-Security-Policy': "default-src 'none'; style-src 'unsafe-inline'",
  };
  if (baixar) headers['Content-Disposition'] = `attachment; filename="selo-${parceiro.selo_codigo}.svg"`;
  return new Response(svg, { headers });
}
