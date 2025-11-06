import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Layout } from './pages/Layout';
import { Ponto } from './pages/Ponto';
import { Clientes } from './pages/Clientes';
import { Solicitacoes } from './pages/Solicitacoes';
import { OKRs } from './pages/OKRs';
import { Feedbacks } from './pages/Feedbacks';
import { Mural } from './pages/Mural';
import { Colaboradores } from './pages/Colaboradores';
import { Configuracoes } from './pages/Configuracoes';
import { NavigationProgress } from './components/ui/NavigationProgress';

function App() {
  return (
    <BrowserRouter>
      <NavigationProgress />
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/ponto" element={<Ponto />} />
          <Route path="/solicitacoes" element={<Solicitacoes />} />
          <Route path="/okrs" element={<OKRs />} />
          <Route path="/feedbacks" element={<Feedbacks />} />
          <Route path="/mural" element={<Mural />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/colaboradores" element={<Colaboradores />} />
          <Route path="/configuracoes" element={<Configuracoes />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
