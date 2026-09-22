import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { fetchUser } from '../../lib/api.js';
import { useAuth } from '../../lib/AuthContext';
import styles from './Sidebar.module.css';

const navItems = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard' },
  { href: '/tarefas', icon: 'task_alt', label: 'Tarefas' },
  { href: '/rotina', icon: 'sync', label: 'Rotina' },
  { href: '/financas', icon: 'payments', label: 'Finanças' },
  { href: '/treino', icon: 'fitness_center', label: 'Treino' },
  { href: '/estudos', icon: 'school', label: 'Estudos' },
  { href: '/relatorio', icon: 'monitoring', label: 'Relatório' },
];

export function Sidebar() {
  const location = useLocation();
  const isActive = (href) => location.pathname.startsWith(href);

  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const { signOut } = useAuth();

  useEffect(() => {
    fetchUser()
      .then((user) => {
        if (user?.name) setUserName(user.name);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className={styles.mobileBar}>
        <button className={styles.hamburger} onClick={() => setMenuOpen((v) => !v)}>
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className={styles.mobileLogo}>
          <img src="/logo.png" alt="Boroska" className={styles.mobileLogoImg} />
        </span>
        <span style={{ width: '2rem', flexShrink: 0 }} />
      </div>

      {menuOpen && <div className={styles.backdrop} onClick={() => setMenuOpen(false)} />}

      <aside className={`${styles.sidebar} ${menuOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.logoContainer}>
          <div className={styles.logoRow}>
            <img src="/logo.png" alt="Boroska" className={styles.logoImg} />
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`${styles.navLink} ${active ? styles.navLinkActive : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className={`material-symbols-outlined ${active ? 'icon-filled' : ''}`}>
                  {item.icon}
                </span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.footer}>
          <p className={styles.quote}>"Disciplina hoje, liberdade amanhã."</p>
          <Link to="/configuracoes" className={`${styles.navLink} ${styles.navLinkFooter}`} onClick={() => setMenuOpen(false)}>
            <span className="material-symbols-outlined">settings</span>
            <span className={styles.navLabel}>Configurações</span>
          </Link>
          <div className={styles.userRow}>
            <div className={styles.avatar}>
              <span className="material-symbols-outlined">person</span>
            </div>
            <span className={styles.userName}>{loading ? 'Carregando...' : (userName || 'Usuário')}</span>
            <button
              type="button"
              onClick={async () => {
                try {
                  await signOut();
                } catch {}
              }}
              title="Sair"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--foreground-muted)',
                cursor: 'pointer',
                padding: '0.25rem',
                marginLeft: 'auto',
                display: 'flex',
                alignItems: 'center',
                lineHeight: 0,
                opacity: 0.6,
                transition: 'color 0.2s, opacity 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.opacity = '1'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--foreground-muted)'; e.currentTarget.style.opacity = '0.6'; }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
