import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';

const COLUNAS = [
  { id: 'funcao', label: 'Função' },
  { id: 'empresa', label: 'Empresa' },
  { id: 'contrato', label: 'Contrato' },
  { id: 'valor', label: 'Valor' },
  { id: 'adicional', label: 'Adicional' },
  { id: 'reembolso', label: 'Reembolso' },
  { id: 'desconto', label: 'Desconto' },
  { id: 'total', label: 'Total' },
  { id: 'valorTotalSemReembolso', label: 'V. Total s/ Reemb' },
  { id: 'empresas', label: 'Empresas (% e Valores)', group: ['empresa1', 'empresa2', 'empresa3', 'empresa4'] },
  { id: 'situacao', label: 'Situação' },
  { id: 'dataPagamento', label: 'Data Pgto' },
  { id: 'nf', label: 'NF' },
  { id: 'statusNF', label: 'Status NF' },
];

interface PersonalizarColunasModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: string[];
  onChange: (value: string[]) => void;
  temPJ: boolean;
}

export function PersonalizarColunasModal({ isOpen, onClose, value, onChange, temPJ }: PersonalizarColunasModalProps) {
  const [selecionadas, setSelecionadas] = useState<string[]>(value);

  useEffect(() => {
    setSelecionadas(value);
  }, [value, isOpen]);

  function handleToggle(colId: string) {
    const coluna = COLUNAS.find(c => c.id === colId);
    if (coluna && 'group' in coluna && coluna.group) {
      // É uma opção agrupada (empresas)
      const hasAny = coluna.group.some(id => selecionadas.includes(id));
      if (hasAny) {
        // Remove todos os itens do grupo
        setSelecionadas(prev => prev.filter(id => !coluna.group.includes(id)));
      } else {
        // Adiciona todos os itens do grupo
        setSelecionadas(prev => [...prev, ...coluna.group]);
      }
    } else {
      // Opção normal
      setSelecionadas((prev) =>
        prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId]
      );
    }
  }

  function handleSalvar() {
    onChange(selecionadas);
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Personalizar Colunas">
      <div className="space-y-2 mb-6">
        {COLUNAS.filter(c => temPJ || (c.id !== 'nf' && c.id !== 'statusNF')).map(col => {
          const isGroup = 'group' in col && col.group;
          const isChecked = isGroup 
            ? col.group.some((id: string) => selecionadas.includes(id))
            : selecionadas.includes(col.id);
          
          return (
            <label key={col.id} className={`flex items-center gap-2 ${isChecked ? 'text-emerald-700' : 'text-gray-900 dark:text-white'}`}>
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleToggle(col.id)}
                className="form-checkbox"
              />
              {col.label}
            </label>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={handleSalvar} variant="primary">Salvar</Button>
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
      </div>
    </Modal>
  );
}
