import { useState, useRef, useEffect } from 'react';
import { PersonalizarColunasModal } from '../components/PersonalizarColunasModal';
// Removido import duplicado de ícones
import { FileText, Plus, Download, Upload, DollarSign, FileSpreadsheet, SlidersHorizontal } from 'lucide-react';
import { useFolhaPagamentoStore } from '../store/folhaPagamentoStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { EditarFolhaModal } from '../components/EditarFolhaModal.tsx';
import { NovaFolhaModal } from '../components/NovaFolhaModal';
import { ImportPreviewModal } from '../components/ImportPreviewModal';
import { FolhaPagamento } from '../types';

export default function FolhaPagamentoPage() {
    // Estado para menu de exportação
    const [showExportMenu, setShowExportMenu] = useState(false);

    // Fechar menu de exportação ao clicar fora
    useEffect(() => {
      if (!showExportMenu) return;
      function handleClick(e: MouseEvent) {
        const target = e.target as HTMLElement;
        if (!target.closest('.relative')) setShowExportMenu(false);
      }
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
    }, [showExportMenu]);

    // Guardar referência original
    const exportarParaExcelOriginal = useFolhaPagamentoStore.getState().exportarParaExcel;

    // Adaptar exportarParaExcel para aceitar tipo
    function handleExportarArquivo(_tipo: 'csv' | 'xls') {
      // Por enquanto ambos chamam a mesma função, mas pode ser expandido no futuro
      exportarParaExcelOriginal();
    }
  const {
    periodoSelecionado,
    filtroSituacao,
    filtroContrato,
    busca,
    setPeriodoSelecionado,
    setFiltroSituacao,
    setFiltroContrato,
    setBusca,
    getFolhasFiltradas,
    atualizarFolha,
    calcularValorTotal,
    importarDePlanilha,
    gerarPlanilhaModelo,
  } = useFolhaPagamentoStore();

  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [folhaSelecionada, setFolhaSelecionada] = useState<FolhaPagamento | null>(null);
  const [colunas, setColunas] = useState<string[]>(() => {
    const saved = localStorage.getItem('folha_colunas');
    return saved ? JSON.parse(saved) : [
      'funcao', 'empresa', 'contrato', 'valor', 'adicional', 'reembolso', 'desconto', 'total', 'valorTotalSemReembolso', 'situacao', 'dataPagamento'
    ];
  });
  const [modalPersonalizar, setModalPersonalizar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [previewPeriodo, setPreviewPeriodo] = useState<string | null>(null);

  const { colaboradores } = useColaboradoresStore();
  const folhasFiltradas = getFolhasFiltradas();

  const handleNovaFolha = () => {
    setModalNovoAberto(true);
  };

  const handleSalvarNovaFolha = (dados: any) => {
    const colaborador = colaboradores.find(c => String(c.id) === dados.colaboradorId);
    if (!colaborador) return;

    const colaboradorCompleto = {
      id: colaborador.id,
      nomeCompleto: colaborador.nomeCompleto || colaborador.nome,
      cpf: colaborador.cpf || '',
      telefone: colaborador.telefone,
      email: colaborador.email,
      setor: colaborador.setor || colaborador.departamento,
      funcao: colaborador.funcao || colaborador.cargo,
      empresa: colaborador.empresa || 'CFO Consultoria',
      regime: colaborador.regime || ('CLT' as const),
      contrato: colaborador.contrato || ('CLT' as const),
      situacao: 'ativo' as const,
      chavePix: colaborador.chavePix,
      banco: colaborador.banco,
      codigoBanco: colaborador.codigoBanco,
      agencia: colaborador.agencia,
      conta: colaborador.conta,
    };

    const novaFolha = {
      colaborador: colaboradorCompleto,
      periodo: dados.periodo,
      valor: dados.valor,
      adicional: dados.adicional,
      reembolso: dados.reembolso,
      desconto: dados.desconto,
      valorTotal: dados.valorTotal,
      valorTotalSemReembolso: dados.valorTotalSemReembolso,
      situacao: dados.situacao,
      dataPagamento: dados.dataPagamento,
      percentualOperacao: dados.percentualOperacao,
      notaFiscal: dados.notaFiscal,
    };

    // Usar a função adicionarFolha da store
    useFolhaPagamentoStore.getState().adicionarFolha(novaFolha as any);
  };



  const handleBaixarModelo = () => {
    const csv = gerarPlanilhaModelo();
    const blob = new Blob(['\ufeff' + csv], { type: 'text/tab-separated-values;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'modelo-folha-pagamento.tsv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        alert('Arquivo vazio ou inválido');
        return;
      }

      // Validar cabeçalhos do modelo padrão (inclui nomes/percent/valor por empresa)
      const expectedHeaders = [
        'colaborador', 'função', 'empresa', 'ctt', 'valor', 'adicional',
        'reembolso', 'desconto', 'valor total', 'situação', 'data pgto',
        'nota fiscal', 'status', 'pagamento', 'data', 'obs',
        'v. total/ s reemb',
        'empresa 1 nome', 'empresa 1 %', 'empresa 1 valor',
        'empresa 2 nome', 'empresa 2 %', 'empresa 2 valor',
        'empresa 3 nome', 'empresa 3 %', 'empresa 3 valor',
        'empresa 4 nome', 'empresa 4 %', 'empresa 4 valor',
        '%total opers'
      ];
      
      const headers = lines[0].split('\t').map(h => h.replace(/"/g, '').trim().toLowerCase());
      const isValidFormat = expectedHeaders.every((h, i) => headers[i] === h);

      if (!isValidFormat) {
        alert('Formato de arquivo inválido! Use o modelo padrão do sistema (Baixar Modelo).');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Processar dados
      const dados = lines.slice(1).map(line => {
        const values = line.split('\t').map(v => v.replace(/"/g, '').trim());
        return {
          colaborador: values[0] || '',
          funcao: values[1] || '',
          empresa: values[2] || '',
          contrato: values[3] || '',
          valor: values[4] || '0',
          adicional: values[5] || '0',
          reembolso: values[6] || '0',
          desconto: values[7] || '0',
          valorTotal: values[8] || '0',
          situacao: values[9] || 'pendente',
          dataPagamento: values[10] || '',
          notaFiscal: values[11] || '',
          statusNF: values[12] || '',
          pagamentoNF: values[13] || '',
          dataNF: values[14] || '',
          obsNF: values[15] || '',
          valorTotalSemReembolso: values[16] || '0',
          empresa1Nome: values[17] || '',
          empresa1Percent: values[18] || '0',
          empresa1Valor: values[19] || '0',
          empresa2Nome: values[20] || '',
          empresa2Percent: values[21] || '0',
          empresa2Valor: values[22] || '0',
          empresa3Nome: values[23] || '',
          empresa3Percent: values[24] || '0',
          empresa3Valor: values[25] || '0',
          empresa4Nome: values[26] || '',
          empresa4Percent: values[27] || '0',
          empresa4Valor: values[28] || '0',
          percTotalOpers: values[29] || '0'
        };
      });

      // Validar se há dados
      if (dados.length === 0 || !dados[0].colaborador) {
        alert('Nenhum dado válido encontrado no arquivo.');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }
      // Perguntar mês de competência
      const mesCompetencia = prompt('Digite o mês de competência (AAAA-MM):', periodoSelecionado);
      if (!mesCompetencia || !/^\d{4}-\d{2}$/.test(mesCompetencia)) {
        alert('Mês de competência inválido! Use o formato AAAA-MM (ex: 2025-11)');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Ajusta período selecionado antes da importação
      setPeriodoSelecionado(mesCompetencia);

      // Preparar preview com correspondências sugeridas (remoção de acentos, CPF, startsWith/includes)
      const strip = (s = '') => s.toString().normalize('NFD').replace(/[\u0000-\u036f]/g, '').toLowerCase().trim();
      const onlyDigits = (s = '') => s.toString().replace(/\D/g, '');

      const preview = dados.map((row, idx) => {
        let suggested: number | string | undefined;

        // Try CPF match (if present in file)
        const cpfInRow = (row as any).cpf;
        if (cpfInRow) {
          const cpfNormalized = onlyDigits(cpfInRow);
          const foundByCpf = colaboradores.find(c => onlyDigits(c.cpf || '') === cpfNormalized && cpfNormalized.length > 0);
          if (foundByCpf) suggested = foundByCpf.id;
        }

        // Try name-based matches
        if (!suggested && row.colaborador) {
          const target = strip(row.colaborador);
          // exact
          const exact = colaboradores.find(c => strip(c.nomeCompleto || c.nome) === target);
          if (exact) suggested = exact.id;
          // startsWith
          if (!suggested) {
            const starts = colaboradores.find(c => strip(c.nomeCompleto || c.nome).startsWith(target.slice(0, Math.min(6, target.length))));
            if (starts) suggested = starts.id;
          }
          // includes
          if (!suggested) {
            const incl = colaboradores.find(c => strip(c.nomeCompleto || c.nome).includes(target));
            if (incl) suggested = incl.id;
          }
        }

        return { index: idx, raw: row, suggestedId: suggested, selectedId: suggested ?? null };
      });

      setPreviewRows(preview);
      setPreviewPeriodo(mesCompetencia);
      setPreviewOpen(true);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const handleEditarFolha = (folha: FolhaPagamento) => {
    setFolhaSelecionada(folha);
    setModalEditarAberto(true);
  };

  const handleSalvarFolha = (id: string, dados: Partial<FolhaPagamento>) => {
    atualizarFolha(id, dados);
    calcularValorTotal(id);
    setModalEditarAberto(false);
    setFolhaSelecionada(null);
  };

  const getBadgeColor = (situacao: string) => {
    switch (situacao) {
      case 'pago':
        return 'green';
      case 'agendado':
        return 'blue';
      case 'pendente':
        return 'yellow';
      case 'cancelado':
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const calcularTotais = () => {
    const totais = folhasFiltradas.reduce(
      (acc, folha) => ({
        valor: acc.valor + folha.valor,
        adicional: acc.adicional + folha.adicional,
        reembolso: acc.reembolso + folha.reembolso,
        desconto: acc.desconto + folha.desconto,
        valorTotal: acc.valorTotal + folha.valorTotal,
      }),
      { valor: 0, adicional: 0, reembolso: 0, desconto: 0, valorTotal: 0 }
    );
    return totais;
  };

  const totais = calcularTotais();

  // Gerar períodos (últimos 12 meses)
  const gerarPeriodos = () => {
    const periodos: string[] = [];
    const hoje = new Date();
    for (let i = 0; i < 12; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      periodos.push(data.toISOString().slice(0, 7));
    }
    return periodos;
  };

  const periodos = gerarPeriodos();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Folha de Pagamento</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie os pagamentos dos colaboradores</p>
        </div>
      </div>

      {/* Filtros e Ações */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <Input
              placeholder="Buscar por colaborador, função..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          
          <select
            value={periodoSelecionado}
            onChange={(e) => setPeriodoSelecionado(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {periodos.map((periodo) => {
              const [ano, mes] = periodo.split('-');
              const data = new Date(parseInt(ano), parseInt(mes) - 1);
              const nomeMes = data.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
              return (
                <option key={periodo} value={periodo}>
                  {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}
                </option>
              );
            })}
          </select>

          <select
            value={filtroSituacao}
            onChange={(e) => setFiltroSituacao(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {['Todos', 'Pendente', 'Agendado', 'Pago', 'Cancelado'].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>

          <select
            value={filtroContrato}
            onChange={(e) => setFiltroContrato(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            {['Todos', 'CLT', 'PJ'].map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Button variant="primary" onClick={handleNovaFolha}>
            <Plus className="w-4 h-4 mr-2 inline" />
            Nova Folha
          </Button>
          <div className="relative">
            <Button variant="outline" onClick={() => setShowExportMenu(v => !v)}>
              <Download className="w-4 h-4 mr-2 inline" />
              Exportar
            </Button>
            {showExportMenu && (
              <div className="absolute z-20 mt-1 bg-white border border-gray-200 rounded shadow-lg min-w-[120px]">
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowExportMenu(false); handleExportarArquivo('csv'); }}>CSV</button>
                <button className="w-full text-left px-4 py-2 hover:bg-gray-100" onClick={() => { setShowExportMenu(false); handleExportarArquivo('xls'); }}>XLS</button>
              </div>
            )}
          </div>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2 inline" />
            Importar
          </Button>
          <Button variant="outline" onClick={handleBaixarModelo}>
            <FileSpreadsheet className="w-4 h-4 mr-2 inline" />
            Baixar Modelo
          </Button>
          <Button variant="outline" onClick={() => setModalPersonalizar(true)}>
            <SlidersHorizontal className="w-4 h-4 mr-2 inline" />
            Personalizar
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.tsv,.txt"
            className="hidden"
            onChange={handleImportar}
          />
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Valor Base</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totais.valor)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900/20">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Adicional</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totais.adicional)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-purple-50 dark:bg-purple-900/20">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Reembolso</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totais.reembolso)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Desconto</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totais.desconto)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-indigo-50 dark:bg-indigo-900/20">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(totais.valorTotal)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabela de Folhas */}
      {folhasFiltradas.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Nenhuma folha de pagamento encontrada
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Adicione colaboradores para gerar a folha de pagamento do período
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 sticky left-0 bg-white dark:bg-gray-900 z-10">Colaborador</th>
                  {colunas.includes('funcao') && <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Função</th>}
                  {colunas.includes('empresa') && <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Empresa</th>}
                  {colunas.includes('contrato') && <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Contrato</th>}
                  {colunas.includes('valor') && <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Valor</th>}
                  {colunas.includes('adicional') && <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Adicional</th>}
                  {colunas.includes('reembolso') && <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Reembolso</th>}
                  {colunas.includes('desconto') && <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Desconto</th>}
                  {colunas.includes('total') && <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Total</th>}
                  {colunas.includes('valorTotalSemReembolso') && <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">V. Total s/ Reemb</th>}
                  {colunas.includes('empresa1') && <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Empresa 1</th>}
                  {colunas.includes('empresa2') && <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Empresa 2</th>}
                  {colunas.includes('empresa3') && <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Empresa 3</th>}
                  {colunas.includes('empresa4') && <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Empresa 4</th>}
                  {colunas.includes('situacao') && <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Situação</th>}
                  {colunas.includes('dataPagamento') && <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Data Pgto</th>}
                  {colunas.includes('nf') && folhasFiltradas.some(f => f.colaborador.contrato === 'PJ') && <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">NF</th>}
                  {colunas.includes('statusNF') && folhasFiltradas.some(f => f.colaborador.contrato === 'PJ') && <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status NF</th>}
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 sticky right-0 bg-white dark:bg-gray-900 z-10">Ações</th>
                </tr>
              </thead>
              <tbody>
                {folhasFiltradas.map((folha) => (
                  <tr
                    key={folha.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                    onClick={() => handleEditarFolha(folha)}
                  >
                    <td className="py-3 px-4 sticky left-0 bg-white dark:bg-gray-900 z-10">
                      <div className="flex items-center gap-3">
                        {folha.colaborador.avatar && (
                          <img
                            src={folha.colaborador.avatar}
                            alt={folha.colaborador.nomeCompleto}
                            className="w-8 h-8 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {folha.colaborador.nomeCompleto}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {folha.colaborador.setor}
                          </p>
                        </div>
                      </div>
                    </td>
                    {colunas.includes('funcao') && <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{folha.colaborador.funcao}</td>}
                    {colunas.includes('empresa') && <td className="py-3 px-4 text-gray-700 dark:text-gray-300">{folha.colaborador.empresa}</td>}
                    {colunas.includes('contrato') && (
                      <td className="py-3 px-4 text-center">
                        <Badge variant={folha.colaborador.contrato === 'CLT' ? 'info' : 'purple' as any}>
                          {folha.colaborador.contrato}
                        </Badge>
                      </td>
                    )}
                    {colunas.includes('valor') && <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(folha.valor)}</td>}
                    {colunas.includes('adicional') && <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(folha.adicional)}</td>}
                    {colunas.includes('reembolso') && <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(folha.reembolso)}</td>}
                    {colunas.includes('desconto') && <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(folha.desconto)}</td>}
                    {colunas.includes('total') && <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(folha.valorTotal)}</td>}
                    {colunas.includes('valorTotalSemReembolso') && <td className="py-3 px-4 text-right text-gray-700 dark:text-gray-300">{formatCurrency(folha.valorTotalSemReembolso)}</td>}
                    {colunas.includes('empresa1') && (
                      <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-gray-400">
                        {folha.percentualOperacao?.empresa1 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{folha.percentualOperacao.empresa1Nome || 'Empresa 1'}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{folha.percentualOperacao.empresa1}%</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(folha.empresa1Valor || 0)}</span>
                          </div>
                        ) : '-'}
                      </td>
                    )}
                    {colunas.includes('empresa2') && (
                      <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-gray-400">
                        {folha.percentualOperacao?.empresa2 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{folha.percentualOperacao.empresa2Nome || 'Empresa 2'}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{folha.percentualOperacao.empresa2}%</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(folha.empresa2Valor || 0)}</span>
                          </div>
                        ) : '-'}
                      </td>
                    )}
                    {colunas.includes('empresa3') && (
                      <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-gray-400">
                        {folha.percentualOperacao?.empresa3 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{folha.percentualOperacao.empresa3Nome || 'Empresa 3'}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{folha.percentualOperacao.empresa3}%</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(folha.empresa3Valor || 0)}</span>
                          </div>
                        ) : '-'}
                      </td>
                    )}
                    {colunas.includes('empresa4') && (
                      <td className="py-3 px-4 text-center text-xs text-gray-600 dark:text-gray-400">
                        {folha.percentualOperacao?.empresa4 ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium">{folha.percentualOperacao.empresa4Nome || 'Empresa 4'}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{folha.percentualOperacao.empresa4}%</span>
                            <span className="text-gray-900 dark:text-white">{formatCurrency(folha.empresa4Valor || 0)}</span>
                          </div>
                        ) : '-'}
                      </td>
                    )}
                    {colunas.includes('situacao') && (
                      <td className="py-3 px-4 text-center">
                        <Badge variant={getBadgeColor(folha.situacao) as any}>
                          {folha.situacao.charAt(0).toUpperCase() + folha.situacao.slice(1)}
                        </Badge>
                      </td>
                    )}
                    {colunas.includes('dataPagamento') && (
                      <td className="py-3 px-4 text-center">
                        {folha.dataPagamento ? new Date(folha.dataPagamento).toLocaleDateString('pt-BR') : '-'}
                      </td>
                    )}
                    {colunas.includes('nf') && folhasFiltradas.some(f => f.colaborador.contrato === 'PJ') && (
                      <td className="py-3 px-4 text-center">{folha.notaFiscal?.numero || '-'}</td>
                    )}
                    {colunas.includes('statusNF') && folhasFiltradas.some(f => f.colaborador.contrato === 'PJ') && (
                      <td className="py-3 px-4 text-center">{folha.notaFiscal?.status || '-'}</td>
                    )}
                    <td className="py-3 px-4 text-center sticky right-0 bg-white dark:bg-gray-900 z-10">
                      <Button variant="outline" onClick={e => { e.stopPropagation(); handleEditarFolha(folha); }}>
                        <FileText className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900 z-10">TOTAL</td>
                  {colunas.includes('funcao') && <td className="py-3 px-4"></td>}
                  {colunas.includes('empresa') && <td className="py-3 px-4"></td>}
                  {colunas.includes('contrato') && <td className="py-3 px-4"></td>}
                  {colunas.includes('valor') && <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(totais.valor)}</td>}
                  {colunas.includes('adicional') && <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(totais.adicional)}</td>}
                  {colunas.includes('reembolso') && <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(totais.reembolso)}</td>}
                  {colunas.includes('desconto') && <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(totais.desconto)}</td>}
                  {colunas.includes('total') && <td className="py-3 px-4 text-right font-semibold text-indigo-600 dark:text-indigo-400">{formatCurrency(totais.valorTotal)}</td>}
                  {colunas.includes('valorTotalSemReembolso') && <td className="py-3 px-4 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(totais.valorTotal - totais.reembolso)}</td>}
                  {colunas.includes('empresa1') && <td className="py-3 px-4"></td>}
                  {colunas.includes('empresa2') && <td className="py-3 px-4"></td>}
                  {colunas.includes('empresa3') && <td className="py-3 px-4"></td>}
                  {colunas.includes('empresa4') && <td className="py-3 px-4"></td>}
                  {colunas.includes('situacao') && <td className="py-3 px-4"></td>}
                  {colunas.includes('dataPagamento') && <td className="py-3 px-4"></td>}
                  {colunas.includes('nf') && folhasFiltradas.some(f => f.colaborador.contrato === 'PJ') && <td className="py-3 px-4"></td>}
                  {colunas.includes('statusNF') && folhasFiltradas.some(f => f.colaborador.contrato === 'PJ') && <td className="py-3 px-4"></td>}
                  <td className="py-3 px-4 sticky right-0 bg-white dark:bg-gray-900 z-10"></td>
                </tr>
                    {/* Modal Personalizar Colunas */}
                    <PersonalizarColunasModal
                      isOpen={modalPersonalizar}
                      onClose={() => setModalPersonalizar(false)}
                      value={colunas}
                      onChange={(cols: string[]) => {
                        setColunas(cols);
                        localStorage.setItem('folha_colunas', JSON.stringify(cols));
                      }}
                      temPJ={folhasFiltradas.some(f => f.colaborador.contrato === 'PJ')}
                    />
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* Modal de Edição */}
      {modalEditarAberto && (
        <EditarFolhaModal
          folha={folhaSelecionada}
          onClose={() => {
            setModalEditarAberto(false);
            setFolhaSelecionada(null);
          }}
          onSave={handleSalvarFolha}
        />
      )}

      {/* Modal de Nova Folha */}
      <NovaFolhaModal
        isOpen={modalNovoAberto}
        onClose={() => setModalNovoAberto(false)}
        onSave={handleSalvarNovaFolha}
        periodo={periodoSelecionado}
      />

      {/* Import Preview Modal */}
      <ImportPreviewModal
        isOpen={previewOpen}
        onClose={() => { setPreviewOpen(false); if (fileInputRef.current) fileInputRef.current.value = ''; }}
        rows={previewRows}
        colaboradores={colaboradores}
        onConfirm={(localRows) => {
          // Ensure periodo is set
          if (previewPeriodo) setPeriodoSelecionado(previewPeriodo);

          const mapped = localRows.map((r: any) => {
            const sel = r.selectedId;
            if (sel && sel !== 'new') {
              const found = colaboradores.find(c => String(c.id) === String(sel));
              if (found) {
                return {
                  ...r.raw,
                  colaboradorId: found.id,
                  colaboradorObject: {
                    id: found.id,
                    nomeCompleto: found.nomeCompleto || found.nome,
                    cpf: found.cpf || '',
                    setor: found.setor || '',
                    funcao: found.funcao || '',
                    empresa: found.empresa || '',
                    regime: found.regime || 'CLT',
                    contrato: found.contrato || 'CLT',
                    situacao: 'ativo'
                  }
                };
              }
            }
            // new or not associated -> leave raw data (store will create minimal collaborator)
            return r.raw;
          });

          importarDePlanilha(mapped);
          setPreviewOpen(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          alert(`${mapped.length} registro(s) importado(s) com sucesso!`);
        }}
      />
    </div>
  );
}
