import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attachment, User } from '../types';

export type TipoSolicitacaoPonto = 'ajuste' | 'atestado';
export type AlvoAjuste = 'entrada' | 'saida';
export type StatusSolicitacao = 'pendente' | 'aprovada' | 'rejeitada';

export interface SolicitacaoPonto {
  id: string;
  colaboradorEmail: string; // lookup to colaboradoresStore when necessário
  colaboradorNome: string;
  data: string; // dd/mm/yyyy
  tipo: TipoSolicitacaoPonto;
  alvo?: AlvoAjuste; // para ajuste
  horarioNovo?: string; // HH:MM
  motivo: string;
  anexos?: Attachment[]; // para atestado
  status: StatusSolicitacao;
  createdAt: string; // ISO
  decididoPor?: Pick<User, 'id' | 'name' | 'role'>;
  decididoEm?: string; // ISO
}

interface AjustesPontoState {
  solicitacoes: SolicitacaoPonto[];
  adicionar: (s: Omit<SolicitacaoPonto, 'id' | 'status' | 'createdAt'>) => string;
  atualizarStatus: (id: string, status: StatusSolicitacao, decididoPor?: Pick<User, 'id' | 'name' | 'role'>) => void;
  reset: () => void;
}

export const useAjustesPontoStore = create<AjustesPontoState>()(
  persist(
    (set) => ({
      solicitacoes: [],
      adicionar: (dados) => {
        const id = Date.now().toString();
        const novo: SolicitacaoPonto = {
          ...dados,
          id,
          status: 'pendente',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ solicitacoes: [novo, ...state.solicitacoes] }));
        return id;
      },
      atualizarStatus: (id, status, decididoPor) =>
        set((state) => ({
          solicitacoes: state.solicitacoes.map((s) =>
            s.id === id ? { ...s, status, decididoPor, decididoEm: new Date().toISOString() } : s
          ),
        })),
      reset: () => set({ solicitacoes: [] }),
    }),
    { name: 'cfo:ajustes-ponto', partialize: (s) => ({ solicitacoes: s.solicitacoes }) }
  )
);
