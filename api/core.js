import { supabaseAdmin, getUserId } from './lib/auth.js';

export default async function handler(req, res) {
  const { action } = req.query;

  if (action === 'dashboard' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json({ user: null, pendingTasks: 0, highPriorityTasks: 0, todaysRoutine: [], studyGoals: [], lastWorkout: null, studyTodayMinutes: 0, studyStreak: 0, finance: { balance: 0, weekExpenses: 0 } });

      const { data: user } = await supabaseAdmin.from('User').select('id, name, email, createdAt').eq('id', userId).single();
      const { count: pendingTasks } = await supabaseAdmin.from('Task').select('*', { count: 'exact', head: true }).eq('userId', userId).neq('status', 'DONE');
      const { count: highPriorityTasks } = await supabaseAdmin.from('Task').select('*', { count: 'exact', head: true }).eq('userId', userId).eq('priority', 'HIGH').neq('status', 'DONE');
      const { data: todaysRoutine } = await supabaseAdmin.from('RoutineBlock').select('*').eq('userId', userId).eq('dayOfWeek', new Date().getDay()).order('startTime');
      const { data: studyGoals } = await supabaseAdmin.from('StudyGoal').select('*').eq('userId', userId).order('progress', { ascending: false }).limit(4);
      const { data: lastWorkout } = await supabaseAdmin.from('Workout').select('*, WorkoutExercise(*)').eq('userId', userId).order('date', { ascending: false }).limit(1).single();

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const { data: studyToday } = await supabaseAdmin.from('StudySession').select('duration').eq('userId', userId).gte('date', today.toISOString());
      const studyTodayMinutes = (studyToday || []).reduce((sum, s) => sum + (s.duration || 0), 0);

      const { data: incomeData } = await supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'INCOME');
      const { data: expenseData } = await supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'EXPENSE');
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data: weekExpenses } = await supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'EXPENSE').gte('date', weekAgo);

      const income = (incomeData || []).reduce((s, t) => s + t.amount, 0);
      const expenses = (expenseData || []).reduce((s, t) => s + t.amount, 0);
      const weekExp = (weekExpenses || []).reduce((s, t) => s + t.amount, 0);

      return res.json({
        user, pendingTasks: pendingTasks || 0, highPriorityTasks: highPriorityTasks || 0,
        todaysRoutine: todaysRoutine || [], studyGoals: studyGoals || [],
        lastWorkout: lastWorkout || null, studyTodayMinutes, studyStreak: 0,
        finance: { balance: income - expenses, weekExpenses: weekExp },
      });
    } catch (e) {
      console.error('Dashboard error:', e.message);
      return res.status(500).json({ error: 'Erro ao carregar dashboard' });
    }
  }

  if (action === 'users') {
    if (req.method === 'GET') {
      try {
        const userId = await getUserId(req);
        if (!userId) return res.json(null);
        const { data: user } = await supabaseAdmin.from('User').select('id, name, email, createdAt').eq('id', userId).single();
        return res.json(user || null);
      } catch (e) {
        return res.status(500).json({ error: 'Erro ao carregar usuario' });
      }
    }
    if (req.method === 'PATCH') {
      try {
        const userId = await getUserId(req);
        if (!userId) return res.status(404).json({ error: 'Sem usuario' });
        const { name, email } = req.body;
        const updates = {};
        if (name?.trim()) updates.name = name.trim();
        if (email?.trim()) updates.email = email.trim();
        const { data, error } = await supabaseAdmin.from('User').update(updates).eq('id', userId).select().single();
        if (error) throw error;
        return res.json(data);
      } catch (e) {
        return res.status(500).json({ error: 'Erro ao atualizar perfil' });
      }
    }
  }

  res.status(404).json({ error: 'Rota nao encontrada' });
}
