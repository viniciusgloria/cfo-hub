import { LucideIcon } from 'lucide-react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'gestor' | 'colaborador' | 'rh';
  avatar: string;
}

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface Attachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  /** Data URL (base64) used for persistent previews */
  dataUrl: string;
  /** Simulated remote URL returned by the mock upload */
  remoteUrl: string;
}
