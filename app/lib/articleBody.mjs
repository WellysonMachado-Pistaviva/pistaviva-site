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

    const gallery = line.match(/^\[gallery:(.+)\]$/);
    if (gallery) {
      flushParagraph();
      const items = gallery[1]
        .split(';;')
        .map((rawItem) => {
          const [src, alt = '', caption = '', size = ''] = rawItem.split('|');
          const dimensions = size.trim().match(/^(\d+)x(\d+)$/);
          return {
            v: src.trim(),
            alt: alt.trim(),
            caption: caption.trim(),
            ...(dimensions ? { width: Number(dimensions[1]), height: Number(dimensions[2]) } : {}),
          };
        })
        .filter((item) => item.v);

      if (items.length) blocks.push({ t: 'gallery', items });
      continue;
    }

    const image = line.match(/^\[img:([^|\]]+)(?:\|([^|\]]*))?(?:\|([^|\]]*))?(?:\|(\d+)x(\d+))?\]$/);
    if (image) {
      flushParagraph();
      blocks.push({
        t: 'img',
        v: image[1].trim(),
        alt: image[2]?.trim() || '',
        caption: image[3]?.trim() || '',
        ...(image[4] && image[5] ? { width: Number(image[4]), height: Number(image[5]) } : {}),
      });
      continue;
    }
    // [instagram:permalink] — embed oficial do post/reel dentro do corpo da matéria.
    const instagram = line.match(/^\[instagram:([^\]]+)\]$/);
    if (instagram) {
      flushParagraph();
      const urls = instagram[1].split(';;').map((url) => url.trim()).filter(Boolean);
      if (urls.length) blocks.push({ t: 'instagram', urls });
      continue;
    }

    const video = line.match(/^\[video:([^|\]]+)(?:\|([^\]]+))?\]$/);
    if (video) {
      flushParagraph();
      blocks.push({ t: 'video', v: video[1].trim(), poster: video[2]?.trim() || '' });
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
