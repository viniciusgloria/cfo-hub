import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Check } from 'lucide-react';

interface ImportRow {
  index: number;
  raw: any;
  suggestedId?: number | string;
  selectedId?: number | string | 'new' | null;
}

interface ImportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  rows: ImportRow[];
  colaboradores: any[];
  onConfirm: (rows: ImportRow[]) => void;
}

export function ImportPreviewModal({ isOpen, onClose, rows, colaboradores, onConfirm }: ImportPreviewModalProps) {
  const [localRows, setLocalRows] = useState<ImportRow[]>(rows);

  React.useEffect(() => setLocalRows(rows), [rows]);

  const handleSelect = (idx: number, value: string) => {
    setLocalRows(prev => prev.map(r => r.index === idx ? { ...r, selectedId: value === 'new' ? 'new' : (value ? (isNaN(Number(value)) ? value : Number(value)) : null) } : r));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pré-visualização de Importação">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">Revise as linhas importadas e associe cada uma a um colaborador existente ou selecione "Criar novo".</p>

        <div className="max-h-64 overflow-auto border rounded p-2 bg-white dark:bg-gray-800">
          {localRows.map((r) => (
            <div key={r.index} className="grid grid-cols-12 gap-2 items-center py-2 border-b last:border-b-0">
              <div className="col-span-1 text-sm text-gray-600">#{r.index + 1}</div>
              <div className="col-span-3 text-sm text-gray-900">{r.raw.colaborador}</div>
              <div className="col-span-3 text-sm text-gray-700">{r.raw.funcao}</div>
              <div className="col-span-2 text-sm text-gray-700">{r.raw.empresa}</div>
              <div className="col-span-1">
                {(() => {
                  const suggested = colaboradores.find(c => String(c.id) === String(r.suggestedId));
                  if (suggested) {
                    return (
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Sugestão: {suggested.nomeCompleto}
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>
              <div className="col-span-2">
                <select
                  className="w-full px-2 py-1 border rounded bg-white dark:bg-gray-800 text-sm"
                  value={r.selectedId ?? ''}
                  onChange={(e) => handleSelect(r.index, e.target.value)}
                >
                  <option value="">(Não associado)</option>
                  {r.suggestedId != null && <option value={String(r.suggestedId)}>Sugestão: {String(r.suggestedId)}</option>}
                  <option value="new">Criar novo</option>
                  <optgroup label="Colaboradores existentes">
                    {colaboradores.map(c => (
                      <option key={c.id} value={String(c.id)}>{c.nomeCompleto || c.nome}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button onClick={() => onConfirm(localRows)} variant="primary">
            <Check className="w-4 h-4 mr-2 inline" />
            Confirmar Importação
          </Button>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </Modal>
  );
}
