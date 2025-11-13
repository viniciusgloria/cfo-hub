import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useAuthStore } from '../store/authStore';

// Título fixo, não precisa mais do mapeamento de páginas

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapsed
  const isAuth = useAuthStore((state) => state.isAuth);
  // Removido useLocation pois não é mais necessário

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  // useLocation funciona em BrowserRouter e HashRouter (usa o pathname correto do roteador)

  // Título fixo conforme solicitado
  const pageTitle = 'Flow HUB - Sistema de Gestão Integrado';

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
