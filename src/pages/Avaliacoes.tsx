import { useState, useEffect } from 'react';
import { Star, CheckCircle, Clock, AlertCircle, TrendingUp, Award, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Card } from '../components/ui/Card';
import PageBanner from '../components/ui/PageBanner';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/Avatar';
import { useAvaliacoesStore } from '../store/avaliacoesStore';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export function Avaliacoes() {
  const { user } = useAuthStore();
  const { avaliacoes, concluirAvaliacao, getAvaliacoesPendentes, getAvaliacoesRecebidas } = useAvaliacoesStore();
  const { colaboradores } = useColaboradoresStore();
  const [avaliacaoAberta, setAvaliacaoAberta] = useState<number | null>(null);
  const [notas, setNotas] = useState({
    comunicacao: 0,
    trabalhoEmEquipe: 0,
    qualidadeTecnica: 0,
    pontualidade: 0,
    proatividade: 0,
  });
  const [pontosFortes, setPontosFortes] = useState('');
  const [pontosDesenvolvimento, setPontosDesenvolvimento] = useState('');
  const [comentarios, setComentarios] = useState('');

  const pendentes = user ? getAvaliacoesPendentes(user.id) : [];
  const recebidas = user ? getAvaliacoesRecebidas(user.id) : [];
  const recebidasConcluidas = recebidas.filter((a) => a.status === 'concluida');

  const [activeTab, setActiveTab] = useState<'pendentes' | 'recebidas'>('pendentes');

  // Paginação
  const [currentPagePendentes, setCurrentPagePendentes] = useState(1);
  const [currentPageRecebidas, setCurrentPageRecebidas] = useState(1);
  const itemsPerPage = 20;

  const totalPendentes = pendentes.length;
  const totalPagesPendentes = Math.ceil(totalPendentes / itemsPerPage);
  const startPendentes = (currentPagePendentes - 1) * itemsPerPage;
  const pendentesPaginados = pendentes.slice(startPendentes, startPendentes + itemsPerPage);

  const totalRecebidas = recebidas.length;
  const totalPagesRecebidas = Math.ceil(totalRecebidas / itemsPerPage);
  const startRecebidas = (currentPageRecebidas - 1) * itemsPerPage;
  const recebidasPaginadas = recebidas.slice(startRecebidas, startRecebidas + itemsPerPage);

  // Reset pagination quando muda activeTab
  useEffect(() => {
    setCurrentPagePendentes(1);
    setCurrentPageRecebidas(1);
  }, [activeTab]);

  // Média geral do usuário considerando todas as avaliações concluídas recebidas
  const minhaMediaGeral = recebidasConcluidas.length > 0
    ? (() => {
        const soma = recebidasConcluidas.reduce(
          (acc, a) => ({
            comunicacao: acc.comunicacao + a.notas.comunicacao,
            trabalhoEmEquipe: acc.trabalhoEmEquipe + a.notas.trabalhoEmEquipe,
            qualidadeTecnica: acc.qualidadeTecnica + a.notas.qualidadeTecnica,
            pontualidade: acc.pontualidade + a.notas.pontualidade,
            proatividade: acc.proatividade + a.notas.proatividade,
          }),
          { comunicacao: 0, trabalhoEmEquipe: 0, qualidadeTecnica: 0, pontualidade: 0, proatividade: 0 }
        );

        const mediaPorCompetencia = {
          comunicacao: soma.comunicacao / recebidasConcluidas.length,
          trabalhoEmEquipe: soma.trabalhoEmEquipe / recebidasConcluidas.length,
          qualidadeTecnica: soma.qualidadeTecnica / recebidasConcluidas.length,
          pontualidade: soma.pontualidade / recebidasConcluidas.length,
          proatividade: soma.proatividade / recebidasConcluidas.length,
        };

        return calcularMedia(mediaPorCompetencia);
      })()
    : '0.0';

  const getColaborador = (id: string) => {
    return colaboradores.find((c) => c.id.toString() === id);
  };

  const handleAbrirAvaliacao = (id: number) => {
    const avaliacao = avaliacoes.find((a) => a.id === id);
    if (avaliacao) {
      setNotas(avaliacao.notas);
      setPontosFortes(avaliacao.pontosFortes || '');
      setPontosDesenvolvimento(avaliacao.pontosDesenvolvimento || '');
      setComentarios(avaliacao.comentarios || '');
      setAvaliacaoAberta(id);
    }
  };

  const handleConcluir = () => {
    if (!avaliacaoAberta) return;

    const todasNotasDadas = Object.values(notas).every((n) => n > 0);
    if (!todasNotasDadas) {
      toast.error('Por favor, preencha todas as notas');
      return;
    }

    concluirAvaliacao(avaliacaoAberta, {
      notas,
      pontosFortes,
      pontosDesenvolvimento,
      comentarios,
    });

    toast.success('Avaliação concluída com sucesso!');
    setAvaliacaoAberta(null);
    resetForm();
  };

  const resetForm = () => {
    setNotas({
      comunicacao: 0,
      trabalhoEmEquipe: 0,
      qualidadeTecnica: 0,
      pontualidade: 0,
      proatividade: 0,
    });
    setPontosFortes('');
    setPontosDesenvolvimento('');
    setComentarios('');
  };

  const renderStars = (competencia: keyof typeof notas, valor: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((estrela) => (
          <button
            key={estrela}
            onClick={() => setNotas({ ...notas, [competencia]: estrela })}
            className="transition-colors"
          >
            <Star
              size={24}
              className={estrela <= valor ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}
            />
          </button>
        ))}
      </div>
    );
  };

  function calcularMedia(notasObj: typeof notas) {
    const valores = Object.values(notasObj);
    const soma = valores.reduce((acc, val) => acc + val, 0);
    return valores.length > 0 ? (soma / valores.length).toFixed(1) : '0.0';
  }

  const avaliacaoSelecionada = avaliacoes.find((a) => a.id === avaliacaoAberta);

  return (
    <div className="space-y-6">
      <PageBanner title="Avaliações de Desempenho" icon={<Award size={32} />} />

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pendentes</p>
              <p className="text-3xl font-bold text-orange-600">{pendentes.length}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Concluídas</p>
              <p className="text-3xl font-bold text-green-600">
                {avaliacoes.filter((a) => a.status === 'concluida').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Minha Média</p>
              <p className="text-3xl font-bold text-blue-600">{minhaMediaGeral}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Avaliações pendentes */}
      {pendentes.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-orange-600" />
            Avaliações Pendentes
          </h3>
          <div className="space-y-3">
            {pendentesPaginados.map((avaliacao) => {
              const avaliado = getColaborador(avaliacao.avaliadoId);
              if (!avaliado) return null;

              return (
                <div
                  key={avaliacao.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar src={avaliado.avatar} alt={avaliado.nome} size="md" />
                    <div>
                      <h4 className="font-semibold text-gray-800 dark:text-gray-100">{avaliado.nome}</h4>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>{avaliacao.periodo}</span>
                        <span>•</span>
                        <span>Prazo: {new Date(avaliacao.dataLimite).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                  <Button onClick={() => handleAbrirAvaliacao(avaliacao.id)}>Avaliar</Button>
                </div>
              );
            })}
          </div>

          {/* Paginação Pendentes */}
          {totalPagesPendentes > 1 && (
            <Card className="mt-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Mostrando {startPendentes + 1}-{Math.min(startPendentes + itemsPerPage, totalPendentes)} de {totalPendentes} avaliações
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={() => setCurrentPagePendentes(1)} disabled={currentPagePendentes === 1} className="dark:text-white" aria-label="Primeira página">
                    <ChevronsLeft className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPagePendentes(prev => Math.max(1, prev - 1))} disabled={currentPagePendentes === 1} className="dark:text-white" aria-label="Página anterior">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex gap-1">
                    {Array.from({ length: totalPagesPendentes }, (_, i) => i + 1)
                      .filter(page => page === 1 || page === totalPagesPendentes || Math.abs(page - currentPagePendentes) <= 1)
                      .map((page, idx, arr) => {
                        const prevPage = arr[idx - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;
                        return (
                          <div key={page} className="flex gap-1">
                            {showEllipsis && <span className="px-3 py-2 text-gray-500 dark:text-gray-400">...</span>}
                            <Button variant={currentPagePendentes === page ? "primary" : "outline"} onClick={() => setCurrentPagePendentes(page)} className={currentPagePendentes === page ? "" : "dark:text-white"} aria-label={`Página ${page}`}>
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                  <Button variant="outline" onClick={() => setCurrentPagePendentes(prev => Math.min(totalPagesPendentes, prev + 1))} disabled={currentPagePendentes === totalPagesPendentes} className="dark:text-white" aria-label="Próxima página">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentPagePendentes(totalPagesPendentes)} disabled={currentPagePendentes === totalPagesPendentes} className="dark:text-white" aria-label="Última página">
                    <ChevronsRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </Card>
      )}

      {/* Avaliações recebidas */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Minhas Avaliações
        </h3>
        <div className="space-y-3">
          {recebidas.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              Você ainda não recebeu avaliações
            </p>
          ) : (
            recebidasPaginadas.map((avaliacao) => {
              const avaliador = getColaborador(avaliacao.avaliadorId);
              if (!avaliador) return null;

              return (
                <div
                  key={avaliacao.id}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar src={avaliador.avatar} alt={avaliador.nome} size="md" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                          {avaliador.nome}
                        </h4>
                        <Badge className={avaliacao.status === 'concluida' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'}>
                          {avaliacao.status === 'concluida' ? 'Concluída' : 'Pendente'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>{avaliacao.periodo}</span>
                        {avaliacao.status === 'concluida' && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Star size={14} className="fill-yellow-400 text-yellow-400" />
                              Média: {calcularMedia(avaliacao.notas)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  {avaliacao.status === 'concluida' && (
                    <Button variant="outline" onClick={() => handleAbrirAvaliacao(avaliacao.id)}>
                      Ver Detalhes
                    </Button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Paginação Recebidas */}
        {totalPagesRecebidas > 1 && (
          <Card className="mt-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Mostrando {startRecebidas + 1}-{Math.min(startRecebidas + itemsPerPage, totalRecebidas)} de {totalRecebidas} avaliações
              </div>
              
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setCurrentPageRecebidas(1)} disabled={currentPageRecebidas === 1} className="dark:text-white" aria-label="Primeira página">
                  <ChevronsLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => setCurrentPageRecebidas(prev => Math.max(1, prev - 1))} disabled={currentPageRecebidas === 1} className="dark:text-white" aria-label="Página anterior">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex gap-1">
                  {Array.from({ length: totalPagesRecebidas }, (_, i) => i + 1)
                    .filter(page => page === 1 || page === totalPagesRecebidas || Math.abs(page - currentPageRecebidas) <= 1)
                    .map((page, idx, arr) => {
                      const prevPage = arr[idx - 1];
                      const showEllipsis = prevPage && page - prevPage > 1;
                      return (
                        <div key={page} className="flex gap-1">
                          {showEllipsis && <span className="px-3 py-2 text-gray-500 dark:text-gray-400">...</span>}
                          <Button variant={currentPageRecebidas === page ? "primary" : "outline"} onClick={() => setCurrentPageRecebidas(page)} className={currentPageRecebidas === page ? "" : "dark:text-white"} aria-label={`Página ${page}`}>
                            {page}
                          </Button>
                        </div>
                      );
                    })}
                </div>
                <Button variant="outline" onClick={() => setCurrentPageRecebidas(prev => Math.min(totalPagesRecebidas, prev + 1))} disabled={currentPageRecebidas === totalPagesRecebidas} className="dark:text-white" aria-label="Próxima página">
                  <ChevronRight className="w-4 h-4" />
                </Button>
                <Button variant="outline" onClick={() => setCurrentPageRecebidas(totalPagesRecebidas)} disabled={currentPageRecebidas === totalPagesRecebidas} className="dark:text-white" aria-label="Última página">
                  <ChevronsRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </Card>

      {/* Modal de Avaliação */}
      {avaliacaoSelecionada && (
        <Modal
          isOpen={!!avaliacaoAberta}
          onClose={() => {
            setAvaliacaoAberta(null);
            resetForm();
          }}
          title={`Avaliação de ${getColaborador(avaliacaoSelecionada.avaliadoId)?.nome}`}
          className="max-w-3xl"
        >
          <div className="space-y-6">
            {/* Competências */}
            <div>
              <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Competências</h4>
              <div className="space-y-4">
                {Object.entries(notas).map(([competencia, valor]) => (
                  <div key={competencia} className="flex items-center justify-between">
                    <span className="text-gray-700 dark:text-gray-300 capitalize">
                      {competencia.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    {avaliacaoSelecionada.status === 'pendente'
                      ? renderStars(competencia as keyof typeof notas, valor)
                      : (
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((estrela) => (
                              <Star
                                key={estrela}
                                size={20}
                                className={
                                  estrela <= valor
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {valor}/5
                          </span>
                        </div>
                      )}
                  </div>
                ))}
              </div>
            </div>

            {/* Feedback textual */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pontos Fortes
                </label>
                {avaliacaoSelecionada.status === 'pendente' ? (
                  <textarea
                    value={pontosFortes}
                    onChange={(e) => setPontosFortes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[80px]"
                    placeholder="Descreva os pontos fortes do colaborador..."
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {avaliacaoSelecionada.pontosFortes || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Pontos de Desenvolvimento
                </label>
                {avaliacaoSelecionada.status === 'pendente' ? (
                  <textarea
                    value={pontosDesenvolvimento}
                    onChange={(e) => setPontosDesenvolvimento(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[80px]"
                    placeholder="Descreva áreas que podem ser desenvolvidas..."
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {avaliacaoSelecionada.pontosDesenvolvimento || 'Não informado'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Comentários Gerais
                </label>
                {avaliacaoSelecionada.status === 'pendente' ? (
                  <textarea
                    value={comentarios}
                    onChange={(e) => setComentarios(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-h-[80px]"
                    placeholder="Comentários adicionais..."
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    {avaliacaoSelecionada.comentarios || 'Não informado'}
                  </p>
                )}
              </div>
            </div>

            {/* Botões */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setAvaliacaoAberta(null);
                  resetForm();
                }}
              >
                Fechar
              </Button>
              {avaliacaoSelecionada.status === 'pendente' && (
                <Button onClick={handleConcluir}>Concluir Avaliação</Button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
