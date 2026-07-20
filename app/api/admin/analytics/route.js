import { NextResponse } from 'next/server';
import { supabaseAdmin, requireAdmin } from '../../../lib/supabaseAdmin';
import {
  ANALYTICS_PAGE_SIZE,
  buildMonthlySeries,
  collectAllPages,
  rankBy,
} from '../../../lib/adminAnalytics.mjs';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const DAY = 86_400_000;

function safeMessage(error) {
  return error?.message || 'Falha desconhecida.';
}

async function exactCount(sb, table, apply = q => q) {
  const { count, error } = await apply(sb.from(table).select('*', { count: 'exact', head: true }));
  if (error) throw error;
  return count ?? 0;
}

async function allRows(sb, table, columns, apply = q => q) {
  return collectAllPages(async ({ from, to }) => {
    const { data, error } = await apply(
      sb.from(table).select(columns).order('id', { ascending: true }).range(from, to),
    );
    if (error) throw error;
    return data || [];
  });
}

async function allAuthUsers(sb) {
  return collectAllPages(async ({ page, pageSize }) => {
    const { data, error } = await sb.auth.admin.listUsers({ page: page + 1, perPage: pageSize });
    if (error) throw error;
    return data?.users || [];
  }, ANALYTICS_PAGE_SIZE);
}

export async function GET(req) {
  const gate = await requireAdmin(req);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: gate.status });

  const sb = supabaseAdmin();
  const errors = [];
  const capture = async (metric, run) => {
    try {
      return await run();
    } catch (error) {
      errors.push({ metric, message: safeMessage(error) });
      return null;
    }
  };

  const sevenDaysAgo = new Date(Date.now() - 7 * DAY).toISOString();
  const [
    users,
    posts,
    posts7,
    comments,
    events,
    rsvpsTotal,
    photographers,
    photogHidden,
    blog,
    partners,
    segments,
    rides,
    comboio7,
    reportsOpen,
    rsvpRows,
    likeRows,
    viewBlog,
  ] = await Promise.all([
    capture('users', () => allAuthUsers(sb)),
    capture('posts', () => exactCount(sb, 'pv_posts')),
    capture('posts_7d', () => exactCount(sb, 'pv_posts', q => q.gte('created_at', sevenDaysAgo))),
    capture('comments', () => exactCount(sb, 'pv_post_comments')),
    capture('events', () => exactCount(sb, 'pv_events')),
    capture('event_rsvps', () => exactCount(sb, 'pv_event_rsvps', q => q.neq('status', 'no'))),
    capture('photographers', () => exactCount(sb, 'pv_photographers')),
    capture('photographers_hidden', () => exactCount(sb, 'pv_photographers', q => q.eq('published', false))),
    capture('published_articles', () => exactCount(sb, 'pv_blog_posts', q => q.eq('published', true))),
    capture('partners', () => exactCount(sb, 'pv_partners')),
    capture('segments', () => exactCount(sb, 'pv_segments')),
    capture('rides', () => exactCount(sb, 'pv_rides')),
    capture('comboio_7d', () => exactCount(sb, 'pv_comboio_messages', q => q.gte('created_at', sevenDaysAgo))),
    capture('reports_open', () => exactCount(sb, 'pv_reports', q => q.eq('status', 'open'))),
    capture('event_ranking', () => allRows(sb, 'pv_event_rsvps', 'id,event_id,status')),
    capture('post_ranking', () => allRows(sb, 'pv_post_likes', 'id,post_id')),
    capture('article_views', async () => {
      const { data, error } = await sb
        .from('pv_blog_posts')
        .select('id,title,views')
        .eq('published', true)
        .gt('views', 0)
        .order('views', { ascending: false })
        .limit(8);
      if (error) throw error;
      return (data || []).map(row => ({ label: row.title, value: row.views || 0 }));
    }),
  ]);

  const topEventCounts = rankBy(rsvpRows || [], 'event_id', {
    include: row => row.status !== 'no',
  });
  const topPostCounts = rankBy(likeRows || [], 'post_id');

  const [eventLabels, postLabels] = await Promise.all([
    capture('event_labels', async () => {
      if (!topEventCounts.length) return [];
      const { data, error } = await sb.from('pv_events').select('id,title').in('id', topEventCounts.map(row => row.id));
      if (error) throw error;
      return data || [];
    }),
    capture('post_labels', async () => {
      if (!topPostCounts.length) return [];
      const { data, error } = await sb.from('pv_posts').select('id,author_name').in('id', topPostCounts.map(row => row.id));
      if (error) throw error;
      return data || [];
    }),
  ]);

  const eventNames = new Map((eventLabels || []).map(row => [String(row.id), row.title]));
  const postNames = new Map((postLabels || []).map(row => [String(row.id), row.author_name]));
  const usersNew7 = users
    ? users.filter(user => user.created_at && new Date(user.created_at).getTime() >= Date.now() - 7 * DAY).length
    : null;

  const response = NextResponse.json({
    generatedAt: new Date().toISOString(),
    complete: errors.length === 0,
    errors,
    summary: {
      users: users?.length ?? null,
      usersNew7,
      posts,
      posts7,
      comments,
      events,
      rsvps: rsvpsTotal,
      photographers,
      photogHidden,
      blog,
      partners,
      segments,
      rides,
      comboio7,
      reportsOpen,
    },
    analytics: {
      signups: buildMonthlySeries(users || []),
      topEvents: topEventCounts.map(row => ({ label: eventNames.get(row.id) || 'Evento removido', value: row.value })),
      topPosts: topPostCounts.map(row => ({ label: postNames.get(row.id) || 'Post removido', value: row.value })),
      viewBlog: viewBlog || [],
    },
    coverage: {
      users: users?.length ?? null,
      eventRsvps: rsvpRows?.length ?? null,
      postLikes: likeRows?.length ?? null,
    },
  });
  response.headers.set('Cache-Control', 'private, no-store');
  return response;
}
