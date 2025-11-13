import { useEffect } from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Layout } from './pages/Layout';
import { Ponto } from './pages/Ponto';
import { Clientes } from './pages/Clientes';
import { Solicitacoes } from './pages/Solicitacoes';
import { SolicitacoesPonto } from './pages/SolicitacoesPonto';
import { OKRs } from './pages/OKRs';
import { Feedbacks } from './pages/Feedbacks';
import { Mural } from './pages/Mural';
import { Colaboradores } from './pages/Colaboradores';
import { CadastroUsuario } from './pages/CadastroUsuario';
import { Configuracoes } from './pages/Configuracoes';
import { MeuPerfil } from './pages/MeuPerfil';
import { Relatorios } from './pages/Relatorios';
import { Calendario } from './pages/Calendario';
import { Chat } from './pages/Chat';
import { Avaliacoes } from './pages/Avaliacoes';
import { NavigationProgress } from './components/ui/NavigationProgress';
import { GuidedTour } from './components/GuidedTour';
import { useThemeStore } from './store/themeStore';
import './build-timestamp';

function App() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    // Aplica o tema salvo ao carregar
    setTheme(theme);
  }, []);

  /**
   * Router selection logic:
   * - Uses HashRouter if running from file:// (static file) or VITE_ROUTER_MODE=hash is set in .env
   * - Otherwise uses BrowserRouter (default for dev/preview)
   * - This preserves SPA navigation in static environments without server rewrites
   */
  const useHash = import.meta.env.VITE_ROUTER_MODE === 'hash' || window.location.protocol === 'file:';
  const Router = useHash ? HashRouter : BrowserRouter;

  return (
    <Router>
      <NavigationProgress />
      <GuidedTour />
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ponto" element={<Ponto />} />
          <Route path="/solicitacoes" element={<Solicitacoes />} />
          <Route path="/solicitacoes-ponto" element={<SolicitacoesPonto />} />
          <Route path="/okrs" element={<OKRs />} />
          <Route path="/feedbacks" element={<Feedbacks />} />
          <Route path="/mural" element={<Mural />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/colaboradores" element={<Colaboradores />} />
          <Route path="/colaboradores/cadastro" element={<CadastroUsuario />} />
          <Route path="/perfil" element={<MeuPerfil />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/avaliacoes" element={<Avaliacoes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
