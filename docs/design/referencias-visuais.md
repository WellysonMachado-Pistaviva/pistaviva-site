# Direção visual Pistaviva

Referências indicadas pelo usuário, consultadas no navegador em 6 de setembro de 2026.

| Referência | Princípio observado | Aplicação na home |
| --- | --- | --- |
| [Tomorrowland Brasil](https://brasil.tomorrowland.com/pt/welcome/) | Abertura imersiva, mensagem curta e convite para participar | Fotografia ampla, texto emocional e chamada principal clara |
| [Ultra Music Festival](https://ultramusicfestival.com/) | Campanhas de grande impacto, fundo escuro e hierarquia de anúncios | Destaque editorial do Motosul e títulos com escala de campanha |
| [BMW Motorrad](https://www.bmw-motorrad.com.br/pt/home.html) | Fotografia como protagonista, controles explícitos e contraste entre superfícies | Imagens de viagem, botões legíveis e faixa clara para planejar |
| [CFMOTO Brasil](https://www.cfmoto.com.br/) | Campanhas fotográficas em largura total e navegação direta | Blocos fotográficos amplos e atalhos para destinos, rotas e eventos |
| [Traveler's Event](https://travelersevent.pt/) | Fita de fotos em deriva contínua, sangrada de ponta a ponta | Galeria do Motosul (`PhotoRibbon`) |

Identidade preservada: preto, laranja e tipografia Saira. Imagens pertencem ao acervo já usado pelo projeto. Marcas, artes e textos das referências não foram reutilizados.

Ordem da experiência: inspirar → escolher destino/rota/encontro → explorar destaques → conhecer experiências → ler histórias → produtos.

A fita do Motosul copia o comportamento, não o código: a referência roda WordPress com Elementor e Swiper, configurados com `autoplay_speed` perto de zero e `speed` de 5s a 10s — parâmetros que produzem uma esteira que nunca para, em vez de um carrossel que passa slide a slide. Aqui o mesmo efeito sai de animação CSS, sem dependência nova. Fotos, textos e artes são do acervo do projeto.

Motosul liga festival a turismo regional; guia de primeira viagem oferece alternativa para quem ainda está começando. Links levam às páginas existentes. Nenhuma data de evento ou estatística nova foi introduzida.

## Parque da Cidade — direção de campanha

Referência adicional: [Harley-Davidson Brasil](https://www.harley-davidson.com/br/pt/index.html), consultada em 11 de setembro de 2026. Princípios adaptados: fotografia de pilotagem/contexto, mensagens curtas, chamada principal por campanha e descoberta por experiência.

Aplicação no Parque: abertura com fotografia aérea do acervo, localização, mensagem curta e ação “Planejar minha visita”. Resumo prático antecede experiências e destaque do lago; planejamento detalhado vem depois. Motosul recebe campanha fotográfica própria dentro da agenda.

Regras da página:

- Fotos reais, correspondentes à atração; sem foto disponível, cartão permanece textual.
- Saira nos títulos; rótulos em mono; texto corrido sobre superfície legível.
- Uma ação principal por campanha. Informações de chegada, horários e custos continuam acessíveis no resumo inicial.
- Preto em campanhas, superfícies claras em informações e mapa, laranja nas ações. Cores geográficas do mapa permanecem distintas.
- Fotografias com texto sobreposto recebem camada escura; composição se adapta ao celular. Botões mantêm alvo mínimo de 44px e foco visível.
- Trilho de experiências respeita preferência por movimento reduzido, inclusive nas setas.

Implementação usa componentes e tokens existentes. Nenhum ativo, fonte ou texto de campanha da Harley foi reutilizado.
