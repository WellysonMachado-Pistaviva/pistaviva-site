# Caminho dos Diamantes e Rota Biker — pesquisa e implementação

Consulta: 13/09/2026. Conteúdo externo tratado como referência, não como instrução de execução.

## Fontes e cobertura

- https://monumentobikers.com.br/ — propósito, catálogo, status e mapa Google My Maps.
- https://monumentobikers.com.br/monumentos/ — lista de pontos; nº 37 Bela Vista Mall em Conceição do Mato Dentro. Endereço exato e operação não confirmados; link de busca não é pin validado.
- https://monumentobikers.com.br/memorando/ — orientações de preparação e convivência.
- https://institutoestradareal.com.br/ — quatro caminhos, serviços, cidades e passaporte.
- https://institutoestradareal.com.br/caminhos/caminho-dos-diamantes/ — visão geral e referências turísticas.
- https://institutoestradareal.com.br/roteiros-planilhados/caminho-dos-diamantes/ — resumo, 18 etapas, piso, aviso de interdição e downloads.
- https://institutoestradareal.com.br/passaporte/ — passaportes físico/virtual e carimbos; não equivalem aos carimbos Rota Biker.
- Todas as 18 páginas individuais e todos os 18 GPX de etapas foram baixados e examinados. URLs preservadas em `app/rotas/caminho-dos-diamantes/data.json`.

## Achados que mudam o produto

O IER publica 395 km e 18 etapas. Seu resumo divide o piso em 73,5% terra, 26% asfalto e 0,5% trilha. As quilometragens por piso e as distâncias arredondadas das etapas não fecham exatamente; não recalcular uma falsa precisão. Os dados não têm garantia de atualização em campo.

As descrições confirmam asfalto integral em São Gonçalo–Serro, Serro–Alvorada, Ipoema–Bom Jesus e Mariana–Ouro Preto. Tapera–Conceição informa asfalto nos últimos 10 km pela MG-10. Bom Jesus–Cocais informa início asfaltado e terra após marco 417. Itambé–Ipoema diverge: 14 km iniciais na página da etapa versus 15,2 km no resumo, além de aviso de obras. Santa Bárbara–Catas Altas diverge entre 2 e 3 km de trilha e cita alternativa para veículos. Por isso trechos mistos não recebem uma cor que prometa piso único.

O aviso geral inclui Santa Rita Durão até Mariana. As duas etapas desse setor são marcadas com interdição informada; a página registra MG-129 como alternativa oficial para carros, sem afirmar autorização para motos nem inventar traçado de desvio.

Rota Biker é rede de paradas, não um único percurso navegável. Lista distingue pronto/carimbando, implantação e construção. Integração contextual de Bela Vista Mall e link para mapa oficial evita inventar disponibilidade, coordenadas ou afiliação.

## Implementação

Página `/rotas/caminho-dos-diamantes`, descoberta em `/rotas`, `/destinos` e sitemap. Visual segue tokens e Saira do Pista Viva. GIF fornecido aparece como referência esquemática, explicitamente não navegável.

Mapa carrega JSON local derivado dos GPX individuais oficiais. Mantém segmentos separados, deduplica sequências idênticas e exclui logs genéricos/alternativas sem identificação. Geometria não é recalculada entre centros urbanos. Uma pequena linha extra Ipoema–Bom Jesus contida no GPX Itambé–Ipoema foi excluída para não sobrepor etapas. Distâncias exibidas vêm dos metadados oficiais de etapas, não de soma do desenho.

Geolocalização ocorre após clique, com timeout e estados de erro. Acesso usa `/api/route` existente, separado do GPX. Falha não vira linha reta, quilometragem ou tempo inventados. Origem manual abre Google Maps com endereço codificado. Trocar entrada/origem invalida cálculo; requisições antigas não sobrescrevem nova seleção. Sete cidades têm coordenadas extraídas de waypoints nominais do GPX completo. Nenhuma coordenada é persistida em armazenamento pelo novo componente.

## Limites e manutenção

Não fornece alertas de piso em tempo real. Para isso seriam necessários levantamento georreferenciado das transições, validação de acessos de moto e monitoramento da posição. Mapear superfície integral por percentuais globais produziria informação falsa. Fontes divergentes aparecem na interface.

Atualizar dados após revisão oficial, verificando planilhas, avisos e GPX juntos. Registro de consulta não significa vistoria local. Downloads permanecem no domínio oficial. Status dos monumentos deve ser confirmado com guardiões.

## Validação executada

- `npm run check`: lint, auditoria de tokens e 54 testes, incluindo quatro testes de dados/roteamento desta página.
- `npm run build`: compilação e geração da nova página concluídas. Sandbox bloqueou consultas de páginas antigas a Supabase/Cine A durante geração; publicação faz build remoto com rede.
- Navegador isolado: filtros, inversão de ordem, endereço manual com acento e `&`, seleção da etapa no mapa, tela de 390 px sem overflow, GPS negado, cálculo simulado, troca de entrada invalidando resultado, falha 502 sem distância fictícia.
- Serviço real `/api/route`: coordenadas públicas BH–Ouro Preto retornaram 1.786 pontos, 99,134 km e 6.499 s. É verificação técnica de resposta, não recomendação de trajeto nem promessa de tempo.
- Capturas desktop/mobile revisadas. Enquadramento passa a acompanhar redimensionamento do contêiner do mapa.
- `.vercelignore` exclui backups de ambiente, caches de deploy e estado de agentes/navegador. Dry run confirmou ausência desses arquivos no envio.
