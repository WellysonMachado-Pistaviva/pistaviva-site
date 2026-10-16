import estados from '../lib/selo/mapaEstados.json';
import { gerarFichaPassaporte } from './passaporte/artePassaporte';
import { carregarFontes, carregarImagem, carregarIdentidade } from './passaporte/recursosPassaporte';

// Canvas local, sem tiles ou imagens externas. Compartilha somente o mapa e
// os dados que a pessoa já está vendo. Nenhum segredo ou relato entra aqui.
export async function gerarImagemMapa({ cidades, pessoa, privado, codigo, demonstracao }) {
  const identidade = await carregarIdentidade({ pessoa, privado, codigo, demonstracao });
  const [papel, ficha] = await Promise.all([
    carregarImagem('/selo/passaporte/papel.webp'),
    gerarFichaPassaporte(identidade),
    carregarFontes(),
  ]);
  const canvas = document.createElement('canvas');
  canvas.width = 1080; canvas.height = 1920;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponível');
  const ufs = new Set(cidades.map((c) => c.uf));
  ctx.drawImage(papel, 0, 0, 1080, 1920);
  ctx.fillStyle = '#5a4a3a'; ctx.textAlign = 'center'; ctx.font = '700 22px PassaporteSlab';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '3px';
  ctx.fillText(`PASSAPORTE DO MOTOCICLISTA · Nº ${String(pessoa.numero).padStart(4, '0')}`, 540, 64);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.save();
  ctx.translate(540, 414); ctx.rotate(0.012);
  ctx.shadowColor = 'rgba(40,25,15,.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
  ctx.fillStyle = '#efe8dc'; ctx.fillRect(-480, -312, 960, 624);
  ctx.shadowColor = 'transparent'; ctx.drawImage(ficha, -470, -302, 940, 601);
  ctx.restore();
  ctx.fillStyle = '#1e1111'; ctx.font = '88px PassaporteTitulo'; ctx.fillText('MEU BRASIL', 540, 858);
  ctx.fillStyle = '#a3281c'; ctx.font = '34px PassaporteCarimbo';
  ctx.fillText(`${cidades.length} ${cidades.length === 1 ? 'CIDADE' : 'CIDADES'} · ${ufs.size} ${ufs.size === 1 ? 'ESTADO' : 'ESTADOS'}`, 540, 920);
  const paths = estados.map((e) => `<path d="${e.d}" fill="${ufs.has(e.uf) ? '#a3281c' : '#d7cfbe'}" stroke="#f6eee6" stroke-width="1.5"/>`).join('');
  const pontos = cidades.filter((c) => c.ponto).map((c) => `<circle cx="${c.ponto[0]}" cy="${c.ponto[1]}" r="3.1" fill="#1e1111" stroke="#f6eee6" stroke-width="1.2"/>`).join('');
  const blob = new Blob([`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 600" width="768" height="720">${paths}${pontos}</svg>`], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  try {
    const img = await carregarImagem(url);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(img, 156, 950, 768, 720); ctx.restore();
  } finally { URL.revokeObjectURL(url); }
  ctx.fillStyle = '#5a4a3a'; ctx.font = '700 20px PassaporteSlab'; ctx.fillText('ÚLTIMAS CONQUISTAS', 540, 1698);
  ctx.font = '400 21px PassaporteSlab';
  cidades.slice(0, 3).forEach((c, i) => {
    const x = 540 + (i - (Math.min(cidades.length, 3) - 1) / 2) * 316;
    ctx.fillText(`${c.nome}/${c.uf}`, x, 1746, 296);
    ctx.font = '400 17px PassaporteSlab';
    ctx.fillText(c.visitas[0].dia.split('-').reverse().join('/'), x, 1780);
    ctx.font = '400 21px PassaporteSlab';
  });
  ctx.fillStyle = '#5a4a3a'; ctx.font = '700 24px PassaporteSlab'; ctx.fillText('CONECTANDO PESSOAS A LUGARES', 540, 1844);
  ctx.fillStyle = '#ff5a00'; ctx.font = '700 25px PassaporteSlab'; ctx.fillText('pistavivamototurismo.com.br/selo', 540, 1888);
  const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.94));
  if (!jpeg) throw new Error('Imagem indisponível');
  return new File([jpeg], `pista-viva-meu-brasil-${pessoa.numero}.jpg`, { type: 'image/jpeg' });
}
