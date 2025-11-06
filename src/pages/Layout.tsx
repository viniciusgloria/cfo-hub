import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
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
  '/configuracoes': 'Configurações',
};

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isAuth = useAuthStore((state) => state.isAuth);

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  const currentPath = window.location.pathname;
  const pageTitle = pageTitles[currentPath] || 'CFO Hub';

  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-[260px]">
        <Header title={pageTitle} onMenuClick={() => setSidebarOpen(true)} />

        <main className="pt-16 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
