import { supabaseAdmin, getUserId } from './lib/auth.js';

export default async function handler(req, res) {
  const { action } = req.query;

  if (action === 'subscribe' && req.method === 'POST') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { endpoint, keys } = req.body || {};
      if (!endpoint || !keys?.p256dh || !keys?.auth) {
        return res.status(400).json({ error: 'Subscription invalida' });
      }
      const { error } = await supabaseAdmin
        .from('PushSubscription')
        .upsert({ endpoint, p256dh: keys.p256dh, auth: keys.auth, userId }, { onConflict: 'endpoint' });
      if (error) throw error;
      return res.status(201).json({ ok: true });
    } catch (e) {
      console.error('Push subscribe error:', e.message);
      return res.status(500).json({ error: 'Erro ao salvar inscricao' });
    }
  }

  if (action === 'unsubscribe' && req.method === 'DELETE') {
    try {
      const { endpoint } = req.body || {};
      if (!endpoint) return res.status(400).json({ error: 'endpoint obrigatorio' });
      await supabaseAdmin.from('PushSubscription').delete().eq('endpoint', endpoint);
      return res.json({ ok: true });
    } catch (e) {
      return res.status(500).json({ error: 'Erro ao remover inscricao' });
    }
  }

  res.status(404).json({ error: 'Rota nao encontrada' });
}
