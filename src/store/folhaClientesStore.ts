import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FolhaCliente, ClienteCompleto } from '../types';

interface FolhaClientesState {
  folhas: FolhaCliente[];
  periodoSelecionado: string;
  filtroSituacao: string;
  filtroCliente: string;
  filtroStatusOmie: string;
  busca: string;
  
  // Setters
  setPeriodoSelecionado: (periodo: string) => void;
  setFiltroSituacao: (situacao: string) => void;
  setFiltroCliente: (cliente: string) => void;
  setFiltroStatusOmie: (status: string) => void;
  setBusca: (busca: string) => void;
  
  // CRUD
  adicionarFolha: (folha: Omit<FolhaCliente, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  atualizarFolha: (id: string, dados: Partial<FolhaCliente>) => void;
  removerFolha: (id: string) => void;
  
  // Operações específicas
  calcularValorTotal: (id: string) => void;
  calcularPercentuais: (id: string) => void;
  enviarParaOmie: (id: string) => Promise<boolean>;
  sincronizarComOmie: () => Promise<void>;
  
  // Filtros computados
  getFolhasFiltradas: () => FolhaCliente[];
  getFolhasPorCliente: (clienteId: number) => FolhaCliente[];
  
  // Exportação e importação
  exportarParaCSV: () => string;
  exportarParaExcel: () => void;
  importarDePlanilha: (dados: any[]) => void;
  gerarPlanilhaModelo: () => string;
  
  reset: () => void;
}

// Dados mockados de clientes
const mockClientes: ClienteCompleto[] = [
  {
    id: 1,
    nome: 'TechCommerce LTDA',
    cnpj: '12.345.678/0001-90',
    responsavel: 'João Silva',
    email: 'joao@techcommerce.com',
    telefone: '+55 11 98888-7777',
    status: 'ativo',
    mrr: 15000,
    inicio: '15/03/2024',
    servicos: ['BPO Financeiro', 'Planejamento']
  },
  {
    id: 2,
    nome: 'MegaStore Online',
    cnpj: '98.765.432/0001-10',
    responsavel: 'Maria Santos',
    email: 'maria@megastore.com',
    telefone: '+55 11 97777-6666',
    status: 'ativo',
    mrr: 8500,
    inicio: '20/06/2024',
    servicos: ['BPO Financeiro']
  },
  {
    id: 3,
    nome: 'Fashion E-commerce',
    cnpj: '11.222.333/0001-44',
    responsavel: 'Carlos Lima',
    email: 'carlos@fashion.com',
    telefone: '+55 11 96666-5555',
    status: 'ativo',
    mrr: 12000,
    inicio: '10/01/2024',
    servicos: ['BPO Financeiro', 'Consultoria']
  }
];

// Dados mockados de folhas de clientes
const hoje = new Date();
const periodoAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;

const mockFolhas: FolhaCliente[] = [
  {
    id: '1',
    clienteId: 1,
    cliente: mockClientes[0],
    periodo: periodoAtual,
    colaborador: 'Ana Maria Silva',
    funcao: 'Analista Financeiro',
    empresa: 'TechCommerce LTDA',
    ctt: 'ADM-001',
    valor: 5500,
    adicional: 800,
    reembolso: 350,
    desconto: 200,
    valorTotal: 6450,
    valorTotalSemReembolso: 6100,
    situacao: 'pendente',
    notaFiscal: {
      status: 'aguardando',
      pagamento: 'pendente'
    },
    percentualOperacao: {
      empresa1: 'Matriz SP',
      empresa1Percent: 50,
      empresa1Valor: 3050,
      empresa2: 'Filial RJ',
      empresa2Percent: 50,
      empresa2Valor: 3050,
      totalOpers: 100
    },
    responsavelSetor: 'Patricia CFO',
    statusOmie: 'pendente',
    criadoEm: new Date(2025, 10, 15).toISOString(),
    atualizadoEm: new Date(2025, 10, 15).toISOString()
  },
  {
    id: '2',
    clienteId: 1,
    cliente: mockClientes[0],
    periodo: periodoAtual,
    colaborador: 'Bruno Costa Santos',
    funcao: 'Gerente Comercial',
    empresa: 'TechCommerce LTDA',
    ctt: 'COM-002',
    valor: 8000,
    adicional: 1200,
    reembolso: 450,
    desconto: 0,
    valorTotal: 9650,
    valorTotalSemReembolso: 9200,
    situacao: 'agendado',
    dataPagamento: '2025-12-05',
    notaFiscal: {
      numero: 'NF-2024-001',
      status: 'recebida',
      pagamento: 'agendado',
      data: '2025-11-28'
    },
    percentualOperacao: {
      empresa1: 'Matriz SP',
      empresa1Percent: 100,
      empresa1Valor: 9200,
      totalOpers: 100
    },
    responsavelSetor: 'Patricia CFO',
    statusOmie: 'sincronizado',
    codigoOmie: 'OMIE-12345',
    dataEnvioOmie: '2025-11-29',
    criadoEm: new Date(2025, 10, 15).toISOString(),
    atualizadoEm: new Date(2025, 10, 28).toISOString()
  },
  {
    id: '3',
    clienteId: 2,
    cliente: mockClientes[1],
    periodo: periodoAtual,
    colaborador: 'Carla Oliveira',
    funcao: 'Coordenadora Marketing',
    empresa: 'MegaStore Online',
    ctt: 'MKT-001',
    valor: 6500,
    adicional: 500,
    reembolso: 200,
    desconto: 150,
    valorTotal: 7050,
    valorTotalSemReembolso: 6850,
    situacao: 'pago',
    dataPagamento: '2025-11-30',
    notaFiscal: {
      numero: 'NF-2024-002',
      status: 'recebida',
      pagamento: 'pago',
      data: '2025-11-25',
      obs: 'Pagamento realizado via PIX'
    },
    percentualOperacao: {
      empresa1: 'E-commerce',
      empresa1Percent: 60,
      empresa1Valor: 4110,
      empresa2: 'Marketplace',
      empresa2Percent: 40,
      empresa2Valor: 2740,
      totalOpers: 100
    },
    responsavelSetor: 'Roberto CFO',
    statusOmie: 'sincronizado',
    codigoOmie: 'OMIE-12346',
    dataEnvioOmie: '2025-11-26',
    criadoEm: new Date(2025, 10, 10).toISOString(),
    atualizadoEm: new Date(2025, 10, 30).toISOString()
  },
  {
    id: '4',
    clienteId: 3,
    cliente: mockClientes[2],
    periodo: periodoAtual,
    colaborador: 'Diego Almeida',
    funcao: 'Desenvolvedor',
    empresa: 'Fashion E-commerce',
    ctt: 'TI-003',
    valor: 7200,
    adicional: 0,
    reembolso: 0,
    desconto: 300,
    valorTotal: 6900,
    valorTotalSemReembolso: 6900,
    situacao: 'pendente',
    notaFiscal: {
      status: 'aguardando',
      pagamento: 'pendente'
    },
    percentualOperacao: {
      empresa1: 'Fashion SP',
      empresa1Percent: 100,
      empresa1Valor: 6900,
      totalOpers: 100
    },
    responsavelSetor: 'Patricia CFO',
    statusOmie: 'pendente',
    criadoEm: new Date(2025, 10, 20).toISOString(),
    atualizadoEm: new Date(2025, 10, 20).toISOString()
  }
];

export const useFolhaClientesStore = create<FolhaClientesState>()(
  persist(
    (set, get) => ({
      folhas: mockFolhas,
      periodoSelecionado: periodoAtual,
      filtroSituacao: 'Todas',
      filtroCliente: 'Todos',
      filtroStatusOmie: 'Todos',
      busca: '',
      
      setPeriodoSelecionado: (periodo) => set({ periodoSelecionado: periodo }),
      setFiltroSituacao: (situacao) => set({ filtroSituacao: situacao }),
      setFiltroCliente: (cliente) => set({ filtroCliente: cliente }),
      setFiltroStatusOmie: (status) => set({ filtroStatusOmie: status }),
      setBusca: (busca) => set({ busca: busca }),
      
      adicionarFolha: (folha) => {
        const novaFolha: FolhaCliente = {
          ...folha,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        };
        set((state) => ({ folhas: [...state.folhas, novaFolha] }));
      },
      
      atualizarFolha: (id, dados) => {
        set((state) => ({
          folhas: state.folhas.map((f) =>
            f.id === id
              ? { ...f, ...dados, atualizadoEm: new Date().toISOString() }
              : f
          )
        }));
      },
      
      removerFolha: (id) => {
        set((state) => ({
          folhas: state.folhas.filter((f) => f.id !== id)
        }));
      },
      
      calcularValorTotal: (id) => {
        const folha = get().folhas.find((f) => f.id === id);
        if (!folha) return;
        
        const valorTotal = folha.valor + folha.adicional + folha.reembolso - folha.desconto;
        const valorTotalSemReembolso = folha.valor + folha.adicional - folha.desconto;
        
        get().atualizarFolha(id, { valorTotal, valorTotalSemReembolso });
      },
      
      calcularPercentuais: (id) => {
        const folha = get().folhas.find((f) => f.id === id);
        if (!folha || !folha.percentualOperacao) return;
        
        const base = folha.valorTotalSemReembolso;
        const po = folha.percentualOperacao;
        
        const updated: any = {};
        if (po.empresa1Percent) {
          updated['percentualOperacao.empresa1Valor'] = (base * po.empresa1Percent) / 100;
        }
        if (po.empresa2Percent) {
          updated['percentualOperacao.empresa2Valor'] = (base * po.empresa2Percent) / 100;
        }
        if (po.empresa3Percent) {
          updated['percentualOperacao.empresa3Valor'] = (base * po.empresa3Percent) / 100;
        }
        if (po.empresa4Percent) {
          updated['percentualOperacao.empresa4Valor'] = (base * po.empresa4Percent) / 100;
        }
        
        get().atualizarFolha(id, { percentualOperacao: { ...po, ...updated } });
      },
      
      enviarParaOmie: async (id) => {
        // Simula envio para API OMIE
        await new Promise((resolve) => setTimeout(resolve, 1500));
        
        const codigoOmie = `OMIE-${Date.now()}`;
        get().atualizarFolha(id, {
          statusOmie: 'sincronizado',
          codigoOmie,
          dataEnvioOmie: new Date().toISOString()
        });
        
        return true;
      },
      
      sincronizarComOmie: async () => {
        // Simula sincronização em lote
        await new Promise((resolve) => setTimeout(resolve, 2000));
        
        const folhasPendentes = get().folhas.filter(
          (f) => f.statusOmie === 'pendente' && f.situacao !== 'cancelado'
        );
        
        for (const folha of folhasPendentes) {
          await get().enviarParaOmie(folha.id);
        }
      },
      
      getFolhasFiltradas: () => {
        const {
          folhas,
          periodoSelecionado,
          filtroSituacao,
          filtroCliente,
          filtroStatusOmie,
          busca
        } = get();
        
        return folhas.filter((f) => {
          const matchPeriodo = f.periodo === periodoSelecionado;
          const matchSituacao =
            filtroSituacao === 'Todas' ||
            f.situacao === filtroSituacao.toLowerCase();
          const matchCliente =
            filtroCliente === 'Todos' ||
            String(f.clienteId) === filtroCliente;
          const matchStatusOmie =
            filtroStatusOmie === 'Todos' ||
            f.statusOmie === filtroStatusOmie.toLowerCase();
          const matchBusca =
            !busca ||
            f.colaborador.toLowerCase().includes(busca.toLowerCase()) ||
            f.cliente.nome.toLowerCase().includes(busca.toLowerCase()) ||
            f.funcao?.toLowerCase().includes(busca.toLowerCase());
          
          return (
            matchPeriodo &&
            matchSituacao &&
            matchCliente &&
            matchStatusOmie &&
            matchBusca
          );
        });
      },
      
      getFolhasPorCliente: (clienteId) => {
        return get().folhas.filter((f) => f.clienteId === clienteId);
      },
      
      exportarParaCSV: () => {
        const folhas = get().getFolhasFiltradas();
        
        const headers = [
          'ID',
          'Cliente',
          'Colaborador',
          'Função',
          'Empresa',
          'CTT',
          'Valor',
          'Adicional',
          'Reembolso',
          'Desconto',
          'Valor Total',
          'Situação',
          'Data Pgto',
          'NF Número',
          'NF Status',
          'Status OMIE',
          'Código OMIE'
        ];
        
        const rows = folhas.map((f) => [
          f.id,
          f.cliente.nome,
          f.colaborador,
          f.funcao || '',
          f.empresa,
          f.ctt || '',
          f.valor.toFixed(2),
          f.adicional.toFixed(2),
          f.reembolso.toFixed(2),
          f.desconto.toFixed(2),
          f.valorTotal.toFixed(2),
          f.situacao,
          f.dataPagamento || '',
          f.notaFiscal?.numero || '',
          f.notaFiscal?.status || '',
          f.statusOmie || '',
          f.codigoOmie || ''
        ]);
        
        const csv = [headers, ...rows]
          .map((row) => row.map((cell) => `"${cell}"`).join(','))
          .join('\n');
        
        return csv;
      },
      
      exportarParaExcel: () => {
        const csv = get().exportarParaCSV();
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `folha-clientes-${get().periodoSelecionado}.csv`;
        link.click();
      },
      
      importarDePlanilha: (dados) => {
        // Lógica de importação de planilha
        // Será implementada nos modais
        console.log('Importando dados:', dados);
      },
      
      gerarPlanilhaModelo: () => {
        const headers = [
          'COLABORADOR',
          'FUNÇÃO',
          'EMPRESA',
          'CTT',
          'VALOR',
          'ADICIONAL',
          'REEMBOLSO',
          'DESCONTO',
          'EMPRESA 1',
          'EMPRESA 1 %',
          'EMPRESA 2',
          'EMPRESA 2 %',
          'EMPRESA 3',
          'EMPRESA 3 %',
          'EMPRESA 4',
          'EMPRESA 4 %'
        ];
        
        const exemplo = [
          'João da Silva',
          'Analista',
          'Empresa Cliente LTDA',
          'ADM-001',
          '5000.00',
          '500.00',
          '200.00',
          '100.00',
          'Matriz SP',
          '50',
          'Filial RJ',
          '50',
          '',
          '',
          '',
          ''
        ];
        
        const csv = [headers, exemplo]
          .map((row) => row.map((cell) => `"${cell}"`).join(','))
          .join('\n');
        
        return csv;
      },
      
      reset: () => {
        set({
          folhas: mockFolhas,
          periodoSelecionado: periodoAtual,
          filtroSituacao: 'Todas',
          filtroCliente: 'Todos',
          filtroStatusOmie: 'Todos',
          busca: ''
        });
      }
    }),
    {
      name: 'folha-clientes-storage',
      version: 1
    }
  )
);
