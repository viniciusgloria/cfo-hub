import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attachment } from '../types';

export interface Solicitacao {
  id: string;
  tipo: 'material' | 'reembolso' | 'ferias' | 'homeoffice';
  titulo: string;
  descricao: string;
  valor?: number;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  solicitante: { nome: string; avatar: string };
  data: string;
  urgencia: 'baixa' | 'media' | 'alta';
  anexos?: Attachment[];
}

interface SolicitacoesState {
  solicitacoes: Solicitacao[];
  adicionarSolicitacao: (sol: Solicitacao) => void;
  atualizarStatus: (id: string, status: 'aprovada' | 'rejeitada') => void;
  reset: () => void;
}

const mockSolicitacoes: Solicitacao[] = [
  {
    id: '1',
    tipo: 'material',
    titulo: 'Notebook Dell XPS 15',
    descricao: 'Preciso de um notebook mais potente para trabalhar com design',
    status: 'pendente',
    solicitante: { nome: 'Maria Santos', avatar: 'Maria' },
    data: '02/11/2024',
    urgencia: 'media'
  },
  {
    id: '3',
    tipo: 'reembolso',
    titulo: 'Uber para reunião externa',
    descricao: 'Corrida para reunião com cliente XYZ',
    valor: 45.50,
    status: 'pendente',
    solicitante: { nome: 'João Silva', avatar: 'Joao' },
    data: '30/10/2024',
    urgencia: 'baixa'
  }
];

export const useSolicitacoesStore = create<SolicitacoesState>()(
  persist(
    (set) => ({
      solicitacoes: mockSolicitacoes,
      adicionarSolicitacao: (sol) => set((state) => ({
        solicitacoes: [sol, ...state.solicitacoes]
      })),
      atualizarStatus: (id, status) => set((state) => ({
        solicitacoes: state.solicitacoes.map(sol =>
          sol.id === id ? { ...sol, status } : sol
        )
      }))
      ,
      reset: () => set({ solicitacoes: mockSolicitacoes }),
    }),
    { name: 'cfo:solicitacoes', partialize: (s) => ({ solicitacoes: s.solicitacoes }) }
  )
);
