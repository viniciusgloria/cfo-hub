import { useState } from 'react';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { useAttachmentUploader } from '../hooks/useAttachmentUploader';
import toast from 'react-hot-toast';
import { useAjustesPontoStore } from '../store/ajustesPontoStore';
import { useAuthStore } from '../store/authStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: string;
}

export function AtestadoModal({ isOpen, onClose, data }: Props) {
  const { user } = useAuthStore();
  const { adicionar } = useAjustesPontoStore();
  const [motivo, setMotivo] = useState('');
  const {
    attachments,
    readyAttachments,
    handleFiles,
    removeAttachment,
    reset,
    isUploading,
    hasError,
  } = useAttachmentUploader();

  const handleSubmit = () => {
    if (!motivo.trim()) {
      toast.error('Descreva o motivo/observação');
      return;
    }
    if (isUploading) {
      toast.error('Aguarde o envio dos anexos.');
      return;
    }

    adicionar({
      colaboradorEmail: user?.email || 'desconhecido',
      colaboradorNome: user?.name || 'Desconhecido',
      data,
      tipo: 'atestado',
      motivo,
      anexos: readyAttachments,
    });
    toast.success('Atestado enviado para análise');
    setMotivo('');
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Inclusão de Atestado Médico">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Data</label>
          <input type="text" value={data} disabled className="bg-white text-gray-900 border border-gray-300 rounded-lg px-3 py-2 dark:modal-accent-field w-full" />
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Anexos (foto/PDF)</label>
          <input
            type="file"
            multiple
            onChange={(e) => {
              const files = e.target.files;
              if (files) {
                handleFiles(files);
                (e.target as HTMLInputElement).value = '';
              }
            }}
          />
          {attachments.length > 0 && (
            <ul className="mt-2 text-sm text-gray-600 space-y-1">
              {attachments.map((a) => (
                <li key={a.id} className="flex items-center justify-between">
                  <span className="truncate max-w-[220px]" title={a.name}>{a.name}</span>
                  <button type="button" className="text-red-600 text-xs" onClick={() => removeAttachment(a.id)}>remover</button>
                </li>
              ))}
            </ul>
          )}
          {hasError && <p className="text-xs text-red-600 mt-1">Alguns anexos falharam. Remova-os antes de enviar.</p>}
          {isUploading && <p className="text-xs text-gray-500 mt-1">Enviando anexos...</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-white mb-1">Observação</label>
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg resize-none bg-white text-gray-900 border border-gray-300 dark:modal-accent-field"
            placeholder="Ex: Retorno médico com atestado anexo."
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} fullWidth>Cancelar</Button>
          <Button onClick={handleSubmit} fullWidth disabled={!motivo.trim() || isUploading || hasError}>Enviar</Button>
        </div>
      </div>
    </Modal>
  );
}
