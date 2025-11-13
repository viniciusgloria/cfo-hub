import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onEscolher: (tipo: 'ajuste' | 'atestado') => void;
}

export function EscolhaTipoSolicitacaoModal({ isOpen, onClose, onEscolher }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="O que deseja solicitar?">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
  <Button onClick={() => onEscolher('ajuste')} className="h-24 text-base">Ajuste de Ponto</Button>
  <Button onClick={() => onEscolher('atestado')} variant="outlineContrast" className="h-24 text-base">Inclusão Atestado Médico</Button>
      </div>
    </Modal>
  );
}
