// Segredo segue apenas em Authorization. Retrato não recebe URL pública.
export async function carregarIdentificacao(codigo) {
  const headers = { Authorization: `Bearer ${codigo}` };
  const r = await fetch('/api/selo/identificacao', { headers, cache: 'no-store' }).catch(() => { throw new Error('Sem conexão para consultar o cadastro.'); });
  const dados = await r.json();
  if (!r.ok) throw new Error(dados.erro || 'Cadastro indisponível.');
  let fotoSrc = null;
  if (dados.temFoto) {
    const foto = await fetch('/api/selo/identificacao?foto=1', { headers, cache: 'no-store' });
    if (!foto.ok) throw new Error('Não foi possível abrir a foto salva. Tente novamente.');
    const blob = await foto.blob();
    fotoSrc = await new Promise((ok, falha) => {
      const leitor = new FileReader();
      leitor.onload = () => ok(leitor.result);
      leitor.onerror = falha;
      leitor.readAsDataURL(blob);
    });
  }
  return { ...dados, fotoSrc };
}

export async function salvarIdentificacao(codigo, ficha, fotoSrc, removerFoto = false) {
  const form = new FormData();
  form.set('ficha', JSON.stringify(ficha));
  if (fotoSrc?.startsWith('data:image/jpeg;base64,')) form.set('foto', await fetch(fotoSrc).then((r) => r.blob()), 'identificacao.jpg');
  if (removerFoto) form.set('removerFoto', '1');
  const r = await fetch('/api/selo/identificacao', { method: 'PUT', headers: { Authorization: `Bearer ${codigo}` }, body: form }).catch(() => { throw new Error('Sem conexão. Sua edição continua neste aparelho; tente salvar novamente.'); });
  const dados = await r.json();
  if (!r.ok) throw new Error(dados.erro || 'Não foi possível salvar no cadastro.');
  return dados;
}
