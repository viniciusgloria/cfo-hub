import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/Avatar';
import { useSolicitacoesStore } from '../store/solicitacoesStore';
import { useAuthStore } from '../store/authStore';
import { SkeletonCard } from '../components/ui/SkeletonCard';

const tiposMap: Record<string, { label: string; badge: string }> = {
  material: { label: 'Material', badge: 'material' },
  sala: { label: 'Sala', badge: 'sala' },
  reembolso: { label: 'Reembolso', badge: 'reembolso' },
  ferias: { label: 'Férias', badge: 'ferias' },
  homeoffice: { label: 'Home Office', badge: 'homeoffice' }
};

const urgenciaMap: Record<string, { label: string; badge: string }> = {
  baixa: { label: 'Baixa', badge: 'urgencia-baixa' },
  media: { label: 'Média', badge: 'urgencia-media' },
  alta: { label: 'Alta', badge: 'urgencia-alta' }
};

export function Solicitacoes() {
  const [activeTab, setActiveTab] = useState('todas');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [detalhesId, setDetalhesId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ tipo: 'material', titulo: '', descricao: '', urgencia: 'media' });
  const [touched, setTouched] = useState({ titulo: false, descricao: false });

  const { solicitacoes, adicionarSolicitacao, atualizarStatus } = useSolicitacoesStore();
  const user = useAuthStore((state) => state.user);

  const tabs = [
    { id: 'todas', label: 'Todas', count: solicitacoes.length },
    { id: 'pendentes', label: 'Pendentes', count: solicitacoes.filter(s => s.status === 'pendente').length },
    { id: 'historico', label: 'Histórico', count: solicitacoes.filter(s => s.status !== 'pendente').length }
  ];

  const solicitacoesFiltradas = solicitacoes.filter(s => {
    if (activeTab === 'pendentes') return s.status === 'pendente';
    if (activeTab === 'historico') return s.status !== 'pendente';
    return true;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = () => {
    const errors: string[] = [];
    setTouched({ titulo: true, descricao: true });
    if (!formData.titulo) errors.push('Título é obrigatório.');
    if (!formData.descricao) errors.push('Descrição é obrigatória.');

    if (errors.length) {
      setFormErrors(errors);
      toast.error('Preencha todos os campos');
      return;
    }

    const novasolicitacao = {
      id: Date.now().toString(),
      tipo: formData.tipo as any,
      titulo: formData.titulo,
      descricao: formData.descricao,
      status: 'pendente' as const,
      solicitante: { nome: user?.name || 'Você', avatar: user?.name || 'Você' },
      data: new Date().toLocaleDateString('pt-BR'),
      urgencia: formData.urgencia as any
    };

    adicionarSolicitacao(novasolicitacao);
    toast.success('Solicitação enviada com sucesso!');
    setIsModalOpen(false);
    setFormData({ tipo: 'material', titulo: '', descricao: '', urgencia: 'media' });
  };

  const handleAprovar = (id: string) => {
    atualizarStatus(id, 'aprovada');
    toast.success('Solicitação aprovada!');
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toRejectId, setToRejectId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pendingBulkReject, setPendingBulkReject] = useState(false);

  const [formErrors, setFormErrors] = useState<string[]>([]);

  const handleRejeitar = (id: string) => {
    setToRejectId(id);
    setConfirmOpen(true);
  };

  const confirmRejeitar = (_reason?: string) => {
    if (pendingBulkReject) {
      // bulk reject
      if (selectedIds.length === 0) {
        setConfirmOpen(false);
        setPendingBulkReject(false);
        return;
      }
      selectedIds.forEach((id) => atualizarStatus(id, 'rejeitada'));
      toast.error(`${selectedIds.length} solicitações rejeitadas`);
      setSelectedIds([]);
      setConfirmOpen(false);
      setPendingBulkReject(false);
      setToRejectId(null);
      return;
    }

    if (!toRejectId) return;
    atualizarStatus(toRejectId, 'rejeitada');
    toast.error('Solicitação rejeitada');
    setConfirmOpen(false);
    setToRejectId(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => atualizarStatus(id, 'aprovada'));
    toast.success(`${selectedIds.length} solicitações aprovadas`);
    setSelectedIds([]);
  };

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return;
    setPendingBulkReject(true);
    setConfirmOpen(true);
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'gestor';
  const solicitacaoDetalhes = solicitacoes.find(s => s.id === detalhesId);

  return (
    <div className="space-y-6">
      <Card className="p-4 flex items-center justify-between">
        <h3 className="text-2xl font-bold">Solicitações</h3>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Nova Solicitação
        </Button>
      </Card>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">{selectedIds.length} selecionada(s)</span>
            <div className="ml-auto flex gap-2">
              <Button onClick={handleBulkApprove} className="text-sm">Aprovar selecionadas</Button>
              <Button onClick={handleBulkReject} variant="outline" className="text-sm border-red-300 text-red-600">Rejeitar selecionadas</Button>
            </div>
          </div>
        )}

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : solicitacoesFiltradas.length === 0 ? (
          <EmptyState title="Nenhuma solicitação" description="Não há solicitações para exibir." cta={<Button onClick={() => setIsModalOpen(true)}>Nova Solicitação</Button>} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {solicitacoesFiltradas.map((sol) => {
              return (
                <Card
                  key={sol.id}
                  className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setDetalhesId(sol.id)}
                >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {isAdmin && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(sol.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleSelect(sol.id);
                      }}
                      aria-label={`Selecionar solicitação ${sol.titulo}`}
                    />
                  )}
                  <Badge variant={sol.tipo}>{tiposMap[sol.tipo].label}</Badge>
                </div>
                <Badge variant={sol.status}>{sol.status === 'pendente' ? 'Pendente' : sol.status === 'aprovada' ? 'Aprovada' : 'Rejeitada'}</Badge>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">{sol.titulo}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{sol.descricao}</p>

              {sol.valor && (
                <p className="text-lg font-bold text-green-600 mb-4">R$ {sol.valor.toFixed(2)}</p>
              )}

              <div className="flex items-center gap-3 mb-4">
                <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${sol.solicitante.avatar}`} alt={sol.solicitante.nome} size="md" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{sol.solicitante.nome}</p>
                  <p className="text-xs text-gray-500">Solicitante</p>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                <span className="text-xs text-gray-500">{sol.data}</span>
                <Badge variant={`urgencia-${sol.urgencia}`}>
                  {urgenciaMap[sol.urgencia].label}
                </Badge>
              </div>

              {sol.status === 'pendente' && isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAprovar(sol.id);
                    }}
                    className="flex-1 text-sm"
                  >
                    Aprovar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRejeitar(sol.id);
                    }}
                    className="flex-1 text-sm border-red-300 text-red-600"
                  >
                    Rejeitar
                  </Button>
                </div>
              )}
            </Card>
          );
            })}
          </div>
        )}
      </Tabs>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={confirmRejeitar} title="Confirmar rejeição" />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nova Solicitação"
      >
        <div className="space-y-4">
          {/* summary errors */}
          {formErrors.length > 0 && (
            <div role="alert" aria-live="assertive" className="mb-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded">
              <strong className="block font-medium">Por favor corrija os seguintes erros:</strong>
              <ul className="mt-2 list-disc list-inside text-sm">
                {formErrors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              {Object.entries(tiposMap).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
            <Input
              placeholder="Título da solicitação"
              value={formData.titulo}
              onBlur={() => setTouched({ ...touched, titulo: true })}
              onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
              aria-invalid={!formData.titulo && touched.titulo}
            />
            {!formData.titulo && touched.titulo && <p className="text-xs text-red-500">Título é obrigatório.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <textarea
              placeholder="Descreva sua solicitação"
              value={formData.descricao}
              onBlur={() => setTouched({ ...touched, descricao: true })}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981] resize-none"
              rows={4}
            />
            {!formData.descricao && touched.descricao && <p className="text-xs text-red-500">Descrição é obrigatória.</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgência</label>
            <select
              value={formData.urgencia}
              onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          <Button onClick={handleSubmit} fullWidth disabled={!formData.titulo || !formData.descricao}>
            Enviar Solicitação
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={!!detalhesId && !!solicitacaoDetalhes}
        onClose={() => setDetalhesId(null)}
        title="Detalhes da Solicitação"
      >
        {solicitacaoDetalhes && (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Tipo</p>
              <Badge variant={solicitacaoDetalhes.tipo}>{tiposMap[solicitacaoDetalhes.tipo].label}</Badge>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Título</p>
              <p className="text-lg font-semibold">{solicitacaoDetalhes.titulo}</p>
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-1">Descrição</p>
              <p className="text-gray-700 whitespace-pre-wrap">{solicitacaoDetalhes.descricao}</p>
            </div>

            {solicitacaoDetalhes.valor && (
              <div>
                <p className="text-xs text-gray-500 mb-1">Valor</p>
                <p className="text-2xl font-bold text-green-600">R$ {solicitacaoDetalhes.valor.toFixed(2)}</p>
              </div>
            )}

            <div>
              <p className="text-xs text-gray-500 mb-1">Solicitante</p>
              <div className="flex items-center gap-2">
                <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${solicitacaoDetalhes.solicitante.avatar}`} alt={solicitacaoDetalhes.solicitante.nome} className="w-8 h-8" />
                <span>{solicitacaoDetalhes.solicitante.nome}</span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Timeline</p>
              <p className="text-sm text-gray-700">Criada em {solicitacaoDetalhes.data}</p>
              {solicitacaoDetalhes.status !== 'pendente' && (
                <p className="text-sm text-gray-700 mt-2">
                  {solicitacaoDetalhes.status === 'aprovada' ? '✓ Aprovada' : '✗ Rejeitada'}
                </p>
              )}
            </div>

            {solicitacaoDetalhes.status === 'pendente' && isAdmin && (
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <Button
                  variant="primary"
                  onClick={() => {
                    handleAprovar(solicitacaoDetalhes.id);
                    setDetalhesId(null);
                  }}
                  fullWidth
                >
                  Aprovar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    handleRejeitar(solicitacaoDetalhes.id);
                    setDetalhesId(null);
                  }}
                  fullWidth
                  className="border-red-300 text-red-600"
                >
                  Rejeitar
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
