import { Company, Board, Column, Card } from './types';

export const INITIAL_COMPANIES: Company[] = [
  { id: 'all', name: 'Todas as Empresas', color: 'indigo', tagline: 'Visão Geral do Workspace' }
];

export const INITIAL_BOARDS: Board[] = [
  {
    id: 'board-general',
    name: 'Workspace Unificado',
    companyName: 'Todas as Empresas',
    description: 'Painel centralizado de fluxo para gerenciar as demandas em uma única tela.',
    color: 'indigo'
  }
];

export const getInitialColumns = (boardId: string): Column[] => {
  const commonCols = [
    {
      id: `${boardId}-col-pending`,
      boardId,
      title: 'Pendente 📌',
      order: 0,
      width: 290,
      borderRadius: 'rounded-xl' as const,
      bgClass: 'bg-slate-50/90 dark:bg-slate-900/40',
      headerBgClass: 'bg-slate-100 dark:bg-slate-800',
      borderClass: 'border border-slate-200/80 dark:border-slate-800',
      textColor: 'text-slate-800 dark:text-slate-200',
      icon: 'Pin'
    },
    {
      id: `${boardId}-col-progress`,
      boardId,
      title: 'Em Andamento ⚡',
      order: 1,
      width: 300,
      borderRadius: 'rounded-xl' as const,
      bgClass: 'bg-amber-50/40 dark:bg-amber-950/10',
      headerBgClass: 'bg-amber-50 dark:bg-amber-950/20',
      borderClass: 'border border-amber-200/50 dark:border-amber-900/30',
      textColor: 'text-amber-800 dark:text-amber-200',
      icon: 'Activity'
    },
    {
      id: `${boardId}-col-review`,
      boardId,
      title: 'Em Revisão 👀',
      order: 2,
      width: 290,
      borderRadius: 'rounded-xl' as const,
      bgClass: 'bg-indigo-50/40 dark:bg-indigo-950/10',
      headerBgClass: 'bg-indigo-50 dark:bg-indigo-950/20',
      borderClass: 'border border-indigo-200/50 dark:border-indigo-900/30',
      textColor: 'text-indigo-800 dark:text-indigo-200',
      icon: 'Eye'
    },
    {
      id: `${boardId}-col-done`,
      boardId,
      title: 'Concluído ✅',
      order: 3,
      width: 290,
      borderRadius: 'rounded-xl' as const,
      bgClass: 'bg-emerald-50/40 dark:bg-emerald-950/10',
      headerBgClass: 'bg-emerald-50 dark:bg-emerald-950/20',
      borderClass: 'border border-emerald-200/50 dark:border-emerald-900/30',
      textColor: 'text-emerald-800 dark:text-emerald-200',
      icon: 'CheckCircle'
    }
  ];

  // Customize slightly for some boards to showcase Canva style capability
  if (boardId === 'board-studio') {
    return commonCols.map((col, idx) => {
      if (idx === 1) {
        return {
          ...col,
          title: 'Criação Ativa 🎨',
          width: 330,
          borderRadius: 'rounded-3xl' as const,
          bgClass: 'bg-purple-50/50 dark:bg-purple-950/10',
          headerBgClass: 'bg-purple-100/50 dark:bg-purple-900/30',
          borderClass: 'border border-purple-300 dark:border-purple-800',
          icon: 'Palette'
        };
      }
      return col;
    });
  }

  return commonCols;
};

export const getInitialCards = (): Card[] => {
  return [];
};
