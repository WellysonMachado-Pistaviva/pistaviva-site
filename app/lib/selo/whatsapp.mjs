// WhatsApp brasileiro: guarda só DDD + número (10 ou 11 dígitos), sem o 55.
// É a chave que identifica o motociclista entre visitas, então "(35) 99999-8888",
// "+55 35 99999 8888" e "035999998888" precisam virar o mesmo valor.

export function soDigitos(valor) {
  return String(valor ?? '').replace(/\D/g, '');
}

// Retorna os dígitos normalizados, null se vazio, ou false se inválido.
export function normalizarWhatsapp(valor) {
  let d = soDigitos(valor);
  if (!d) return null;
  if (d.length > 11 && d.startsWith('55')) d = d.slice(2);
  else if (d.length > 11 && d.startsWith('0')) d = d.replace(/^0+/, '');
  if (d.length === 11 && d.startsWith('0')) d = d.slice(1);   // 0 + DDD + fixo
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd % 10 === 0) return false;                // DDDs vão de 11 a 99, sem final 0
  if (d.length === 11 && d[2] !== '9') return false;           // celular tem 9 na frente
  return d;
}

// Máscara enquanto digita: (35) 99999-8888
export function mascararWhatsapp(valor) {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length <= 2) return d ? `(${d}` : '';
  const corte = d.length === 11 ? 7 : 6;
  if (d.length <= corte) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, corte)}-${d.slice(corte)}`;
}
