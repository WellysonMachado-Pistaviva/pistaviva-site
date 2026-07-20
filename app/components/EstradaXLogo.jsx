'use client';
import { useState } from 'react';

// Logo do Estrada X com fallback: se /estrada-x-logo.png não existir, some sem quebrar.
export default function EstradaXLogo({ size = 64 }) {
  const [ok, setOk] = useState(true);
  if (!ok) return null;
  return (
    <img src="/estrada-x-logo.png" alt="Estrada X" width={size} height={size}
      style={{ borderRadius: 14 }} onError={() => setOk(false)} />
  );
}
