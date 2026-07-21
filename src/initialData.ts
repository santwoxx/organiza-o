import { Company, Board, Column, Card } from './types';

export const INITIAL_COMPANIES: Company[] = [
  { id: 'all', name: 'Todas as Empresas', color: 'indigo', tagline: 'Visão Geral do Workspace' },
  { id: 'nexus', name: 'Nexus Tech', color: 'blue', tagline: 'Desenvolvimento de Softwares e SaaS' },
  { id: 'aurora', name: 'Aurora Alimentos', color: 'amber', tagline: 'Distribuição e Produtos Naturais' },
  { id: 'studio', name: 'Studio Criativo', color: 'purple', tagline: 'Branding e Campanhas de Marketing' },
  { id: 'coope', name: 'CoopeRibeirão', color: 'emerald', tagline: 'Logística e Agronegócios' },
];

export const INITIAL_BOARDS: Board[] = [
  {
    id: 'board-general',
    name: 'Workspace Unificado',
    companyName: 'Todas as Empresas',
    description: 'Painel centralizado de fluxo para gerenciar as 4 empresas em uma única tela.',
    color: 'indigo'
  },
  {
    id: 'board-nexus',
    name: 'Nexus Tech Board',
    companyName: 'Nexus Tech',
    description: 'Sprint Backlog, Roadmap de Produtos e bugs pendentes.',
    color: 'blue'
  },
  {
    id: 'board-aurora',
    name: 'Aurora Alimentos Board',
    companyName: 'Aurora Alimentos',
    description: 'Controle de qualidade, fornecedores e lançamentos de produtos.',
    color: 'amber'
  },
  {
    id: 'board-studio',
    name: 'Studio Criativo Board',
    companyName: 'Studio Criativo',
    description: 'Prazos de clientes, aprovação de peças e briefings.',
    color: 'purple'
  },
  {
    id: 'board-coope',
    name: 'CoopeRibeirão Board',
    companyName: 'CoopeRibeirão',
    description: 'Contratos, rotas de escoamento e cronogramas de safra.',
    color: 'emerald'
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
  // Let's set some near-deadline times relative to today
  const today = new Date();
  
  const getRelativeDate = (daysOffset: number, hoursOffset = 12) => {
    const d = new Date(today);
    d.setDate(today.getDate() + daysOffset);
    d.setHours(hoursOffset, 0, 0, 0);
    return d.toISOString();
  };

  return [
    // Nexus Tech
    {
      id: 'card-nexus-1',
      columnId: 'board-general-col-pending',
      boardId: 'board-general',
      title: 'Finalizar MVP da API GraphQL',
      description: 'Implementar queries e mutations para gerenciar dados de faturamento. Fazer testes integrados.',
      priority: 'high',
      dueDate: getRelativeDate(1, 9), // Tomorrow
      subtasks: [
        { id: 's1', text: 'Criar Schema GraphQL', completed: true },
        { id: 's2', text: 'Configurar resolvers de pagamento', completed: false },
        { id: 's3', text: 'Documentar endpoints no README', completed: false }
      ],
      companyName: 'Nexus Tech',
      customBg: 'border-l-4 border-l-blue-500',
      order: 0,
      completed: false
    },
    {
      id: 'card-nexus-2',
      columnId: 'board-general-col-progress',
      boardId: 'board-general',
      title: 'Corrigir Bug de Autenticação MFA',
      description: 'Usuários estão recebendo token expirado na segunda tentativa. Verificar tempo de Redis.',
      priority: 'high',
      dueDate: getRelativeDate(0, 23), // Today evening (due soon!)
      subtasks: [
        { id: 's4', text: 'Analisar logs do CloudWatch', completed: true },
        { id: 's5', text: 'Corrigir TTL no cache do Redis', completed: true },
        { id: 's6', text: 'Subir correção para ambiente Staging', completed: false }
      ],
      companyName: 'Nexus Tech',
      customBg: 'border-l-4 border-l-red-500 bg-red-50/40 dark:bg-red-950/10',
      order: 0,
      completed: false
    },
    {
      id: 'card-nexus-3',
      columnId: 'board-general-col-done',
      boardId: 'board-general',
      title: 'Migração de Banco SQL para Produção',
      description: 'Rodar scripts de migração na AWS e validar integridade referencial das tabelas.',
      priority: 'medium',
      dueDate: getRelativeDate(-2), // Overdue but completed, so it is OK
      subtasks: [
        { id: 's7', text: 'Backup completo do banco atual', completed: true },
        { id: 's8', text: 'Executar migração', completed: true }
      ],
      companyName: 'Nexus Tech',
      customBg: 'border-l-4 border-l-emerald-500 opacity-80',
      order: 0,
      completed: true
    },

    // Aurora Alimentos
    {
      id: 'card-aurora-1',
      columnId: 'board-general-col-pending',
      boardId: 'board-general',
      title: 'Negociar com Fornecedor de Embalagens',
      description: 'Reunião para fechar lote de caixas biodegradáveis. Meta: conseguir 10% de desconto.',
      priority: 'medium',
      dueDate: getRelativeDate(3),
      subtasks: [
        { id: 's9', text: 'Revisar planilha de orçamentos', completed: false },
        { id: 's10', text: 'Enviar proposta final por e-mail', completed: false }
      ],
      companyName: 'Aurora Alimentos',
      customBg: 'border-l-4 border-l-amber-500',
      order: 1,
      completed: false
    },
    {
      id: 'card-aurora-2',
      columnId: 'board-general-col-progress',
      boardId: 'board-general',
      title: 'Auditoria Sanitária - Galpão 3',
      description: 'Inspeção de rotina das câmaras frias e certificação de higiene do lote de laticínios.',
      priority: 'high',
      dueDate: getRelativeDate(-1), // Overdue!
      subtasks: [
        { id: 's11', text: 'Checar termostatos', completed: true },
        { id: 's12', text: 'Validar crachás e EPIs da equipe', completed: false },
        { id: 's13', text: 'Assinar termo de vistoria técnica', completed: false }
      ],
      companyName: 'Aurora Alimentos',
      customBg: 'border-l-4 border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/10',
      order: 1,
      completed: false
    },

    // Studio Criativo
    {
      id: 'card-studio-1',
      columnId: 'board-general-col-review',
      boardId: 'board-general',
      title: 'Aprovação de Layout: Campanha de Inverno',
      description: 'Peças gráficas para Instagram e outdoors da marca de roupas UrbanWear.',
      priority: 'low',
      dueDate: getRelativeDate(4),
      subtasks: [
        { id: 's14', text: 'Carrossel do feed', completed: true },
        { id: 's15', text: 'Criativos de Stories e Reels', completed: true },
        { id: 's16', text: 'Arte do outdoor principal', completed: false }
      ],
      companyName: 'Studio Criativo',
      customBg: 'border-l-4 border-l-purple-500 bg-purple-50/30 dark:bg-purple-950/10',
      order: 0,
      completed: false
    },
    {
      id: 'card-studio-2',
      columnId: 'board-general-col-pending',
      boardId: 'board-general',
      title: 'Branding Completo - Clínica Sorriso',
      description: 'Elaboração de logotipo, paleta de cores, tipografia institucional e manual de marca.',
      priority: 'medium',
      dueDate: getRelativeDate(7),
      subtasks: [
        { id: 's17', text: 'Briefing com cliente', completed: true },
        { id: 's18', text: 'Rascunhos de conceitos de logo', completed: false },
        { id: 's19', text: 'Definição da paleta cromática', completed: false }
      ],
      companyName: 'Studio Criativo',
      customBg: 'border-l-4 border-l-pink-500',
      order: 2,
      completed: false
    },

    // CoopeRibeirão
    {
      id: 'card-coope-1',
      columnId: 'board-general-col-progress',
      boardId: 'board-general',
      title: 'Roteamento da Frota de Grãos (Trigo)',
      description: 'Definir caminhos alternativos devido às obras na BR-364. Contatar motoristas da frota C.',
      priority: 'high',
      dueDate: getRelativeDate(2),
      subtasks: [
        { id: 's20', text: 'Mapear desvios viáveis no GPS', completed: true },
        { id: 's21', text: 'Avisar despachantes', completed: true },
        { id: 's22', text: 'Confirmar abastecimento dos tanques', completed: false }
      ],
      companyName: 'CoopeRibeirão',
      customBg: 'border-l-4 border-l-emerald-500',
      order: 2,
      completed: false
    },
    {
      id: 'card-coope-2',
      columnId: 'board-general-col-review',
      boardId: 'board-general',
      title: 'Renovação de Licença Ambiental Secadora',
      description: 'Apresentar laudo de emissões ao órgão regulador do estado para evitar multas operacionais.',
      priority: 'high',
      dueDate: getRelativeDate(0, 16), // Today afternoon (due soon!)
      subtasks: [
        { id: 's23', text: 'Coletar assinatura do Engenheiro Químico', completed: true },
        { id: 's24', text: 'Pagar taxa de protocolo', completed: false }
      ],
      companyName: 'CoopeRibeirão',
      customBg: 'border-l-4 border-l-teal-500',
      order: 1,
      completed: false
    }
  ];
};
