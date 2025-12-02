import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ColaboradorCompleto } from '../types';

export interface Colaborador {
  id: number;
  nome: string;
  cargo: string;
  departamento: string;
  email: string;
  telefone?: string;
  avatar?: string;
  status: 'ativo' | 'afastado' | 'ferias';
  metaHorasMensais?: number; // Meta de horas por mês (padrão 176h)
  
  // Campos extras para integração com folha de pagamento
  nomeCompleto?: string;
  cpf?: string;
  rg?: string;
  dataNascimento?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  setor?: string;
  funcao?: string;
  empresa?: string;
  regime?: 'CLT' | 'PJ';
  contrato?: 'CLT' | 'PJ';
  chavePix?: string;
  banco?: string;
  codigoBanco?: string;
  agencia?: string;
  conta?: string;
  operacao?: string;
  cnpj?: string;
  razaoSocial?: string;
  obs?: string;
}

interface ColaboradoresState {
  colaboradores: Colaborador[];
  busca: string;
  filtroStatus: string;
  setBusca: (b: string) => void;
  setFiltroStatus: (s: string) => void;
  adicionarColaborador: (dados: Omit<Colaborador, 'id'>) => void;
  atualizarColaborador: (id: number, dados: Partial<Colaborador>) => void;
  updateAvatarByEmail: (email: string, avatarUrl: string) => void;
  reset: () => void;
}

const mock: Colaborador[] = [
  { id: 1, nome: 'Ana Costa', nomeCompleto: 'Ana Costa', cpf: '12345678901', cargo: 'Contadora', departamento: 'Financeiro', email: 'ana@cfo.com', telefone: '+55 11 98877-6655', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana', status: 'ativo', metaHorasMensais: 176 },
  { id: 2, nome: 'Bruno Almeida', nomeCompleto: 'Bruno Almeida', cpf: '23456789012', cargo: 'Analista de Dados', departamento: 'BI', email: 'bruno@cfo.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno', status: 'ativo', metaHorasMensais: 176 },
  { id: 3, nome: 'Carla Pereira', nomeCompleto: 'Carla Pereira', cpf: '34567890123', cargo: 'Gerente de RH', departamento: 'RH', email: 'carla@cfo.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carla', status: 'ferias', metaHorasMensais: 176 },
  { id: 4, nome: 'Diego Ruiz', nomeCompleto: 'Diego Ruiz', cpf: '45678901234', cargo: 'Desenvolvedor', departamento: 'Tech', email: 'diego@cfo.com', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diego', status: 'afastado', metaHorasMensais: 176 },
];

export const useColaboradoresStore = create<ColaboradoresState>()(
  persist(
    (set) => ({
      colaboradores: mock,
      busca: '',
      filtroStatus: 'Todos',
      setBusca: (b) => set({ busca: b }),
      setFiltroStatus: (s) => set({ filtroStatus: s }),
      adicionarColaborador: (dados) =>
        set((state) => {
          const newId = Math.max(...state.colaboradores.map((c) => c.id)) + 1;
          const newColaborador: Colaborador = { id: newId, ...dados };
          return { colaboradores: [...state.colaboradores, newColaborador] };
        }),
      atualizarColaborador: (id, dados) =>
        set((state) => ({
          colaboradores: state.colaboradores.map((c) =>
            c.id === id ? { ...c, ...dados } : c
          ),
        })),
      updateAvatarByEmail: (email, avatarUrl) =>
        set((state) => ({
          colaboradores: state.colaboradores.map((c) =>
            c.email === email ? { ...c, avatar: avatarUrl } : c
          ),
        })),
      reset: () => set({ colaboradores: mock, busca: '', filtroStatus: 'Todos' }),
    }),
    { name: 'cfo:colaboradores', partialize: (s) => ({ colaboradores: s.colaboradores }) }
  )
);
