# Monumentos da Rota Biker — consulta de 08/10/2026

Fontes consultadas:
- https://monumentobikers.com.br/
- https://monumentobikers.com.br/monumentos/
- https://www.google.com/maps/d/viewer?mid=1ZHPck3Yykbhc8M1GYPrCcKf5pajiTvk
- Exportação KML pública, preservada em `mapa-oficial.kml`.

44 registros numerados; 43 pontos geográficos. Nº 2 permanece sem localização. Inclusões: 43 (Parada Route, São Miguel do Passa Quatro/GO) e 44 (Laranja Doce, Martinópolis/SP). Ambos em construção, conforme catálogo; coordenadas do KML.

37 prontos e 6 em construção (39–44). O KML mantém o nº 39 em construção, assim como a listagem /monumentos/, embora a home omita a situação. Nº 36: home informa Abadiânia; a listagem ainda diz Goiás. Coordenadas não alteradas; divergência mantida em nota.

As 41 coordenadas anteriores foram comparadas por nome com o KML; as duas novas foram extraídas das respectivas entradas. Não houve geocodificação aproximada nem invenção do ponto nº 2.

## Roteamento

`node scripts/update-monument-routes.mjs` gera os dois traçados locais. Ordem sugerida por vizinho mais próximo, começando no nº 10, sem promessa de otimização global. OSRM driving fornece geometria completa; Turf simplifica com tolerância 0,0001 grau para exibição/exportação. Distâncias e duração vêm do roteador, não de linhas retas. Perfil rodoviário para automóveis, sem garantia de piso ou acesso para motos.

Roteiro completo inclui construções; alternativa “Só prontos” exclui essas paradas. Recálculo passa pelo endpoint /api/monumentos/rota, com validação de IDs, origem e limite de requisições. Se falhar, não inventa distância ou traçado. Navegação externa dividida em até 3 waypoints por link, com continuidade entre etapas.

## Passagem obrigatória por Itajubá

A pedido do usuário, o trecho entre monumentos 27 (São Bento do Sapucaí) e 35 (São Lourenço), em ambos os sentidos, inclui Itajubá. Ponto urbano de passagem: Av. Coronel Carneiro Júnior, [-22.4247371, -45.4563136]. Referência: https://cepbrasil.org/minas-gerais/itajuba/centro/37500018 . Não integra o catálogo de monumentos nem altera sua contagem. Mesma expansão de pontos usada na geração dos traçados, API, links de navegação e GPX. Geometria e distâncias recalculadas nos dois roteiros locais. Versão de roteamento 2 invalida resultados anteriores no cliente.

## Imagens

Cinco arquivos fornecidos pelo usuário copiados sem transformação para public/monumentos. Marca mantida na apresentação da Rota Biker. Foto de monumento usada como ilustração geral; local não atribuído sem confirmação. Guia identificado como iniciativa independente Pistaviva.
