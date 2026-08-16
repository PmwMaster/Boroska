import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar.jsx';
import { AIChatPanel } from '../components/ui/AIChatPanel.jsx';
import styles from './DashboardLayout.module.css';

export function DashboardLayout() {
  return (
    <div className={styles.container}>
      <Sidebar />
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <AIChatPanel />
    </div>
  );
}
