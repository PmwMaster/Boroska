const express = require('express');
const cors = require('cors');
const path = require('path');

const dashboardRoutes = require('./routes/dashboard');
const tasksRoutes = require('./routes/tasks');
const routinesRoutes = require('./routes/routines');
const transactionsRoutes = require('./routes/transactions');
const workoutsRoutes = require('./routes/workouts');
const studiesRoutes = require('./routes/studies');
const usersRoutes = require('./routes/users');
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const frontendDist = path.join(__dirname, '..', '..', 'frontend', 'dist');

app.use(express.static(frontendDist));

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/routines', routinesRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/workouts', workoutsRoutes);
app.use('/api/studies', studiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ai', aiRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🟢 Ritmo rodando na porta ${PORT}`);
  console.log(`📁 Frontend servido de: ${frontendDist}`);
});
