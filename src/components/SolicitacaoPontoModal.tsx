import { useState } from 'react';
// X not needed; Modal handles close button
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import toast from 'react-hot-toast';
import { useAjustesPontoStore } from '../store/ajustesPontoStore';
import { useAuthStore } from '../store/authStore';

interface SolicitacaoPontoModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: string;
  tipo: 'ajuste' | 'justificativa';
}

export function SolicitacaoPontoModal({ isOpen, onClose, data, tipo }: SolicitacaoPontoModalProps) {
  const [horario, setHorario] = useState('');
  const [alvo, setAlvo] = useState<'entrada' | 'saida'>('entrada');
  const [motivo, setMotivo] = useState('');
  const { adicionar } = useAjustesPontoStore();
  const { user } = useAuthStore();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (tipo === 'ajuste' && !horario) {
      toast.error('Informe o horário correto');
      return;
    }
    
    if (!motivo.trim()) {
      toast.error('Descreva o motivo da solicitação');
      return;
    }

    if (tipo === 'ajuste') {
      adicionar({
        colaboradorEmail: user?.email || 'desconhecido',
        colaboradorNome: user?.name || 'Desconhecido',
        data,
        tipo: 'ajuste',
        alvo,
        horarioNovo: horario,
        motivo,
      });
      toast.success('Solicitação de ajuste enviada!');
    } else {
      toast.success('Justificativa enviada!');
    }
    onClose();
    setHorario('');
    setMotivo('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tipo === 'ajuste' ? 'Solicitar Ajuste de Ponto' : 'Justificar Falta/Atraso'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Data</label>
          <input
            type="text"
            value={data}
            disabled
            className="modal-accent-field w-full"
          />
        </div>

          {tipo === 'ajuste' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">O que deseja ajustar?</label>
              <div className="flex gap-3 mb-3">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-white">
                  <input type="radio" name="alvo" value="entrada" checked={alvo === 'entrada'} onChange={() => setAlvo('entrada')} />
                  Entrada
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-white">
                  <input type="radio" name="alvo" value="saida" checked={alvo === 'saida'} onChange={() => setAlvo('saida')} />
                  Saída
                </label>
              </div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Horário Correto</label>
              <input
                type="time"
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg dark:modal-accent-field"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">Motivo/Justificativa</label>
            <textarea
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              rows={4}
              placeholder={tipo === 'ajuste' 
                ? 'Ex: Esqueci de registrar a saída no horário correto...'
                : 'Ex: Consulta médica urgente...'
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none dark:modal-accent-field"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              fullWidth
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
            >
              Enviar Solicitação
            </Button>
          </div>
        </form>
    </Modal>
  );
}
