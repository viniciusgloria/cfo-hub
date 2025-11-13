import { useState, createElement, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, GripVertical, Eye, EyeOff } from 'lucide-react';
import { Clock, FileText, Calendar, Plus, MessageSquare, Users, Target, MessageCircle, TrendingUp, Briefcase, UsersRound, Settings, Edit3, BarChart, FileBarChart2 } from 'lucide-react';
import { Button } from './ui/Button';

const iconMap: Record<string, any> = {
  Clock,
  Plus,
  Calendar,
  MessageSquare,
  TrendingUp,
  FileText,
  Users,
  Target,
  MessageCircle,
  Briefcase,
  UsersRound,
  Settings,
  Edit3,
  BarChart,
  FileBarChart2,
};

import type { Widget } from '../store/dashboardStore';

interface DashboardCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: Widget[];
  onToggleWidget: (id: string) => void;
  onReorderWidgets: (widgets: Widget[]) => void;
  previewMode?: boolean;
}

export function DashboardCustomizer({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onReorderWidgets,
}: DashboardCustomizerProps) {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, widgetId: string) => {
    setDraggedId(widgetId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', widgetId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedIndex = widgets.findIndex((w) => w.id === draggedId);
    const targetIndex = widgets.findIndex((w) => w.id === targetId);

    const newWidgets = [...widgets];
    const [removed] = newWidgets.splice(draggedIndex, 1);
    newWidgets.splice(targetIndex, 0, removed);

    // Atualizar ordem
    const reorderedWidgets = newWidgets.map((w, idx) => ({ ...w, order: idx }));
    onReorderWidgets(reorderedWidgets);
    setDraggedId(null);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const content = (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        style={{ zIndex: 9998 }}
        onClick={onClose}
      />

      {/* Sidebar à direita */}
      <div 
        className="fixed top-0 right-0 h-screen w-96 bg-white dark:bg-gray-800 shadow-2xl flex flex-col"
        style={{ zIndex: 9999 }}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            Personalizar Dashboard
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {widgets.map((widget, index) => {
              const Icon = iconMap[widget.icon];
              const isDragging = draggedId === widget.id;
              const isVisible = widget.enabled;
              
              return (
                <div key={widget.id} className="relative">
                  {/* Indicador de posição */}
                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                    {index + 1}
                  </div>
                  
                  <div
                    draggable
                    onDragStart={(e: React.DragEvent) => handleDragStart(e, widget.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e: React.DragEvent) => handleDrop(e, widget.id)}
                    className={`ml-6 p-3 cursor-move hover:shadow-lg transition-all bg-white dark:bg-gray-700 border-2 rounded-lg ${
                      isDragging
                        ? 'opacity-30 border-blue-500 scale-95 shadow-xl' 
                        : isVisible
                          ? 'border-green-300 dark:border-green-600 shadow-sm hover:border-green-400'
                          : 'border-gray-200 dark:border-gray-600 opacity-50 hover:opacity-70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <GripVertical
                        size={20}
                        className={`flex-shrink-0 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
                      />
                      <div
                        className={`p-2 ${widget.color} rounded flex-shrink-0 ${!isVisible && 'opacity-50'}`}
                      >
                        {Icon && createElement(Icon, { size: 18, className: 'text-white' })}
                      </div>
                      <span className={`text-sm font-medium flex-1 min-w-0 truncate ${
                        isVisible
                          ? 'text-gray-800 dark:text-gray-100' 
                          : 'text-gray-400 dark:text-gray-500 line-through'
                      }`}>
                        {widget.label}
                      </span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWidget(widget.id);
                        }}
                        className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                          isVisible
                            ? 'hover:bg-red-50 dark:hover:bg-red-900/20 bg-green-50 border border-green-200' 
                            : 'hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200'
                        }`}
                        title={isVisible ? 'Clique para OCULTAR este widget' : 'Clique para MOSTRAR este widget'}
                      >
                        {isVisible ? (
                          <Eye size={18} className="text-green-600" />
                        ) : (
                          <EyeOff size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Indicador de drop zone quando arrastando */}
                  {isDragging && (
                    <div className="absolute inset-0 ml-6 border-2 border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                        Arraste para reposicionar
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} fullWidth>
            Concluir
          </Button>
        </div>
      </div>
    </>
  );

  return createPortal(content, document.body);
}
