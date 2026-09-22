import { SectionHeader } from '../components/ui/SectionHeader.jsx';
import { PrefsSection } from '../components/ui/PrefsSection.jsx';
import { fetchUser, updateProfile } from '../lib/api.js';
import { useFetch } from '../lib/useFetch.js';
import { useToast } from '../lib/toast.jsx';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { TutorialBox } from '../components/ui/TutorialBox.jsx';
import styles from './Configuracoes.module.css';

export default function Configuracoes() {
  const { data: user, loading, error, reload } = useFetch(fetchUser);
  const toast = useToast();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    const email = formData.get('email');
    try {
      await updateProfile({ name, email });
      toast.success('Perfil atualizado!');
      reload();
    } catch {
      toast.error('Erro ao salvar');
    }
  }

  if (loading) {
    return (
      <div className={styles.config} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '1rem' }}>Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.config} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <p style={{ color: 'var(--danger)', fontSize: '1rem', marginBottom: '1rem' }}>Erro ao carregar: {error}</p>
        <button onClick={reload} className="btn btn-secondary">
          <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>refresh</span>
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className={styles.config}>
      <TutorialBox
        id="config-intro"
        icon="settings"
        title="Configurações"
        steps={[
          "Aqui você gerencia seu perfil e preferências.",
          "Edite seu nome e email e clique em 'Salvar'.",
          "Ative ou desative o modo escuro conforme sua preferência.",
        ]}
      />

      <header className={styles.pageHeader}>
        <div>
          <h2 className={styles.title}>Configurações</h2>
          <p className={styles.subtitle}>Gerencie suas preferências e dados da conta.</p>
        </div>
      </header>

      <div className="glass-card">
        <SectionHeader icon="person" title="Perfil" />
        <form onSubmit={handleSubmit}>
          <div className={styles.avatarRow}>
            <div
              className={styles.avatar}
              style={{
                background: 'linear-gradient(135deg, var(--primary-start), var(--primary-end))',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '2rem', color: '#fff' }}>person</span>
            </div>
            <div style={{ flex: 1 }}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Nome</label>
                <input
                  type="text"
                  name="name"
                  className={styles.input}
                  defaultValue={user?.name || ''}
                />
              </div>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email</label>
                <input
                  type="email"
                  name="email"
                  className={styles.input}
                  defaultValue={user?.email || ''}
                />
              </div>
            </div>
            <div style={{ alignSelf: 'flex-start' }}>
              <button type="submit" className="btn btn-gradient">
                <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>save</span>
                Salvar
              </button>
            </div>
          </div>
        </form>
      </div>

      <div className="glass-card">
        <SectionHeader icon="tune" title="Preferências" />
        <PrefsSection />
      </div>

      <div className="glass-card" style={{ marginTop: '1.25rem' }}>
        <SectionHeader icon="lock" title="Sessão da Conta" />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--foreground)', display: 'block' }}>Desconectar</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--foreground-muted)' }}>Encerrar sua sessão ativa neste navegador</span>
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await signOut();
                toast.success('Você saiu da sua conta.');
                navigate('/login');
              } catch {
                toast.error('Erro ao sair');
              }
            }}
            className="btn btn-secondary"
            style={{ color: 'var(--danger)', borderColor: 'rgba(192, 74, 61, 0.3)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '1.125rem' }}>logout</span>
            Sair da Conta
          </button>
        </div>
      </div>

    </div>
  );
}
