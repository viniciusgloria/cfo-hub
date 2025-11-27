import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gestor' | 'colaborador' | 'rh';
  avatar: string;
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
