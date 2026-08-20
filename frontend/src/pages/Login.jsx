import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const { authAvailable } = useAuth();
  const navigate = useNavigate();

  // If auth is not available, redirect to dashboard
  if (!authAvailable) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className="material-symbols-outlined" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>
            fitness_center
          </span>
          <h1 className={styles.title}>Boroska</h1>
          <p className={styles.subtitle}>Autenticação não configurada</p>
        </div>
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <p style={{ color: 'var(--foreground-muted)', marginBottom: '1rem' }}>
            O sistema está rodando em modo local. Faça login pelo Supabase para usar autenticação.
          </p>
          <button onClick={() => navigate('/dashboard')} className={styles.submitBtn}>
            Continuar sem login
          </button>
        </div>
      </div>
    </div>
  );
}
