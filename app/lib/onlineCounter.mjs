export const ONLINE_MIN = 18;
export const ONLINE_MAX = 240;

export function clampOnlineCount(value) {
  return Math.max(ONLINE_MIN, Math.min(ONLINE_MAX, value));
}

export function pickNextOnlineCount(current, seen, random = Math.random) {
  const used = seen instanceof Set ? seen : new Set();
  const range = ONLINE_MAX - ONLINE_MIN + 1;

  if (used.size >= range) {
    used.clear();
    used.add(current);
  }

  const direction = random() < 0.5 ? -1 : 1;
  const distance = 1 + Math.floor(random() * 4);
  const preferred = clampOnlineCount(current + direction * distance);

  for (let offset = 0; offset < range; offset += 1) {
    const candidates = [preferred + offset, preferred - offset];
    for (const candidate of candidates) {
      if (
        candidate >= ONLINE_MIN &&
        candidate <= ONLINE_MAX &&
        candidate !== current &&
        !used.has(candidate)
      ) {
        used.add(candidate);
        return candidate;
      }
    }
  }

  return current === ONLINE_MAX ? ONLINE_MAX - 1 : current + 1;
}
