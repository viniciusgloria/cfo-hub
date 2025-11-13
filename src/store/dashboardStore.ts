import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type WidgetType = 
  | 'registrar-ponto'
  | 'nova-solicitacao'
  | 'agendar-sala'
  | 'ver-mural'
  | 'banco-horas'
  | 'grafico-horas'
  | 'solicitacoes-pendentes'
  | 'reunioes-hoje'
  | 'okrs'
  | 'feedbacks'
  | 'clientes'
  | 'colaboradores'
  | 'configuracoes'
  | 'ajustes-ponto'
  | 'relatorios'
  | 'card-banco-horas'
  | 'card-solicitacoes'
  | 'card-reunioes'
  | 'ultimos-registros'
  | 'mural-recente';

export interface Widget {
  id: string;
  type: WidgetType;
  label: string;
  icon: string;
  color: string;
  enabled: boolean;
  order: number;
  gridPosition?: {
    row: number;
    col: number;
    width: number; // largura em colunas (1-4)
    height: number; // altura em unidades
  };
}

interface DashboardState {
  widgets: Widget[];
  toggleWidget: (id: string) => void;
  reorderWidgets: (widgets: Widget[]) => void;
  updateWidgetPosition: (id: string, position: { row: number; col: number; width: number; height: number }) => void;
  reset: () => void;
}

const defaultWidgets: Widget[] = [
  // Ações rápidas
  { id: 'registrar-ponto', type: 'registrar-ponto', label: 'Registrar Ponto', icon: 'Clock', color: 'bg-[#10B981]', enabled: true, order: 0 },
  { id: 'nova-solicitacao', type: 'nova-solicitacao', label: 'Nova Solicitação', icon: 'Plus', color: 'bg-[#3B82F6]', enabled: true, order: 1 },
  { id: 'agendar-sala', type: 'agendar-sala', label: 'Agendar Sala', icon: 'Calendar', color: 'bg-[#8B5CF6]', enabled: true, order: 2 },
  { id: 'ver-mural', type: 'ver-mural', label: 'Ver Mural', icon: 'MessageSquare', color: 'bg-[#F59E0B]', enabled: true, order: 3 },
  { id: 'banco-horas', type: 'banco-horas', label: 'Banco de Horas', icon: 'TrendingUp', color: 'bg-[#10B981]', enabled: true, order: 4 },
  { id: 'grafico-horas', type: 'grafico-horas', label: 'Gráfico de Horas', icon: 'BarChart', color: 'bg-[#6366F1]', enabled: true, order: 5 },
  { id: 'solicitacoes-pendentes', type: 'solicitacoes-pendentes', label: 'Solicitações Pendentes', icon: 'FileText', color: 'bg-[#EF4444]', enabled: true, order: 6 },
  { id: 'reunioes-hoje', type: 'reunioes-hoje', label: 'Reuniões Hoje', icon: 'Users', color: 'bg-[#3B82F6]', enabled: false, order: 7 },
  { id: 'okrs', type: 'okrs', label: 'Meus OKRs', icon: 'Target', color: 'bg-[#8B5CF6]', enabled: true, order: 8 },
  { id: 'feedbacks', type: 'feedbacks', label: 'Feedbacks', icon: 'MessageCircle', color: 'bg-[#F59E0B]', enabled: true, order: 9 },
  { id: 'clientes', type: 'clientes', label: 'Clientes', icon: 'Briefcase', color: 'bg-[#6366F1]', enabled: true, order: 10 },
  { id: 'colaboradores', type: 'colaboradores', label: 'Colaboradores', icon: 'UsersRound', color: 'bg-[#EC4899]', enabled: true, order: 11 },
  { id: 'configuracoes', type: 'configuracoes', label: 'Configurações', icon: 'Settings', color: 'bg-[#64748B]', enabled: true, order: 12 },
  { id: 'ajustes-ponto', type: 'ajustes-ponto', label: 'Ajustes de Ponto', icon: 'Edit3', color: 'bg-[#F97316]', enabled: true, order: 13 },
  { id: 'relatorios', type: 'relatorios', label: 'Relatórios', icon: 'FileBarChart2', color: 'bg-[#14B8A6]', enabled: true, order: 14 },
  // Cards de métricas
  { id: 'card-banco-horas', type: 'card-banco-horas', label: 'Banco de Horas', icon: 'Clock', color: 'bg-[#10B981]', enabled: true, order: 15 },
  { id: 'card-solicitacoes', type: 'card-solicitacoes', label: 'Solicitações', icon: 'FileText', color: 'bg-[#F59E0B]', enabled: true, order: 16 },
  { id: 'card-reunioes', type: 'card-reunioes', label: 'Reuniões Hoje', icon: 'Calendar', color: 'bg-[#3B82F6]', enabled: true, order: 17 },
  // Seções de conteúdo
  { id: 'ultimos-registros', type: 'ultimos-registros', label: 'Últimos Registros', icon: 'Clock', color: 'bg-[#10B981]', enabled: true, order: 18 },
  { id: 'mural-recente', type: 'mural-recente', label: 'Mural Recente', icon: 'MessageSquare', color: 'bg-[#F59E0B]', enabled: true, order: 19 },
];

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: defaultWidgets,
      toggleWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w)),
        })),
      reorderWidgets: (widgets) => set({ widgets }),
      updateWidgetPosition: (id, position) =>
        set((state) => ({
          widgets: state.widgets.map((w) => (w.id === id ? { ...w, gridPosition: position } : w)),
        })),
      reset: () => set({ widgets: defaultWidgets }),
    }),
    { 
      name: 'cfo:dashboard', 
      partialize: (s) => ({ widgets: s.widgets }),
      // Validar e corrigir dados ao carregar do localStorage
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        
        // Validar se widgets existe e é um array válido
        if (!Array.isArray(state.widgets) || state.widgets.length === 0) {
          state.widgets = defaultWidgets;
          return;
        }
        
        // Atualizar widgets existentes com novos labels e ícones
        const defaultWidgetsMap = new Map(defaultWidgets.map(w => [w.id, w]));
        
        const updatedWidgets = state.widgets.map(widget => {
          const defaultWidget = defaultWidgetsMap.get(widget.id);
          if (defaultWidget) {
            // Preservar apenas enabled e order do localStorage, atualizar tudo mais
            return {
              ...defaultWidget,
              enabled: widget.enabled,
              order: widget.order,
              gridPosition: widget.gridPosition,
            };
          }
          return widget;
        });
        
        // Adicionar widgets faltantes
        const existingIds = new Set(updatedWidgets.map(w => w.id));
        const missingWidgets = defaultWidgets.filter(w => !existingIds.has(w.id));
        
        state.widgets = [...updatedWidgets, ...missingWidgets].sort((a, b) => a.order - b.order);
      }
    }
  )
);
