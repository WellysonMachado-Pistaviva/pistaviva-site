'use client';
import { useEffect } from 'react';
import { supabase } from '../../src/lib/supabaseClient';

// Conta 1 visualização por sessão (evita inflar com refresh). Falha silenciosa
// se a função/coluna ainda não existir no banco.
export default function ViewPing({ kind, id }) {
  useEffect(() => {
    if (!id) return;
    const key = `pv_viewed_${kind}_${id}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch { /* sessionStorage indisponível: segue */ }
    supabase.rpc('pv_bump_view', { p_kind: kind, p_id: id }).then(() => {}, () => {});
  }, [kind, id]);
  return null;
}
