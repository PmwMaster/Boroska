import { supabaseAdmin, getUserId } from './lib/auth.js';
import { computeStreak } from './lib/dates.js';

export default async function handler(req, res) {
  const { action } = req.query;

  if (action === 'dashboard' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json({ user: null, pendingTasks: 0, highPriorityTasks: 0, todaysRoutine: [], studyGoals: [], lastWorkout: null, studyTodayMinutes: 0, studyStreak: 0, finance: { balance: 0, weekExpenses: 0 } });

      const today = new Date(); today.setHours(0, 0, 0, 0);
      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

      const [
        { data: user },
        { count: pendingTasks },
        { count: highPriorityTasks },
        { data: todaysRoutine },
        { data: studyGoals },
        { data: lastWorkout },
        { data: studyToday },
        { data: studyDates },
        { data: incomeData },
        { data: expenseData },
        { data: weekExpenses }
      ] = await Promise.all([
        supabaseAdmin.from('User').select('id, name, email, createdAt').eq('id', userId).single(),
        supabaseAdmin.from('Task').select('*', { count: 'exact', head: true }).eq('userId', userId).neq('status', 'DONE'),
        supabaseAdmin.from('Task').select('*', { count: 'exact', head: true }).eq('userId', userId).eq('priority', 'HIGH').neq('status', 'DONE'),
        supabaseAdmin.from('RoutineBlock').select('*').eq('userId', userId).eq('dayOfWeek', new Date().getDay()).order('startTime'),
        supabaseAdmin.from('StudyGoal').select('*').eq('userId', userId).order('progress', { ascending: false }).limit(4),
        supabaseAdmin.from('Workout').select('*, WorkoutExercise(*)').eq('userId', userId).order('date', { ascending: false }).limit(1).maybeSingle(),
        supabaseAdmin.from('StudySession').select('duration').eq('userId', userId).gte('date', today.toISOString()),
        supabaseAdmin.from('StudySession').select('date').eq('userId', userId),
        supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'INCOME'),
        supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'EXPENSE'),
        supabaseAdmin.from('Transaction').select('amount').eq('userId', userId).eq('type', 'EXPENSE').gte('date', weekAgo)
      ]);

      const studyTodayMinutes = (studyToday || []).reduce((sum, s) => sum + (s.duration || 0), 0);
      const studyStreak = computeStreak((studyDates || []).map(s => s.date));

      const income = (incomeData || []).reduce((s, t) => s + t.amount, 0);
      const expenses = (expenseData || []).reduce((s, t) => s + t.amount, 0);
      const weekExp = (weekExpenses || []).reduce((s, t) => s + t.amount, 0);

      return res.json({
        user, pendingTasks: pendingTasks || 0, highPriorityTasks: highPriorityTasks || 0,
        todaysRoutine: todaysRoutine || [], studyGoals: studyGoals || [],
        lastWorkout: lastWorkout ? { ...lastWorkout, exercises: lastWorkout.WorkoutExercise || [] } : null,
        studyTodayMinutes, studyStreak,
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
