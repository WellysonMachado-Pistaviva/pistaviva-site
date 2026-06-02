'use client';
// Brincadeira: ao clicar, solta partículas (estilo "cool mode" do MagicUI), leve, sem libs.
export default function CoolMode({ children, emojis = ['🏍️', '⚡', '✨', '🔥', '🛣️'], count = 16, style }) {
  const burst = (e) => {
    const x = e.clientX, y = e.clientY;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      el.style.cssText = `position:fixed;left:${x}px;top:${y}px;font-size:${13 + Math.random() * 16}px;pointer-events:none;z-index:99999;will-change:transform,opacity;`;
      document.body.appendChild(el);
      const ang = Math.random() * Math.PI * 2, sp = 4 + Math.random() * 8;
      let vx = Math.cos(ang) * sp, vy = Math.sin(ang) * sp - 7, px = 0, py = 0, life = 0;
      const step = () => {
        life++; vy += 0.4; px += vx; py += vy;
        el.style.transform = `translate(${px}px,${py}px) rotate(${life * 14}deg)`;
        el.style.opacity = String(Math.max(0, 1 - life / 55));
        if (life < 55) requestAnimationFrame(step); else el.remove();
      };
      requestAnimationFrame(step);
    }
  };
  return (
    <span onClick={burst} style={{ cursor: 'pointer', display: 'inline-flex', ...style }} role="button" aria-label="Diversão" title="Clica! 🏍️">
      {children}
    </span>
  );
}
