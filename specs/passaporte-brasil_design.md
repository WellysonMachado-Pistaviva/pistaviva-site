# Passaporte do motociclista — Brasil

Status: proposta de expansão, 14/10/2026. A regra de aquisição por fotografia ainda depende da definição do usuário. Este documento não indica funcionalidade já implementada.

## Referências analisadas

- https://stampie.app/passports — descoberta de passaportes públicos, busca e contadores.
- https://stampie.app/@tutosports14 — perfil, livro folheável, adesivos datados, alternância livro/grade e mapa de lugares visitados.

Aplicar a estrutura de produto à identidade própria da PistaViva: tipografia, cores e composição editorial da home; papel, lombada e carimbos restritos ao passaporte. Criar artes próprias para os municípios e parceiros.

## Experiência proposta

Um passaporte por motociclista, com três famílias de adesivos:

1. **Cidades brasileiras:** adesivo por município identificado pelo código IBGE. Repetir visita acrescenta memória e data, sem inflar a quantidade de cidades únicas.
2. **Paradas parceiras:** adesivo especial do estabelecimento, associado ao município e à regra de confirmação da parada. O selo de autenticidade do estabelecimento não equivale à aquisição pelo motociclista.
3. **Coleções especiais:** estações de Itajubá, eventos e roteiros. Preservar regras atuais de certificado e benefícios.

Perfil público:

- Nome público, origem, apresentação e número do passaporte.
- Contadores de cidades, UFs, adesivos e coleções completas, calculados a partir de aquisições publicáveis.
- Livro folheável e grade, com filtros por tipo, UF e ano.
- Ao tocar no adesivo: cidade/parada, data da visita, tipo de confirmação, legenda e fotos autorizadas.
- Mapa de cidades visitadas. Não desenhar trajetos entre pontos como se fossem percursos registrados.
- Linha do tempo de visitas e ação de compartilhar coleção/cartão.

Descoberta:

- Evoluir Conquistadores para explorar passaportes do Brasil, mantendo acesso à coleção e ao ranking específico de Itajubá.
- Busca por nome ou cidade; distinguir cidade de origem de cidade visitada.
- Convites para registrar viagem e retornar ao passaporte; contadores e destaques baseados em dados reais.

## Entrada por foto: decisão pendente

Há dois produtos diferentes na frase “tirou foto, vai pegar”:

- **Foto do lugar/viagem:** localizar ou selecionar município e anexar lembrança à visita. Foto antiga sem comprovação pode ser visita declarada, sem virar automaticamente visita confirmada.
- **Foto do adesivo/carimbo físico:** identificar candidato no catálogo, pedir confirmação e aplicar a regra de validação. Um adesivo fotografado não comprova sozinho presença no local.

Proposta inicial: check-in no local libera adesivo digital; foto é lembrança opcional. Para foto de adesivo físico, identificação assistida gera candidato ou pendência de revisão. Nenhuma identificação automática deve inventar município ou atribuir confirmação silenciosamente.

Dados EXIF, quando disponíveis, são apenas sinais auxiliares e precisam ser lidos antes da compressão. Não presumir que fotos contenham GPS/data nem que esses dados comprovem autoria/presença. Não publicar metadados brutos.

## Fluxo de aquisição

1. Acessar coleção privada já identificada pelo sistema.
2. Escolher cidade, parceiro ou coleção; ou fotografar adesivo para buscar candidato.
3. Capturar localização mediante ação do participante, ou selecionar visita declarada/foto para revisão conforme regra escolhida.
4. Validar destino no servidor; para cidade, usar limite municipal ou serviço geográfico confiável, não raio em torno do centro da cidade.
5. Confirmar aquisição idempotente e permitir foto/legenda.
6. Animar entrada do adesivo no livro; oferecer cartão e publicação opcional.

Revisitas preservam memória sem duplicar adesivo único. Selos sazonais continuam únicos por pessoa/estação/ano. Benefícios físicos não são liberados pela mera criação de visita nacional.

## Base existente e mudanças necessárias

Reaproveitar:

- `app/lib/municipios.mjs` e `/api/municipios`: catálogo e busca de cidades com código IBGE.
- `PassaporteLivro`, `PassaporteMockup`, cartões e compartilhamento.
- Identidade do motociclista, armazenamento de fotos e controles de publicação.
- Catálogo de parceiros e regras de estações.

Adicionar modelo persistente de catálogo nacional, visitas e aquisições:

- Município: código IBGE, nome, UF e referência geográfica validada.
- Adesivo: identificador, tipo, município/parceiro/coleção, arte/versionamento e regra de aquisição.
- Visita: titular, destino, data, método, estado de confirmação e chave de idempotência.
- Aquisição: titular, adesivo e visita que fundamenta sua liberação; unicidade conforme tipo.
- Memória: foto, legenda, vínculo à visita, autorização e moderação independentes.

Aplicar alterações tanto ao store local quanto ao Supabase, com migração explícita e testes. Não transformar a cidade residencial atual em cidade visitada. Não usar fotos de comprovação existentes como galeria pública sem autorização específica.

## Entrega por etapas

1. Catálogo de cidades + modelo unificado de aquisições, sem alterar regras de Itajubá.
2. Passaporte nacional, mapa de visitas e registro autenticado com método definido.
3. Fotos/memórias públicas autorizadas, compartilhamento e descoberta.
4. Reconhecimento assistido de adesivos físicos, após definir validação e operação de revisão.

## Critérios de aceitação

- Adicionar cidade não duplica contadores em revisitas.
- Parceiro e cidade podem render adesivos distintos, ligados à mesma visita quando aplicável.
- Foto recusada não aparece em perfil/cartão/mapa público.
- Alterar ou revogar consentimento retira conteúdo das projeções públicas e invalida caches correspondentes.
- Perfil público não expõe código privado, telefone, endereço residencial ou GPS bruto.
- Mapa diferencia presença declarada de confirmada quando ambas forem habilitadas.
- GPS negado, foto sem metadados, upload interrompido, candidato ambíguo e parceiro inativo têm estados explícitos.
- Certificados e ranking de Itajubá mantêm regras atuais.
