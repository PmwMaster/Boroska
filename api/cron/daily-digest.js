import { supabaseAdmin } from '../lib/auth.js';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:contato@boroska.app',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  const auth = req.headers.authorization;
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Nao autorizado' });
  }

  const { data: subs } = await supabaseAdmin.from('PushSubscription').select('*');
  if (!subs?.length) return res.json({ sent: 0 });

  const userIds = [...new Set(subs.map((s) => s.userId))];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
  const dayOfWeek = new Date().getDay();

  let sent = 0;
  const expired = [];

  for (const userId of userIds) {
    const [{ count: pendingTasks }, { count: highPriority }, { data: routine }] = await Promise.all([
      supabaseAdmin.from('Task').select('*', { count: 'exact', head: true }).eq('userId', userId).neq('status', 'DONE'),
      supabaseAdmin.from('Task').select('*', { count: 'exact', head: true }).eq('userId', userId).eq('priority', 'HIGH').neq('status', 'DONE'),
      supabaseAdmin.from('RoutineBlock').select('title, startTime').eq('userId', userId).eq('dayOfWeek', dayOfWeek).order('startTime').limit(1),
    ]);

    if (!pendingTasks && !routine?.length) continue;

    const firstBlock = routine?.[0];
    const parts = [];
    if (pendingTasks) parts.push(`${pendingTasks} tarefa${pendingTasks > 1 ? 's' : ''} pendente${pendingTasks > 1 ? 's' : ''}${highPriority ? ` (${highPriority} urgente${highPriority > 1 ? 's' : ''})` : ''}`);
    if (firstBlock) parts.push(`primeiro bloco: ${firstBlock.title} às ${firstBlock.startTime}`);
    const body = parts.join(' · ') || 'Confira seu dia no Boroska.';

    const payload = JSON.stringify({ title: 'Bom dia! ☀️', body });

    for (const sub of subs.filter((s) => s.userId === userId)) {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        sent++;
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) expired.push(sub.endpoint);
      }
    }
  }

  if (expired.length) {
    await supabaseAdmin.from('PushSubscription').delete().in('endpoint', expired);
  }

  return res.json({ sent, expiredRemoved: expired.length });
}
