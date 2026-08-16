import { useState, useEffect } from 'react';

export function PrefsSection() {
  const [darkMode, setDarkMode] = useState(() => {
    try {
      return localStorage.getItem('ritmo-dark-mode') === 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ritmo-dark-mode', String(darkMode));
    } catch {}
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [darkMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>dark_mode</span>
          <div>
            <span style={{ fontSize: '0.9375rem', fontWeight: 500, color: 'var(--foreground)', display: 'block' }}>Tema escuro</span>
            <span style={{ fontSize: '0.8125rem', color: 'var(--foreground-muted)' }}>{darkMode ? 'Modo escuro ativo' : 'Modo claro ativo'}</span>
          </div>
        </div>
        <label style={{ cursor: 'pointer', position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
          <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} style={{ opacity: 0, width: 0, height: 0 }} />
          <span style={{ position: 'absolute', inset: 0, backgroundColor: darkMode ? 'var(--primary-start)' : 'var(--surface-bright)', borderRadius: '24px', transition: '0.3s' }}>
            <span style={{ position: 'absolute', left: darkMode ? '22px' : '2px', top: '2px', width: '20px', height: '20px', backgroundColor: '#fff', borderRadius: '50%', transition: '0.3s' }} />
          </span>
        </label>
      </div>
    </div>
  );
}
