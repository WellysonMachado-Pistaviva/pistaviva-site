// Armazenamento LOCAL do Selo (só desenvolvimento): um JSON em .selo-local/ e as
// fotos na mesma pasta. Reproduz a regra de pv_selo_registrar (supabase_selo.sql)
// para testar o fluxo inteiro sem tocar no Supabase de produção.
//
// Leitura e escrita síncronas: dentro de um processo Node, cada chamada roda
// inteira sem intercalar com outra — é a "transação" do modo local.
import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { conquistaDoAno } from './conquistas.mjs';
import { LIMITE_DENUNCIAS, autorFoto } from './mapaCidades.mjs';

const DEZ_MIN = 10 * 60 * 1000;
const SEGREDO_DEV = 'selo-local-dev';   // assina URLs de upload locais; não protege nada em produção

export function criarStoreLocal(pasta = join(process.cwd(), '.selo-local')) {
  const arquivo = join(pasta, 'db.json');
  const pastaFotos = join(pasta, 'fotos');

  function ler() {
    if (!existsSync(arquivo)) return { proximoNumero: 1, motociclistas: [], visitas: [], conquistas: [], usos: [], parceiros: [], entradas: [], denuncias: [], series: {} };
    const db = JSON.parse(readFileSync(arquivo, 'utf8'));
    return { ...db, acessos: db.acessos || [], conquistas: db.conquistas || [], usos: db.usos || [], parceiros: db.parceiros || [], entradas: db.entradas || [], denuncias: db.denuncias || [], series: db.series || {} };
  }
  function gravar(db) {
    mkdirSync(pasta, { recursive: true });
    const tmp = `${arquivo}.tmp`;
    writeFileSync(tmp, JSON.stringify(db, null, 2));
    renameSync(tmp, arquivo);
  }
  const resposta = (v, m, reaproveitada) =>
    ({ visitaId: v.id, numero: m.numero, codigo: m.codigo, criadoEm: v.criado_em, reaproveitada });

  function registrar(d, agora = new Date()) {
    if (!/^[1-9][0-9]{9,10}$/.test(d.whatsapp || '')) throw new Error('WhatsApp obrigatório.');
    const db = ler();
    const porId = (id) => db.motociclistas.find((m) => m.id === id);

    const repetida = db.visitas.find((v) => v.chave_envio === d.chave);
    if (repetida) return resposta(repetida, porId(repetida.motociclista_id), true);

    let moto = d.whatsapp ? db.motociclistas.find((m) => m.whatsapp === d.whatsapp) : null;
    if (moto) {
      const recente = db.visitas
        .filter((v) => v.motociclista_id === moto.id && v.estacao === d.estacao && v.ano === d.ano)
        .sort((a, b) => b.criado_em.localeCompare(a.criado_em))[0];
      if (recente) return resposta(recente, moto, true);
    } else {
      moto = {
        id: randomUUID(), numero: db.proximoNumero++, codigo: randomBytes(6).toString('hex'),
        nome: d.nome, whatsapp: d.whatsapp || null, cidade: d.cidade, uf: d.uf,
        criado_em: agora.toISOString(), atualizado_em: agora.toISOString(),
      };
      db.motociclistas.push(moto);
    }

    const visita = {
      id: randomUUID(), motociclista_id: moto.id, chave_envio: d.chave, criado_em: agora.toISOString(),
      cidade: d.cidade, uf: d.uf, passou_por: d.passou_por, estacao: d.estacao, ano: d.ano,
      local: d.local || 'parque', foto_path: null, foto_autorizada: Boolean(d.foto_autorizada),
      foto_status: 'pendente', aceite_lgpd: true, retirado_em: null,
      liberado_em: null, checkin_metodo: null, checkin_em: null, checkin_distancia_m: null, checkin_precisao_m: null, prova_path: null,
    };
    db.visitas.push(visita);
    gravar(db);
    return resposta(visita, moto, false);
  }

  function retirar(visitaId, estacao, ano, agora = new Date()) {
    const db = ler();
    const v = db.visitas.find((x) => x.id === visitaId && x.estacao === estacao && x.ano === ano);
    if (!v || v.retirado_em) return false;
    v.retirado_em = agora.toISOString();
    gravar(db);
    return true;
  }

  // ── check-in ────────────────────────────────────────────────────
  function visitaAtual(codigo, estacao, ano) {
    const db = ler();
    const m = db.motociclistas.find((x) => x.codigo === codigo);
    return m ? db.visitas.find((v) => v.motociclista_id === m.id && v.estacao === estacao && v.ano === ano) || null : null;
  }

  // Compare-and-set: o primeiro check-in fica; os seguintes só confirmam.
  // { ok, ja } | null quando não há visita da temporada.
  function checkin(codigo, estacao, ano, { metodo, distancia = null, precisao = null }, agora = new Date()) {
    const db = ler();
    const m = db.motociclistas.find((x) => x.codigo === codigo);
    const v = m && db.visitas.find((x) => x.motociclista_id === m.id && x.estacao === estacao && x.ano === ano);
    if (!v) return null;
    if (v.liberado_em || v.retirado_em) return { ok: true, ja: true, visitaId: v.id };
    Object.assign(v, {
      liberado_em: agora.toISOString(), checkin_em: agora.toISOString(), checkin_metodo: metodo,
      checkin_distancia_m: distancia, checkin_precisao_m: precisao,
    });
    gravar(db);
    return { ok: true, ja: false, visitaId: v.id };
  }

  function marcarProva(visitaId, path) {
    const db = ler();
    const v = db.visitas.find((x) => x.id === visitaId);
    if (!v) return false;
    v.prova_path = path;
    gravar(db);
    return true;
  }

  // Atendente recusa a prova/GPS: o selo digital volta a "registrado". Entrega no balcão não se desfaz.
  function revogarCheckin(visitaId) {
    const db = ler();
    const v = db.visitas.find((x) => x.id === visitaId);
    if (!v || !v.liberado_em || v.retirado_em) return false;
    Object.assign(v, { liberado_em: null, checkin_metodo: null, checkin_em: null, checkin_distancia_m: null, checkin_precisao_m: null });
    gravar(db);
    return true;
  }

  // ── endereço e código de benefício ─────────────────────────────
  function salvarEndereco(codigo, e, gerar, agora = new Date()) {
    const db = ler();
    const m = db.motociclistas.find((x) => x.codigo === codigo);
    if (!m) return null;
    Object.assign(m, {
      cep: e.cep, logradouro: e.logradouro, numero_endereco: e.numero, complemento: e.complemento || null, bairro: e.bairro,
      atualizado_em: agora.toISOString(),
    });
    if (!m.cupom) {
      let c;
      do c = gerar(); while (db.motociclistas.some((x) => x.cupom === c));
      m.cupom = c;
    }
    gravar(db);
    return m;
  }

  function porCupom(cupom) {
    const db = ler();
    const m = db.motociclistas.find((x) => x.cupom === cupom);
    if (!m) return null;
    return {
      moto: m,
      visitas: db.visitas.filter((v) => v.motociclista_id === m.id),
      usos: db.usos.filter((u) => u.motociclista_id === m.id).sort((a, b) => b.usado_em.localeCompare(a.usado_em)),
    };
  }

  // Espelha o índice único do SQL: um almoço por (motociclista, ano).
  function registrarUso(motoId, nota, parceiroId = null, { tipo = 'desconto', ano = null } = {}, agora = new Date()) {
    const db = ler();
    if (!db.motociclistas.some((m) => m.id === motoId)) return false;
    if (tipo === 'almoco' && db.usos.some((u) => u.motociclista_id === motoId && u.tipo === 'almoco' && u.ano === ano)) return 'duplicado';
    db.usos.push({ id: randomUUID(), motociclista_id: motoId, parceiro_id: parceiroId, usado_em: agora.toISOString(), nota: nota || null, tipo, ano: tipo === 'almoco' ? ano : null });
    gravar(db);
    return true;
  }

  // ── parceiros (link secreto por estabelecimento) ───────────────
  function criarParceiro(nome, token, agora = new Date()) {
    const db = ler();
    const p = { id: randomUUID(), nome, token, ativo: true, criado_em: agora.toISOString() };
    db.parceiros.push(p);
    gravar(db);
    return p;
  }

  function listarParceiros() {
    const db = ler();
    return db.parceiros.map((p) => ({ ...p, usos: db.usos.filter((u) => u.parceiro_id === p.id).length }))
      .sort((a, b) => a.nome.localeCompare(b.nome));
  }

  function ativarParceiro(id, ativo) {
    const db = ler();
    const p = db.parceiros.find((x) => x.id === id);
    if (!p) return false;
    p.ativo = ativo;
    gravar(db);
    return true;
  }

  function parceiroPorToken(token) {
    return ler().parceiros.find((p) => p.token === token && p.ativo) || null;
  }

  function salvarSeloParceiro(id, { cor, local }, gerar, agora = new Date()) {
    const db = ler();
    const p = db.parceiros.find((x) => x.id === id && x.ativo);
    if (!p) return null;
    if (!p.selo_codigo) {
      do p.selo_codigo = gerar(); while (db.parceiros.some((x) => x !== p && x.selo_codigo === p.selo_codigo));
    }
    Object.assign(p, { selo_cor: cor, selo_local: local, selo_atualizado_em: agora.toISOString() });
    gravar(db);
    return p;
  }

  function contagemSelos() {
    const pessoas = {};
    for (const v of ler().visitas) {
      if (!v.retirado_em && !v.liberado_em) continue;
      (pessoas[v.estacao] ||= new Set()).add(v.motociclista_id);
    }
    return Object.fromEntries(['verao', 'outono', 'inverno', 'primavera'].map((e) => [e, pessoas[e]?.size || 0]));
  }

  function paradasOficiais() {
    return ler().parceiros.filter((p) => p.ativo && p.selo_codigo && p.selo_local)
      .map(({ nome, selo_codigo, selo_cor, selo_local, criado_em }) => ({ nome, selo_codigo, selo_cor, selo_local, criado_em }))
      .sort((a, b) => a.selo_local.localeCompare(b.selo_local, 'pt-BR'));
  }

  function parceiroPorSelo(codigo) {
    return ler().parceiros.find((p) => p.selo_codigo === codigo) || null;
  }

  function visitaPorChave(chave) {
    return ler().visitas.find((v) => v.chave_envio === chave) || null;
  }

  function perfil(codigo) {
    const db = ler();
    const moto = db.motociclistas.find((m) => m.codigo === codigo);
    if (!moto) return null;
    const visitas = db.visitas.filter((v) => v.motociclista_id === moto.id)
      .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
    return {
      moto, visitas, conquistas: db.conquistas.filter((c) => c.motociclista_id === moto.id),
      usos: db.usos.filter((u) => u.motociclista_id === moto.id && u.tipo === 'almoco'),
    };
  }

  function porWhatsapp(whatsapp) {
    return ler().motociclistas.find((m) => m.whatsapp === whatsapp) || null;
  }

  // URL "assinada" local: HMAC do caminho + validade, como a do Supabase.
  const assinar = (path, exp) => createHmac('sha256', SEGREDO_DEV).update(`${path}:${exp}`).digest('hex');

  function urlUpload(path, base) {
    const exp = Date.now() + DEZ_MIN;
    return `${base}/api/selo/foto-local?path=${encodeURIComponent(path)}&exp=${exp}&sig=${assinar(path, exp)}`;
  }

  function uploadValido(path, exp, sig) {
    if (!/^[a-z0-9-]+\.jpg$/.test(path) || !(Number(exp) > Date.now())) return false;
    const esperado = Buffer.from(assinar(path, exp));
    const recebido = Buffer.from(String(sig));
    return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
  }

  function salvarFoto(path, bytes) {
    mkdirSync(pastaFotos, { recursive: true });
    writeFileSync(join(pastaFotos, path), bytes);
  }

  function fotoExiste(path) {
    return /^[a-z0-9-]+\.jpg$/.test(path) && existsSync(join(pastaFotos, path));
  }

  function lerFoto(path) {
    return fotoExiste(path) ? readFileSync(join(pastaFotos, path)) : null;
  }

  function apagarFoto(path) {
    if (fotoExiste(path)) rmSync(join(pastaFotos, path));
  }

  function identificacao(codigo) {
    const db = ler();
    const m = db.motociclistas.find((p) => p.codigo === codigo);
    if (!m) return null;
    return { motoId: m.id, registro: (db.identificacoes || []).find((i) => i.motociclista_id === m.id) || null };
  }

  function salvarIdentificacao(codigo, dados, fotoPath, alterarFoto) {
    const db = ler();
    const m = db.motociclistas.find((p) => p.codigo === codigo);
    if (!m) return null;
    db.identificacoes ||= [];
    const anterior = db.identificacoes.find((i) => i.motociclista_id === m.id);
    const registro = { motociclista_id: m.id, piloto: dados.piloto, garupa: dados.garupa, origem: dados.origem, assinatura: dados.assinatura, foto_path: alterarFoto ? fotoPath : anterior?.foto_path || null, atualizado_em: new Date().toISOString() };
    db.identificacoes = db.identificacoes.filter((i) => i.motociclista_id !== m.id);
    db.identificacoes.push(registro);
    gravar(db);
    return { foto_anterior: alterarFoto ? anterior?.foto_path || null : null, atualizado_em: registro.atualizado_em };
  }

  function marcarFoto(chave, path) {
    const db = ler();
    const v = db.visitas.find((x) => x.chave_envio === chave);
    if (!v) return false;
    v.foto_path = path;
    gravar(db);
    return true;
  }

  // ── admin ──────────────────────────────────────────────────────
  // Visitas unidas ao motociclista, mais recentes primeiro.
  function listarVisitas() {
    const db = ler();
    const motos = new Map(db.motociclistas.map((m) => [m.id, m]));
    return db.visitas
      .map((v) => {
        const m = motos.get(v.motociclista_id);
        return { ...v, numero: m.numero, nome: m.nome, whatsapp: m.whatsapp, codigo: m.codigo };
      })
      .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  }

  function mudarStatusFoto(visitaId, status) {
    const db = ler();
    const v = db.visitas.find((x) => x.id === visitaId);
    if (!v || !v.foto_path) return false;
    if (status === 'aprovada' && !v.foto_autorizada) return false;   // sem autorização não vai pra rede
    v.foto_status = status;
    gravar(db);
    return true;
  }

  function autorizarConquista(codigo, ano, autorizar) {
    const db = ler();
    const m = db.motociclistas.find((x) => x.codigo === codigo);
    if (!m || (autorizar && conquistaDoAno(db.visitas.filter((v) => v.motociclista_id === m.id), ano).total === 0)) return false;
    let c = db.conquistas.find((x) => x.motociclista_id === m.id && x.ano === ano);
    if (!c) {
      c = { id: randomUUID(), motociclista_id: m.id, ano, autorizado_em: null, aprovado_em: null };
      db.conquistas.push(c);
    }
    // Repetir um pedido autorizado não remove aprovação existente.
    if (Boolean(c.autorizado_em) !== autorizar) {
      c.autorizado_em = autorizar ? new Date().toISOString() : null;
      c.aprovado_em = null;
    }
    gravar(db);
    return true;
  }

  function listarConquistas() {
    const db = ler();
    return db.conquistas.flatMap((c) => {
      const m = db.motociclistas.find((x) => x.id === c.motociclista_id);
      const conquista = conquistaDoAno(db.visitas.filter((v) => v.motociclista_id === c.motociclista_id), c.ano);
      return m && conquista.total > 0 ? [{ ...c, nome: m.nome, numero: m.numero, cidade: m.cidade, uf: m.uf, total: conquista.total, etapas: conquista.etapas, concluidoEm: conquista.concluidoEm }] : [];
    });
  }

  function publicarConquista(id, publicar) {
    const db = ler();
    const c = db.conquistas.find((x) => x.id === id);
    if (!c) return false;
    if (publicar && (!c.autorizado_em || conquistaDoAno(db.visitas.filter((v) => v.motociclista_id === c.motociclista_id), c.ano).total === 0)) return false;
    c.aprovado_em = publicar ? (c.aprovado_em || new Date().toISOString()) : null;
    gravar(db);
    return true;
  }

  function motociclistas() {
    return ler().motociclistas;
  }

  // ── carimbos de cidade (pv_selo_entradas) ─────────────────────
  function motoPorCodigo(codigo) {
    const m = ler().motociclistas.find((x) => x.codigo === codigo);
    return m ? { id: m.id } : null;
  }

  // Passaporte criado pelo site (pv_selo_criar_passaporte). WhatsApp já
  // cadastrado não devolve o código: a recuperação é em /selo/meu-numero.
  function criarPassaporte(d, agora = new Date(), acesso = null) {
    if (!/^[1-9][0-9]{9,10}$/.test(d.whatsapp || '')) throw new Error('WhatsApp obrigatório.');
    const db = ler();
    const ja = db.motociclistas.find((m) => m.whatsapp === d.whatsapp);
    if (ja) return { numero: ja.numero, codigo: null, existente: true };
    const moto = {
      id: randomUUID(), numero: db.proximoNumero++, codigo: randomBytes(6).toString('hex'),
      nome: d.nome, whatsapp: d.whatsapp, cidade: d.cidade, uf: d.uf, aceite_lgpd_em: agora.toISOString(),
      criado_em: agora.toISOString(), atualizado_em: agora.toISOString(),
    };
    db.motociclistas.push(moto);
    if (acesso) {
      db.acessos ||= [];
      db.acessos.push({ motociclista_id: moto.id, senha_hash: acesso.senha_hash, recuperacao_hash: acesso.recuperacao_hash });
    }
    gravar(db);
    return { numero: moto.numero, codigo: moto.codigo, existente: false };
  }

  function cadastrarAcesso(d, c) {
    const r = criarPassaporte(d, new Date(), c);
    return r.existente ? null : { codigo: r.codigo, numero: r.numero, nome: d.nome, cidade: d.cidade, uf: d.uf };
  }
  function buscarAcesso(teste) {
    const db = ler();
    const a = (db.acessos || []).find((a) => teste(a, db.motociclistas.find((m) => m.id === a.motociclista_id)));
    if (!a) return null;
    const m = db.motociclistas.find((m) => m.id === a.motociclista_id);
    return { ...a, pessoa: { nome: m.nome, whatsapp: m.whatsapp, cidade: m.cidade, uf: m.uf } };
  }
  const acessoPorWhatsapp = (numero) => buscarAcesso((_a, m) => m?.whatsapp === numero);
  const acessoPorRecuperacao = (hash) => buscarAcesso((a) => a.recuperacao_hash === hash);
  function confirmarSenha(id, hash) {
    const db = ler();
    if (!(db.acessos || []).some((a) => a.motociclista_id === id && a.senha_hash === hash)) return null;
    const m = db.motociclistas.find((m) => m.id === id);
    return m ? { codigo: m.codigo, numero: m.numero, nome: m.nome, cidade: m.cidade, uf: m.uf } : null;
  }
  function ativarAcesso(codigo, c) {
    const db = ler();
    const m = db.motociclistas.find((m) => m.codigo === codigo);
    if (!m || (db.acessos || []).some((a) => a.motociclista_id === m.id)) return false;
    db.acessos ||= [];
    db.acessos.push({ motociclista_id: m.id, senha_hash: c.senha_hash, recuperacao_hash: c.recuperacao_hash });
    gravar(db);
    return true;
  }
  function redefinirAcesso(id, antigoHash, c, codigo) {
    const db = ler();
    const a = (db.acessos || []).find((a) => a.motociclista_id === id && a.recuperacao_hash === antigoHash);
    const m = db.motociclistas.find((m) => m.id === id);
    if (!a || !m || db.motociclistas.some((m) => m.codigo === codigo)) return false;
    a.senha_hash = c.senha_hash;
    a.recuperacao_hash = c.recuperacao_hash;
    m.codigo = codigo;
    m.atualizado_em = new Date().toISOString();
    gravar(db);
    return true;
  }

  // { ok, ja, id } | null (código desconhecido). Um carimbo por cidade por dia.
  function carimbarCidade(codigo, d, agora = new Date()) {
    const db = ler();
    const m = db.motociclistas.find((x) => x.codigo === codigo);
    if (!m) return null;
    const ja = db.entradas.find((e) => e.motociclista_id === m.id && e.carimbo === d.carimbo && e.dia === d.dia);
    if (ja) return { ok: true, ja: true, id: ja.id, serie: ja.serie ?? null };
    // Igual ao gatilho pv_selo_entradas_serie: número nunca reaproveitado.
    db.series[d.carimbo] = (db.series[d.carimbo] || 0) + 1;
    const e = {
      serie: db.series[d.carimbo],
      id: randomUUID(), motociclista_id: m.id, tipo: 'cidade', carimbo: d.carimbo, ibge: d.ibge, uf: d.uf, dia: d.dia,
      criado_em: agora.toISOString(), metodo: d.metodo || 'gps', capturado_em: d.capturadoEm || agora.toISOString(),
      distancia_m: d.distancia, precisao_m: d.precisao, foto_path: d.foto || null, foto_status: d.foto ? 'privada' : null,
      foto_em: null, denuncias: 0,
    };
    db.entradas.push(e);
    gravar(db);
    return { ok: true, ja: false, id: e.id, serie: e.serie };
  }

  // Foto opcional do carimbo. Só o dono do passaporte anexa à própria entrada.
  function anexarFotoCidade(codigo, entradaId, path, publica, agora = new Date()) {
    const db = ler();
    const m = db.motociclistas.find((x) => x.codigo === codigo);
    const e = m && db.entradas.find((x) => x.id === entradaId && x.motociclista_id === m.id);
    if (!e) return null;
    e.foto_path = path;
    e.foto_status = publica ? 'publica' : 'privada';
    e.foto_em = agora.toISOString();
    gravar(db);
    return { carimbo: e.carimbo, status: e.foto_status };
  }

  function resumoMapa() {
    const por = new Map();
    for (const e of ler().entradas) {
      const t = por.get(e.carimbo) || { carimbo: e.carimbo, carimbos: 0, pessoas: new Set(), fotos: 0 };
      t.carimbos++;
      t.pessoas.add(e.motociclista_id);
      if (e.foto_status === 'publica') t.fotos++;
      por.set(e.carimbo, t);
    }
    return [...por.values()].map((t) => ({ ...t, pessoas: t.pessoas.size }));
  }

  function fotosDaCidade(slug, limite = 60) {
    const db = ler();
    return db.entradas
      .filter((e) => e.carimbo === slug && e.foto_status === 'publica' && e.foto_path)
      .sort((a, b) => (b.foto_em || '').localeCompare(a.foto_em || ''))
      .slice(0, limite)
      .map((e) => {
        const m = db.motociclistas.find((x) => x.id === e.motociclista_id);
        return { id: e.id, dia: e.dia, fotoEm: e.foto_em, autor: autorFoto(m?.nome, m?.numero) };
      });
  }

  // Caminho do arquivo só se a foto está pública agora.
  function fotoPublica(id) {
    const e = ler().entradas.find((x) => x.id === id);
    return e?.foto_status === 'publica' && e.foto_path ? e.foto_path : null;
  }

  function denunciarFoto(id, quem) {
    const db = ler();
    const e = db.entradas.find((x) => x.id === id);
    if (!e) return null;
    if (!db.denuncias.some((d) => d.entrada_id === id && d.quem === quem)) db.denuncias.push({ entrada_id: id, quem, criado_em: new Date().toISOString() });
    e.denuncias = db.denuncias.filter((d) => d.entrada_id === id).length;
    if (e.foto_status === 'publica' && e.denuncias >= LIMITE_DENUNCIAS) e.foto_status = 'denunciada';
    gravar(db);
    return e.foto_status;
  }

  function listarFotosCidades(status) {
    const db = ler();
    return db.entradas
      .filter((e) => e.foto_path && e.foto_status === status)
      .sort((a, b) => (b.foto_em || '').localeCompare(a.foto_em || ''))
      .slice(0, 200)
      .map((e) => {
        const m = db.motociclistas.find((x) => x.id === e.motociclista_id);
        return { id: e.id, carimbo: e.carimbo, dia: e.dia, foto_path: e.foto_path, foto_em: e.foto_em, denuncias: e.denuncias || 0, nome: m?.nome, numero: m?.numero };
      });
  }

  function mudarStatusFotoCidade(id, status) {
    const db = ler();
    const e = db.entradas.find((x) => x.id === id && x.foto_path);
    if (!e) return false;
    e.foto_status = status;
    // Restaurar zera as denúncias: a foto já foi revisada.
    if (status === 'publica') { e.denuncias = 0; db.denuncias = db.denuncias.filter((d) => d.entrada_id !== id); }
    gravar(db);
    return true;
  }

  function entradas(motoId) {
    return ler().entradas.filter((e) => e.motociclista_id === motoId).sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  }

  function memoriaPorEntrada(codigo, entradaId) {
    const db = ler();
    const m = db.motociclistas.find((x) => x.codigo === codigo);
    const e = m && db.entradas.find((x) => x.id === entradaId && x.motociclista_id === m.id);
    if (!e) return null;
    return { relato: e.memoria_relato || '', atualizadoEm: e.memoria_em || null, fotoPath: e.foto_path || null, fotoStatus: e.foto_status || null };
  }

  function salvarMemoria(codigo, entradaId, relato, agora = new Date()) {
    const db = ler();
    const m = db.motociclistas.find((x) => x.codigo === codigo);
    const e = m && db.entradas.find((x) => x.id === entradaId && x.motociclista_id === m.id);
    if (!e) return null;
    e.memoria_relato = relato;
    e.memoria_em = agora.toISOString();
    gravar(db);
    return { relato, atualizadoEm: e.memoria_em };
  }

  function autorizarPassaporte(codigo, publico, agora = new Date()) {
    const db = ler();
    const m = db.motociclistas.find((x) => x.codigo === codigo);
    if (!m) return false;
    m.passaporte_publico_em = publico ? (m.passaporte_publico_em || agora.toISOString()) : null;
    gravar(db);
    return true;
  }

  function passaportePublico(numero) {
    const db = ler();
    const m = db.motociclistas.find((x) => x.numero === numero && x.passaporte_publico_em);
    if (!m) return null;
    return { moto: m, visitas: db.visitas.filter((v) => v.motociclista_id === m.id), entradas: entradas(m.id) };
  }

  // LGPD: apaga a pessoa, as visitas, os carimbos e as fotos.
  function excluirMotociclista(id) {
    const db = ler();
    const visitas = db.visitas.filter((v) => v.motociclista_id === id);
    for (const v of visitas) {
      for (const f of [v.foto_path, v.prova_path]) if (f && fotoExiste(f)) rmSync(join(pastaFotos, f));
    }
    const minhas = db.entradas.filter((x) => x.motociclista_id === id);
    for (const e of minhas) if (fotoExiste(e.foto_path)) rmSync(join(pastaFotos, e.foto_path));
    db.denuncias = db.denuncias.filter((d) => !minhas.some((e) => e.id === d.entrada_id));
    db.entradas = db.entradas.filter((e) => e.motociclista_id !== id);
    const antes = db.motociclistas.length;
    db.conquistas = db.conquistas.filter((c) => c.motociclista_id !== id);
    db.usos = db.usos.filter((u) => u.motociclista_id !== id);
    db.motociclistas = db.motociclistas.filter((m) => m.id !== id);
    db.acessos = (db.acessos || []).filter((a) => a.motociclista_id !== id);
    for (const i of db.identificacoes || []) if (i.motociclista_id === id) apagarFoto(i.foto_path);
    db.identificacoes = (db.identificacoes || []).filter((i) => i.motociclista_id !== id);
    db.visitas = db.visitas.filter((v) => v.motociclista_id !== id);
    gravar(db);
    return db.motociclistas.length < antes;
  }

  return {
    identificacao, salvarIdentificacao, apagarFoto,
    cadastrarAcesso, acessoPorWhatsapp, acessoPorRecuperacao, confirmarSenha, ativarAcesso, redefinirAcesso,
    autorizarConquista, listarConquistas, publicarConquista, registrar, retirar, visitaPorChave,
    visitaAtual, checkin, marcarProva, revogarCheckin, salvarEndereco, porCupom, registrarUso,
    criarParceiro, listarParceiros, ativarParceiro, parceiroPorToken, salvarSeloParceiro, parceiroPorSelo, contagemSelos, paradasOficiais, perfil, porWhatsapp, urlUpload, uploadValido, salvarFoto, fotoExiste, lerFoto, marcarFoto, ler,
    listarVisitas, mudarStatusFoto, motociclistas, excluirMotociclista,
    motoPorCodigo, carimbarCidade, entradas, autorizarPassaporte, passaportePublico, memoriaPorEntrada, salvarMemoria,
    criarPassaporte, anexarFotoCidade, resumoMapa, fotosDaCidade, fotoPublica, denunciarFoto, listarFotosCidades, mudarStatusFotoCidade,
  };
}
