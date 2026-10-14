// Nos testes do Node, 'server-only' (que o Next resolve internamente) vira um módulo vazio.
import { registerHooks } from 'node:module';

registerHooks({
  resolve(especificador, contexto, proximo) {
    if (especificador === 'server-only') return { url: 'data:text/javascript,export {};', shortCircuit: true };
    return proximo(especificador, contexto);
  },
});
