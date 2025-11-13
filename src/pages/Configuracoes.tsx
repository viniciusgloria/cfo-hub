import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Modal } from '../components/ui/Modal';
import { resetStores, PersistKey } from '../store/resetHelpers';
import { FormError } from '../components/ui/FormError';
import { isValidCNPJ, maxLength } from '../utils/validation';
import toast from 'react-hot-toast';

export function Configuracoes() {
  const [active, setActive] = useState('empresa');
  const [empresa, setEmpresa] = useState({ nome: 'CFO Hub Ltda', cnpj: '12.345.678/0001-99', cidade: 'São Paulo' });
  const [jornada, setJornada] = useState({ inicio: '09:00', fim: '18:00', intervalo: '01:00' });
  const [users, setUsers] = useState([
    { id: '1', name: 'João Silva', email: 'joao@cfocompany.com', role: 'admin' },
    { id: '2', name: 'Maria Santos', email: 'maria@cfocompany.com', role: 'colaborador' },
  ]);
  const [isSavingEmpresa, setIsSavingEmpresa] = useState(false);
  const [isSavingJornada, setIsSavingJornada] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toRemoveUser, setToRemoveUser] = useState<string | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; email: string; role: string }>({ name: '', email: '', role: 'colaborador' });

  const handleConfirmRemove = (_reason?: string) => {
    if (!toRemoveUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== toRemoveUser));
    setToRemoveUser(null);
    setConfirmOpen(false);
  };

  const openEditUser = (id: string) => {
    const u = users.find((x) => x.id === id);
    if (!u) return;
    setEditUserId(id);
    setEditForm({ name: u.name, email: u.email, role: u.role });
  };

  const saveEditUser = () => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      toast.error('Preencha nome e email');
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === editUserId ? { ...u, name: editForm.name, email: editForm.email, role: editForm.role } : u)));
    toast.success('Usuário atualizado');
    setEditUserId(null);
  };

  const [selected, setSelected] = useState<Record<PersistKey, boolean>>({
    auth: true,
    ponto: true,
    solicitacoes: true,
    'ajustes-ponto': true,
    okrs: true,
    feedbacks: true,
    mural: true,
    colaboradores: true,
    clientes: true,
    dashboard: true,
    empresa: true,
    reservas: true,
    notificacoes: true,
  });

  const toggleSelect = (k: PersistKey) => setSelected((s) => ({ ...s, [k]: !s[k] }));
  const selectAll = (v: boolean) => setSelected((s) => Object.keys(s).reduce((acc, key) => ({ ...acc, [key]: v }), {} as Record<PersistKey, boolean>));

  const handleConfirmClear = (_reason?: string) => {
    const keys = (Object.keys(selected).filter((k) => selected[k as PersistKey]) as PersistKey[]);
    if (!keys.length) {
      toast('Nenhum store selecionado', { icon: '⚠️' });
      setConfirmClearOpen(false);
      return;
    }
    try {
      resetStores(keys);
      toast.success('Dados restaurados aos mocks.');
    } catch (e) {
      console.error('Erro ao limpar dados:', e);
      toast.error('Falha ao limpar dados. Veja o console.');
    }
    setConfirmClearOpen(false);
  };

  // validate empresa form on save
  const handleSaveEmpresa = () => {
    // mark fields as touched
    setTouchedEmpresa({ nome: true, cnpj: true, cidade: true });
    const errors: string[] = [];
    if (!empresa.nome) errors.push('Nome da empresa é obrigatório.');
    if (!empresa.cnpj) errors.push('CNPJ é obrigatório.');
    else if (!isValidCNPJ(empresa.cnpj)) errors.push('CNPJ inválido.');
    if (!maxLength(empresa.nome, 100)) errors.push('Nome da empresa é muito longo (máx. 100 caracteres).');

    if (errors.length) {
      toast.error('Existem erros no formulário');
      setEmpresaErrors(errors);
      return;
    }

    setEmpresaErrors([]);
    setIsSavingEmpresa(true);
    setTimeout(() => {
      setIsSavingEmpresa(false);
      toast.success('Dados da empresa salvos');
    }, 800);
  };

  const [empresaErrors, setEmpresaErrors] = useState<string[]>([]);

  // validation / touched states for inline errors
  const [touchedEmpresa, setTouchedEmpresa] = useState({ nome: false, cnpj: false, cidade: false });
  const [touchedJornada, setTouchedJornada] = useState({ inicio: false, fim: false });

  return (
    <div className="p-6">
      <Card>
        <h2 className="text-lg font-semibold">Configurações</h2>

        <Tabs
          tabs={[
            { id: 'empresa', label: 'Empresa' },
            { id: 'jornada', label: 'Jornada' },
            { id: 'usuarios', label: 'Usuários' },
            { id: 'permissoes', label: 'Permissões' },
            { id: 'integracoes', label: 'Integrações' },
          ]}
          activeTab={active}
          onTabChange={setActive}
        >
          {active === 'empresa' && (
            <div className="space-y-4 max-w-lg mt-4">
              <FormError errors={empresaErrors} />
              <label className="block text-sm text-gray-600">Nome da empresa</label>
              <Input maxLength={100} aria-label="Nome da empresa" value={empresa.nome} onBlur={() => setTouchedEmpresa({ ...touchedEmpresa, nome: true })} onChange={(e) => setEmpresa({ ...empresa, nome: e.target.value })} aria-invalid={!empresa.nome && touchedEmpresa.nome} />
              {!empresa.nome && touchedEmpresa.nome && <p className="text-xs text-red-500">O nome da empresa é obrigatório.</p>}
              <label className="block text-sm text-gray-600">CNPJ</label>
              <Input
                maxLength={18}
                aria-label="CNPJ"
                mask="cnpj"
                value={empresa.cnpj}
                onBlur={() => setTouchedEmpresa({ ...touchedEmpresa, cnpj: true })}
                onChange={(e) => setEmpresa({ ...empresa, cnpj: (e.target as HTMLInputElement).value })}
                aria-invalid={!empresa.cnpj && touchedEmpresa.cnpj}
              />
              {!empresa.cnpj && touchedEmpresa.cnpj && <p className="text-xs text-red-500">CNPJ é obrigatório.</p>}
              {empresa.cnpj && touchedEmpresa.cnpj && !isValidCNPJ(empresa.cnpj) && <p className="text-xs text-red-500">CNPJ inválido.</p>}
              {empresa.cnpj && touchedEmpresa.cnpj && isValidCNPJ(empresa.cnpj) && <p className="text-xs text-green-600">CNPJ válido.</p>}
              <label className="block text-sm text-gray-600">Cidade</label>
              <Input maxLength={60} aria-label="Cidade" value={empresa.cidade} onBlur={() => setTouchedEmpresa({ ...touchedEmpresa, cidade: true })} onChange={(e) => setEmpresa({ ...empresa, cidade: e.target.value })} />
              <div className="flex gap-3">
                <Button onClick={handleSaveEmpresa} loading={isSavingEmpresa} disabled={!empresa.nome || !empresa.cnpj}>Salvar</Button>
                <Button variant="outline" onClick={() => { setEmpresa({ nome: '', cnpj: '', cidade: '' }); }}>
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {active === 'jornada' && (
            <div className="space-y-4 max-w-lg mt-4">
              <label className="text-sm text-gray-600">Início</label>
              <Input aria-label="Início da jornada" value={jornada.inicio} onBlur={() => setTouchedJornada({ ...touchedJornada, inicio: true })} onChange={(e) => setJornada({ ...jornada, inicio: e.target.value })} aria-invalid={!jornada.inicio && touchedJornada.inicio} />
              {!jornada.inicio && touchedJornada.inicio && <p className="text-xs text-red-500">Informe o horário de início.</p>}
              <label className="text-sm text-gray-600">Fim</label>
              <Input aria-label="Fim da jornada" value={jornada.fim} onBlur={() => setTouchedJornada({ ...touchedJornada, fim: true })} onChange={(e) => setJornada({ ...jornada, fim: e.target.value })} aria-invalid={!jornada.fim && touchedJornada.fim} />
              {!jornada.fim && touchedJornada.fim && <p className="text-xs text-red-500">Informe o horário de término.</p>}
              <label className="text-sm text-gray-600">Intervalo</label>
              <Input aria-label="Intervalo" value={jornada.intervalo} onChange={(e) => setJornada({ ...jornada, intervalo: e.target.value })} />
              <div className="flex gap-3">
                <Button onClick={() => { setIsSavingJornada(true); setTimeout(() => setIsSavingJornada(false), 800); }} loading={isSavingJornada} disabled={!jornada.inicio || !jornada.fim}>Salvar</Button>
              </div>
            </div>
          )}

          {active === 'usuarios' && (
            <div className="mt-4">
              {/* Mobile: cards */}
              <div className="space-y-3 md:hidden">
                {users.map((u) => (
                  <div key={u.id} className="p-4 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-500">{u.role}</div>
                        <div className="font-medium text-gray-800">{u.name}</div>
                        <div className="text-sm text-gray-600">{u.email}</div>
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button variant="ghost" aria-label={`Editar usuário ${u.name}`} onClick={() => openEditUser(u.id)}>Editar</Button>
                        <Button variant="outline" onClick={() => { setToRemoveUser(u.id); setConfirmOpen(true); }} aria-label={`Remover usuário ${u.name}`}>Remover</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="text-left text-sm text-gray-600">
                      <th className="p-2">Nome</th>
                      <th className="p-2">Email</th>
                      <th className="p-2">Cargo</th>
                      <th className="p-2">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-t">
                        <td className="p-2">{u.name}</td>
                        <td className="p-2">{u.email}</td>
                        <td className="p-2">{u.role}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button variant="ghost" aria-label={`Editar usuário ${u.name}`} onClick={() => openEditUser(u.id)}>Editar</Button>
                            <Button variant="outline" onClick={() => { setToRemoveUser(u.id); setConfirmOpen(true); }} aria-label={`Remover usuário ${u.name}`}>Remover</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}


        // Modal simples no final do componente (fora do return principal)
        // Inserido após o export function para manter consistência de arquivo

          {active === 'permissoes' && (
            <div className="mt-4 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Níveis de Acesso</h4>
                <p className="text-sm text-blue-700 mb-3">Configure as permissões por tipo de usuário no sistema.</p>
              </div>

              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-800">Administrador</h5>
                      <p className="text-xs text-gray-600">Acesso total ao sistema, incluindo configurações</p>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">Total</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Gerenciar usuários e permissões</li>
                    <li>✓ Aprovar/rejeitar solicitações</li>
                    <li>✓ Configurar empresa e jornada</li>
                    <li>✓ Editar meta de horas dos colaboradores</li>
                    <li>✓ Acessar relatórios completos</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-800">Gestor / RH</h5>
                      <p className="text-xs text-gray-600">Gerenciamento de equipe e aprovações</p>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded-full">Avançado</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Aprovar/rejeitar solicitações da equipe</li>
                    <li>✓ Visualizar ponto e banco de horas</li>
                    <li>✓ Editar meta de horas dos colaboradores</li>
                    <li>✓ Cadastrar novos colaboradores</li>
                    <li>✗ Configurações de sistema</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-800">Colaborador</h5>
                      <p className="text-xs text-gray-600">Usuário padrão com acesso aos recursos básicos</p>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Padrão</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Registrar ponto</li>
                    <li>✓ Ver próprio banco de horas</li>
                    <li>✓ Criar solicitações (ajuste, atestado, férias, etc)</li>
                    <li>✓ Postar no mural</li>
                    <li>✗ Aprovar solicitações</li>
                    <li>✗ Ver dados de outros colaboradores</li>
                  </ul>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="font-semibold text-gray-800">Visitante</h5>
                      <p className="text-xs text-gray-600">Acesso somente leitura (ex: estagiário, consultor)</p>
                    </div>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">Limitado</span>
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✓ Ver dashboard</li>
                    <li>✓ Visualizar mural</li>
                    <li>✗ Registrar ponto</li>
                    <li>✗ Criar solicitações</li>
                    <li>✗ Postar no mural</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Nota:</strong> As permissões são aplicadas automaticamente com base no role do usuário.
                  Para alterar o nível de acesso, edite o campo "role" na aba Usuários.
                </p>
              </div>
            </div>
          )}

          {active === 'integracoes' && (
            <div className="text-sm text-gray-600 mt-4">Integrações e webhooks (mock)</div>
          )}
        </Tabs>
      </Card>

      <Card className="mt-4">
        <h3 className="text-sm font-medium text-gray-800">Manutenção de dados</h3>
        <p className="text-sm text-gray-600 mt-2">Escolha quais dados persistidos você quer limpar. Os stores selecionados serão restaurados aos dados mock.</p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-3">
            <input id="selectAll" type="checkbox" checked={Object.values(selected).every(Boolean)} onChange={(e) => selectAll(e.target.checked)} />
            <label htmlFor="selectAll" className="text-sm">Selecionar todos</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.auth} onChange={() => toggleSelect('auth')} /> Auth (sessão)</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.ponto} onChange={() => toggleSelect('ponto')} /> Ponto</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.solicitacoes} onChange={() => toggleSelect('solicitacoes')} /> Solicitações</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.okrs} onChange={() => toggleSelect('okrs')} /> OKRs</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.feedbacks} onChange={() => toggleSelect('feedbacks')} /> Feedbacks</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.mural} onChange={() => toggleSelect('mural')} /> Mural</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.colaboradores} onChange={() => toggleSelect('colaboradores')} /> Colaboradores</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.clientes} onChange={() => toggleSelect('clientes')} /> Clientes</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected['ajustes-ponto']} onChange={() => toggleSelect('ajustes-ponto')} /> Ajustes Ponto</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={selected.dashboard} onChange={() => toggleSelect('dashboard')} /> Dashboard</label>
          </div>
          <div className="mt-3">
            <Button variant="outline" className="text-red-600 border-red-200" onClick={() => setConfirmClearOpen(true)} disabled={!Object.values(selected).some(Boolean)}>Limpar dados selecionados</Button>
          </div>
        </div>
      </Card>

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmRemove} title="Remover usuário" />
      <ConfirmModal isOpen={confirmClearOpen} onClose={() => setConfirmClearOpen(false)} onConfirm={handleConfirmClear} title="Limpar dados persistidos" />

      {/* Modal Editar Usuário */}
      <Modal isOpen={!!editUserId} onClose={() => setEditUserId(null)} title="Editar Usuário">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-600">Nome</label>
            <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Perfil</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
            >
              <option value="admin">Administrador</option>
              <option value="gestor">Gestor</option>
              <option value="rh">RH</option>
              <option value="colaborador">Colaborador</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditUserId(null)} fullWidth>Cancelar</Button>
            <Button onClick={saveEditUser} fullWidth>Salvar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
