import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { FolhaPagamento, ColaboradorCompleto, NotaFiscal } from '../types';

interface FolhaPagamentoState {
  folhas: FolhaPagamento[];
  periodoSelecionado: string;
  filtroSituacao: string;
  filtroContrato: string;
  busca: string;
  
  // Setters
  setPeriodoSelecionado: (periodo: string) => void;
  setFiltroSituacao: (situacao: string) => void;
  setFiltroContrato: (contrato: string) => void;
  setBusca: (busca: string) => void;
  
  // CRUD
  adicionarFolha: (folha: Omit<FolhaPagamento, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  atualizarFolha: (id: string, dados: Partial<FolhaPagamento>) => void;
  removerFolha: (id: string) => void;
  
  // Operações específicas
  calcularValorTotal: (id: string) => void;
  calcularPercentuais: (id: string) => void;
  atualizarNotaFiscal: (id: string, notaFiscal: NotaFiscal) => void;
  gerarFolhasPorPeriodo: (periodo: string, colaboradores: ColaboradorCompleto[]) => void;
  
  // Filtros computados
  getFolhasFiltradas: () => FolhaPagamento[];
  getFolhasPorColaborador: (colaboradorId: number) => FolhaPagamento[];
  
  // Exportação e importação
  exportarParaCSV: () => string;
  exportarParaExcel: () => void;
  importarDePlanilha: (dados: any[]) => void;
  gerarPlanilhaModelo: () => string;
  
  reset: () => void;
}

// Mock inicial
const mockColaboradores: ColaboradorCompleto[] = [
  {
    id: 1,
    nomeCompleto: 'Ana Costa Silva',
    cpf: '123.456.789-00',
    telefone: '+55 11 98877-6655',
    email: 'ana@cfo.com',
    setor: 'Financeiro',
    funcao: 'Contadora',
    empresa: 'CFO Consultoria',
    regime: 'CLT',
    contrato: 'CLT',
    situacao: 'ativo',
    chavePix: 'ana@cfo.com',
    banco: 'Banco do Brasil',
    codigoBanco: '001',
    agencia: '1234-5',
    conta: '12345-6',
  },
  {
    id: 2,
    nomeCompleto: 'Bruno Almeida Santos',
    cpf: '987.654.321-00',
    telefone: '+55 11 91234-5678',
    email: 'bruno@cfo.com',
    setor: 'BI',
    funcao: 'Analista de Dados',
    empresa: 'CFO Consultoria',
    regime: 'PJ',
    contrato: 'PJ',
    situacao: 'ativo',
    chavePix: '987.654.321-00',
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Bruno Almeida Consultoria ME',
  },
];

const gerarFolhasMock = (): FolhaPagamento[] => {
  const periodo = new Date().toISOString().slice(0, 7); // "2025-11"
  return mockColaboradores.map((colab, idx) => ({
    id: `fp-${idx + 1}`,
    colaboradorId: colab.id,
    colaborador: colab,
    periodo,
    valor: colab.contrato === 'CLT' ? 5000 : 8000,
    adicional: colab.contrato === 'CLT' ? 500 : 0,
    reembolso: 200,
    desconto: colab.contrato === 'CLT' ? 800 : 0,
    valorTotal: colab.contrato === 'CLT' ? 4900 : 8200,
    situacao: 'pendente',
    valorTotalSemReembolso: colab.contrato === 'CLT' ? 4700 : 8000,
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
  }));
};

export const useFolhaPagamentoStore = create<FolhaPagamentoState>()(
  persist(
    (set, get) => ({
      folhas: gerarFolhasMock(),
      periodoSelecionado: new Date().toISOString().slice(0, 7),
      filtroSituacao: 'Todos',
      filtroContrato: 'Todos',
      busca: '',
      
      setPeriodoSelecionado: (periodo) => set({ periodoSelecionado: periodo }),
      setFiltroSituacao: (situacao) => set({ filtroSituacao: situacao }),
      setFiltroContrato: (contrato) => set({ filtroContrato: contrato }),
      setBusca: (busca) => set({ busca: busca }),
      
      adicionarFolha: (folha) =>
        set((state) => {
          const newId = `fp-${Date.now()}`;
          const now = new Date().toISOString();
          const novaFolha: FolhaPagamento = {
            ...folha,
            id: newId,
            criadoEm: now,
            atualizadoEm: now,
          };
          return { folhas: [...state.folhas, novaFolha] };
        }),
      
      atualizarFolha: (id, dados) =>
        set((state) => ({
          folhas: state.folhas.map((f) =>
            f.id === id
              ? { ...f, ...dados, atualizadoEm: new Date().toISOString() }
              : f
          ),
        })),
      
      removerFolha: (id) =>
        set((state) => ({
          folhas: state.folhas.filter((f) => f.id !== id),
        })),
      
      calcularValorTotal: (id) =>
        set((state) => ({
          folhas: state.folhas.map((f) => {
            if (f.id === id) {
              const valorTotal = f.valor + f.adicional + f.reembolso - f.desconto;
              const valorTotalSemReembolso = valorTotal - f.reembolso;
              return {
                ...f,
                valorTotal,
                valorTotalSemReembolso,
                atualizadoEm: new Date().toISOString(),
              };
            }
            return f;
          }),
        })),
      
      calcularPercentuais: (id) =>
        set((state) => ({
          folhas: state.folhas.map((f) => {
            if (f.id === id && f.percentualOperacao) {
              const total = f.valorTotalSemReembolso;
              const { empresa1, empresa2, empresa3, empresa4 } = f.percentualOperacao;
              
              return {
                ...f,
                empresa1Valor: (total * empresa1) / 100,
                empresa2Valor: (total * empresa2) / 100,
                empresa3Valor: (total * empresa3) / 100,
                empresa4Valor: (total * empresa4) / 100,
                percentualOperacao: {
                  ...f.percentualOperacao,
                  totalOpers: empresa1 + empresa2 + empresa3 + empresa4,
                },
                atualizadoEm: new Date().toISOString(),
              };
            }
            return f;
          }),
        })),
      
      atualizarNotaFiscal: (id, notaFiscal) =>
        set((state) => ({
          folhas: state.folhas.map((f) =>
            f.id === id
              ? { ...f, notaFiscal, atualizadoEm: new Date().toISOString() }
              : f
          ),
        })),
      
      gerarFolhasPorPeriodo: (periodo, colaboradores) =>
        set((state) => {
          // Verifica se já existem folhas para este período
          const folhasExistentes = state.folhas.filter((f) => f.periodo === periodo);
          
          if (folhasExistentes.length > 0) {
            console.warn(`Folhas já existem para o período ${periodo}`);
            return state;
          }
          
          const novasFolhas: FolhaPagamento[] = colaboradores
            .filter((c) => c.situacao === 'ativo')
            .map((colab) => ({
              id: `fp-${periodo}-${colab.id}`,
              colaboradorId: colab.id,
              colaborador: colab,
              periodo,
              valor: 0,
              adicional: 0,
              reembolso: 0,
              desconto: 0,
              valorTotal: 0,
              situacao: 'pendente',
              valorTotalSemReembolso: 0,
              criadoEm: new Date().toISOString(),
              atualizadoEm: new Date().toISOString(),
            }));
          
          return { folhas: [...state.folhas, ...novasFolhas] };
        }),
      
      getFolhasFiltradas: () => {
        const state = get();
        let filtradas = state.folhas.filter((f) => f.periodo === state.periodoSelecionado);
        
        if (state.filtroSituacao !== 'Todos') {
          filtradas = filtradas.filter((f) => f.situacao === state.filtroSituacao.toLowerCase());
        }
        
        if (state.filtroContrato !== 'Todos') {
          filtradas = filtradas.filter((f) => f.colaborador.contrato === state.filtroContrato);
        }
        
        if (state.busca) {
          const buscaLower = state.busca.toLowerCase();
          filtradas = filtradas.filter(
            (f) =>
              f.colaborador.nomeCompleto.toLowerCase().includes(buscaLower) ||
              f.colaborador.funcao.toLowerCase().includes(buscaLower) ||
              f.colaborador.setor.toLowerCase().includes(buscaLower)
          );
        }
        
        return filtradas;
      },
      
      getFolhasPorColaborador: (colaboradorId) => {
        return get().folhas.filter((f) => f.colaboradorId === colaboradorId);
      },
      
      exportarParaCSV: () => {
        const folhas = get().getFolhasFiltradas();
        const headers = [
          'COLABORADOR',
          'FUNÇÃO',
          'EMPRESA',
          'CTT',
          'VALOR',
          'ADICIONAL',
          'REEMBOLSO',
          'DESCONTO',
          'VALOR TOTAL',
          'SITUAÇÃO',
          'DATA PGTO',
          'NOTA FISCAL',
          'STATUS',
          'PAGAMENTO',
          'DATA',
          'OBS',
          'V. TOTAL/ S REEMB',
          'EMPRESA 1 NOME',
          'EMPRESA 1 %',
          'EMPRESA 1 VALOR',
          'EMPRESA 2 NOME',
          'EMPRESA 2 %',
          'EMPRESA 2 VALOR',
          'EMPRESA 3 NOME',
          'EMPRESA 3 %',
          'EMPRESA 3 VALOR',
          'EMPRESA 4 NOME',
          'EMPRESA 4 %',
          'EMPRESA 4 VALOR',
          '%TOTAL OPERS'
        ];
        
        const rows = folhas.map(f => {
          // If there is no percentualOperacao or totalOpers is falsy, fallback to colaborador.empresa = 100%
          const po = f.percentualOperacao;
          const hasPerc = po && (po.totalOpers && po.totalOpers > 0);
          const empresa1Percent = hasPerc ? (po!.empresa1 || 0) : 100;
          const empresa1Valor = hasPerc ? (f.empresa1Valor || 0) : (f.valorTotalSemReembolso || 0);
          const empresa2Percent = hasPerc ? (po!.empresa2 || 0) : 0;
          const empresa2Valor = hasPerc ? (f.empresa2Valor || 0) : 0;
          const empresa3Percent = hasPerc ? (po!.empresa3 || 0) : 0;
          const empresa3Valor = hasPerc ? (f.empresa3Valor || 0) : 0;
          const empresa4Percent = hasPerc ? (po!.empresa4 || 0) : 0;
          const empresa4Valor = hasPerc ? (f.empresa4Valor || 0) : 0;

          return [
            f.colaborador.nomeCompleto,
            f.colaborador.funcao,
            f.colaborador.empresa,
            f.colaborador.contrato,
            f.valor.toFixed(2),
            f.adicional.toFixed(2),
            f.reembolso.toFixed(2),
            f.desconto.toFixed(2),
            f.valorTotal.toFixed(2),
            f.situacao,
            f.dataPagamento || '',
            f.notaFiscal?.numero || '',
            f.notaFiscal?.status || '',
            f.notaFiscal?.pagamento || '',
            f.notaFiscal?.data || '',
            f.notaFiscal?.obs || '',
            f.valorTotalSemReembolso.toFixed(2),
            // Empresa 1: nome, percent, valor
            (hasPerc ? (po!.empresa1Nome || '') : (f.colaborador.empresa || '')),
            empresa1Percent.toFixed(2),
            empresa1Valor.toFixed(2),
            // Empresa 2
            (hasPerc ? (po!.empresa2Nome || '') : ''),
            empresa2Percent.toFixed(2),
            empresa2Valor.toFixed(2),
            // Empresa 3
            (hasPerc ? (po!.empresa3Nome || '') : ''),
            empresa3Percent.toFixed(2),
            empresa3Valor.toFixed(2),
            // Empresa 4
            (hasPerc ? (po!.empresa4Nome || '') : ''),
            empresa4Percent.toFixed(2),
            empresa4Valor.toFixed(2),
            (po && po.totalOpers ? po.totalOpers : (hasPerc ? 0 : 100)).toFixed(2)
          ];
        });
        
        const csv = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join('\t'))
          .join('\n');
        
        return csv;
      },
      
      exportarParaExcel: () => {
        const csv = get().exportarParaCSV();
        const blob = new Blob(['\ufeff' + csv], { type: 'text/tab-separated-values;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        const periodo = get().periodoSelecionado;
        link.setAttribute('href', url);
        link.setAttribute('download', `folha-pagamento-${periodo}.tsv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      
      importarDePlanilha: (dados: any[]) => {
        const periodo = get().periodoSelecionado;
        const novasFolhas: FolhaPagamento[] = dados.map((linha, idx) => {
          const valor = parseFloat(linha.valor) || 0;
          const adicional = parseFloat(linha.adicional) || 0;
          const reembolso = parseFloat(linha.reembolso) || 0;
          const desconto = parseFloat(linha.desconto) || 0;
          const valorTotal = valor + adicional + reembolso - desconto;
          const valorTotalSemReembolso = valorTotal - reembolso;

          // Parse empresas (se presentes)
          const e1p = parseFloat(linha.empresa1Percent) || 0;
          const e2p = parseFloat(linha.empresa2Percent) || 0;
          const e3p = parseFloat(linha.empresa3Percent) || 0;
          const e4p = parseFloat(linha.empresa4Percent) || 0;

          const po: any = {
            empresa1: e1p,
            empresa1Nome: linha.empresa1Nome || undefined,
            empresa2: e2p,
            empresa2Nome: linha.empresa2Nome || undefined,
            empresa3: e3p,
            empresa3Nome: linha.empresa3Nome || undefined,
            empresa4: e4p,
            empresa4Nome: linha.empresa4Nome || undefined,
            totalOpers: parseFloat(linha.percTotalOpers) || (e1p + e2p + e3p + e4p),
          };

          const folha: FolhaPagamento = {
            id: `fp-import-${Date.now()}-${idx}`,
            colaboradorId: linha.colaboradorId || (linha.colaboradorObject?.id) || 0,
            colaborador: linha.colaboradorObject
              ? {
                  id: linha.colaboradorObject.id,
                  nomeCompleto: linha.colaboradorObject.nomeCompleto || linha.colaborador || '',
                  cpf: linha.colaboradorObject.cpf || linha.cpf || '',
                  setor: linha.colaboradorObject.setor || linha.setor || '',
                  funcao: linha.colaboradorObject.funcao || linha.funcao || '',
                  empresa: linha.colaboradorObject.empresa || linha.empresa || '',
                  regime: (linha.colaboradorObject.regime as 'CLT' | 'PJ') || (linha.contrato as 'CLT' | 'PJ') || 'CLT',
                  contrato: (linha.colaboradorObject.contrato as 'CLT' | 'PJ') || (linha.contrato as 'CLT' | 'PJ') || 'CLT',
                  situacao: 'ativo' as const,
                }
              : {
                  id: 0,
                  nomeCompleto: linha.colaborador || '',
                  cpf: linha.cpf || '',
                  setor: linha.setor || '',
                  funcao: linha.funcao || '',
                  empresa: linha.empresa || '',
                  regime: (linha.contrato as 'CLT' | 'PJ') || 'CLT',
                  contrato: (linha.contrato as 'CLT' | 'PJ') || 'CLT',
                  situacao: 'ativo' as const,
                },
            periodo,
            valor,
            adicional,
            reembolso,
            desconto,
            valorTotal,
            situacao: linha.situacao || 'pendente',
            valorTotalSemReembolso,
            criadoEm: new Date().toISOString(),
            atualizadoEm: new Date().toISOString(),
            percentualOperacao: (po.totalOpers && po.totalOpers > 0) ? po : undefined,
            empresa1Valor: parseFloat(linha.empresa1Valor) || (valorTotalSemReembolso * (e1p || 0) / 100) || undefined,
            empresa2Valor: parseFloat(linha.empresa2Valor) || (valorTotalSemReembolso * (e2p || 0) / 100) || undefined,
            empresa3Valor: parseFloat(linha.empresa3Valor) || (valorTotalSemReembolso * (e3p || 0) / 100) || undefined,
            empresa4Valor: parseFloat(linha.empresa4Valor) || (valorTotalSemReembolso * (e4p || 0) / 100) || undefined,
          };

          return folha;
        });

        set(state => ({ folhas: [...state.folhas, ...novasFolhas] }));
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
          'VALOR TOTAL',
          'SITUAÇÃO',
          'DATA PGTO',
          'NOTA FISCAL',
          'STATUS',
          'PAGAMENTO',
          'DATA',
          'OBS',
          'V. TOTAL/ S REEMB',
          'EMPRESA 1 NOME',
          'EMPRESA 1 %',
          'EMPRESA 1 VALOR',
          'EMPRESA 2 NOME',
          'EMPRESA 2 %',
          'EMPRESA 2 VALOR',
          'EMPRESA 3 NOME',
          'EMPRESA 3 %',
          'EMPRESA 3 VALOR',
          'EMPRESA 4 NOME',
          'EMPRESA 4 %',
          'EMPRESA 4 VALOR',
          '%TOTAL OPERS'
        ];

        const exemplo = [
          'João da Silva',
          'Analista',
          'CFO Consultoria',
          'CLT',
          '5000.00',
          '500.00',
          '200.00',
          '800.00',
          '4900.00',
          'Pendente',
          '2025-11-30',
          '',
          '',
          '',
          '',
          '',
          '4700.00',
          'Empresa A',
          '25',
          '1175.00',
          'Empresa B',
          '25',
          '1175.00',
          'Empresa C',
          '25',
          '1175.00',
          'Empresa D',
          '25',
          '1175.00',
          '100'
        ];
        
        const csv = [headers, exemplo]
          .map(row => row.map(cell => `"${cell}"`).join('\t'))
          .join('\n');
        
        return csv;
      },
      
      reset: () =>
        set({
          folhas: gerarFolhasMock(),
          periodoSelecionado: new Date().toISOString().slice(0, 7),
          filtroSituacao: 'Todos',
          filtroContrato: 'Todos',
          busca: '',
        }),
    }),
    {
      name: 'cfo:folha-pagamento',
      partialize: (s) => ({ folhas: s.folhas }),
    }
  )
);
