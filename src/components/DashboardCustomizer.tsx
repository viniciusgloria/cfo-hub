import { useState, createElement, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, GripVertical, Eye, EyeOff } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragCancelEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  const [activeId, setActiveId] = useState<string | null>(null);

  // sensors for mouse and touch (touch support)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  function SortableItem({ id, widget, index }: { id: string; widget: Widget; index: number }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.4 : 1,
      zIndex: isDragging ? 1000 : 'auto',
    } as React.CSSProperties;

    return (
      <div ref={setNodeRef} style={style} className="relative">
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
          {index + 1}
        </div>

        <div
          className={`ml-6 p-3 cursor-move hover:shadow-lg transition-all bg-white dark:bg-gray-700 border-2 rounded-lg ${
            widget.enabled ? 'border-green-300 dark:border-green-600 shadow-sm hover:border-green-400' : 'border-gray-200 dark:border-gray-600 opacity-50 hover:opacity-70'
          }`}
        >
          <div className="flex items-center gap-3">
            <span {...attributes} {...listeners} className={`flex-shrink-0 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}>
              <GripVertical size={20} />
            </span>
            <div className={`p-2 ${widget.color} rounded flex-shrink-0 ${!widget.enabled && 'opacity-50'}`}>
              {createElement(iconMap[widget.icon], { size: 18, className: 'text-white' })}
            </div>
            <span className={`text-sm font-medium flex-1 min-w-0 truncate ${widget.enabled ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500 line-through'}`}>
              {widget.label}
            </span>

            <button
              onClick={(e) => { e.stopPropagation(); onToggleWidget(widget.id); }}
              className={`p-2 rounded-lg transition-all flex-shrink-0 ${
                widget.enabled ? 'hover:bg-red-50 dark:hover:bg-red-900/20 bg-green-50 border border-green-200' : 'hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200'
              }`}
              title={widget.enabled ? 'Clique para OCULTAR este widget' : 'Clique para MOSTRAR este widget'}
            >
              {widget.enabled ? <Eye size={18} className="text-green-600" /> : <EyeOff size={18} className="text-gray-400" />}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDragStartDnd = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragEndDnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId !== overId) {
      const oldIndex = widgets.findIndex((w) => w.id === activeId);
      const newIndex = widgets.findIndex((w) => w.id === overId);
      if (oldIndex === -1 || newIndex === -1) return;
      const next = arrayMove(widgets, oldIndex, newIndex);
      const reorderedWidgets = next.map((w, idx) => ({ ...w, order: idx }));
      onReorderWidgets(reorderedWidgets);
    }
  };

  const handleDragCancel = (_e: DragCancelEvent) => {
    setActiveId(null);
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStartDnd}
            onDragEnd={handleDragEndDnd}
            onDragCancel={handleDragCancel}
          >
            <SortableContext items={widgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {widgets.map((widget, index) => (
                  <SortableItem key={widget.id} id={widget.id} widget={widget} index={index} />
                ))}
              </div>
            </SortableContext>

            <DragOverlay dropAnimation={{ duration: 120 }}>
              {activeId ? (
                (() => {
                  const activeWidget = widgets.find((w) => w.id === activeId);
                  if (!activeWidget) return null;
                  return (
                    <div className="ml-6 p-3 cursor-move bg-white dark:bg-gray-700 border-2 rounded-lg shadow-xl" style={{ width: '100%' }}>
                      <div className="flex items-center gap-3">
                        <GripVertical size={20} className="text-blue-500" />
                        <div className={`p-2 ${activeWidget.color} rounded flex-shrink-0`}>
                          {createElement(iconMap[activeWidget.icon], { size: 18, className: 'text-white' })}
                        </div>
                        <span className="text-sm font-medium flex-1 min-w-0 truncate text-gray-800 dark:text-gray-100">{activeWidget.label}</span>
                      </div>
                    </div>
                  );
                })()
              ) : null}
            </DragOverlay>
          </DndContext>
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
