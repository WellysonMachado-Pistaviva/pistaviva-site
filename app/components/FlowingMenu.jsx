'use client';
import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import './FlowingMenu.css';

export default function FlowingMenu({
  items = [],
  speed = 15,
  textColor = '#fff',
  bgColor = '#0c0c0d',
  marqueeBgColor = '#ff5a00',
  marqueeTextColor = '#0c0c0d',
  borderColor = 'rgba(255,255,255,.12)',
}) {
  return (
    <div className="menu-wrap" style={{ backgroundColor: bgColor }}>
      <nav className="menu">
        {items.map((item, idx) => (
          <MenuItem key={idx} {...item} speed={speed} textColor={textColor}
            marqueeBgColor={marqueeBgColor} marqueeTextColor={marqueeTextColor} borderColor={borderColor} />
        ))}
      </nav>
    </div>
  );
}

function MenuItem({ link, text, image, speed, textColor, marqueeBgColor, marqueeTextColor, borderColor }) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const marqueeInnerRef = useRef(null);
  const animationRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);
  const animationDefaults = { duration: 0.6, ease: 'expo' };

  const distMetric = (x, y, x2, y2) => { const a = x - x2, b = y - y2; return a * a + b * b; };
  const findClosestEdge = (mx, my, w, h) => distMetric(mx, my, w / 2, 0) < distMetric(mx, my, w / 2, h) ? 'top' : 'bottom';

  useEffect(() => {
    const calc = () => {
      const c = marqueeInnerRef.current?.querySelector('.marquee__part');
      if (!c) return;
      const needed = Math.ceil(window.innerWidth / c.offsetWidth) + 2;
      setRepetitions(Math.max(4, needed));
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, [text, image]);

  useEffect(() => {
    const setup = () => {
      const c = marqueeInnerRef.current?.querySelector('.marquee__part');
      if (!c || c.offsetWidth === 0) return;
      animationRef.current?.kill();
      animationRef.current = gsap.to(marqueeInnerRef.current, { x: -c.offsetWidth, duration: speed, ease: 'none', repeat: -1 });
    };
    const t = setTimeout(setup, 50);
    return () => { clearTimeout(t); animationRef.current?.kill(); };
  }, [text, image, repetitions, speed]);

  const onEnter = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const r = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);
    gsap.timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };
  const onLeave = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const r = itemRef.current.getBoundingClientRect();
    const edge = findClosestEdge(ev.clientX - r.left, ev.clientY - r.top, r.width, r.height);
    gsap.timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  return (
    <div className="menu__item" ref={itemRef} style={{ borderColor }}>
      <a className="menu__item-link" href={link} onMouseEnter={onEnter} onMouseLeave={onLeave} style={{ color: textColor }}>{text}</a>
      <div className="marquee" ref={marqueeRef} style={{ backgroundColor: marqueeBgColor }}>
        <div className="marquee__inner-wrap">
          <div className="marquee__inner" ref={marqueeInnerRef} aria-hidden="true">
            {[...Array(repetitions)].map((_, idx) => (
              <div className="marquee__part" key={idx} style={{ color: marqueeTextColor }}>
                <span>{text}</span>
                <div className="marquee__img" style={{ backgroundImage: `url(${image})` }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
