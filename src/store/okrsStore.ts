import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ResultadoChave {
  id: string;
  descricao: string;
  meta: number;
  atual: number;
  unidade: string;
  progresso: number;
}

export interface OKR {
  id: string;
  objetivo: string;
  tipo: 'empresa' | 'time' | 'pessoal';
  trimestre: string;
  owner: { nome: string; avatar: string };
  progresso: number;
  resultadosChave: ResultadoChave[];
  status: 'no-prazo' | 'atencao' | 'atrasado';
}

interface OKRsState {
  okrs: OKR[];
  atualizarProgresso: (okrId: string, krId: string, atual: number) => void;
  reset: () => void;
}

const mockOKRs: OKR[] = [
  {
    id: '1',
    objetivo: 'Aumentar eficiência operacional',
    tipo: 'empresa',
    trimestre: 'Q4 2024',
    owner: { nome: 'João Silva', avatar: 'Joao' },
    progresso: 75,
    resultadosChave: [
      { id: '1a', descricao: 'Reduzir tempo de fechamento em 30%', meta: 30, atual: 24, unidade: '%', progresso: 80 },
      { id: '1b', descricao: 'Automatizar 5 processos manuais', meta: 5, atual: 3, unidade: 'processos', progresso: 60 },
      { id: '1c', descricao: 'Atingir NPS acima de 8.5', meta: 8.5, atual: 7.2, unidade: 'pontos', progresso: 85 }
    ],
    status: 'no-prazo'
  },
  {
    id: '2',
    objetivo: 'Desenvolver competências técnicas',
    tipo: 'pessoal',
    trimestre: 'Q4 2024',
    owner: { nome: 'Maria Santos', avatar: 'Maria' },
    progresso: 60,
    resultadosChave: [
      { id: '2a', descricao: 'Concluir 3 certificações profissionais', meta: 3, atual: 2, unidade: 'certs', progresso: 66 },
      { id: '2b', descricao: 'Participar de 5 workshops', meta: 5, atual: 4, unidade: 'workshops', progresso: 80 },
      { id: '2c', descricao: 'Mentorar 2 colaboradores júnior', meta: 2, atual: 0.7, unidade: 'pessoas', progresso: 35 }
    ],
    status: 'atencao'
  }
];

export const useOKRsStore = create<OKRsState>()(
  persist(
    (set) => ({
      okrs: mockOKRs,
      atualizarProgresso: (okrId, krId, atual) => set((state) => ({
        okrs: state.okrs.map(okr =>
          okr.id === okrId
            ? {
                ...okr,
                resultadosChave: okr.resultadosChave.map(kr =>
                  kr.id === krId
                    ? {
                        ...kr,
                        atual,
                        progresso: Math.round((atual / kr.meta) * 100)
                      }
                    : kr
                )
              }
            : okr
        )
      }))
      ,
      reset: () => set({ okrs: mockOKRs }),
    }),
    { name: 'cfo:okrs', partialize: (s) => ({ okrs: s.okrs }) }
  )
);
