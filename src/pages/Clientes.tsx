import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { PageBanner } from '../components/ui/PageBanner';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import toast from 'react-hot-toast';
import { useClientesStore } from '../store/clientesStore';

export function Clientes() {
  usePageTitle('Clientes');
  const { clientes, filtroStatus, busca, setFiltroStatus, setBusca } = useClientesStore();
  const [isSyncing, setIsSyncing] = useState(false);

  

  const clientesFiltrados = clientes.filter(cliente => {
    const matchStatus = filtroStatus === 'Todos' || cliente.status === filtroStatus.toLowerCase();
    const matchBusca = cliente.nome.toLowerCase().includes(busca.toLowerCase());
    return matchStatus && matchBusca;
  });

  const [isLoading, setIsLoading] = useState(false);

  // simulate loading when syncing
  const handleSync = async () => {
    setIsLoading(true);
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    // call store sync stub for traceability
    try {
      syncOMIE();
      toast.success('Sincronização com OMIE concluída (mock)');
    } catch (e) {
      toast.error('Falha ao sincronizar OMIE');
    }
    setIsSyncing(false);
    setIsLoading(false);
  };

  // edit / remove handlers
  const { removerCliente, editarCliente, syncOMIE } = useClientesStore();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [toDeleteId, setToDeleteId] = useState<number | null>(null);

  const openEdit = (cliente: any) => {
    setEditing({ ...cliente, servicosText: cliente.servicos.join(', ') });
    setIsEditOpen(true);
  };

  const saveEdit = () => {
    if (!editing) return;
    const updated = {
      ...editing,
      servicos: (editing.servicosText || '').split(',').map((s: string) => s.trim()).filter(Boolean),
    };
    editarCliente(updated);
    toast.success('Cliente atualizado');
    setIsEditOpen(false);
    setEditing(null);
  };

  const confirmDelete = (id: number) => {
    setToDeleteId(id);
    setIsConfirmOpen(true);
  };

  const doDelete = () => {
    if (toDeleteId == null) return;
    removerCliente(toDeleteId);
    toast.success('Cliente removido');
    setIsConfirmOpen(false);
    setToDeleteId(null);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ativo: 'bg-green-100 text-green-800',
      pausado: 'bg-yellow-100 text-yellow-800',
      encerrado: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      ativo: 'Ativo',
      pausado: 'Pausado',
      encerrado: 'Encerrado'
    };
    return { colors: colors[status as keyof typeof colors], label: labels[status as keyof typeof labels] };
  };

  return (
    <div className="space-y-6">
      <PageBanner
        title="Clientes"
        style={{ minHeight: '64px' }}
        right={(
          <>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 p-2 rounded-md">
                <Search size={16} className="text-gray-500" />
                <Input
                  className="bg-transparent text-sm outline-none px-2 py-1 rounded-md border border-gray-200"
                  placeholder="Buscar cliente..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                />
                <div className="flex items-center gap-1">
                  <Filter size={16} className="text-gray-500" />
                  <select
                    value={filtroStatus}
                    onChange={(e) => setFiltroStatus(e.target.value)}
                    className="bg-transparent text-sm outline-none px-2 py-1 rounded-md border border-gray-200"
                  >
                    <option>Todos</option>
                    <option value="ativo">Ativos</option>
                    <option value="pausado">Pausados</option>
                    <option value="encerrado">Encerrados</option>
                  </select>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                Sincronizar OMIE
              </Button>
            </div>
          </>
        )}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map((i) => (
            <div key={i}><div className="animate-pulse bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-48" /></div>
          ))}
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-600">Nenhum cliente cadastrado</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesFiltrados.map((cliente) => {
          const badgeInfo = getStatusBadge(cliente.status);
          return (
            <Card key={cliente.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${cliente.responsavel}`} alt={cliente.responsavel} size="lg" />
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{cliente.nome}</h3>
                        <p className="text-sm text-gray-600">{cliente.responsavel}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${badgeInfo.colors}`}>{badgeInfo.label}</span>
                    </div>
                  </div>

              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <p className="text-xs text-gray-600">Valor MRR</p>
                <p className="text-2xl font-bold text-green-600">
                  R$ {cliente.mrr.toLocaleString('pt-BR')}
                </p>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="text-sm">
                  <p className="text-gray-600">Responsável</p>
                  <p className="font-medium text-gray-800">{cliente.responsavel}</p>
                </div>
              </div>

              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-xs text-gray-600 mb-1">Início</p>
                <p className="text-sm font-medium text-gray-800">{cliente.inicio}</p>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">Serviços</p>
                <div className="flex flex-wrap gap-2">
                  {cliente.servicos.map((servico, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                      {servico}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => openEdit(cliente)} className="flex-1">Editar</Button>
                <Button variant="outline" onClick={() => confirmDelete(cliente.id)} className="flex-1 border-red-300 text-red-600">Remover</Button>
              </div>
            </Card>
          );
        })}
      </div>
    )}

    {/* Edit modal */}
    <Modal isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditing(null); }} title="Editar cliente">
      {editing && (
        <div className="space-y-4">
          <Input value={editing.nome} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} />
          <Input value={editing.responsavel} onChange={(e) => setEditing({ ...editing, responsavel: e.target.value })} />
          <Input value={editing.mrr} onChange={(e) => setEditing({ ...editing, mrr: Number(e.target.value) || 0 })} />
          <Input value={editing.inicio} onChange={(e) => setEditing({ ...editing, inicio: e.target.value })} />
          <Input value={editing.servicosText} onChange={(e) => setEditing({ ...editing, servicosText: e.target.value })} placeholder="Serviços (separados por vírgula)" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditing(null); }}>Cancelar</Button>
            <Button onClick={saveEdit}>Salvar</Button>
          </div>
        </div>
      )}
    </Modal>

    {/* Confirm delete */}
    <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={() => doDelete()} title="Remover cliente" />
  </div>
  );
}
