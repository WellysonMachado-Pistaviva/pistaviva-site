// Extract structured answers without changing or truncating the visible article.
export function getArticleFaq(blocks) {
  const entries = [];
  let inFaq = false;
  let current = null;
  const flush = () => {
    if (current?.paragraphs.length) entries.push({ q: current.q, a: current.paragraphs.join(' ') });
    current = null;
  };
  for (const block of blocks) {
    if (block.t === 'h2') {
      flush();
      inFaq = /perguntas frequentes|faq|d[úu]vidas/i.test(block.v);
    } else if (inFaq && block.t === 'h3') {
      flush();
      current = { q: block.v, paragraphs: [] };
    } else if (inFaq && current && block.t === 'p') {
      current.paragraphs.push(block.v);
    }
  }
  flush();
  return entries;
}
