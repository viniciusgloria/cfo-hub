import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useAuthStore } from '../store/authStore';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/ponto': 'Ponto',
  '/solicitacoes': 'Solicitações',
  '/okrs': 'OKRs',
  '/feedbacks': 'Feedbacks',
  '/mural': 'Mural',
  '/clientes': 'Clientes',
  '/colaboradores': 'Colaboradores',
  '/perfil': 'Meu Perfil',
  '/configuracoes': 'Configurações',
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapsed
  const isAuth = useAuthStore((state) => state.isAuth);
  const location = useLocation();

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  // useLocation funciona em BrowserRouter e HashRouter (usa o pathname correto do roteador)
  const currentPath = location.pathname;
  const pageTitle = pageTitles[currentPath] || 'CFO Hub';

  return (
  <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(prev => !prev)}
      />

      <div className={`flex flex-col flex-1 h-full overflow-hidden transition-all duration-300`}>        
        <Header
          title={pageTitle}
          onMenuClick={() => setSidebarOpen(o => !o)}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
