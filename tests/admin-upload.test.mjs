import test from 'node:test';
import assert from 'node:assert/strict';
import { ADMIN_IMAGE_MAX_BYTES, validateAdminImage } from '../app/lib/adminUploadValidation.mjs';
import { resolveSupabaseAdminConfig } from '../app/lib/supabaseAdminConfig.mjs';

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

test('prefers current Vercel Supabase integration over stale standalone key', () => {
  const config = resolveSupabaseAdminConfig({
    NEXT_PUBLIC_SUPABASE_URL: 'https://old-project.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'stale-service-role',
    NEXT_PUBLIC_SUPABASE_URL_SUPABASE_URL: 'https://current-project.supabase.co',
    NEXT_PUBLIC_SUPABASE_URL_SUPABASE_SERVICE_ROLE_KEY: 'current-service-role',
  });

  assert.deepEqual(config, {
    url: 'https://current-project.supabase.co',
    key: 'current-service-role',
  });
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
