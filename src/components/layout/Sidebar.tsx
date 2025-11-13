import {
  Home,
  Clock,
  FileText,
  Target,
  MessageCircle,
  MessageSquare,
  Users,
  UserCog,
  Settings,
  LogOut,
  X,
  ClipboardCheck,
  Upload,
  BarChart,
  Calendar,
  Award
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useEmpresaStore } from '../../store/empresaStore';
import { NavItem } from '../../types';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

const navItems: NavItem[] = [
  { label: 'Avaliações', path: '/avaliacoes', icon: Award },
  { label: 'Calendário', path: '/calendario', icon: Calendar },
  { label: 'Chat', path: '/chat', icon: MessageSquare },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Colaboradores', path: '/colaboradores', icon: UserCog },
  { label: 'Configurações', path: '/configuracoes', icon: Settings },
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Feedbacks', path: '/feedbacks', icon: MessageCircle },
  { label: 'Mural', path: '/mural', icon: MessageSquare },
  { label: 'OKRs', path: '/okrs', icon: Target },
  { label: 'Ponto', path: '/ponto', icon: Clock },
  { label: 'Relatórios', path: '/relatorios', icon: BarChart },
  { label: 'Solicitações', path: '/solicitacoes', icon: FileText },
].sort((a, b) => a.label.localeCompare(b.label));

const navItemsGestor: NavItem[] = [
  { label: 'Aprovações Ponto', path: '/solicitacoes-ponto', icon: ClipboardCheck },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  collapsed?: boolean; // desktop collapsed (icons only)
  onToggleCollapse?: () => void;
}

export function Sidebar({ isOpen = true, onClose, collapsed = false, onToggleCollapse }: SidebarProps) {
  const { logout, user } = useAuthStore();
  const { logo, nomeEmpresa, setLogo } = useEmpresaStore();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  
  const isGestor = user?.role === 'admin' || user?.role === 'gestor' || user?.role === 'rh';
  const isAdmin = user?.role === 'admin';

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      toast.error('Apenas arquivos JPG e PNG são permitidos');
      return;
    }

    // Validar tamanho (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('O arquivo deve ter no máximo 2MB');
      return;
    }

    setUploadingLogo(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Criar canvas para redimensionar
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Definir tamanho máximo (largura 200px, altura proporcional)
        const maxWidth = 200;
        const maxHeight = 60;
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
        setUploadingLogo(false);
        toast.success('Logo atualizado com sucesso!');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (!isOpen) return;

    // trap basic focus to close button when opened on small screens
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        // focus trap: keep focus inside the panel when open
        const panel = panelRef.current;
        if (!panel) return;
        const focusable = Array.from(
          panel.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', onKey);

    // focus the close button for mobile keyboard users
    const focusTimer = window.setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);

    return () => {
      window.removeEventListener('keydown', onKey);
      window.clearTimeout(focusTimer);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        ref={panelRef}
        role={isOpen && onClose ? 'dialog' : undefined}
        aria-modal={isOpen && onClose ? 'true' : undefined}
        aria-label={isOpen && onClose ? 'Menu de navegação' : undefined}
        className={`
  fixed md:static top-0 left-0 h-screen ${collapsed ? 'w-[72px]' : 'w-[260px]'} bg-white dark:bg-gray-800 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
          <div className={`p-4 flex items-center ${collapsed ? 'justify-center' : 'justify-between'} transition-all`}>
            <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3 flex-1'} w-full`}>
              {logo ? (
                <img
                  src={logo}
                  alt={nomeEmpresa}
                  className={`${collapsed ? 'h-8 w-8 object-contain rounded' : 'max-h-12 max-w-[160px] object-contain'} transition-all`}
                />
              ) : (
                !collapsed && <h1 className="text-gray-800 dark:text-white text-xl font-bold">{nomeEmpresa}</h1>
              )}
              {!collapsed && isAdmin && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors p-1 rounded"
                  title="Alterar logo"
                  disabled={uploadingLogo}
                >
                  <Upload size={16} />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            {/* Mobile close */}
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="md:hidden ml-2 text-gray-600 dark:text-white hover:text-gray-800 dark:hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
            >
              <X size={24} />
            </button>
            {/* Desktop collapse toggle */}
            <button
              onClick={onToggleCollapse}
              className="hidden md:inline-flex ml-2 p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
              title={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {collapsed ? (
                  // Ícone expandir (setas para direita)
                  <>
                    <polyline points="13 17 18 12 13 7" />
                    <polyline points="6 17 11 12 6 7" />
                  </>
                ) : (
                  // Ícone colapsar (setas para esquerda)
                  <>
                    <polyline points="11 17 6 12 11 7" />
                    <polyline points="18 17 13 12 18 7" />
                  </>
                )}
              </svg>
            </button>
          </div>

          <nav className={`flex-1 px-3 ${collapsed ? 'space-y-1' : 'p-4 space-y-2'} transition-all`} data-tour="menu">
            {navItems.map((item) => {
              const getTourAttr = () => {
                if (item.path === '/ponto') return 'ponto';
                if (item.path === '/solicitacoes') return 'solicitacoes';
                if (item.path === '/okrs') return 'okrs';
                if (item.path === '/feedbacks') return 'feedbacks';
                return undefined;
              };
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  data-tour={getTourAttr()}
                  title={item.label}
                  className={({ isActive }) => `
                    group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-all relative
                    ${isActive
                      ? 'bg-[#10B981]/20 border-l-4 border-[#10B981] text-gray-800 dark:text-white font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                    }
                  `}
                  onClick={onClose}
                >
                  <item.icon size={collapsed ? 28 : 22} />
                  {!collapsed && <span className="font-medium">{item.label}</span>}
                </NavLink>
              );
            })}
            
            {isGestor && (
              <>
                <div className="my-3 border-t border-gray-700" />
                {navItemsGestor.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    title={item.label}
                    className={({ isActive }) => `
                      group flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg transition-all
                      ${isActive
                        ? 'bg-[#10B981]/20 border-l-4 border-[#10B981] text-gray-800 dark:text-white font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                      }
                    `}
                    onClick={onClose}
                  >
                    <item.icon size={collapsed ? 28 : 22} />
                    {!collapsed && <span className="font-medium">{item.label}</span>}
                  </NavLink>
                ))}
              </>
            )}
          </nav>
          <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${collapsed ? 'flex justify-center' : ''}`}>
            <button
              onClick={logout}
              className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'} p-3 rounded-lg text-red-500 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-white/10 w-full transition-all`}
              title={collapsed ? "Sair" : undefined}
            >
              <LogOut size={20} />
              {!collapsed && <span className="font-medium">Sair</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
