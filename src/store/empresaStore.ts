import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EmpresaState {
  logo: string;
  nomeEmpresa: string;
  setLogo: (logo: string) => void;
  setNomeEmpresa: (nome: string) => void;
  reset: () => void;
}

const defaultLogo = '';
const defaultNome = 'CFO Hub';

export const useEmpresaStore = create<EmpresaState>()(
  persist(
    (set) => ({
      logo: defaultLogo,
      nomeEmpresa: defaultNome,
      setLogo: (logo) => set({ logo }),
      setNomeEmpresa: (nome) => set({ nomeEmpresa: nome }),
      reset: () => set({ logo: defaultLogo, nomeEmpresa: defaultNome }),
    }),
    { name: 'cfo:empresa', partialize: (s) => ({ logo: s.logo, nomeEmpresa: s.nomeEmpresa }) }
  )
);
