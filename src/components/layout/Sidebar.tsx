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
  X
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { NavItem } from '../../types';
import { useEffect, useRef } from 'react';

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: Home },
  { label: 'Ponto', path: '/ponto', icon: Clock },
  { label: 'Solicitações', path: '/solicitacoes', icon: FileText },
  { label: 'OKRs', path: '/okrs', icon: Target },
  { label: 'Feedbacks', path: '/feedbacks', icon: MessageCircle },
  { label: 'Mural', path: '/mural', icon: MessageSquare },
  { label: 'Clientes', path: '/clientes', icon: Users },
  { label: 'Colaboradores', path: '/colaboradores', icon: UserCog },
  { label: 'Configurações', path: '/configuracoes', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const logout = useAuthStore((state) => state.logout);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);

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
        fixed md:static top-0 left-0 h-screen w-[260px] bg-[#1F2937] z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <h1 className="text-white text-xl font-bold">CFO Hub</h1>
            <button
              ref={closeBtnRef}
              onClick={onClose}
              className="md:hidden text-white hover:text-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
            >
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 p-3 rounded-lg transition-all
                  ${isActive
                    ? 'bg-[#10B981]/20 border-l-4 border-[#10B981] text-white'
                    : 'text-gray-300 hover:bg-white/10'
                  }
                `}
                onClick={onClose}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-700">
            <button
              onClick={logout}
              className="flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-white/10 w-full transition-all"
            >
              <LogOut size={20} />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
