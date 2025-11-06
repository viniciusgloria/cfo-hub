import { Bell, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Avatar } from '../Avatar';

interface HeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export function Header({ title, onMenuClick }: HeaderProps) {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-16 bg-white shadow-sm fixed top-0 right-0 left-0 md:left-[260px] z-30">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="md:hidden text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-600 hover:text-gray-900 transition-colors">
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              3
            </span>
          </button>

          <div className="flex items-center gap-3">
            <Avatar src={user?.avatar} alt={user?.name} className="w-9 h-9 border-2 border-gray-200" />
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
