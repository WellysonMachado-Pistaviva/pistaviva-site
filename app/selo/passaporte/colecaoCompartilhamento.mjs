// Stories: seis carimbos na identificação, doze nas seguintes. Feed: quatro
// na identificação e seis nas seguintes, com mais espaço para cada arte.
// Nenhum limite de coleção é aplicado: todas as entradas mantêm sua ordem.
export function paginarColecao(carimbos, formato = 'stories') {
  const primeira = formato === 'feed' ? 4 : 6;
  const demais = formato === 'feed' ? 6 : 12;
  const paginas = [{ identificacao: true, carimbos: carimbos.slice(0, primeira), inicio: 0 }];
  for (let inicio = primeira; inicio < carimbos.length; inicio += demais) {
    paginas.push({ identificacao: false, carimbos: carimbos.slice(inicio, inicio + demais), inicio });
  }
  return paginas;
}

// ZIP sem recompressão: os JPEGs já estão comprimidos. Um único download
// evita bloqueios de múltiplos arquivos e mantém a ordem das páginas.
const tabelaCrc = Array.from({ length: 256 }, (_, i) => {
  let n = i;
  for (let j = 0; j < 8; j++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = tabelaCrc[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

export async function zipColecao(arquivos) {
  const partes = [], diretorio = [];
  const encoder = new TextEncoder();
  let offset = 0, tamanhoDiretorio = 0;
  for (const arquivo of arquivos) {
    const bytes = new Uint8Array(await arquivo.arrayBuffer());
    const nome = encoder.encode(arquivo.name);
    const crc = crc32(bytes);
    const cabecalho = new Uint8Array(30 + nome.length);
    const view = new DataView(cabecalho.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x0800, true);
    view.setUint16(12, 33, true); // 1º de janeiro de 1980, data DOS válida.
    view.setUint32(14, crc, true);
    view.setUint32(18, bytes.length, true);
    view.setUint32(22, bytes.length, true);
    view.setUint16(26, nome.length, true);
    cabecalho.set(nome, 30);
    partes.push(cabecalho, bytes);

    const central = new Uint8Array(46 + nome.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true);
    cv.setUint16(6, 20, true);
    cv.setUint16(8, 0x0800, true);
    cv.setUint16(14, 33, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, bytes.length, true);
    cv.setUint32(24, bytes.length, true);
    cv.setUint16(28, nome.length, true);
    cv.setUint32(42, offset, true);
    central.set(nome, 46);
    diretorio.push(central);
    tamanhoDiretorio += central.length;
    offset += cabecalho.length + bytes.length;
  }
  const fim = new Uint8Array(22);
  const fv = new DataView(fim.buffer);
  fv.setUint32(0, 0x06054b50, true);
  fv.setUint16(8, arquivos.length, true);
  fv.setUint16(10, arquivos.length, true);
  fv.setUint32(12, tamanhoDiretorio, true);
  fv.setUint32(16, offset, true);
  return new Blob([...partes, ...diretorio, fim], { type: 'application/zip' });
}
