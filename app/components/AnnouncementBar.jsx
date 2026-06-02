import { supabaseServer } from '../lib/supabaseServer';

export const revalidate = 60;

export default async function AnnouncementBar() {
  let a = null;
  try {
    const sb = supabaseServer();
    const { data } = await sb.from('pv_site_config').select('announcement, announcement_active').eq('id', 1).maybeSingle();
    a = data;
  } catch { /* sem config */ }
  if (!a?.announcement_active || !a?.announcement) return null;
  return (
    <div style={{ background: 'var(--clay)', color: 'var(--ink)', textAlign: 'center', padding: '9px 16px', fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, letterSpacing: '.02em', position: 'relative', zIndex: 60 }}>
      {a.announcement}
    </div>
  );
}
