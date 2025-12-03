import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FuncionarioCliente } from '../types';

interface FuncionariosClienteState {
  funcionarios: FuncionarioCliente[];
  busca: string;
  filtroStatus: string;
  
  // Setters
  setBusca: (busca: string) => void;
  setFiltroStatus: (status: string) => void;
  
  // CRUD
  adicionarFuncionario: (funcionario: Omit<FuncionarioCliente, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  atualizarFuncionario: (id: string, dados: Partial<FuncionarioCliente>) => void;
  removerFuncionario: (id: string) => void;
  
  // Queries
  getFuncionariosPorCliente: (clienteId: number) => FuncionarioCliente[];
  getFuncionariosFiltrados: (clienteId: number) => FuncionarioCliente[];
  getFuncionarioPorId: (id: string) => FuncionarioCliente | undefined;
  
  reset: () => void;
}

// Dados mockados
const mockFuncionarios: FuncionarioCliente[] = [
  {
    id: '1',
    clienteId: 1, // TechCommerce LTDA
    nomeCompleto: 'Ana Maria Silva',
    cpf: '123.456.789-00',
    rg: '12.345.678-9',
    dataNascimento: '1990-05-15',
    telefone: '+55 11 98888-1111',
    email: 'ana.silva@techcommerce.com',
    endereco: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    cep: '01234-567',
    funcao: 'Analista Financeiro',
    setor: 'Financeiro',
    dataAdmissao: '2023-03-15',
    tipoContrato: 'CLT',
    chavePix: 'ana.silva@techcommerce.com',
    banco: 'Banco do Brasil',
    agencia: '1234-5',
    conta: '12345-6',
    tipoConta: 'corrente',
    status: 'ativo',
    criadoEm: new Date(2023, 2, 15).toISOString(),
    atualizadoEm: new Date(2023, 2, 15).toISOString()
  },
  {
    id: '2',
    clienteId: 1, // TechCommerce LTDA
    nomeCompleto: 'Bruno Costa Santos',
    cpf: '987.654.321-00',
    rg: '98.765.432-1',
    dataNascimento: '1988-08-20',
    telefone: '+55 11 97777-2222',
    email: 'bruno.santos@techcommerce.com',
    endereco: 'Av. Paulista',
    numero: '1000',
    bairro: 'Bela Vista',
    cidade: 'São Paulo',
    cep: '01310-100',
    funcao: 'Gerente Comercial',
    setor: 'Comercial',
    dataAdmissao: '2022-06-01',
    tipoContrato: 'CLT',
    chavePix: '987.654.321-00',
    banco: 'Itaú',
    agencia: '4321',
    conta: '54321-0',
    tipoConta: 'corrente',
    status: 'ativo',
    criadoEm: new Date(2022, 5, 1).toISOString(),
    atualizadoEm: new Date(2022, 5, 1).toISOString()
  },
  {
    id: '3',
    clienteId: 2, // MegaStore Online
    nomeCompleto: 'Carla Oliveira',
    cpf: '111.222.333-44',
    telefone: '+55 11 96666-3333',
    email: 'carla.oliveira@megastore.com',
    funcao: 'Coordenadora Marketing',
    setor: 'Marketing',
    dataAdmissao: '2023-01-10',
    tipoContrato: 'CLT',
    chavePix: 'carla.oliveira@megastore.com',
    banco: 'Bradesco',
    agencia: '5678',
    conta: '98765-4',
    tipoConta: 'corrente',
    status: 'ativo',
    criadoEm: new Date(2023, 0, 10).toISOString(),
    atualizadoEm: new Date(2023, 0, 10).toISOString()
  },
  {
    id: '4',
    clienteId: 3, // Fashion E-commerce
    nomeCompleto: 'Diego Almeida',
    cpf: '555.666.777-88',
    telefone: '+55 11 95555-4444',
    email: 'diego@fashion.com',
    funcao: 'Desenvolvedor',
    setor: 'TI',
    dataAdmissao: '2024-02-15',
    tipoContrato: 'PJ',
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Diego Almeida Consultoria ME',
    chavePix: '555.666.777-88',
    banco: 'Nubank',
    agencia: '0001',
    conta: '11111-1',
    tipoConta: 'corrente',
    status: 'ativo',
    criadoEm: new Date(2024, 1, 15).toISOString(),
    atualizadoEm: new Date(2024, 1, 15).toISOString()
  }
];

export const useFuncionariosClienteStore = create<FuncionariosClienteState>()(
  persist(
    (set, get) => ({
      funcionarios: mockFuncionarios,
      busca: '',
      filtroStatus: 'todos',
      
      setBusca: (busca) => set({ busca }),
      setFiltroStatus: (status) => set({ filtroStatus: status }),
      
      adicionarFuncionario: (funcionario) => {
        const novoFuncionario: FuncionarioCliente = {
          ...funcionario,
          id: Date.now().toString(),
          criadoEm: new Date().toISOString(),
          atualizadoEm: new Date().toISOString()
        };
        set((state) => ({
          funcionarios: [...state.funcionarios, novoFuncionario]
        }));
      },
      
      atualizarFuncionario: (id, dados) => {
        set((state) => ({
          funcionarios: state.funcionarios.map((f) =>
            f.id === id
              ? { ...f, ...dados, atualizadoEm: new Date().toISOString() }
              : f
          )
        }));
      },
      
      removerFuncionario: (id) => {
        set((state) => ({
          funcionarios: state.funcionarios.filter((f) => f.id !== id)
        }));
      },
      
      getFuncionariosPorCliente: (clienteId) => {
        return get().funcionarios.filter((f) => f.clienteId === clienteId);
      },
      
      getFuncionariosFiltrados: (clienteId) => {
        const { funcionarios, busca, filtroStatus } = get();
        
        return funcionarios.filter((f) => {
          const matchCliente = f.clienteId === clienteId;
          const matchStatus =
            filtroStatus === 'todos' ||
            f.status === filtroStatus;
          const matchBusca =
            !busca ||
            f.nomeCompleto.toLowerCase().includes(busca.toLowerCase()) ||
            f.funcao.toLowerCase().includes(busca.toLowerCase()) ||
            f.cpf.includes(busca);
          
          return matchCliente && matchStatus && matchBusca;
        });
      },
      
      getFuncionarioPorId: (id) => {
        return get().funcionarios.find((f) => f.id === id);
      },
      
      reset: () => {
        set({
          funcionarios: mockFuncionarios,
          busca: '',
          filtroStatus: 'todos'
        });
      }
    }),
    {
      name: 'funcionarios-cliente-storage',
      version: 1
    }
  )
);
