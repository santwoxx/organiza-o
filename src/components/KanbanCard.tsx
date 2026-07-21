import React from 'react';
import { Calendar, Clock, AlertTriangle, CheckSquare, Edit3, ArrowRight, CheckCircle2, Paperclip, Link2, FileText, ExternalLink, Repeat, Flame } from 'lucide-react';
import { Card, Priority } from '../types';
import { isDoneToday, getStreak } from '../utils/recurring';

interface KanbanCardProps {
  card: Card;
  onEditCard: (card: Card) => void;
  onToggleComplete: (cardId: string) => void;
  onUpdateCard?: (updatedCard: Card) => void;
}

export default function KanbanCard({
  card,
  onEditCard,
  onToggleComplete,
  onUpdateCard
}: KanbanCardProps) {
  const [isDragging, setIsDragging] = React.useState(false);

  const getPriorityBadge = (p: Priority) => {
    const styles = {
      low: 'bg-slate-50 text-slate-500 border-slate-200/60 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800',
      medium: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
      high: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-red-950/30 dark:text-rose-400 dark:border-red-900/40 font-bold'
    };

    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta'
    };

    return (
      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded border ${styles[p]}`}>
        {labels[p]}
      </span>
    );
  };

  const getCompanyColor = (companyName: string) => {
    switch (companyName) {
      case 'Nexus Tech': return 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30';
      case 'Aurora Alimentos': return 'bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
      case 'Studio Criativo': return 'bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400 border border-purple-100 dark:border-purple-900/30';
      case 'CoopeRibeirão': return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
      default: return 'bg-slate-50 text-slate-500 dark:bg-slate-900 dark:text-slate-400 border border-slate-100 dark:border-slate-800';
    }
  };

  // Demandas recorrentes usam "feito hoje" em vez de "concluído para sempre"
  const recurring = !!card.isRecurring;
  const doneToday = recurring ? isDoneToday(card.lastCompletedDate) : card.completed;
  const streak = recurring ? getStreak(card.completedDates) : 0;

  // Check if deadline is overdue
  const isOverdue = () => {
    if (!card.dueDate || doneToday) return false;
    return new Date(card.dueDate) < new Date();
  };

  // Check if deadline is close (less than 24 hours)
  const isDueSoon = () => {
    if (!card.dueDate || doneToday || isOverdue()) return false;
    const diff = new Date(card.dueDate).getTime() - new Date().getTime();
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const completedSubtasks = card.subtasks.filter(s => s.completed).length;
  const totalSubtasks = card.subtasks.length;
  const subtasksPercentage = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`group relative bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing p-4 select-none ${
        doneToday ? 'opacity-70 border-dashed bg-slate-50/50 dark:bg-slate-950/10' : ''
      } ${card.customBg || ''} ${isDragging ? 'opacity-40 ring-2 ring-indigo-500 scale-95' : ''}`}
      id={`card-${card.id}`}
    >

      {/* Top badges bar */}
      <div className="flex items-center justify-between gap-1.5 mb-2.5">
        <div className="flex items-center gap-1 min-w-0">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md truncate ${getCompanyColor(card.companyName)}`}>
            {card.companyName}
          </span>
          {recurring && (
            <span
              className="flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-violet-50 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400 shrink-0"
              title={`Demanda recorrente (diária)${streak > 0 ? ` — ${streak} dia(s) em sequência` : ''}`}
            >
              <Repeat className="w-2.5 h-2.5" />
              {streak > 0 && (
                <span className="flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5" />{streak}
                </span>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {getPriorityBadge(card.priority)}
          <button
            onClick={() => onToggleComplete(card.id)}
            className={`p-1 rounded-md transition-colors cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${
              doneToday ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'
            }`}
            title={
              recurring
                ? (doneToday ? 'Feito hoje — clique para desmarcar' : 'Marcar como feito hoje')
                : (card.completed ? 'Reabrir tarefa' : 'Marcar como concluída')
            }
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Card title & Description */}
      <div className="text-left space-y-1">
        <h4 className={`text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ${
          doneToday ? 'line-through text-slate-400 dark:text-slate-500' : ''
        }`}>
          {card.title}
        </h4>
        {card.description && (
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {card.description}
          </p>
        )}
      </div>

      {/* Interactive Subtasks checklist view */}
      {totalSubtasks > 0 && (
        <div className="mt-3.5 space-y-1.5 pt-1 text-left">
          <div className="flex items-center justify-between text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-indigo-500" /> Checklist
            </span>
            <span>{completedSubtasks}/{totalSubtasks}</span>
          </div>
          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                doneToday || subtasksPercentage === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${subtasksPercentage}%` }}
            />
          </div>
          
          {/* Quick interactive subtasks checkboxes */}
          <div className="space-y-1 pt-1 max-h-24 overflow-y-auto pr-0.5">
            {card.subtasks.map((sub) => (
              <div
                key={sub.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!onUpdateCard) return;
                  const updated = card.subtasks.map(s => s.id === sub.id ? { ...s, completed: !s.completed } : s);
                  onUpdateCard({ ...card, subtasks: updated });
                }}
                className="flex items-center gap-2 py-0.5 px-1 hover:bg-black/[0.03] dark:hover:bg-white/[0.03] rounded-md transition-colors cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={sub.completed}
                  onChange={() => {}} // handled by parent div onClick
                  className="rounded text-indigo-600 focus:ring-indigo-500/30 w-3 h-3 shrink-0 cursor-pointer pointer-events-none"
                />
                <span className={`text-[10px] truncate ${
                  sub.completed ? 'line-through text-slate-400 dark:text-slate-500 font-medium' : 'text-slate-600 dark:text-slate-300 font-medium'
                }`}>
                  {sub.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Card Attachments Row */}
      {card.attachments && card.attachments.length > 0 && (
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-850 space-y-1 text-left">
          <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Paperclip className="w-3 h-3 text-slate-400" /> Anexos ({card.attachments.length})
          </span>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            {card.attachments.map((att) => (
              <a
                key={att.id}
                href={att.url}
                target="_blank"
                rel="referrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 text-[9px] font-bold px-2 py-0.5 rounded-lg bg-slate-50 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 dark:bg-slate-950/40 dark:hover:bg-slate-800 border border-slate-200/50 dark:border-slate-800 transition-colors max-w-full truncate cursor-pointer"
                title={att.name}
              >
                {att.type === 'link' ? (
                  <Link2 className="w-2.5 h-2.5 text-indigo-500" />
                ) : (
                  <FileText className="w-2.5 h-2.5 text-emerald-500" />
                )}
                <span className="truncate max-w-[80px]">{att.name}</span>
                {att.url !== '#' && <ExternalLink className="w-2 h-2 opacity-50" />}
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Card footer: Due dates & Edit Action */}
      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
        
        {/* Deadline indicators */}
        <div>
          {card.dueDate ? (
            <div className={`flex items-center gap-1 text-[9px] font-bold ${
              doneToday
                ? 'text-slate-400'
                : isOverdue()
                ? 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-1.5 py-0.5 rounded-md animate-pulse'
                : isDueSoon()
                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded-md'
                : 'text-slate-500 dark:text-slate-400'
            }`}>
              {isOverdue() ? (
                <AlertTriangle className="w-3.5 h-3.5" />
              ) : (
                <Clock className="w-3 h-3" />
              )}
              <span>{formatDate(card.dueDate)}</span>
            </div>
          ) : (
            <span className="text-[9px] font-semibold text-slate-400">Sem prazo</span>
          )}
        </div>

        {/* Edit Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEditCard(card);
          }}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-md transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
          title="Editar Cartão"
        >
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
}
