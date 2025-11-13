import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Mensagem {
  id: number;
  conversaId: number;
  remetenteId: string;
  texto: string;
  timestamp: string;
  lida: boolean;
}

export interface Conversa {
  id: number;
  participantes: string[]; // IDs dos participantes
  nomeGrupo?: string;
  ultimaMensagem?: string;
  ultimaAtualizacao: string;
  naoLidas: number;
}

interface ChatState {
  conversas: Conversa[];
  mensagens: Mensagem[];
  conversaAtiva: number | null;
  setConversaAtiva: (id: number | null) => void;
  enviarMensagem: (conversaId: number, texto: string, remetenteId: string) => void;
  marcarComoLida: (conversaId: number) => void;
  iniciarConversa: (participantes: string[]) => number;
  getMensagensDaConversa: (conversaId: number) => Mensagem[];
  reset: () => void;
}

const mockMensagens: Mensagem[] = [
  {
    id: 1,
    conversaId: 1,
    remetenteId: '2',
    texto: 'Oi! Tudo bem?',
    timestamp: '2025-11-10T10:30:00',
    lida: true,
  },
  {
    id: 2,
    conversaId: 1,
    remetenteId: '1',
    texto: 'Tudo ótimo! E você?',
    timestamp: '2025-11-10T10:31:00',
    lida: true,
  },
  {
    id: 3,
    conversaId: 1,
    remetenteId: '2',
    texto: 'Podemos conversar sobre o projeto?',
    timestamp: '2025-11-10T10:32:00',
    lida: false,
  },
];

const mockConversas: Conversa[] = [
  {
    id: 1,
    participantes: ['1', '2'],
    ultimaMensagem: 'Podemos conversar sobre o projeto?',
    ultimaAtualizacao: '2025-11-10T10:32:00',
    naoLidas: 1,
  },
  {
    id: 2,
    participantes: ['1', '3'],
    ultimaMensagem: 'Até amanhã!',
    ultimaAtualizacao: '2025-11-09T18:00:00',
    naoLidas: 0,
  },
];

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      conversas: mockConversas,
      mensagens: mockMensagens,
      conversaAtiva: null,

      setConversaAtiva: (id) => set({ conversaAtiva: id }),

      enviarMensagem: (conversaId, texto, remetenteId) => {
        const novaMensagem: Mensagem = {
          id: Date.now(),
          conversaId,
          remetenteId,
          texto,
          timestamp: new Date().toISOString(),
          lida: false,
        };

        set((state) => ({
          mensagens: [...state.mensagens, novaMensagem],
          conversas: state.conversas.map((c) =>
            c.id === conversaId
              ? {
                  ...c,
                  ultimaMensagem: texto,
                  ultimaAtualizacao: novaMensagem.timestamp,
                }
              : c
          ),
        }));
      },

      marcarComoLida: (conversaId) => {
        set((state) => ({
          mensagens: state.mensagens.map((m) =>
            m.conversaId === conversaId ? { ...m, lida: true } : m
          ),
          conversas: state.conversas.map((c) =>
            c.id === conversaId ? { ...c, naoLidas: 0 } : c
          ),
        }));
      },

      iniciarConversa: (participantes) => {
        const novaConversa: Conversa = {
          id: Date.now(),
          participantes,
          ultimaAtualizacao: new Date().toISOString(),
          naoLidas: 0,
        };

        set((state) => ({
          conversas: [...state.conversas, novaConversa],
        }));

        return novaConversa.id;
      },

      getMensagensDaConversa: (conversaId) => {
        return get().mensagens.filter((m) => m.conversaId === conversaId);
      },

      reset: () =>
        set({
          conversas: [],
          mensagens: [],
          conversaAtiva: null,
        }),
    }),
    {
      name: 'cfo:chat',
    }
  )
);
