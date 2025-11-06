import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { ProgressBar, CircularProgress } from '../components/ui/ProgressBar';
import { Tabs } from '../components/ui/Tabs';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { Input } from '../components/ui/Input';
import { Avatar } from '../components/Avatar';
import { useOKRsStore } from '../store/okrsStore';
import { EmptyState } from '../components/ui/EmptyState';

export function OKRs() {
  const [activeTab, setActiveTab] = useState('todos');
  const [trimestre, setTrimestre] = useState('Q4 2024');
  const [isUpdateModal, setIsUpdateModal] = useState(false);
  const [selectedOKR, setSelectedOKR] = useState<string | null>(null);
  const [progressValues, setProgressValues] = useState<Record<string, number>>({});

  const { okrs, atualizarProgresso } = useOKRsStore();

  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'pessoal', label: 'Pessoal' },
    { id: 'time', label: 'Time' },
    { id: 'empresa', label: 'Empresa' }
  ];

  const okrsFiltrados = okrs.filter(okr => {
    if (activeTab === 'todos') return true;
    return okr.tipo === activeTab;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const handleUpdateProgress = () => {
    if (!selectedOKR) return;

    const okr = okrs.find(o => o.id === selectedOKR);
    if (!okr) return;

    okr.resultadosChave.forEach(kr => {
      if (progressValues[kr.id] !== undefined) {
        atualizarProgresso(selectedOKR, kr.id, progressValues[kr.id]);
      }
    });

    toast.success('Progresso atualizado!');
    setIsUpdateModal(false);
    setSelectedOKR(null);
    setProgressValues({});
  };

  const handleOpenUpdate = (okrId: string) => {
    const okr = okrs.find(o => o.id === okrId);
    if (okr) {
      setSelectedOKR(okrId);
      const values: Record<string, number> = {};
      okr.resultadosChave.forEach(kr => {
        values[kr.id] = kr.atual;
      });
      setProgressValues(values);
      setIsUpdateModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-800">OKRs</h1>
        <div className="flex gap-2">
          <select
            value={trimestre}
            onChange={(e) => setTrimestre(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
          >
            <option>Q4 2024</option>
            <option>Q3 2024</option>
            <option>Q2 2024</option>
            <option>Q1 2024</option>
          </select>
          <Button className="flex items-center gap-2">
            <Plus size={18} />
            Novo OKR
          </Button>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="space-y-6">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : okrsFiltrados.length === 0 ? (
            <EmptyState title="Nenhum objetivo criado" description="Crie um OKR para começar a acompanhar metas." cta={<Button onClick={() => {}}>Novo OKR</Button>} />
          ) : (
            okrsFiltrados.map((okr) => {
              return (
                <Card key={okr.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant={okr.tipo}>{okr.tipo === 'empresa' ? 'Empresa' : okr.tipo === 'time' ? 'Time' : 'Pessoal'}</Badge>
                        <Badge variant={okr.status}>
                          {okr.status === 'no-prazo' ? 'No Prazo' : okr.status === 'atencao' ? 'Atenção' : 'Atrasado'}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">{okr.objetivo}</h3>
                      <div className="flex items-center gap-3">
                        <Avatar src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${okr.owner.avatar}`} alt={okr.owner.nome} size="md" />
                        <div>
                          <div className="text-sm font-medium text-gray-800">{okr.owner.nome}</div>
                          <div className="text-xs text-gray-500">{okr.trimestre}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <CircularProgress progress={okr.progresso} size={100} />
                    </div>
                  </div>

                  <div className="space-y-4 mb-6 pt-6 border-t border-gray-200">
                    {okr.resultadosChave.map((kr) => (
                      <div key={kr.id}>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm text-gray-700">{kr.descricao}</p>
                          <span className="text-xs font-medium text-gray-600">
                            {kr.atual}/{kr.meta} {kr.unidade}
                          </span>
                        </div>
                        <ProgressBar progress={kr.progresso} showLabel={true} />
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => handleOpenUpdate(okr.id)}
                    fullWidth
                  >
                    Atualizar Progresso
                  </Button>
                </Card>
              );
            })
          )}
        </div>
      </Tabs>

      <Modal
        isOpen={isUpdateModal}
        onClose={() => {
          setIsUpdateModal(false);
          setSelectedOKR(null);
        }}
        title="Atualizar Progresso"
      >
        {selectedOKR && okrs.find(o => o.id === selectedOKR) && (
          <div className="space-y-4">
            {okrs.find(o => o.id === selectedOKR)?.resultadosChave.map((kr) => (
              <div key={kr.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {kr.descricao}
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={progressValues[kr.id] || 0}
                    onChange={(e) =>
                      setProgressValues({
                        ...progressValues,
                        [kr.id]: parseFloat(e.target.value) || 0
                      })
                    }
                    className="flex-1"
                  />
                  <span className="text-sm text-gray-600 min-w-fit">/ {kr.meta} {kr.unidade}</span>
                </div>
              </div>
            ))}

            <Button onClick={handleUpdateProgress} fullWidth>
              Salvar Alterações
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
