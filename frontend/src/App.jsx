import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './lib/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login.jsx';
import { DashboardLayout } from './pages/DashboardLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Tarefas from './pages/Tarefas.jsx';
import Rotina from './pages/Rotina.jsx';
import Financas from './pages/Financas.jsx';
import Treino from './pages/Treino.jsx';
import Estudos from './pages/Estudos.jsx';
import Configuracoes from './pages/Configuracoes.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tarefas" element={<Tarefas />} />
            <Route path="/rotina" element={<Rotina />} />
            <Route path="/financas" element={<Financas />} />
            <Route path="/treino" element={<Treino />} />
            <Route path="/estudos" element={<Estudos />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
