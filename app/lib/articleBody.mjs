export function parseArticleBody(body) {
  const blocks = [];
  let paragraph = [];

  const flushParagraph = () => {
    if (!paragraph.length) return;
    blocks.push({ t: 'p', v: paragraph.join(' ') });
    paragraph = [];
  };

  for (const raw of String(body || '').split('\n')) {
    const line = raw.trim();
    if (!line) {
      flushParagraph();
      continue;
    }

    const image = line.match(/^\[img:(.+)\]$/);
    if (image) {
      flushParagraph();
      blocks.push({ t: 'img', v: image[1].trim() });
      continue;
    }
    if (line.startsWith('### ')) {
      flushParagraph();
      blocks.push({ t: 'h3', v: line.slice(4) });
      continue;
    }
    if (line.startsWith('## ')) {
      flushParagraph();
      blocks.push({ t: 'h2', v: line.slice(3) });
      continue;
    }

    const task = line.match(/^-\s*\[([ xX])\]\s+(.+)$/);
    if (task) {
      flushParagraph();
      const item = { checked: task[1].toLowerCase() === 'x', text: task[2].trim() };
      const previous = blocks.at(-1);
      if (previous?.t === 'checklist') previous.items.push(item);
      else blocks.push({ t: 'checklist', items: [item] });
      continue;
    }

    paragraph.push(line);
  }

  flushParagraph();
  return blocks;
}
