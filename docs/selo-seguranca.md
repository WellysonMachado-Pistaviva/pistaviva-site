# Selo da Estação — segurança

Referências: OWASP Top 10 (2021), OWASP ASVS 4.0 nível 2, modelo de ameaças STRIDE,
LGPD (minimização e direito de exclusão).

## Superfície

| Entrada | Quem acessa | Credencial |
|---|---|---|
| Formulário `/selo` (server actions) | público | nenhuma, limite de tentativas |
| Coleção `/selo/m/{codigo}` | dono do link | código aleatório de 12 hex (48 bits) |
| Painel `/selo/parceiro/{token}` | parceiro | token de 32 caracteres (192 bits), revogável |
| Verificação `/selo/v/{nº}` e catálogo `/selos` | público | nenhuma, só dados públicos |
| `/api/admin/selo` | equipe | JWT Supabase + e-mail na lista `ADMIN_EMAILS` |
| `/api/cron/selo-planilhas` | Vercel Cron | `Authorization: Bearer CRON_SECRET` (comparação em tempo constante) |
| Google Sheets | conta de serviço | chave privada só no servidor |

## STRIDE

| Ameaça | Exemplo | Defesa |
|---|---|---|
| **S**poofing | se passar por admin ou parceiro | JWT validado no Supabase + lista de e-mails; token de parceiro aleatório e revogável; JWT `alg=none` recusado (testado) |
| **T**ampering | forjar check-in ou selo | check-in validado no servidor (GPS/raio, foto com URL assinada); selo de parceiro com nº único e verificação pública; tabelas sem política RLS (só service role) |
| **R**epudiation | "não fui eu que dei o desconto/almoço" | `pv_selo_beneficio_usos` com parceiro e data; aba Eventos na planilha oficial |
| **I**nformation disclosure | vazar WhatsApp/endereço | páginas públicas só com nome, cidade, nº; painel do parceiro mostra "Ana S."; `/selo/m` sem cache, sem referrer, sem indexação; IP no limite só como hash |
| **D**enial of service | robô enchendo cadastro / força bruta de código | limite de tentativas **compartilhado no banco** (`pv_selo_limite`), honeypot no formulário, corpo máximo nas rotas |
| **E**levation of privilege | parceiro virar admin, IDOR em ids | ações de admin só na rota com JWT; ids validados por formato; código de cupom 31⁸ ≈ 8,5×10¹¹ |

## OWASP Top 10 → controle

- **A01 Controle de acesso:** testes de IDOR, admin sem token, cron sem segredo, parceiro inventado.
- **A02 Criptografia:** HSTS com preload; tokens com `crypto.getRandomValues`; JWT RS256 assinado localmente para o Google.
- **A03 Injeção:** consultas parametrizadas (Supabase); React escapa HTML; nome e cidade só com letras; SVG com texto escapado e CSP própria; JSON-LD com `<` escapado; planilha em modo RAW e prefixo `'` contra fórmula.
- **A04 Design inseguro:** banco é a fonte da verdade, planilha é cópia; benefício revalidado no servidor na hora do registro; índice único impede almoço duplicado.
- **A05 Configuração:** cabeçalhos (nosniff, DENY, HSTS, COOP, Permissions-Policy, CSP base); `x-powered-by` removido; cron fechado se `CRON_SECRET` faltar.
- **A06 Componentes:** `npm audit` = 0 vulnerabilidades (Next 15.5.27).
- **A07 Autenticação:** admin via Supabase Auth; recomendado 2FA nas contas (Supabase, Vercel, Google, GitHub).
- **A08 Integridade:** URL de upload assinada (HMAC) com validade; pré-voo bloqueia deploy com banco desatualizado.
- **A09 Logs:** erros no log da Vercel com prefixo `[selo]`, sem dados pessoais.
- **A10 SSRF:** o servidor só chama URLs fixas (Google, Supabase, ViaCEP no navegador).

## Testes automatizados

| Comando | O que prova |
|---|---|
| `npm run check` | lint + sistema visual + 190 testes de unidade (validação, privacidade, regras de benefício, planilhas, cliente Google simulado) |
| `npm run selo:ataque` | 17 ataques caixa-preta contra o servidor local (cabeçalhos, IDOR, admin/cron sem credencial, JWT forjado, path traversal, upload forjado, XSS refletido e no SVG, parâmetros malformados, corpo gigante, vazamento de dados) |
| `npm run selo:preflight` | banco com todas as colunas, funções e bucket privado; nenhum segredo com `NEXT_PUBLIC_` |

Resultado em 14/10/2026:
- servidor de desenvolvimento: **17/17** defesas confirmadas;
- build de produção: **14/15** — a falha era o banco sem as colunas novas, que o pré-voo agora bloqueia;
- XSS pelo formulário real (nome `<img onerror>` e cidade `<svg onload>`): o código não executou, o texto apareceu como texto e agora é recusado na validação.

## Riscos que continuam (e o que fazer)

1. **CSP de scripts em modo relatório.** Ligar de verdade exige nonce e testar AdSense/Analytics. Fazer em etapa separada.
2. **Quem tem o link `/selo/m/...` vê a coleção.** É o modelo "link mágico". Orientar a não compartilhar; o cartão dos Stories não leva esse link.
3. **Planilhas têm dados pessoais.** Compartilhar só com quem precisa, com 2FA na conta Google. Ver `docs/selo-operacao.md`.
4. **Teste de invasão externo** antes de grande divulgação: revisão de código não substitui um pentest.
