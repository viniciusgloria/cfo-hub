import { LucideIcon } from 'lucide-react';

export type UserRole = 'admin' | 'gestor' | 'colaborador' | 'cliente' | 'visitante';

export interface HistoricoAlteracao {
  id: string;
  tipo: 'cargo' | 'setor';
  itemId: string;
  itemNome: string;
  acao: 'criacao' | 'edicao' | 'remocao';
  alteradoPor: string; // nome do usuário
  alteradoPorId: string; // id do usuário
  alteradoEm: string;
  detalhes?: string; // descrição da alteração
}

export interface Cargo {
  id: string;
  nome: string;
  descricao?: string;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
  atualizadoPor?: string;
}

export interface Setor {
  id: string;
  nome: string;
  descricao?: string;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
  atualizadoPor?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  cargoId?: string; // ID do cargo
  setorId?: string; // ID do setor
  clienteId?: number; // ID do cliente vinculado (para role cliente)
}

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  /** Data URL (base64) used for persistent previews */
  dataUrl: string;
  /** Simulated remote URL returned by the mock upload */
  remoteUrl: string;
}

// Tipos para Folha de Pagamento
export interface ColaboradorCompleto {
  // Dados pessoais
  id: number;
  nomeCompleto: string;
  rg?: string;
  cpf: string;
  telefone?: string;
  dataNascimento?: string;
  email?: string;
  
  // Endereço
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  
  // Dados profissionais
  setor: string;
  funcao: string;
  empresa: string;
  regime: 'CLT' | 'PJ';
  contrato: 'CLT' | 'PJ';
  situacao: 'ativo' | 'afastado' | 'desligado' | 'ferias';
  
  // Dados bancários
  chavePix?: string;
  banco?: string;
  codigoBanco?: string;
  agencia?: string;
  conta?: string;
  operacao?: string;
  
  // Dados PJ (se aplicável)
  cnpj?: string;
  razaoSocial?: string;
  tipo?: string;
  enderecoEmpresa?: string;
  numeroEmpresa?: string;
  complementoEmpresa?: string;
  cepEmpresa?: string;
  bairroEmpresa?: string;
  cidadeEmpresa?: string;
  
  // Outros
  avatar?: string;
  obs?: string;
}

export interface PercentualOperacao {
  empresa1: number;
  empresa1Nome?: string;
  empresa2: number;
  empresa2Nome?: string;
  empresa3: number;
  empresa3Nome?: string;
  empresa4: number;
  empresa4Nome?: string;
  totalOpers: number;
}

export interface NotaFiscal {
  id: string;
  numero?: string;
  status: 'aguardando' | 'recebida' | 'pendente';
  pagamento: 'pendente' | 'agendado' | 'pago';
  data?: string;
  obs?: string;
  anexo?: Attachment;
}

export interface FolhaPagamento {
  id: string;
  colaboradorId: number;
  colaborador: ColaboradorCompleto;
  periodo: string; // formato: "2025-11"
  
  // Valores (preenchido pela empresa - amarelo)
  valor: number;
  adicional: number;
  reembolso: number;
  desconto: number;
  valorTotal: number; // calculado automaticamente
  
  // Status e pagamento
  situacao: 'pendente' | 'agendado' | 'pago' | 'cancelado';
  dataPagamento?: string;
  
  // Nota fiscal (apenas para PJ)
  notaFiscal?: NotaFiscal;
  
  // Percentual por operação (divisão entre empresas)
  valorTotalSemReembolso: number; // calculado
  percentualOperacao?: PercentualOperacao;
  empresa1Valor?: number;
  empresa2Valor?: number;
  empresa3Valor?: number;
  empresa4Valor?: number;
  
  // Metadados
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
  atualizadoPor?: string;
}

// Tipos para Folha de Clientes (BPO Financeiro)
export interface ClienteCompleto {
  id: number;
  nome: string;
  cnpj?: string;
  responsavel: string;
  email?: string;
  telefone?: string;
  status: 'ativo' | 'pausado' | 'encerrado';
  mrr: number;
  inicio: string;
  servicos: string[];
  setor?: string;
}

// Funcionário cadastrado pelo cliente para uso na folha de pagamento
export interface FuncionarioCliente {
  id: string;
  clienteId: number; // Cliente ao qual pertence
  
  // Dados pessoais
  nomeCompleto: string;
  cpf: string;
  rg?: string;
  dataNascimento?: string;
  telefone?: string;
  email?: string;
  
  // Endereço
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  cep?: string;
  
  // Dados profissionais
  funcao: string;
  setor?: string;
  dataAdmissao?: string;
  tipoContrato: 'CLT' | 'PJ';
  
  // Dados bancários
  chavePix?: string;
  banco?: string;
  agencia?: string;
  conta?: string;
  tipoConta?: 'corrente' | 'poupanca';
  
  // Dados PJ (se aplicável)
  cnpj?: string;
  razaoSocial?: string;
  
  // Status
  status: 'ativo' | 'inativo';
  
  // Metadados
  criadoEm: string;
  atualizadoEm: string;
}

export interface FolhaCliente {
  id: string;
  clienteId: number;
  cliente: ClienteCompleto;
  funcionarioId?: string; // ID do funcionário cadastrado pelo cliente
  periodo: string; // formato: "2025-11"
  
  // Campos preenchidos pelo CLIENTE (amarelo)
  colaborador: string; // nome do colaborador
  funcao?: string;
  empresa: string; // empresa responsável pelo pagamento
  ctt?: string; // centro de custo
  valor: number;
  adicional: number;
  reembolso: number;
  desconto: number;
  
  // Percentual por operação (preenchido pelo cliente)
  percentualOperacao?: {
    empresa1?: string;
    empresa1Percent?: number;
    empresa1Valor?: number;
    empresa2?: string;
    empresa2Percent?: number;
    empresa2Valor?: number;
    empresa3?: string;
    empresa3Percent?: number;
    empresa3Valor?: number;
    empresa4?: string;
    empresa4Percent?: number;
    empresa4Valor?: number;
    totalOpers?: number;
  };
  
  // Campos preenchidos pela CFO (verde)
  valorTotal: number; // calculado
  valorTotalSemReembolso: number; // calculado
  situacao: 'pendente' | 'agendado' | 'pago' | 'cancelado';
  dataPagamento?: string;
  
  // Nota fiscal
  notaFiscal?: {
    numero?: string;
    status: 'aguardando' | 'recebida' | 'pendente';
    pagamento: 'pendente' | 'agendado' | 'pago';
    data?: string;
    obs?: string;
  };
  
  // Informações adicionais CFO
  responsavelSetor?: string; // quem da CFO está cuidando
  statusOmie?: 'pendente' | 'enviado' | 'sincronizado' | 'erro';
  dataEnvioOmie?: string;
  codigoOmie?: string;
  obs?: string;
  
  // Metadados
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
  atualizadoPor?: string;
}
