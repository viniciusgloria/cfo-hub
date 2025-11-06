import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Cliente {
  id: number;
  nome: string;
  mrr: number;
  status: 'ativo' | 'pausado' | 'encerrado';
  responsavel: string;
  inicio: string;
  servicos: string[];
}

interface ClientesState {
  clientes: Cliente[];
  filtroStatus: string;
  busca: string;
  setFiltroStatus: (status: string) => void;
  setBusca: (busca: string) => void;
  syncOMIE: () => void;
  removerCliente: (id: number) => void;
  editarCliente: (cliente: Cliente) => void;
  reset: () => void;
}

const mockClientes: Cliente[] = [
  { id: 1, nome: 'Loja Virtual Fashion', mrr: 12500, status: 'ativo', responsavel: 'Maria Santos', inicio: '14/01/2023', servicos: ['BPO Financeiro', 'Consultoria'] },
  { id: 2, nome: 'MegaStore Online', mrr: 8900, status: 'ativo', responsavel: 'Carlos Lima', inicio: '19/03/2023', servicos: ['BPO Financeiro'] },
  { id: 3, nome: 'TechGadgets Brasil', mrr: 15000, status: 'pausado', responsavel: 'Ana Costa', inicio: '09/11/2022', servicos: ['Consultoria', 'Auditoria'] },
  { id: 4, nome: 'BeautyShop Express', mrr: 5500, status: 'ativo', responsavel: 'João Silva', inicio: '04/01/2024', servicos: ['BPO Financeiro'] },
  { id: 5, nome: 'Casa & Decoração', mrr: 18200, status: 'ativo', responsavel: 'Maria Santos', inicio: '11/07/2023', servicos: ['BPO Financeiro', 'Planejamento'] },
  { id: 6, nome: 'SuperMercado Digital', mrr: 0, status: 'encerrado', responsavel: 'Carlos Lima', inicio: '30/04/2022', servicos: ['Consultoria'] }
];

export const useClientesStore = create<ClientesState>()(
  persist(
    (set) => ({
      clientes: mockClientes,
      filtroStatus: 'Todos',
      busca: '',
      setFiltroStatus: (status) => set({ filtroStatus: status }),
      setBusca: (busca) => set({ busca }),
      syncOMIE: () => {
        console.log('Sincronizando OMIE...');
      },
  removerCliente: (id: number) => set((state) => ({ clientes: state.clientes.filter((c) => c.id !== id) })),
  editarCliente: (cliente: Cliente) => set((state) => ({ clientes: state.clientes.map((c) => c.id === cliente.id ? cliente : c) })),
      reset: () => set({ clientes: mockClientes, filtroStatus: 'Todos', busca: '' }),
    }),
    { name: 'cfo:clientes', partialize: (s) => ({ clientes: s.clientes }) }
  )
);
