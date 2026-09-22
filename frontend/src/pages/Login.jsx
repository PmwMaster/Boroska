import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import styles from './Login.module.css';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'recuperar'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { signIn, signUp, authAvailable, user, resetPasswordForEmail } = useAuth();
  const navigate = useNavigate();

  // If auth is not available, or user is already logged in, redirect to dashboard
  useEffect(() => {
    if (!authAvailable || user) {
      navigate('/dashboard', { replace: true });
    }
  }, [authAvailable, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'recuperar') {
        await resetPasswordForEmail(email);
        setResetSent(true);
        return;
      }
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        if (!name.trim()) {
          setError('Nome é obrigatório');
          setLoading(false);
          return;
        }
        await signUp(email, password, name);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao autenticar');
    } finally {
      setLoading(false);
    }
  };

  // If auth is not available, show message
  if (!authAvailable) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <img src="/boroska.png" alt="Boroska" style={{ width: '4.5rem', height: '4.5rem', objectFit: 'contain', margin: '0 auto 0.5rem', display: 'block' }} />
            <h1 className={styles.title}>Boroska</h1>
            <p className={styles.subtitle}>Autenticação não configurada</p>
          </div>
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <p style={{ color: 'var(--foreground-muted)', marginBottom: '1rem' }}>
              O Supabase Auth não está habilitado. Configure o Authentication no painel do Supabase para usar login.
            </p>
            <button onClick={() => navigate('/dashboard')} className={styles.submitBtn}>
              Continuar sem login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <img src="/boroska.png" alt="Boroska" style={{ width: '4.5rem', height: '4.5rem', objectFit: 'contain', margin: '0 auto 0.5rem', display: 'block' }} />
          <h1 className={styles.title}>Boroska</h1>
          <p className={styles.subtitle}>
            {mode === 'login' ? 'Entre na sua conta' : mode === 'signup' ? 'Crie sua conta' : 'Recupere sua senha'}
          </p>
        </div>

        {mode === 'recuperar' && resetSent ? (
          <div style={{ textAlign: 'center', padding: '0.5rem 0 1rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: 'var(--success)', display: 'block', marginBottom: '0.75rem' }}>
              mark_email_read
            </span>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Se <strong>{email}</strong> tiver uma conta, enviamos um link de recuperação. Confira sua caixa de entrada.
            </p>
            <button type="button" onClick={() => { setMode('login'); setResetSent(false); }} className={styles.linkBtn}>
              Voltar para o login
            </button>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signup' && (
            <div className={styles.field}>
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                required
              />
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          {mode !== 'recuperar' && (
            <div className={styles.field}>
              <label htmlFor="password">Senha</label>
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
          )}

          {mode === 'login' && (
            <button
              type="button"
              onClick={() => { setMode('recuperar'); setError(null); }}
              className={styles.linkBtn}
              style={{ alignSelf: 'flex-end', fontSize: '0.8125rem' }}
            >
              Esqueci minha senha
            </button>
          )}

          {error && (
            <div className={styles.error}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>error</span>
              {error}
            </div>
          )}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Carregando...' : mode === 'login' ? 'Entrar' : mode === 'signup' ? 'Criar conta' : 'Enviar link de recuperação'}
          </button>
        </form>
        )}

        <div className={styles.footer}>
          {mode === 'login' && (
            <p>
              Não tem conta?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError(null); }} className={styles.linkBtn}>
                Criar conta
              </button>
            </p>
          )}
          {mode === 'signup' && (
            <p>
              Já tem conta?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(null); }} className={styles.linkBtn}>
                Entrar
              </button>
            </p>
          )}
          {mode === 'recuperar' && !resetSent && (
            <p>
              Lembrou a senha?{' '}
              <button type="button" onClick={() => { setMode('login'); setError(null); }} className={styles.linkBtn}>
                Entrar
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
