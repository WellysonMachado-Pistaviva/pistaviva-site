import test from 'node:test';
import assert from 'node:assert/strict';
import { isAdminAccount } from '../app/lib/adminAccess.mjs';

const emails = ['owner@example.com'];
test('configured owner and server-managed admin role grant access', () => {
  assert.equal(isAdminAccount({ email: 'OWNER@example.com' }, emails), true);
  assert.equal(isAdminAccount({ app_metadata: { is_admin: true } }, emails), true);
});
test('editable metadata, string flags and revoked admin roles cannot grant access', () => {
  for (const user of [null, {}, { user_metadata: { is_admin: true } },
    { app_metadata: { is_admin: 'true' } }, { app_metadata: { is_admin: false } }]) {
    assert.equal(isAdminAccount(user, emails), false);
  }
});
