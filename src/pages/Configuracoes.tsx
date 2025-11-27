import { useState, useRef } from 'react';
import { Settings } from 'lucide-react';
// Card removed: no longer needed after maintenance UI removal
import PageBanner from '../components/ui/PageBanner';
import { Tabs } from '../components/ui/Tabs';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Modal } from '../components/ui/Modal';
// removed resetHelpers import after removing maintenance UI
import { FormError } from '../components/ui/FormError';
import { isValidCNPJ, maxLength } from '../utils/validation';
import toast from 'react-hot-toast';
import { useEmpresaStore } from '../store/empresaStore';
import { useAuthStore } from '../store/authStore';

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

  const { logo, miniLogo, setLogo, setMiniLogo } = useEmpresaStore();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const fileInputRefExpanded = useRef<HTMLInputElement | null>(null);
  const fileInputRefMini = useRef<HTMLInputElement | null>(null);
  const [uploadingExpanded, setUploadingExpanded] = useState(false);
  const [uploadingMini, setUploadingMini] = useState(false);

  const handleExpandedUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Apenas arquivos JPG e PNG são permitidos');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 2MB');
      return;
    }

    setUploadingExpanded(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Max display size for sidebar expanded is 246x55px
        const maxWidth = 246;
        const maxHeight = 55;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (maxHeight / height) * width;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const resizedDataUrl = canvas.toDataURL(file.type);
        setLogo(resizedDataUrl);
        setUploadingExpanded(false);
        toast.success('Logo Sidebar atualizado com sucesso!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleMiniUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Apenas arquivos JPG e PNG são permitidos');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 2MB');
      return;
    }

    setUploadingMini(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Max display size for sidebar collapsed is 32x32px
        const maxSize = 32;
        let width = img.width;
        let height = img.height;

        if (width > maxSize) {
          height = (maxSize / width) * height;
          width = maxSize;
        }
        if (height > maxSize) {
          width = (maxSize / height) * width;
          height = maxSize;
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const resizedDataUrl = canvas.toDataURL(file.type);
        setMiniLogo(resizedDataUrl);
        setUploadingMini(false);
        toast.success('Mini Logo Sidebar atualizado com sucesso!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // validation / touched states for inline errors
  const [touchedEmpresa, setTouchedEmpresa] = useState({ nome: false, cnpj: false, cidade: false });
  const [touchedJornada, setTouchedJornada] = useState({ inicio: false, fim: false });

  return (
    <div className="space-y-6">
      <PageBanner title="Configurações" icon={<Settings size={32} />} />
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
            <div className="space-y-4 max-w-2xl mt-4">
              <FormError errors={empresaErrors} />
              <div className="flex flex-row gap-8 items-start">
                {/* Logo expandida */}
                <div className="flex flex-col items-center w-[260px]">
                  <div className="text-xs text-gray-600 mb-1">Logo Sidebar</div>
                  <div className="h-[55px] w-[246px] bg-white border border-gray-200 flex items-center justify-center p-2 mb-2 rounded">
                    {logo ? (
                      <img src={logo} alt="preview-expanded" className="h-[55px] w-[246px] object-contain" />
                    ) : (
                      <div className="text-xs text-gray-400">Sem logo</div>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => fileInputRefExpanded.current?.click()}
                      className="text-xs px-2 py-1 bg-gray-100 rounded border"
                      disabled={uploadingExpanded}
                    >
                      {uploadingExpanded ? 'Enviando...' : 'Upload'}
                    </button>
                  )}
                  <div className="text-[11px] text-gray-500 mt-2 text-center">Exibição: 246×55 px<br/>PNG/JPG até 2MB</div>
                  <input ref={fileInputRefExpanded} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleExpandedUpload} className="hidden" />
                </div>

                {/* Mini logo */}
                <div className="flex flex-col items-center w-[120px]">
                  <div className="text-xs text-gray-600 mb-1">Mini Logo Sidebar</div>
                  <div className="h-10 w-10 bg-white border border-gray-200 flex items-center justify-center mb-2 rounded">
                    {miniLogo ? (
                      <img src={miniLogo} alt="preview-collapsed" className="h-10 w-10 object-contain rounded" />
                    ) : (
                      <div className="text-xs text-gray-400">—</div>
                    )}
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => fileInputRefMini.current?.click()}
                      className="text-xs px-2 py-1 bg-gray-100 rounded border"
                      disabled={uploadingMini}
                    >
                      {uploadingMini ? 'Enviando...' : 'Upload'}
                    </button>
                  )}
                  <div className="text-[11px] text-gray-500 mt-2 text-center">Exibição: 40×40 px<br/>PNG/JPG até 2MB</div>
                  <input ref={fileInputRefMini} type="file" accept="image/jpeg,image/jpg,image/png" onChange={handleMiniUpload} className="hidden" />
                </div>
              </div>
              
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
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
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

      {/* Manutenção de dados removida */}

      <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleConfirmRemove} title="Remover usuário" />

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
