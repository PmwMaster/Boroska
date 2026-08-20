const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:4000';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

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
export function fetchDashboard() { return get('/api/dashboard'); }

// ─── Tarefas ───
export function fetchTasks(filter = 'all') { return get(`/api/tasks?filter=${filter}`); }
export function fetchTaskStats() { return get('/api/tasks/stats'); }
export function createTask(data) { return post('/api/tasks', data); }
export function toggleTask(id) { return patch(`/api/tasks/${id}/toggle`); }
export function updateTask(id, data) { return patch(`/api/tasks/${id}`, data); }
export function deleteTask(id) { return request(`/api/tasks/${id}`, { method: 'DELETE' }); }

// ─── Rotina ───
export function fetchRoutineBlocks(day) { return get(`/api/routines?day=${day}`); }
export function fetchRoutineStats() { return get('/api/routines/stats'); }
export function toggleRoutineBlock(id) { return patch(`/api/routines/${id}/toggle`); }
export function createRoutine(data) { return post('/api/routines', data); }
export function updateRoutine(id, data) { return patch(`/api/routines/${id}`, data); }
export function deleteRoutine(id) { return request(`/api/routines/${id}`, { method: 'DELETE' }); }

// ─── Finanças ───
export function fetchFinanceStats() { return get('/api/transactions/stats'); }
export function fetchTransactions(limit = 5) { return get(`/api/transactions?limit=${limit}`); }
export function fetchCategories() { return get('/api/transactions/categories'); }
export function createTransaction(data) { return post('/api/transactions', data); }
export function updateTransaction(id, data) { return patch(`/api/transactions/${id}`, data); }
export function deleteTransaction(id) { return request(`/api/transactions/${id}`, { method: 'DELETE' }); }

// ─── Treino ───
export function fetchWorkoutStats() { return get('/api/workouts/stats'); }
export function fetchTodaysWorkout() { return get('/api/workouts/today'); }
export function updateWorkoutStatus(id, status) { return patch(`/api/workouts/${id}/status`, { status }); }
export function toggleExercise(id) { return patch(`/api/workouts/exercises/${id}/toggle`); }
export function createWorkout(data) { return post('/api/workouts', data); }
export function updateWorkout(id, data) { return patch(`/api/workouts/${id}`, data); }
export function deleteWorkout(id) { return request(`/api/workouts/${id}`, { method: 'DELETE' }); }
export function deleteExercise(id) { return request(`/api/workouts/exercises/${id}`, { method: 'DELETE' }); }

// ─── Estudos ───
export function fetchStudyStats() { return get('/api/studies/stats'); }
export function fetchStudyGoals() { return get('/api/studies/goals'); }
export function fetchStudySessions(limit = 5) { return get(`/api/studies/sessions?limit=${limit}`); }
export function createStudySession(data) { return post('/api/studies/sessions', data); }
export function createStudyGoal(data) { return post('/api/studies/goals', data); }
export function updateStudyGoal(id, data) { return patch(`/api/studies/goals/${id}`, data); }
export function deleteStudyGoal(id) { return request(`/api/studies/goals/${id}`, { method: 'DELETE' }); }
export function deleteStudySession(id) { return request(`/api/studies/sessions/${id}`, { method: 'DELETE' }); }

// ─── Usuário ───
export function fetchUser() { return get('/api/users/me'); }
export function updateProfile(data) { return patch('/api/users/me', data); }
