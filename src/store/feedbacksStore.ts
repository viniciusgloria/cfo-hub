import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Feedback {
  id: string;
  de: { nome: string; avatar: string };
  para: { nome: string; avatar: string };
  tipo: 'positivo' | 'construtivo' | 'avaliacao';
  titulo: string;
  mensagem: string;
  data: string;
  privado: boolean;
  nota?: number;
}

interface FeedbacksState {
  feedbacks: Feedback[];
  adicionarFeedback: (fb: Feedback) => void;
  solicitarFeedback: (paraQuem: string, tipo: string, pergunta: string, anonimo: boolean) => void;
  reset: () => void;
}

const mockFeedbacks: Feedback[] = [
  {
    id: '1',
    de: { nome: 'Carlos Lima', avatar: 'Carlos' },
    para: { nome: 'Maria Santos', avatar: 'Maria' },
    tipo: 'positivo',
    titulo: 'Excelente trabalho na implementação',
    mensagem: 'Excelente trabalho na implementação do novo sistema. Demonstrou grande capacidade técnica e proatividade.',
    data: '31/10/2024',
    privado: false
  },
  {
    id: '2',
    de: { nome: 'RH CFO', avatar: 'RH' },
    para: { nome: 'João Silva', avatar: 'Joao' },
    tipo: 'avaliacao',
    titulo: 'Avaliação Trimestral',
    mensagem: 'Avaliação trimestral: Desempenho acima das expectativas. Pontos fortes: comunicação e entrega de resultados.',
    data: '14/10/2024',
    privado: true,
    nota: 9
  },
  {
    id: '3',
    de: { nome: 'Ana Costa', avatar: 'Ana' },
    para: { nome: 'Maria Santos', avatar: 'Maria' },
    tipo: 'construtivo',
    titulo: 'Feedback sobre apresentação',
    mensagem: 'Ótima apresentação! Sugestão: adicione mais exemplos práticos para facilitar o entendimento da equipe.',
    data: '28/10/2024',
    privado: false
  }
];

export const useFeedbacksStore = create<FeedbacksState>()(
  persist(
    (set) => ({
      feedbacks: mockFeedbacks,
      adicionarFeedback: (fb) => set((state) => ({
        feedbacks: [fb, ...state.feedbacks]
      })),
      solicitarFeedback: (paraQuem, tipo, pergunta, anonimo) => {
        console.log('Feedback solicitado:', { paraQuem, tipo, pergunta, anonimo });
      }
      ,
      reset: () => set({ feedbacks: mockFeedbacks }),
    }),
    { name: 'cfo:feedbacks', partialize: (s) => ({ feedbacks: s.feedbacks }) }
  )
);
