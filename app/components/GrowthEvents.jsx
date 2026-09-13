'use client';

import { useEffect } from 'react';
import { track } from '@vercel/analytics';

// Only curated actions; never send search terms, location or user identifiers.
export default function GrowthEvents() {
  useEffect(() => {
    const onClick = (event) => {
      const link = event.target instanceof Element ? event.target.closest('a[data-growth-action]') : null;
      if (!link) return;
      const properties = {
        action: link.dataset.growthAction,
        source: link.dataset.growthSource || 'editorial',
      };
      try { track('editorial_action', properties); } catch { /* Analytics must never block navigation. */ }
      try { window.gtag?.('event', 'editorial_action', properties); } catch { /* Optional GA4. */ }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
  return null;
}
