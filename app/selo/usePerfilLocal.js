'use client';
import { useMemo, useSyncExternalStore } from 'react';
import { assinarPerfil, perfilSalvo } from './perfilLocal';

const noServidor = () => null;

export default function usePerfilLocal() {
  const salvo = useSyncExternalStore(assinarPerfil, perfilSalvo, noServidor);
  return useMemo(() => { try { return JSON.parse(salvo || 'null'); } catch { return null; } }, [salvo]);
}
