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

test('parses native video with optional poster', () => {
  const [block] = parseArticleBody('[video:https://cdn.example.com/evento.mp4|https://cdn.example.com/capa.jpg]');
  assert.deepEqual(block, {
    t: 'video',
    v: 'https://cdn.example.com/evento.mp4',
    poster: 'https://cdn.example.com/capa.jpg',
  });
});

test('parses article image with accessible text and caption', () => {
  const [block] = parseArticleBody('[img:/evento.jpg|Motociclistas chegando|Chegada ao parque.|1200x800]');
  assert.deepEqual(block, {
    t: 'img',
    v: '/evento.jpg',
    alt: 'Motociclistas chegando',
    caption: 'Chegada ao parque.',
    width: 1200,
    height: 800,
  });
});

test('parses responsive media gallery with captions and dimensions', () => {
  const [block] = parseArticleBody('[gallery:/jornal-1.jpg|Primeiro recorte|Legenda 1.|720x1280;;/jornal-2.jpg|Segundo recorte|Legenda 2.|1650x2200]');
  assert.deepEqual(block, {
    t: 'gallery',
    items: [
      { v: '/jornal-1.jpg', alt: 'Primeiro recorte', caption: 'Legenda 1.', width: 720, height: 1280 },
      { v: '/jornal-2.jpg', alt: 'Segundo recorte', caption: 'Legenda 2.', width: 1650, height: 2200 },
    ],
  });
});
