import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, User as UserIcon, Mail, Phone, Briefcase, Building2, Shield, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { useColaboradoresStore } from '../store/colaboradoresStore';
import { useAuthStore } from '../store/authStore';
import { validateEmail, validatePhone, formatPhone } from '../utils/validation';

type UserRole = 'admin' | 'gestor' | 'colaborador' | 'rh';

interface FormData {
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  departamento: string;
  role: UserRole;
  metaHorasMensais: string;
  status: 'ativo' | 'afastado' | 'ferias';
}

export function CadastroUsuario() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = !!editId;

  const { colaboradores, adicionarColaborador, atualizarColaborador } = useColaboradoresStore();
  const { user } = useAuthStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    telefone: '',
    cargo: '',
    departamento: '',
    role: 'colaborador',
    metaHorasMensais: '176',
    status: 'ativo',
  });

  // Verificar permissão
  const podeGerenciarUsuarios = user?.role === 'admin' || user?.role === 'gestor' || user?.role === 'rh';

  useEffect(() => {
    if (!podeGerenciarUsuarios) {
      toast.error('Você não tem permissão para acessar esta página');
      navigate('/dashboard');
      return;
    }

    if (isEdit) {
      const colab = colaboradores.find((c) => c.id === parseInt(editId));
      if (!colab) {
        toast.error('Colaborador não encontrado');
        navigate('/colaboradores');
        return;
      }
      setFormData({
        nome: colab.nome,
        email: colab.email,
        telefone: colab.telefone || '',
        cargo: colab.cargo,
        departamento: colab.departamento,
        role: 'colaborador', // Por padrão, não temos role no Colaborador ainda
        metaHorasMensais: String(colab.metaHorasMensais || 176),
        status: colab.status,
      });
    }
  }, [editId, isEdit, colaboradores, navigate, podeGerenciarUsuarios]);

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.telefone && !validatePhone(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido';
    }

    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
    }

    if (!formData.departamento.trim()) {
      newErrors.departamento = 'Departamento é obrigatório';
    }

    const meta = parseInt(formData.metaHorasMensais, 10);
    if (isNaN(meta) || meta <= 0) {
      newErrors.metaHorasMensais = 'Meta de horas inválida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    if (isEdit) {
      // Atualizar colaborador existente
      atualizarColaborador(parseInt(editId), {
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cargo: formData.cargo,
        departamento: formData.departamento,
        status: formData.status,
        metaHorasMensais: parseInt(formData.metaHorasMensais, 10),
      });
      toast.success('Colaborador atualizado com sucesso!');
    } else {
      // Criar novo colaborador
      adicionarColaborador({
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cargo: formData.cargo,
        departamento: formData.departamento,
        status: formData.status,
        metaHorasMensais: parseInt(formData.metaHorasMensais, 10),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.nome.split(' ')[0]}`,
      });
      toast.success('Colaborador cadastrado com sucesso!');
    }

    navigate('/colaboradores');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Button variant="outlineContrast" onClick={() => navigate('/colaboradores')}>
          <ArrowLeft size={20} />
        </Button>
      </div>
      <PageHeader title={isEdit ? 'Editar Colaborador' : 'Novo Colaborador'} />

      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Dados Pessoais */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <UserIcon size={20} className="text-[#10B981]" />
                Dados Pessoais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => handleChange('nome', e.target.value)}
                    placeholder="Ex: João Silva"
                    className={`w-full px-4 py-2 border ${errors.nome ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                  />
                  {errors.nome && <p className="text-sm text-red-600 mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="joao@empresa.com"
                      className={`w-full pl-10 px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Telefone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={formatPhone(formData.telefone)}
                      onChange={(e) => handleChange('telefone', e.target.value.replace(/\D/g, ''))}
                      placeholder="(11) 98765-4321"
                      maxLength={15}
                      className={`w-full pl-10 px-4 py-2 border ${errors.telefone ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                    />
                  </div>
                  {errors.telefone && <p className="text-sm text-red-600 mt-1">{errors.telefone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Status
                  </label>
                  <Select
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value as 'ativo' | 'afastado' | 'ferias')}
                    className="w-full px-4 py-2"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="ferias">Férias</option>
                    <option value="afastado">Afastado</option>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dados Profissionais */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Briefcase size={20} className="text-[#3B82F6]" />
                Dados Profissionais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Cargo *
                  </label>
                  <input
                    type="text"
                    value={formData.cargo}
                    onChange={(e) => handleChange('cargo', e.target.value)}
                    placeholder="Ex: Analista de RH"
                    className={`w-full px-4 py-2 border ${errors.cargo ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                  />
                  {errors.cargo && <p className="text-sm text-red-600 mt-1">{errors.cargo}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Departamento *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Select
                      value={formData.departamento}
                      onChange={(e) => handleChange('departamento', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 ${
                        errors.departamento ? 'border-red-500' : 'border-gray-300'
                      } rounded-lg`}
                    >
                      <option value="">Selecione...</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="RH">RH</option>
                      <option value="Tech">Tech</option>
                      <option value="BI">BI</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Operações">Operações</option>
                      <option value="Marketing">Marketing</option>
                    </Select>
                  </div>
                  {errors.departamento && <p className="text-sm text-red-600 mt-1">{errors.departamento}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Meta de Horas Mensais *
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="number"
                      value={formData.metaHorasMensais}
                      onChange={(e) => handleChange('metaHorasMensais', e.target.value)}
                      placeholder="176"
                      min="1"
                      className={`w-full pl-10 px-4 py-2 border ${errors.metaHorasMensais ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-[#10B981] focus:border-transparent`}
                    />
                  </div>
                  {errors.metaHorasMensais && <p className="text-sm text-red-600 mt-1">{errors.metaHorasMensais}</p>}
                  <p className="text-xs text-gray-500 dark:text-white mt-1">Horas de trabalho esperadas por mês</p>
                </div>
              </div>
            </div>

            {/* Permissões e Acesso */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Shield size={20} className="text-[#8B5CF6]" />
                Permissões e Acesso
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                    Nível de Acesso
                  </label>
                  <Select
                    value={formData.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full px-4 py-2"
                    disabled={user?.role !== 'admin'}
                  >
                    <option value="colaborador">Colaborador - Acesso Padrão</option>
                    <option value="gestor">Gestor - Acesso Avançado</option>
                    <option value="rh">RH - Acesso Avançado</option>
                    <option value="admin">Administrador - Acesso Total</option>
                  </Select>
                  {user?.role !== 'admin' && (
                    <p className="text-xs text-amber-600 mt-1">
                      Apenas administradores podem alterar o nível de acesso
                    </p>
                  )}
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-white">
                      <strong>Colaborador:</strong> Registrar ponto, solicitar férias, visualizar informações próprias.
                      <br />
                      <strong>Gestor/RH:</strong> Todos os recursos do colaborador + aprovar solicitações, visualizar relatórios da equipe.
                      <br />
                      <strong>Administrador:</strong> Acesso total ao sistema, incluindo configurações e gerenciamento de usuários.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="pt-6 border-t border-gray-200 flex items-center gap-3">
              <Button type="submit" className="flex items-center gap-2">
                <Save size={18} />
                {isEdit ? 'Salvar Alterações' : 'Cadastrar Colaborador'}
              </Button>
              <Button type="button" variant="outlineContrast" onClick={() => navigate('/colaboradores')}>
                Cancelar
              </Button>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
