import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import styles from './Login.module.css';

export default function ResetPassword() {
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres');
      return;
    }
    if (password !== confirm) {
      setError('As senhas não coincidem');
      return;
    }
    setLoading(true);
    try {
      await updatePassword(password);
      setDone(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setError(err.message || 'Erro ao atualizar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src="/boroska.png" alt="Boroska" style={{ width: '4.5rem', height: '4.5rem', objectFit: 'contain', margin: '0 auto 0.5rem', display: 'block' }} />
          <h1 className={styles.title}>Boroska</h1>
          <p className={styles.subtitle}>Defina sua nova senha</p>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--success)', display: 'block', marginBottom: '0.75rem' }}>
              check_circle
            </span>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>Senha atualizada! Redirecionando...</p>
          </div>
        ) : !ready ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Link inválido ou expirado. Peça um novo link de recuperação.
            </p>
            <button type="button" onClick={() => navigate('/login')} className={styles.linkBtn}>
              Voltar para o login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="password">Nova senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="confirm">Confirmar nova senha</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className={styles.error}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>error</span>
                {error}
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
