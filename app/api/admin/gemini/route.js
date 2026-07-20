import { NextResponse } from 'next/server';
import { requireAdmin } from '../../../lib/supabaseAdmin';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MODEL = 'gemini-3.5-flash';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function gemini(prompt, schema) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return { error: 'GEMINI_API_KEY ausente no servidor.' };
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: schema
      ? { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.85 }
      : { temperature: 0.85 },
  };
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    console.error('[Gemini] Erro na API:', res.status, JSON.stringify(json?.error || json));
    return { error: json?.error?.message || `Erro Gemini (${res.status}).` };
  }
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return { text };
}

// Busca o texto de uma página externa (fonte de pesquisa). Falha silenciosa.
async function fetchRefText(url) {
  try {
    if (!/^https?:\/\//i.test(url)) return '';
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 12000);
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PistavivaBot/1.0)' } });
    clearTimeout(to);
    if (!res.ok) return '';
    let html = await res.text();
    html = html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ');
    const main = html.match(/<(article|main)[\s\S]*?<\/\1>/i)?.[0] || html;
    const text = main.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim();
    return text.slice(0, 9000);
  } catch { return ''; }
}

const BLOG_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string' },
    slug: { type: 'string' },
    excerpt: { type: 'string' },
    tags: { type: 'array', items: { type: 'string' } },
    body: { type: 'string' },
  },
  required: ['title', 'slug', 'excerpt', 'tags', 'body'],
};

function blogPrompt({ tema, keyword, refText }) {
  const refBlock = refText ? `

MATERIAL DE REFERÊNCIA (use APENAS como fonte de fatos/contexto — extraído de uma página externa):
"""
${refText.slice(0, 7000)}
"""
REGRAS DE ORIGINALIDADE (obrigatório):
- Escreva uma matéria 100% ORIGINAL, com suas próprias palavras, estrutura e ângulo.
- NÃO copie frases, NÃO traduza trechos, NÃO parafraseie sentença por sentença do material acima.
- Use só os FATOS/ideias como pesquisa; reescreva tudo na voz do Pistaviva.
- Se algum dado parecer incerto, não invente — escreva de forma geral.
` : '';
  return `Você é um motociclista viajante brasileiro experiente, escrevendo para o Pistaviva — comunidade aberta de mototurismo. Escreva uma matéria de blog completa sobre: "${tema}".${keyword ? ` Palavra-chave principal de SEO: "${keyword}".` : ''}${refBlock}

REGRAS:
- Português do Brasil, tom de quem pega estrada de verdade (use "a gente", "rolê", "pista", "curva"). Natural, sem clichê de IA, sem frases genéricas tipo "no mundo de hoje".
- Otimizada para SEO: use a palavra-chave no título, no início e ao longo do texto de forma natural.
- 600 a 900 palavras.
- Estrutura do campo "body": parágrafos separados por LINHA EM BRANCO. Use "## " para títulos de seção. NÃO repita o título principal no body.
- Inclua no final uma seção "## Perguntas frequentes" com 3 perguntas, cada pergunta como "### Pergunta?" seguida de um parágrafo de resposta (isso vira rich result no Google).
- Onde fizer sentido, insira links internos em markdown para: [rotas](/rotas), [estradas](/estradas), [Tabela FIPE](/fipe), [comboio ao vivo](/comboio). Não force.
- "excerpt": 1-2 frases, máx 160 caracteres, com a palavra-chave.
- "tags": 3 a 5 tags curtas.
- "slug": minúsculo, com hífens, sem acento, baseado no título.

Responda só o JSON.`;
}

function paradaPrompt({ nome, cidade, uf, categoria }) {
  return `Você escreve para o Pistaviva (mototurismo). Crie uma descrição curta e convidativa (2 a 4 frases, tom de motociclista brasileiro, natural, com SEO leve) para esta parada amiga do motociclista:
Nome: ${nome}
Cidade/UF: ${cidade || '?'}/${uf || '?'}
Categoria: ${categoria || 'parada'}

Descreva por que vale a parada pra quem viaja de moto (clima, comida, vista, estrutura, acesso). Não invente fatos específicos que não dá pra saber (preços, horários). Responda só o JSON com os campos: descricao (string) e selos_sugeridos (array entre: "asfalto","descanso","gear","sabor").`;
}

const PARADA_SCHEMA = {
  type: 'object',
  properties: {
    descricao: { type: 'string' },
    selos_sugeridos: { type: 'array', items: { type: 'string' } },
  },
  required: ['descricao'],
};

export async function POST(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const { task, ...args } = await req.json().catch(() => ({}));

  if (task === 'blog') {
    if (!args.tema?.trim() && !args.ref?.trim()) return NextResponse.json({ error: 'Informe o tema ou um link de referência.' }, { status: 400 });
    let refText = '';
    if (args.ref?.trim()) {
      refText = await fetchRefText(args.ref.trim());
      if (!refText) return NextResponse.json({ error: 'Não consegui ler esse link (pode estar bloqueado). Tente outro ou escreva só o tema.' }, { status: 422 });
    }
    const tema = args.tema?.trim() || 'gere o tema a partir do material de referência';
    const { text, error } = await gemini(blogPrompt({ ...args, tema, refText }), BLOG_SCHEMA);
    if (error) { console.error('[Gemini] blog error:', error); return NextResponse.json({ error }, { status: 502 }); }
    try { return NextResponse.json({ result: JSON.parse(text) }); }
    catch (e) { console.error('[Gemini] JSON parse falhou:', e.message, 'text:', text?.slice(0, 300)); return NextResponse.json({ error: 'Resposta inválida da IA.' }, { status: 502 }); }
  }

  if (task === 'parada') {
    if (!args.nome?.trim()) return NextResponse.json({ error: 'Informe o nome da parada.' }, { status: 400 });
    const { text, error } = await gemini(paradaPrompt(args), PARADA_SCHEMA);
    if (error) { console.error('[Gemini] parada error:', error); return NextResponse.json({ error }, { status: 502 }); }
    try { return NextResponse.json({ result: JSON.parse(text) }); }
    catch (e) { console.error('[Gemini] JSON parse falhou:', e.message, 'text:', text?.slice(0, 300)); return NextResponse.json({ error: 'Resposta inválida da IA.' }, { status: 502 }); }
  }

  return NextResponse.json({ error: 'Tarefa desconhecida.' }, { status: 400 });
}
