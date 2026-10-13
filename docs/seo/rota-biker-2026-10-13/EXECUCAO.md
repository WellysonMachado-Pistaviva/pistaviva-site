# Primeira execução — 13/10/2026

## Escopo confirmado

Começar pela base técnica e palavras-chave. Por pedido do usuário, ficam para depois: revisão da abertura, divulgação da parceria e aprofundamento dos guias. Textos preparados na rodada anterior permanecem no workspace, sem publicação; não devem entrar automaticamente em um deploy técnico. Nenhum parceiro foi contatado.

## Entregas

1. `palavras-chave.csv`: 30 consultas distribuídas entre página nacional, seções, páginas estaduais e guias existentes. Prioridade qualitativa, não baseada em volume ou posição medidos. Campos de métricas explicitamente não medidos. Cada consulta tem uma página principal; consultas diferentes podem compartilhar a mesma intenção.
2. `baseline-tecnica.json`: registro da verificação pública de 11 URLs. Todas responderam 200, sem redirecionamento, com canonical próprio, título, descrição, um H1, ausência de noindex nos metadados/headers, presença no sitemap e CollectionPage.
3. `scripts/audit-rota-biker.py`: verificação repetível, somente leitura, sem dependências externas. Falhas de rede, JSON-LD inválido ou sinais técnicos ausentes geram saída diferente de zero. A execução não confirma indexação no Google, ranking, acessibilidade visual, bloqueios completos de robots nem aprovação no Rich Results Test.
4. Página principal: acrescentada BreadcrumbList à CollectionPage existente, com identificação estável e ligação entre as duas entidades. Mantidos lista e destinos de todos os monumentos. Não adicionadas avaliações, atributos de entidade oficial ou FAQPage artificiais.

Reexecutar:

```sh
python3 scripts/audit-rota-biker.py --output /tmp/rota-biker-audit.json
```

A baseline preserva o estado anterior à publicação. Na produção, página principal ainda não tem BreadcrumbList; páginas estaduais já possuem. A marcação local permanece pendente de publicação e inspeção no Google.

## Verificação

Lint do arquivo alterado aprovado; 97 testes existentes passaram. Build concluído; JSON-LD renderizado validado: três níveis de navegação, referência correta entre CollectionPage e BreadcrumbList e 43 itens preservados. Dados de palavras-chave e métricas do domínio continuam dependentes de Search Console; não substituir por dados de Instagram.

Referência técnica: https://developers.google.com/search/docs/appearance/structured-data/breadcrumb.
