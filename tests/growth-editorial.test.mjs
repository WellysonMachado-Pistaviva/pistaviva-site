import test from 'node:test';
import assert from 'node:assert/strict';
import { reviseGrowthEditorial } from '../app/lib/growthEditorial.mjs';

test('corrects BH distance promise without changing slug or publication date', () => {
  const post = { slug: 'bate-volta-de-moto-saindo-de-bh', excerpt: 'Destinos a até 130 km.', body: 'Lista completa.', published_at: '2026-06-06' };
  const revised = reviseGrowthEditorial(post);
  assert.equal(revised.slug, post.slug);
  assert.equal(revised.published_at, post.published_at);
  assert.doesNotMatch(revised.excerpt, /até 130/);
  assert.equal(revised.body, post.body);
});

test('removes old seasonal guarantee while preserving later sections', () => {
  const post = { slug: 'serra-do-rio-do-rastro-de-moto-guia', body: '## Melhor época\nOs meses de outono e inverno trazem dias mais secos e límpidos — e frio. Prefira subir quando o sol secou o asfalto.\n## Fontes\nConteúdo preservado.' };
  const revised = reviseGrowthEditorial(post);
  assert.match(revised.body, /não garantem pista seca/);
  assert.match(revised.body, /## Fontes\nConteúdo preservado/);
  assert.equal(reviseGrowthEditorial(revised), revised);
});

test('unrelated and later CMS wording is preserved', () => {
  assert.equal(reviseGrowthEditorial(null), null);
  const post = { slug: 'outro', body: 'Texto independente.' };
  assert.equal(reviseGrowthEditorial(post), post);
  const newer = { slug: 'serra-do-rio-do-rastro-de-moto-guia', body: 'Texto revisado pela equipe.', updated_at: '2026-09-20' };
  assert.equal(reviseGrowthEditorial(newer), newer);
});
