import { useAuthStore } from './authStore';
import { usePontoStore } from './pontoStore';
import { useSolicitacoesStore } from './solicitacoesStore';
import { useOKRsStore } from './okrsStore';
import { useFeedbacksStore } from './feedbacksStore';
import { useMuralStore } from './muralStore';
import { useColaboradoresStore } from './colaboradoresStore';
import { useClientesStore } from './clientesStore';

export type PersistKey =
  | 'auth'
  | 'ponto'
  | 'solicitacoes'
  | 'okrs'
  | 'feedbacks'
  | 'mural'
  | 'colaboradores'
  | 'clientes';

export const persistKeyMap: Record<PersistKey, string> = {
  auth: 'cfo:auth',
  ponto: 'cfo:ponto',
  solicitacoes: 'cfo:solicitacoes',
  okrs: 'cfo:okrs',
  feedbacks: 'cfo:feedbacks',
  mural: 'cfo:mural',
  colaboradores: 'cfo:colaboradores',
  clientes: 'cfo:clientes',
};

export function resetStores(keys: PersistKey[]) {
  if (keys.length === 0) return;
  keys.forEach((k) => {
    try {
      switch (k) {
        case 'auth':
          useAuthStore.getState().reset?.();
          break;
        case 'ponto':
          usePontoStore.getState().reset?.();
          break;
        case 'solicitacoes':
          useSolicitacoesStore.getState().reset?.();
          break;
        case 'okrs':
          useOKRsStore.getState().reset?.();
          break;
        case 'feedbacks':
          useFeedbacksStore.getState().reset?.();
          break;
        case 'mural':
          useMuralStore.getState().reset?.();
          break;
        case 'colaboradores':
          useColaboradoresStore.getState().reset?.();
          break;
        case 'clientes':
          useClientesStore.getState().reset?.();
          break;
      }
    } catch (e) {
      // swallow - caller should handle reporting
      // console.error('resetStores error for', k, e);
    }
    // remove persisted key so hydrate doesn't bring old data back
    const storageKey = persistKeyMap[k];
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      /* ignore */
    }
  });
}

export function resetAll() {
  resetStores(Object.keys(persistKeyMap) as PersistKey[]);
}
