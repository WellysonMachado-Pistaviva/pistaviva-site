import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArticleBody } from '../app/lib/articleBody.mjs';

test('turns consecutive markdown tasks into one checklist', () => {
  const blocks = parseArticleBody([
    '## Planejamento',
    '- [ ] Destino definido',
    '- [x] Moto revisada',
    '',
    'Pronto para sair.',
  ].join('\n'));

  assert.deepEqual(blocks, [
    { t: 'h2', v: 'Planejamento' },
    {
      t: 'checklist',
      items: [
        { checked: false, text: 'Destino definido' },
        { checked: true, text: 'Moto revisada' },
      ],
    },
    { t: 'p', v: 'Pronto para sair.' },
  ]);
});

test('does not merge checklist text into paragraph', () => {
  const [block] = parseArticleBody('- [ ] Item único');
  assert.equal(block.t, 'checklist');
  assert.equal(block.items.length, 1);
});
