import { supabase } from './supabase';

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:4000';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (token && typeof token === 'string') {
      // Sanitize token to remove any non-ASCII characters
      const cleanToken = token.replace(/[^\x20-\x7E]/g, '');
      if (cleanToken.length > 0) {
        headers['Authorization'] = `Bearer ${cleanToken}`;
      }
    }
  } catch (e) {
    // Continue without auth
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Erro de conexão' }));
    throw new Error(error.error || `HTTP ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function get(path) {
  return request(path);
}

export function post(path, body) {
  return request(path, { method: 'POST', body: JSON.stringify(body) });
}

export function patch(path, body) {
  return request(path, { method: 'PATCH', body: JSON.stringify(body) });
}

// ─── Dashboard ───
export function fetchDashboard() { return get('/api/core?action=dashboard'); }

// ─── Tarefas ───
export function fetchTasks(filter = 'all') { return get(`/api/tasks?action=list&filter=${filter}`); }
export function fetchTaskStats() { return get('/api/tasks?action=stats'); }
export function createTask(data) { return post('/api/tasks?action=create', data); }
export function toggleTask(id) { return patch(`/api/tasks?action=toggle&id=${id}`); }
export function updateTask(id, data) { return patch(`/api/tasks?action=update&id=${id}`, data); }
export function deleteTask(id) { return request(`/api/tasks?action=delete&id=${id}`, { method: 'DELETE' }); }

// ─── Rotina ───
export function fetchRoutineBlocks(day) { return get(`/api/routines?action=list&day=${day}`); }
export function fetchRoutineStats() { return get('/api/routines?action=stats'); }
export function toggleRoutineBlock(id) { return patch(`/api/routines?action=toggle&id=${id}`); }
export function createRoutine(data) { return post('/api/routines?action=create', data); }
export function updateRoutine(id, data) { return patch(`/api/routines?action=update&id=${id}`, data); }
export function deleteRoutine(id) { return request(`/api/routines?action=delete&id=${id}`, { method: 'DELETE' }); }

// ─── Finanças ───
export function fetchFinanceStats() { return get('/api/transactions?action=stats'); }
export function fetchTransactions(limit = 5) { return get(`/api/transactions?action=list&limit=${limit}`); }
export function fetchCategories() { return get('/api/transactions?action=categories'); }
export function createTransaction(data) { return post('/api/transactions?action=create', data); }
export function updateTransaction(id, data) { return patch(`/api/transactions?action=update&id=${id}`, data); }
export function deleteTransaction(id) { return request(`/api/transactions?action=delete&id=${id}`, { method: 'DELETE' }); }

// ─── Treino ───
export function fetchWorkoutStats() { return get('/api/workouts?action=stats'); }
export function fetchTodaysWorkout() { return get('/api/workouts?action=today'); }
export function updateWorkoutStatus(id, status) { return patch(`/api/workouts?action=status&id=${id}`, { status }); }
export function toggleExercise(id) { return patch(`/api/workouts?action=toggle_exercise&id=${id}`); }
export function createWorkout(data) { return post('/api/workouts?action=create', data); }
export function updateWorkout(id, data) { return patch(`/api/workouts?action=update&id=${id}`, data); }
export function deleteWorkout(id) { return request(`/api/workouts?action=delete&id=${id}`, { method: 'DELETE' }); }
export function deleteExercise(id) { return request(`/api/workouts?action=delete_exercise&id=${id}`, { method: 'DELETE' }); }

// ─── Estudos ───
export function fetchStudyStats() { return get('/api/studies?action=stats'); }
export function fetchStudyGoals() { return get('/api/studies?action=goals'); }
export function fetchStudySessions(limit = 5) { return get(`/api/studies?action=sessions&limit=${limit}`); }
export function createStudySession(data) { return post('/api/studies?action=create_session', data); }
export function createStudyGoal(data) { return post('/api/studies?action=create_goal', data); }
export function updateStudyGoal(id, data) { return patch(`/api/studies?action=update_goal&id=${id}`, data); }
export function deleteStudyGoal(id) { return request(`/api/studies?action=delete_goal&id=${id}`, { method: 'DELETE' }); }
export function deleteStudySession(id) { return request(`/api/studies?action=delete_session&id=${id}`, { method: 'DELETE' }); }

// ─── Usuário ───
export function fetchUser() { return get('/api/core?action=users'); }
export function updateProfile(data) { return patch('/api/core?action=users', data); }
