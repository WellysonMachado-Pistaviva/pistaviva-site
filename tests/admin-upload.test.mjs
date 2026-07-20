import test from 'node:test';
import assert from 'node:assert/strict';
import { ADMIN_IMAGE_MAX_BYTES, validateAdminImage } from '../app/lib/adminUploadValidation.mjs';

test('accepts supported admin cover', () => {
  assert.deepEqual(
    validateAdminImage({ type: 'image/jpeg', size: 1024, kind: 'covers' }),
    { error: null, ext: 'jpg' },
  );
});

test('rejects oversized, unsupported, and unknown uploads', () => {
  assert.match(
    validateAdminImage({ type: 'image/jpeg', size: ADMIN_IMAGE_MAX_BYTES + 1, kind: 'covers' }).error,
    /8 MB/,
  );
  assert.match(
    validateAdminImage({ type: 'image/svg+xml', size: 1024, kind: 'covers' }).error,
    /Formato inválido/,
  );
  assert.match(
    validateAdminImage({ type: 'image/jpeg', size: 1024, kind: 'unknown' }).error,
    /Destino/,
  );
});
