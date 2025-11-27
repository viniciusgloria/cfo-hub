import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, FileText, Calendar, Settings, Plus, MessageSquare, Users, Target, MessageCircle, TrendingUp, Briefcase, UsersRound, Edit3, BarChart, HelpCircle, FileBarChart2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card } from '../components/ui/Card';
import { PageBanner } from '../components/ui/PageBanner';
import { Button } from '../components/ui/Button';
import { usePontoStore } from '../store/pontoStore';
import { DashboardCustomizer } from '../components/DashboardCustomizer';
import { useSolicitacoesStore } from '../store/solicitacoesStore';
import { useMuralStore } from '../store/muralStore';
import { useDashboardStore } from '../store/dashboardStore';
import { useTourStore } from '../store/tourStore';
// import { useAuthStore } from '../store/authStore';
import { Avatar } from '../components/Avatar';
// no utils import needed here

const iconMap: Record<string, any> = {
  Clock,
  Plus,
  Calendar,
  MessageSquare,
  TrendingUp,
  FileText,
  Users,
  Target,
  MessageCircle,
  Briefcase,
  UsersRound,
  Settings,
  Edit3,
  BarChart,
  FileBarChart2,
};

export function Dashboard() {
  const navigate = useNavigate();
  // Removido 'user' pois não é mais necessário
  const { registros, bancoHoras } = usePontoStore();
  const { solicitacoes } = useSolicitacoesStore();
  const { posts } = useMuralStore();
  const { widgets, toggleWidget, reorderWidgets } = useDashboardStore();
  const { tourCompleted, startTour, autoTourShown, markAutoShown } = useTourStore();
  const [configOpen, setConfigOpen] = useState(false);

  const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'pendente').length;
  
  // Filtrar widgets baseado no role do usuário
  // Removido userRole pois não é mais necessário
  
  // Exibir todos os widgets habilitados, ordenados pelo campo 'order' (garante drag-and-drop correto)
  const orderedWidgets = widgets
    .filter(w => w.enabled)
    .sort((a, b) => a.order - b.order);

  // Separar widgets por categoria, mantendo a ordem
  const actionWidgets = orderedWidgets.filter(w => 
    !w.type.startsWith('card-') && w.type !== 'ultimos-registros' && w.type !== 'mural-recente'
  );
  const cardWidgets = orderedWidgets.filter(w => w.type.startsWith('card-'));
  const sectionWidgets = orderedWidgets.filter(w => 
    w.type === 'ultimos-registros' || w.type === 'mural-recente'
  );

  // Exibir tour automaticamente apenas UMA vez caso não concluído e não tenha sido mostrado
  useEffect(() => {
    if (!tourCompleted && !autoTourShown) {
      setTimeout(() => {
        startTour();
        markAutoShown();
      }, 1000);
    }
    // Não exibe novamente se já foi concluído ou já foi mostrado
    return () => {};
  }, [tourCompleted, autoTourShown, startTour, markAutoShown]);

  const handleWidgetClick = (type: string) => {
    switch (type) {
      case 'registrar-ponto':
        navigate('/ponto');
        return;
      case 'nova-solicitacao':
        navigate('/solicitacoes');
        return;
      case 'agendar-sala':
        navigate('/calendario'); // ajustado para ir direto ao calendário
        return;
      case 'ver-mural':
        navigate('/mural');
        return;
      case 'banco-horas':
        navigate('/ponto');
        return;
      case 'grafico-horas':
        // Widget especial, não navega
        return;
      case 'solicitacoes-pendentes':
        navigate('/solicitacoes');
        return;
      case 'reunioes-hoje':
        navigate('/calendario'); // reuniões remete ao calendário
        return;
      case 'okrs':
        navigate('/okrs');
        return;
      case 'feedbacks':
        navigate('/feedbacks');
        return;
      case 'clientes':
        navigate('/clientes');
        return;
      case 'colaboradores':
        navigate('/colaboradores');
        return;
      case 'configuracoes':
        navigate('/configuracoes');
        return;
      case 'ajustes-ponto':
        navigate('/solicitacoes-ponto');
        return;
      case 'relatorios':
        navigate('/relatorios'); // corrigido destino
        return;
      default:
        // fallback simples evita clique “morto”
        import('react-hot-toast').then(m => m.toast?.('Funcionalidade em desenvolvimento'));
    }
  };

  // Removido banner e título administrativo conforme solicitação

  // Dados para gráfico semanal (últimos 7 dias)
  const getUltimos7Dias = () => {
    const hoje = new Date();
    const dados = [];
    
    for (let i = 6; i >= 0; i--) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - i);
      const dataStr = data.toLocaleDateString('pt-BR');
      const registro = registros.find((r) => r.data === dataStr);
      const minutos = registro ? registro.totalMinutos || 0 : 0;
      const horas = minutos / 60;
      
      dados.push({
        data: data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        horas: Number(horas.toFixed(2)),
        label: `${data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}\nHoras: ${horas.toFixed(2)}`,
      });
    }
    return dados;
  };

  const dadosSemana = getUltimos7Dias();

  return (
    <div className="space-y-6">
      <PageBanner
        title="Dashboard"
        icon={<Home size={32} />}
        style={{ minHeight: '64px' }}
        right={(
          <>
            <Button onClick={startTour} variant="outline" className="flex items-center gap-2">
              <HelpCircle size={16} />
              Tour Guiado
            </Button>
            <Button onClick={() => setConfigOpen(true)} variant="outline" className="flex items-center gap-2">
              <Settings size={16} />
              Personalizar
            </Button>
          </>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 max-w-7xl">
        {cardWidgets.map((widget) => {
          if (widget.type === 'card-banco-horas') {
            return (
              <Card key={widget.id} className="p-3 h-[120px] flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Banco de Horas</p>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{bancoHoras}</h3>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Clock className="text-[#10B981] dark:text-green-400" size={18} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Saldo do mês</p>
              </Card>
            );
          }
          if (widget.type === 'card-solicitacoes') {
            return (
              <Card key={widget.id} className="p-3 h-[120px] flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Solicitações</p>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{solicitacoes.length}</h3>
                  </div>
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <FileText className="text-orange-600 dark:text-orange-400" size={18} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{solicitacoesPendentes} pendentes de aprovação</p>
              </Card>
            );
          }
          if (widget.type === 'card-reunioes') {
            return (
              <Card key={widget.id} className="p-3 h-[120px] flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Reuniões Hoje</p>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">2</h3>
                  </div>
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Calendar className="text-blue-600 dark:text-blue-400" size={18} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Próximas reuniões</p>
              </Card>
            );
          }
          return null;
        })}
      </div>

      <div className="max-w-7xl">
        <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">Ações Rápidas</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {actionWidgets.filter(w => w.type !== 'grafico-horas').map((widget) => {
            const Icon = iconMap[widget.icon];
            
            return (
              <button
                key={widget.id}
                onClick={() => handleWidgetClick(widget.type)}
                className={`${widget.color} p-3 rounded-lg text-white hover:opacity-90 transition-all shadow-sm hover:shadow-md flex flex-col items-center justify-center gap-2 h-[100px]`}
              >
                {Icon && <Icon size={20} />}
                <span className="text-xs font-medium text-center leading-tight">{widget.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 max-w-7xl">
        {actionWidgets.find(w => w.type === 'grafico-horas') && (
          <Card className="p-3">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">Gráfico de Horas (Últimos 7 Dias)</h3>
            <ResponsiveContainer width="100%" height={320}>
              <RechartsBarChart data={dadosSemana}>
                <XAxis dataKey="data" style={{ fontSize: '12px' }} stroke="currentColor" className="text-gray-600 dark:text-gray-400" />
                <YAxis style={{ fontSize: '12px' }} stroke="currentColor" className="text-gray-600 dark:text-gray-400" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--background)', borderColor: 'var(--foreground)' }} />
                <Bar dataKey="horas" radius={[8, 8, 0, 0]}>
                  {dadosSemana.map((_, index) => (
                    <Cell key={`cell-${index}`} fill="#10B981" />
                  ))}
                </Bar>
              </RechartsBarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {sectionWidgets.find(w => w.type === 'ultimos-registros') && (
          <Card className="p-3">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">Últimos Registros</h3>
            <div className="space-y-2">
              {registros.slice(0, 5).map((reg, idx) => {
                const entradaPunch = (reg.punches || []).find((p: any) => p.type === 'entrada');
                const saidaPunch = ([...(reg.punches || [])].reverse() as any[]).find((p) => p.type === 'saida');
                const entrada = entradaPunch?.hhmm ?? '--:--';
                const saida = saidaPunch?.hhmm ?? '--:--';
                return (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{reg.data}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Entrada: {entrada} • Saída: {saida}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium whitespace-nowrap">Entrada: {entrada}</span>
                      <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium whitespace-nowrap">Saída: {saida}</span>
                    </div>
                  </div>
                );
              })}
              <div className="text-center pt-2">
                <Link className="text-[#10B981] dark:text-green-400 text-xs font-medium hover:underline" to="/ponto">Ver todos os registros</Link>
              </div>
            </div>
          </Card>
        )}

        {sectionWidgets.find(w => w.type === 'mural-recente') && (
          <Card className="p-3">
            <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">Mural Recente</h3>
            <div className="space-y-2">
              {posts.slice(0,3).map((post) => (
                <div key={post.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Avatar src={post.avatar} alt={post.author} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{post.author}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(post.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                      <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 line-clamp-2">{post.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              <div className="text-center pt-2">
                <Link className="text-[#10B981] dark:text-green-400 text-xs font-medium hover:underline" to="/mural">Ver todos os posts</Link>
              </div>
            </div>
          </Card>
        )}
      </div>

      <DashboardCustomizer
        isOpen={configOpen}
        onClose={() => setConfigOpen(false)}
        widgets={[...widgets].sort((a, b) => a.order - b.order)}
        onToggleWidget={toggleWidget}
        onReorderWidgets={reorderWidgets}
      />
    </div>
  );
}
