const buckets = new Map();
const MAX_BUCKETS = 10_000;

function requestIp(req) {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  return forwarded.split(',')[0].trim() || req.headers.get('x-real-ip') || 'unknown';
}

export function enforceBodyLimit(req, maxBytes) {
  const raw = req.headers.get('content-length');
  if (!raw) return null;
  const length = Number(raw);
  if (!Number.isFinite(length) || length < 0 || length > maxBytes) {
    return { error: 'Requisição grande demais.', status: 413 };
  }
  return null;
}

export function enforceRateLimit(req, { scope, limit, windowMs }) {
  const now = Date.now();
  const key = `${scope}:${requestIp(req)}`;
  let bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;

  if (buckets.size > MAX_BUCKETS) {
    for (const [candidate, value] of buckets) {
      if (now >= value.resetAt) buckets.delete(candidate);
    }
  }

  if (bucket.count > limit) {
    return {
      error: 'Muitas requisições. Tente novamente em instantes.',
      status: 429,
      retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return null;
}
