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
  setor?: string;
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
  { id: 1, nome: 'Loja Virtual Fashion', mrr: 12500, status: 'ativo', responsavel: 'Maria Santos', inicio: '14/01/2023', servicos: ['BPO Financeiro', 'Consultoria'], setor: 'E-commerce' },
  { id: 2, nome: 'MegaStore Online', mrr: 8900, status: 'ativo', responsavel: 'Carlos Lima', inicio: '19/03/2023', servicos: ['BPO Financeiro'], setor: 'Varejo' },
  { id: 3, nome: 'TechGadgets Brasil', mrr: 15000, status: 'pausado', responsavel: 'Ana Costa', inicio: '09/11/2022', servicos: ['Consultoria', 'Auditoria'], setor: 'Tecnologia' },
  { id: 4, nome: 'BeautyShop Express', mrr: 5500, status: 'ativo', responsavel: 'João Silva', inicio: '04/01/2024', servicos: ['BPO Financeiro'], setor: 'Beleza & Estética' },
  { id: 5, nome: 'Casa & Decoração', mrr: 18200, status: 'ativo', responsavel: 'Maria Santos', inicio: '11/07/2023', servicos: ['BPO Financeiro', 'Planejamento'], setor: 'Decoração' },
  { id: 6, nome: 'SuperMercado Digital', mrr: 0, status: 'encerrado', responsavel: 'Carlos Lima', inicio: '30/04/2022', servicos: ['Consultoria'], setor: 'Alimentos' },
  { id: 7, nome: 'Fit & Health Store', mrr: 9800, status: 'ativo', responsavel: 'Ana Costa', inicio: '22/05/2023', servicos: ['BPO Financeiro'], setor: 'Saúde & Fitness' },
  { id: 8, nome: 'Pet Shop Premium', mrr: 6700, status: 'ativo', responsavel: 'João Silva', inicio: '15/08/2023', servicos: ['BPO Financeiro', 'Consultoria'], setor: 'Pet Shop' },
  { id: 9, nome: 'Livraria Cultural Online', mrr: 7200, status: 'ativo', responsavel: 'Maria Santos', inicio: '03/02/2024', servicos: ['BPO Financeiro'], setor: 'Livros & Cultura' },
  { id: 10, nome: 'Eletro Center', mrr: 14500, status: 'ativo', responsavel: 'Carlos Lima', inicio: '10/09/2023', servicos: ['BPO Financeiro', 'Planejamento'], setor: 'Eletrônicos' },
  { id: 11, nome: 'Moda Infantil Kids', mrr: 8300, status: 'ativo', responsavel: 'Ana Costa', inicio: '28/11/2023', servicos: ['BPO Financeiro'], setor: 'Moda Infantil' },
  { id: 12, nome: 'Joias & Acessórios', mrr: 11200, status: 'ativo', responsavel: 'João Silva', inicio: '05/06/2023', servicos: ['BPO Financeiro', 'Consultoria'], setor: 'Joalheria' },
  { id: 13, nome: 'Sports & Outdoor', mrr: 10500, status: 'ativo', responsavel: 'Maria Santos', inicio: '17/04/2024', servicos: ['BPO Financeiro'], setor: 'Esportes' },
  { id: 14, nome: 'Gourmet Foods', mrr: 9100, status: 'ativo', responsavel: 'Carlos Lima', inicio: '12/01/2024', servicos: ['BPO Financeiro'], setor: 'Alimentos Gourmet' },
  { id: 15, nome: 'Auto Peças Express', mrr: 13400, status: 'ativo', responsavel: 'Ana Costa', inicio: '25/07/2023', servicos: ['BPO Financeiro', 'Planejamento'], setor: 'Automotivo' }
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
