import React from 'react';
import {
  Settings,
  Plus,
  Minimize2,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Pin,
  Activity,
  Eye,
  CheckCircle,
  Zap,
  Flame,
  Award,
  Palette,
  MinusSquare,
  PlusSquare,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { Column, Card } from '../types';
import KanbanCard from './KanbanCard';

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  onEditColumn: (column: Column) => void;
  onAddCard: (columnId: string) => void;
  onEditCard: (card: Card) => void;
  onToggleCardComplete: (cardId: string) => void;
  onCardDropped: (cardId: string, targetColumnId: string) => void;
  onResizeColumn: (columnId: string, newWidth: number) => void;
  onToggleCollapseColumn: (columnId: string) => void;
  onMoveColumn?: (columnId: string, direction: 'left' | 'right') => void;
  onDeleteColumn?: (columnId: string) => void;
  onUpdateCard?: (updatedCard: Card) => void;
}

const ICONS_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Pin,
  Activity,
  Eye,
  CheckCircle,
  Zap,
  Flame,
  Award,
  Palette
};

export default function KanbanColumn({
  column,
  cards,
  onEditColumn,
  onAddCard,
  onEditCard,
  onToggleCardComplete,
  onCardDropped,
  onResizeColumn,
  onToggleCollapseColumn,
  onMoveColumn,
  onDeleteColumn,
  onUpdateCard
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const HeaderIcon = ICONS_MAP[column.icon || 'Pin'] || Pin;
  const isCollapsed = column.isCollapsed || false;

  // HTML5 Drag over handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const cardId = e.dataTransfer.getData('text/plain');
    if (cardId) {
      onCardDropped(cardId, column.id);
    }
  };

  // Quick resize buttons
  const handleIncreaseWidth = () => {
    onResizeColumn(column.id, Math.min(450, (column.width || 280) + 30));
  };

  const handleDecreaseWidth = () => {
    onResizeColumn(column.id, Math.max(220, (column.width || 280) - 30));
  };

  const getBulletColor = () => {
    const title = column.title.toLowerCase();
    if (title.includes('pendent') || title.includes('backlog') || title.includes('to do')) return 'bg-slate-400 dark:bg-slate-500';
    if (title.includes('andament') || title.includes('progress') || title.includes('ativ')) return 'bg-amber-500';
    if (title.includes('revis') || title.includes('review')) return 'bg-indigo-500';
    if (title.includes('concl') || title.includes('done') || title.includes('complet')) return 'bg-emerald-500';
    return 'bg-indigo-500';
  };

  return (
    <div
      style={{ width: isCollapsed ? 64 : column.width || 280 }}
      className={`flex flex-col h-full shrink-0 transition-all duration-300 ${
        column.borderRadius || 'rounded-xl'
      } ${column.bgClass} ${column.borderClass} ${
        isDragOver
          ? 'ring-2 ring-indigo-500/50 bg-slate-50/90 dark:bg-slate-900/40'
          : ''
      } overflow-hidden border border-slate-200/60 dark:border-slate-800/80 shadow-xs`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      id={`column-${column.id}`}
    >
      
      {/* --- COLLAPSED STATE --- */}
      {isCollapsed ? (
        <div className="flex flex-col items-center py-4 h-full space-y-4 bg-white/80 dark:bg-slate-950/60">
          <button
            onClick={() => onToggleCollapseColumn(column.id)}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md text-slate-400 dark:text-slate-500 cursor-pointer"
            title="Expandir Coluna"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 rotate-90 whitespace-nowrap tracking-widest uppercase">
              {column.title.substring(0, 18)}
            </span>
          </div>

          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {cards.length}
          </span>
        </div>
      ) : (
        /* --- EXPANDED FULL COLUMN --- */
        <>
          {/* Column Header */}
          <div
            className="px-4 py-3 flex items-center justify-between border-b border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className={`w-2.5 h-2.5 rounded-sm shrink-0 ${getBulletColor()}`} />
              <h3 className="text-xs font-bold truncate leading-none uppercase tracking-wider text-slate-800 dark:text-slate-200">
                {column.title}
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                {cards.length}
              </span>
            </div>

            {/* Column controls */}
            <div className="flex items-center gap-1 shrink-0">
              
              {/* Move column arrows */}
              {onMoveColumn && (
                <div className="flex items-center opacity-0 group-hover:opacity-100 hover:opacity-100 focus-within:opacity-100 transition-opacity mr-1 border border-slate-300/40 dark:border-slate-700 rounded-md overflow-hidden bg-white/40 dark:bg-black/10">
                  <button
                    onClick={() => onMoveColumn(column.id, 'left')}
                    className="p-0.5 hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                    title="Mover para Esquerda"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onMoveColumn(column.id, 'right')}
                    className="p-0.5 hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 cursor-pointer"
                    title="Mover para Direita"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Canva Sizing quick controls */}
              <div className="flex items-center opacity-0 group-hover:opacity-100 focus-within:opacity-100 hover:opacity-100 transition-opacity mr-1 border border-slate-300/40 dark:border-slate-700 rounded-md overflow-hidden bg-white/40 dark:bg-black/10">
                <button
                  onClick={handleDecreaseWidth}
                  disabled={(column.width || 280) <= 220}
                  className="p-0.5 hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 disabled:opacity-30 cursor-pointer"
                  title="Diminuir Largura (-30px)"
                >
                  <MinusSquare className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleIncreaseWidth}
                  disabled={(column.width || 280) >= 450}
                  className="p-0.5 hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 disabled:opacity-30 cursor-pointer"
                  title="Aumentar Largura (+30px)"
                >
                  <PlusSquare className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Edit settings gear */}
              <button
                onClick={() => onEditColumn(column)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Personalizar Estilo"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>

              {/* Direct delete column trash button */}
              {onDeleteColumn && (
                <button
                  onClick={() => onDeleteColumn(column.id)}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-950/25 rounded-md text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                  title="Excluir Coluna"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}

              {/* Collapse column button */}
              <button
                onClick={() => onToggleCollapseColumn(column.id)}
                className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Recolher Coluna"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cards Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px]">
            {cards.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center py-8 text-center px-4 border border-dashed border-slate-300/60 dark:border-slate-800 rounded-xl bg-slate-50/20 dark:bg-slate-900/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Vazio
                </p>
                <p className="text-[9px] text-slate-400 mt-0.5">
                  Arraste cartões ou clique em "+" para adicionar.
                </p>
              </div>
            ) : (
              cards.map((card) => (
                <KanbanCard
                  key={card.id}
                  card={card}
                  onEditCard={onEditCard}
                  onToggleComplete={onToggleCardComplete}
                  onUpdateCard={onUpdateCard}
                />
              ))
            )}
          </div>

          {/* Add card button footer */}
          <button
            onClick={() => onAddCard(column.id)}
            className="w-full py-2.5 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-black text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1 cursor-pointer border-t border-black/5 uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Adicionar Cartão
          </button>
        </>
      )}

    </div>
  );
}
