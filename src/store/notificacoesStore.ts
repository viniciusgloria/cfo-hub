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
  | 'aviso_sistema'
  | 'documento_aprovado'
  | 'documento_rejeitado'
  | 'documento_enviado'
  | 'documento_pendente_gestor';

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
  destinatarioId?: string; // ID do colaborador que deve receber (undefined = todos)
}

interface NotificacoesState {
  notificacoes: Notificacao[];
  adicionarNotificacao: (notificacao: Omit<Notificacao, 'id' | 'criadoEm' | 'lida'>) => void;
  marcarComoLida: (id: string) => void;
  marcarTodasComoLidas: () => void;
  removerNotificacao: (id: string) => void;
  getNotificacoesNaoLidas: () => Notificacao[];
  getNotificacoesPorUsuario: (usuarioId: string) => Notificacao[];
  notificarDocumentoAprovado: (colaboradorId: string, documentoNome: string) => void;
  notificarDocumentoRejeitado: (colaboradorId: string, documentoNome: string, motivo: string) => void;
  notificarDocumentoEnviado: (gestoresIds: string[], colaboradorNome: string, documentoTipo: string) => void;
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

      getNotificacoesPorUsuario: (usuarioId) => {
        return get().notificacoes.filter(
          (n) => !n.destinatarioId || n.destinatarioId === usuarioId
        );
      },

      notificarDocumentoAprovado: (colaboradorId, documentoNome) => {
        const nova: Notificacao = {
          tipo: 'documento_aprovado',
          titulo: 'Documento Aprovado',
          mensagem: `Seu documento "${documentoNome}" foi aprovado!`,
          link: '/documentos',
          icone: 'CheckCircle',
          cor: 'text-green-600',
          destinatarioId: colaboradorId,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          lida: false,
        };

        set((state) => ({
          notificacoes: [nova, ...state.notificacoes],
        }));
      },

      notificarDocumentoRejeitado: (colaboradorId, documentoNome, motivo) => {
        const nova: Notificacao = {
          tipo: 'documento_rejeitado',
          titulo: 'Documento Rejeitado',
          mensagem: `Seu documento "${documentoNome}" foi rejeitado. Motivo: ${motivo}`,
          link: '/documentos',
          icone: 'XCircle',
          cor: 'text-red-600',
          destinatarioId: colaboradorId,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          lida: false,
        };

        set((state) => ({
          notificacoes: [nova, ...state.notificacoes],
        }));
      },

      notificarDocumentoEnviado: (gestoresIds, colaboradorNome, documentoTipo) => {
        const novasNotificacoes: Notificacao[] = gestoresIds.map((gestorId) => ({
          tipo: 'documento_pendente_gestor' as TipoNotificacao,
          titulo: 'Novo Documento Pendente',
          mensagem: `${colaboradorNome} enviou um documento do tipo "${documentoTipo}" para aprovação.`,
          link: '/documentos',
          icone: 'Clock',
          cor: 'text-yellow-600',
          destinatarioId: gestorId,
          id: `${Date.now()}-${gestorId}`,
          criadoEm: new Date().toISOString(),
          lida: false,
        }));

        set((state) => ({
          notificacoes: [...novasNotificacoes, ...state.notificacoes],
        }));
      },

      reset: () => set({ notificacoes: mockNotificacoes }),
    }),
    { name: 'cfo:notificacoes', partialize: (s) => ({ notificacoes: s.notificacoes }) }
  )
);
