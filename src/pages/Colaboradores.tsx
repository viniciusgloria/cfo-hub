import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { CollaboratorCard } from '../components/CollaboratorCard';
import { Pagination } from '../components/ui/Pagination';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useAuthStore } from '../store/authStore';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useEffect } from 'react';
import { formatPhone } from '../utils/validation';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 12;

export function Colaboradores() {
  usePageTitle('Colaboradores');
  const navigate = useNavigate();
  const colaboradores = useColaboradoresStore((s) => s.colaboradores);
  const atualizarColaborador = useColaboradoresStore((s) => s.atualizarColaborador);
  const busca = useColaboradoresStore((s) => s.busca);
  const setBusca = useColaboradoresStore((s) => s.setBusca);
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('dados');
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaTemp, setMetaTemp] = useState('176');
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = colaboradores.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedColaboradores = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  
  const [isLoading, setIsLoading] = useState(true);
  const podeGerenciarUsuarios = user?.role === 'admin' || user?.role === 'gestor' || user?.role === 'rh';

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const openProfile = (id: number) => { 
    setSelected(id); 
    setOpen(true); 
    setActiveTab('dados'); 
    const colab = colaboradores.find(c => c.id === id);
    setMetaTemp(String(colab?.metaHorasMensais || 176));
    setEditandoMeta(false);
  };

  const sel = colaboradores.find(c => c.id === selected);
  const podeEditar = user?.role === 'admin' || user?.role === 'gestor' || user?.role === 'rh';

  const salvarMeta = () => {
    if (!sel) return;
    const metaNum = parseInt(metaTemp, 10);
    if (isNaN(metaNum) || metaNum <= 0) {
      toast.error('Meta de horas inválida');
      return;
    }
    atualizarColaborador(sel.id, { metaHorasMensais: metaNum });
    setEditandoMeta(false);
    toast.success('Meta de horas atualizada!');
  };

  return (
    <div className="space-y-6">
      <Card className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Colaboradores</h3>
          <p className="text-sm text-gray-500">Equipe e contatos</p>
        </div>
        <div className="flex items-center gap-3">
          <Input placeholder="Buscar por nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <Button variant="outline" onClick={() => { setBusca(''); }}>Limpar</Button>
          {podeGerenciarUsuarios && (
            <Button onClick={() => navigate('/colaboradores/cadastro')} className="flex items-center gap-2">
              <Plus size={18} />
              Novo Colaborador
            </Button>
          )}
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {paginatedColaboradores.map(c => (
              <CollaboratorCard key={c.id} nome={c.nome} cargo={c.cargo} departamento={c.departamento} avatar={c.avatar} onOpen={() => openProfile(c.id)} />
            ))}
          </div>
          
          {filtered.length > ITEMS_PER_PAGE && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              totalItems={filtered.length}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title={sel ? sel.nome : 'Perfil'}>
        {sel && (
          <div>
            <Tabs tabs={[{ id: 'dados', label: 'Dados' }, { id: 'documentos', label: 'Documentos' }, { id: 'ferias', label: 'Férias' }, { id: 'ponto', label: 'Ponto' }]} activeTab={activeTab} onTabChange={setActiveTab}>
              {activeTab === 'dados' && (
                <div className="space-y-3">
                  <p className="text-sm"><strong>Email:</strong> {sel.email}</p>
                  <p className="text-sm"><strong>Telefone:</strong> {sel.telefone ? formatPhone(sel.telefone) : '—'}</p>
                  <p className="text-sm"><strong>Departamento:</strong> {sel.departamento}</p>
                  <p className="text-sm"><strong>Cargo:</strong> {sel.cargo}</p>
                  
                  {podeEditar && (
                    <>
                      <div className="pt-4 border-t border-gray-200 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Meta de Horas Mensais</label>
                        {editandoMeta ? (
                          <div className="flex items-center gap-2">
                            <Input 
                              type="number" 
                              value={metaTemp} 
                              onChange={(e) => setMetaTemp(e.target.value)}
                              className="w-24"
                            />
                            <span className="text-sm text-gray-600">horas/mês</span>
                            <Button onClick={salvarMeta} className="text-sm">Salvar</Button>
                            <Button variant="outline" onClick={() => setEditandoMeta(false)} className="text-sm">Cancelar</Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <p className="text-sm"><strong>{sel.metaHorasMensais || 176}h/mês</strong></p>
                            <Button variant="outline" onClick={() => setEditandoMeta(true)} className="text-sm">Editar</Button>
                          </div>
                        )}
                      </div>
                      <div className="pt-4 border-t border-gray-200 mt-4">
                        <Button 
                          onClick={() => navigate(`/colaboradores/cadastro?id=${sel.id}`)} 
                          variant="outline" 
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Edit size={16} />
                          Editar Dados Completos
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              )}
              {activeTab === 'documentos' && (
                <div className="text-sm text-gray-600">Documentos do colaborador (mock)</div>
              )}
              {activeTab === 'ferias' && (
                <div className="text-sm text-gray-600">Histórico de férias e solicitações (mock)</div>
              )}
              {activeTab === 'ponto' && (
                <div className="text-sm text-gray-600">Resumo de ponto (mock)</div>
              )}
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
}
