import { supabaseAdmin, getUserId } from './lib/auth.js';

export default async function handler(req, res) {
  const { action, id } = req.query;

  if (action === 'today' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json(null);
      const today = new Date(); today.setHours(0, 0, 0, 0);
      const { data } = await supabaseAdmin.from('Workout').select('*, WorkoutExercise(*)').eq('userId', userId).gte('date', today.toISOString()).order('date', { ascending: false }).limit(1).single();
      return res.json(data || null);
    } catch (e) { return res.json(null); }
  }

  if (action === 'stats' && req.method === 'GET') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.json({ streak: 0, totalWorkouts: 0, thisWeek: 0 });
      const { count: totalWorkouts } = await supabaseAdmin.from('Workout').select('*', { count: 'exact', head: true }).eq('userId', userId);
      const weekStart = new Date(); weekStart.setHours(0, 0, 0, 0); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const { count: thisWeek } = await supabaseAdmin.from('Workout').select('*', { count: 'exact', head: true }).eq('userId', userId).gte('date', weekStart.toISOString());
      return res.json({ streak: 0, totalWorkouts: totalWorkouts || 0, thisWeek: thisWeek || 0 });
    } catch (e) { return res.status(500).json({ error: 'Erro ao carregar stats' }); }
  }

  if (action === 'create' && req.method === 'POST') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { muscleGroup, notes, exercises } = req.body;
      if (!muscleGroup?.trim()) return res.status(400).json({ error: 'Campo grupo muscular obrigatorio' });
      const { data: workout, error } = await supabaseAdmin.from('Workout').insert({ muscleGroup: muscleGroup.trim(), notes: notes || null, userId }).select().single();
      if (error) throw error;
      if (exercises?.length) {
        const exData = exercises.map(e => ({ name: e.name, series: e.series || 4, repsMin: e.repsMin || 8, repsMax: e.repsMax || 12, weight: e.weight || null, workoutId: workout.id }));
        await supabaseAdmin.from('WorkoutExercise').insert(exData);
      }
      const { data: full } = await supabaseAdmin.from('Workout').select('*, WorkoutExercise(*)').eq('id', workout.id).single();
      return res.status(201).json(full);
    } catch (e) { return res.status(500).json({ error: 'Erro ao criar treino' }); }
  }

  if (action === 'update' && req.method === 'PATCH') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: workout } = await supabaseAdmin.from('Workout').select('userId').eq('id', id).single();
      if (!workout) return res.status(404).json({ error: 'Nao encontrado' });
      if (workout.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const updates = {};
      if (req.body.muscleGroup !== undefined) updates.muscleGroup = req.body.muscleGroup;
      if (req.body.notes !== undefined) updates.notes = req.body.notes;
      if (req.body.status !== undefined) updates.status = req.body.status;
      if (Object.keys(updates).length) await supabaseAdmin.from('Workout').update(updates).eq('id', id);
      if (req.body.exercises) {
        await supabaseAdmin.from('WorkoutExercise').delete().eq('workoutId', id);
        const exData = req.body.exercises.map(e => ({ name: e.name, series: e.series || 4, repsMin: e.repsMin || 8, repsMax: e.repsMax || 12, weight: e.weight || null, workoutId: id }));
        if (exData.length) await supabaseAdmin.from('WorkoutExercise').insert(exData);
      }
      const { data } = await supabaseAdmin.from('Workout').select('*, WorkoutExercise(*)').eq('id', id).single();
      return res.json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao atualizar treino' }); }
  }

  if (action === 'status' && req.method === 'PATCH') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: workout } = await supabaseAdmin.from('Workout').select('userId').eq('id', id).single();
      if (!workout) return res.status(404).json({ error: 'Nao encontrado' });
      if (workout.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      const { data, error } = await supabaseAdmin.from('Workout').update({ status: req.body.status }).eq('id', id).select().single();
      if (error) throw error;
      return res.json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao atualizar status' }); }
  }

  if (action === 'delete' && req.method === 'DELETE') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: workout } = await supabaseAdmin.from('Workout').select('userId').eq('id', id).single();
      if (!workout) return res.status(404).json({ error: 'Nao encontrado' });
      if (workout.userId !== userId) return res.status(403).json({ error: 'Acesso negado' });
      await supabaseAdmin.from('WorkoutExercise').delete().eq('workoutId', id);
      await supabaseAdmin.from('Workout').delete().eq('id', id);
      return res.json({ deleted: true });
    } catch (e) { return res.status(500).json({ error: 'Erro ao deletar treino' }); }
  }

  if (action === 'toggle_exercise' && req.method === 'PATCH') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      const { data: ex } = await supabaseAdmin.from('WorkoutExercise').select('isDone, Workout(userId)').eq('id', id).single();
      if (!ex) return res.status(404).json({ error: 'Nao encontrado' });
      const { data, error } = await supabaseAdmin.from('WorkoutExercise').update({ isDone: !ex.isDone }).eq('id', id).select().single();
      if (error) throw error;
      return res.json(data);
    } catch (e) { return res.status(500).json({ error: 'Erro ao alternar exercicio' }); }
  }

  if (action === 'delete_exercise' && req.method === 'DELETE') {
    try {
      const userId = await getUserId(req);
      if (!userId) return res.status(401).json({ error: 'Nao autenticado' });
      await supabaseAdmin.from('WorkoutExercise').delete().eq('id', id);
      return res.json({ deleted: true });
    } catch (e) { return res.status(500).json({ error: 'Erro ao deletar exercicio' }); }
  }

  res.status(404).json({ error: 'Rota nao encontrada' });
}
