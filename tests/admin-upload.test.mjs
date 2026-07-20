import test from 'node:test';
import assert from 'node:assert/strict';
import { ADMIN_IMAGE_MAX_BYTES, validateAdminImage } from '../app/lib/adminUploadValidation.mjs';
import { resolveSupabaseAdminConfig } from '../app/lib/supabaseAdminConfig.mjs';
import {
  detectImageType,
  downloadRemoteImage,
  isPublicAddress,
  validateRemoteImageUrl,
} from '../app/lib/remoteImage.mjs';

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

test('accepts every admin media destination used by the panel', () => {
  for (const kind of ['covers', 'body', 'banners', 'destinations', 'hero', 'spots']) {
    assert.equal(validateAdminImage({ type: 'image/webp', size: 1024, kind }).error, null);
  }
});

test('detects supported image signatures and rejects fake images', () => {
  assert.deepEqual(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0x00])), { mime: 'image/jpeg', ext: 'jpg' });
  assert.deepEqual(
    detectImageType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
    { mime: 'image/png', ext: 'png' },
  );
  assert.deepEqual(detectImageType(Buffer.from('GIF89a')), { mime: 'image/gif', ext: 'gif' });
  assert.deepEqual(detectImageType(Buffer.from('RIFF0000WEBP')), { mime: 'image/webp', ext: 'webp' });
  assert.equal(detectImageType(Buffer.from('<html>not an image</html>')), null);
});

test('blocks local, private, metadata, reserved, and non-http image sources', async () => {
  for (const address of ['127.0.0.1', '10.0.0.1', '169.254.169.254', '192.168.1.1', '::1', 'fe80::1', 'fc00::1']) {
    assert.equal(isPublicAddress(address), false, address);
  }
  assert.equal(isPublicAddress('8.8.8.8'), true);
  assert.equal(isPublicAddress('2606:4700:4700::1111'), true);
  assert.throws(() => validateRemoteImageUrl('file:///etc/passwd'), /http ou https/);
  assert.throws(() => validateRemoteImageUrl('https://user:pass@example.com/a.jpg'), /credenciais/);
  await assert.rejects(downloadRemoteImage('http://127.0.0.1/image.jpg'), /não é público/);
});

test('prefers current Vercel Supabase integration over stale standalone key', () => {
  const config = resolveSupabaseAdminConfig({
    NEXT_PUBLIC_SUPABASE_URL: 'https://old-project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'stale-service-role',
    NEXT_PUBLIC_SUPABASE_URL_SUPABASE_URL: 'https://current-project.supabase.co',
    SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY: 'current-service-role',
  });

  assert.deepEqual(config, {
    url: 'https://current-project.supabase.co',
    key: 'current-service-role',
  });
});

test('rejects service-role keys marked as browser-public', () => {
  const config = resolveSupabaseAdminConfig({
    NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
    NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY: 'must-not-be-used',
  });
  assert.deepEqual(config, { url: '', key: '' });
});

test('uses normal local Supabase pair when integration variables are absent', () => {
  const config = resolveSupabaseAdminConfig({
    NEXT_PUBLIC_SUPABASE_URL: 'https://local-project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'local-service-role',
  });

  assert.deepEqual(config, {
    url: 'https://local-project.supabase.co',
    key: 'local-service-role',
  });
});
