import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Colaborador {
  id: number;
  nome: string;
  cargo: string;
  departamento: string;
  email: string;
  telefone?: string;
  avatar?: string;
  status: 'ativo' | 'afastado' | 'ferias';
}

interface ColaboradoresState {
  colaboradores: Colaborador[];
  busca: string;
  filtroStatus: string;
  setBusca: (b: string) => void;
  setFiltroStatus: (s: string) => void;
  reset: () => void;
}

const mock: Colaborador[] = [
  { id: 1, nome: 'Ana Costa', cargo: 'Contadora', departamento: 'Financeiro', email: 'ana@cfo.com', telefone: '+55 11 98877-6655', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', status: 'ativo' },
  { id: 2, nome: 'Bruno Almeida', cargo: 'Analista de Dados', departamento: 'BI', email: 'bruno@cfo.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno', status: 'ativo' },
  { id: 3, nome: 'Carla Pereira', cargo: 'Gerente de RH', departamento: 'RH', email: 'carla@cfo.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carla', status: 'ferias' },
  { id: 4, nome: 'Diego Ruiz', cargo: 'Desenvolvedor', departamento: 'Tech', email: 'diego@cfo.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego', status: 'afastado' },
];

export const useColaboradoresStore = create<ColaboradoresState>()(
  persist(
    (set) => ({
      colaboradores: mock,
      busca: '',
      filtroStatus: 'Todos',
      setBusca: (b) => set({ busca: b }),
      setFiltroStatus: (s) => set({ filtroStatus: s }),
      reset: () => set({ colaboradores: mock, busca: '', filtroStatus: 'Todos' }),
    }),
    { name: 'cfo:colaboradores', partialize: (s) => ({ colaboradores: s.colaboradores }) }
  )
);
