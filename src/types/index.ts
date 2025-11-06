import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gestor' | 'colaborador';
  avatar: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}
