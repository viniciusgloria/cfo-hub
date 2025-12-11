import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Attachment } from '../types';

export interface Solicitacao {
  id: string;
  tipo: 'material' | 'documento' | 'reembolso' | 'ferias' | 'homeoffice';
  titulo: string;
  descricao: string;
  valor?: number;
  status: 'pendente' | 'aprovada' | 'rejeitada';
  solicitante: { nome: string; avatar: string };
  data: string;
  urgencia: 'baixa' | 'media' | 'alta';
  anexos?: Attachment[];
  respostaGestor?: {
    enviadoEm: string;
    enviadoPor: string;
    mensagem?: string;
  };
  arquivosResposta?: Attachment[];
}

interface SolicitacoesState {
  solicitacoes: Solicitacao[];
  adicionarSolicitacao: (sol: Solicitacao) => void;
  atualizarStatus: (id: string, status: 'aprovada' | 'rejeitada') => void;
  enviarRespostaComArquivos: (id: string, arquivos: Attachment[], mensagem: string, gestorNome: string) => void;
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
    id: '2',
    tipo: 'reembolso',
    titulo: 'Solicitação de Holerite - Outubro/2024',
    descricao: 'Preciso do holerite de outubro para apresentação bancária',
    valor: 0,
    status: 'pendente',
    solicitante: { nome: 'Carlos Mendes', avatar: 'Carlos' },
    data: '05/11/2024',
    urgencia: 'alta',
    respostaGestor: {
      enviadoEm: '06/11/2024',
      enviadoPor: 'Ana Silva',
      mensagem: 'Segue em anexo o holerite solicitado. Qualquer dúvida, entre em contato.'
    },
    arquivosResposta: [
      {
        id: 'resp-1',
        name: 'Holerite_Carlos_Mendes_Outubro2024.pdf',
        mimeType: 'application/pdf',
        size: 1024000,
        dataUrl: 'data:application/pdf;base64,JVBERi0xLjQ=',
        remoteUrl: 'https://files.cfo-hub.local/resp-1/Holerite_Carlos_Mendes_Outubro2024.pdf'
      }
    ]
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
      })),
      enviarRespostaComArquivos: (id, arquivos, mensagem, gestorNome) => set((state) => ({
        solicitacoes: state.solicitacoes.map(sol =>
          sol.id === id 
            ? {
                ...sol,
                arquivosResposta: arquivos,
                respostaGestor: {
                  enviadoEm: new Date().toLocaleDateString('pt-BR'),
                  enviadoPor: gestorNome,
                  mensagem
                }
              }
            : sol
        )
      })),
      reset: () => set({ solicitacoes: mockSolicitacoes }),
    }),
    { name: 'cfo:solicitacoes', partialize: (s) => ({ solicitacoes: s.solicitacoes }) }
  )
);
