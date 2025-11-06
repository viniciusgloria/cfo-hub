import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { Modal } from '../components/ui/Modal';
import { CollaboratorCard } from '../components/CollaboratorCard';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { SkeletonCard } from '../components/ui/SkeletonCard';
import { useEffect } from 'react';
import { formatPhone } from '../utils/validation';

export function Colaboradores() {
  const colaboradores = useColaboradoresStore((s) => s.colaboradores);
  const busca = useColaboradoresStore((s) => s.busca);
  const setBusca = useColaboradoresStore((s) => s.setBusca);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('dados');

  const filtered = colaboradores.filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  const openProfile = (id: number) => { setSelected(id); setOpen(true); setActiveTab('dados'); };

  const sel = colaboradores.find(c => c.id === selected);

  return (
    <div className="space-y-6">
      <Card className="p-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Colaboradores</h3>
          <p className="text-sm text-gray-500">Equipe e contatos</p>
        </div>
        <div className="flex items-center gap-3">
          <Input placeholder="Buscar por nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
          <Button onClick={() => { setBusca(''); }}>Limpar</Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(c => (
            <CollaboratorCard key={c.id} nome={c.nome} cargo={c.cargo} departamento={c.departamento} avatar={c.avatar} onOpen={() => openProfile(c.id)} />
          ))}
        </div>
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
