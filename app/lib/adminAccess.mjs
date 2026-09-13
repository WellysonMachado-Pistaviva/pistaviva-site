// app_metadata is controlled by Supabase Admin; user_metadata is never trusted.
export function isAdminAccount(user, emails) {
  return emails.includes((user?.email || '').toLowerCase()) || user?.app_metadata?.is_admin === true;
}
