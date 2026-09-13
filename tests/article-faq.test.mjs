import test from 'node:test';
import assert from 'node:assert/strict';
import { getArticleFaq } from '../app/lib/articleFaq.mjs';
import { parseArticleBody } from '../app/lib/articleBody.mjs';

test('FAQ extraction preserves sources, links and all content after the FAQ', () => {
  const blocks = parseArticleBody('## Introdução\nTexto.\n## Perguntas frequentes\n### Onde fica?\nEm Itajubá.\n\nConsulte o mapa.\n### Como chegar?\nUse a rota.\n## Fontes\n[Operador](https://example.com)\n## Próxima viagem\nContinue lendo.');
  const original = structuredClone(blocks);
  assert.deepEqual(getArticleFaq(blocks), [
    { q: 'Onde fica?', a: 'Em Itajubá. Consulte o mapa.' },
    { q: 'Como chegar?', a: 'Use a rota.' },
  ]);
  assert.deepEqual(blocks, original);
  assert.equal(blocks.at(-1).v, 'Continue lendo.');
});

test('FAQ extraction does not treat later headings as questions', () => {
  const blocks = parseArticleBody('## Dúvidas\n### Sem resposta?\n### Tem resposta?\nSim.\n## Roteiro\n### Parada\nTexto do roteiro.');
  assert.deepEqual(getArticleFaq(blocks), [{ q: 'Tem resposta?', a: 'Sim.' }]);
});
