import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Avaliacao {
  id: number;
  avaliadorId: string;
  avaliadoId: string;
  periodo: string; // Ex: "Q4 2025"
  status: 'pendente' | 'concluida';
  dataLimite: string;
  dataConclusao?: string;
  notas: {
    comunicacao: number;
    trabalhoEmEquipe: number;
    qualidadeTecnica: number;
    pontualidade: number;
    proatividade: number;
  };
  pontosFortes?: string;
  pontosDesenvolvimento?: string;
  comentarios?: string;
}

interface AvaliacoesState {
  avaliacoes: Avaliacao[];
  adicionarAvaliacao: (avaliacao: Omit<Avaliacao, 'id'>) => void;
  concluirAvaliacao: (id: number, dados: Partial<Avaliacao>) => void;
  getAvaliacoesPendentes: (userId: string) => Avaliacao[];
  getAvaliacoesRecebidas: (userId: string) => Avaliacao[];
  reset: () => void;
}

const mockAvaliacoes: Avaliacao[] = [
  {
    id: 1,
    avaliadorId: '1',
    avaliadoId: '2',
    periodo: 'Q4 2025',
    status: 'pendente',
    dataLimite: '2025-12-15',
    notas: {
      comunicacao: 0,
      trabalhoEmEquipe: 0,
      qualidadeTecnica: 0,
      pontualidade: 0,
      proatividade: 0,
    },
  },
  {
    id: 2,
    avaliadorId: '3',
    avaliadoId: '1',
    periodo: 'Q3 2025',
    status: 'concluida',
    dataLimite: '2025-09-30',
    dataConclusao: '2025-09-28',
    notas: {
      comunicacao: 4,
      trabalhoEmEquipe: 5,
      qualidadeTecnica: 4,
      pontualidade: 5,
      proatividade: 4,
    },
    pontosFortes: 'Excelente comunicação e trabalho em equipe',
    pontosDesenvolvimento: 'Continuar desenvolvendo habilidades técnicas',
    comentarios: 'Profissional dedicado e colaborativo',
  },
];

export const useAvaliacoesStore = create<AvaliacoesState>()(
  persist(
    (set, get) => ({
      avaliacoes: mockAvaliacoes,

      adicionarAvaliacao: (avaliacao) => {
        const novaAvaliacao: Avaliacao = {
          ...avaliacao,
          id: Date.now(),
        };
        set((state) => ({
          avaliacoes: [...state.avaliacoes, novaAvaliacao],
        }));
      },

      concluirAvaliacao: (id, dados) => {
        set((state) => ({
          avaliacoes: state.avaliacoes.map((a) =>
            a.id === id
              ? {
                  ...a,
                  ...dados,
                  status: 'concluida',
                  dataConclusao: new Date().toISOString().split('T')[0],
                }
              : a
          ),
        }));
      },

      getAvaliacoesPendentes: (userId) => {
        return get().avaliacoes.filter(
          (a) => a.avaliadorId === userId && a.status === 'pendente'
        );
      },

      getAvaliacoesRecebidas: (userId) => {
        return get().avaliacoes.filter((a) => a.avaliadoId === userId);
      },

      reset: () => set({ avaliacoes: [] }),
    }),
    {
      name: 'cfo:avaliacoes',
    }
  )
);
