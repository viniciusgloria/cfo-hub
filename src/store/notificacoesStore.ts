import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TipoNotificacao =
  | 'solicitacao_aprovada'
  | 'solicitacao_rejeitada'
  | 'nova_solicitacao_gestor'
  | 'ajuste_ponto_aprovado'
  | 'ajuste_ponto_rejeitado'
  | 'nova_mensagem_mural'
  | 'feedback_recebido'
  | 'okr_atualizado'
  | 'reserva_sala_proxima'
  | 'aniversario'
  | 'aviso_sistema';

export interface Notificacao {
  id: string;
  tipo: TipoNotificacao;
  titulo: string;
  mensagem: string;
  lida: boolean;
  criadoEm: string;
  link?: string; // URL para redirecionar ao clicar
  icone?: string; // Nome do ícone lucide
  cor?: string; // Cor do ícone
}

interface NotificacoesState {
  notificacoes: Notificacao[];
  adicionarNotificacao: (notificacao: Omit<Notificacao, 'id' | 'criadoEm' | 'lida'>) => void;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  removerNotificacao: (id: string) => void;
  getNotificacoesNaoLidas: () => Notificacao[];
  reset: () => void;
}

const mockNotificacoes: Notificacao[] = [
  {
    id: '1',
    tipo: 'solicitacao_aprovada',
    titulo: 'Solicitação Aprovada',
    mensagem: 'Sua solicitação de férias foi aprovada!',
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min atrás
    link: '/solicitacoes',
    icone: 'CheckCircle',
    cor: 'text-green-600',
  },
  {
    id: '2',
    tipo: 'nova_mensagem_mural',
    titulo: 'Nova publicação no Mural',
    mensagem: 'João Silva publicou uma nova mensagem no mural.',
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h atrás
    link: '/mural',
    icone: 'MessageSquare',
    cor: 'text-blue-600',
  },
  {
    id: '3',
    tipo: 'ajuste_ponto_aprovado',
    titulo: 'Ajuste de Ponto Aprovado',
    mensagem: 'Seu ajuste de horário do dia 10/11 foi aprovado.',
    lida: false,
    criadoEm: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5h atrás
    link: '/ponto',
    icone: 'Clock',
    cor: 'text-green-600',
  },
];

export const useNotificacoesStore = create<NotificacoesState>()(
  persist(
    (set, get) => ({
      notificacoes: mockNotificacoes,

      adicionarNotificacao: (notificacao) => {
        const nova: Notificacao = {
          ...notificacao,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          lida: false,
        };

        set((state) => ({
          notificacoes: [nova, ...state.notificacoes],
        }));
      },

      marcarComoLida: (id) => {
        set((state) => ({
          notificacoes: state.notificacoes.map((n) =>
            n.id === id ? { ...n, lida: true } : n
          ),
        }));
      },

      marcarTodasComoLidas: () => {
        set((state) => ({
          notificacoes: state.notificacoes.map((n) => ({ ...n, lida: true })),
        }));
      },

      removerNotificacao: (id) => {
        set((state) => ({
          notificacoes: state.notificacoes.filter((n) => n.id !== id),
        }));
      },

      getNotificacoesNaoLidas: () => {
        return get().notificacoes.filter((n) => !n.lida);
      },

      reset: () => set({ notificacoes: mockNotificacoes }),
    }),
    { name: 'cfo:notificacoes', partialize: (s) => ({ notificacoes: s.notificacoes }) }
  )
);
