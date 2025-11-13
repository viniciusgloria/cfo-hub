import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { useAuthStore } from '../store/authStore';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/ponto': 'Ponto',
  '/solicitacoes': 'Solicitações',
  '/solicitacoes-ponto': 'Solicitações de Ponto',
  '/calendario': 'Calendário',
  '/chat': 'Chat',
  '/okrs': 'OKRs',
  '/avaliacoes': 'Avaliações',
  '/feedbacks': 'Feedbacks',
  '/mural': 'Mural',
  '/relatorios': 'Relatórios',
  '/clientes': 'Clientes',
  '/colaboradores': 'Colaboradores',
  '/perfil': 'Meu Perfil',
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
    <div className="flex min-h-screen bg-[#F9FAFB] dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 md:ml-[260px] flex flex-col">
        <Header title={pageTitle} onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 p-6 mt-16">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
