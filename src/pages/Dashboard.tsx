import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Plus,
  Printer,
  Download,
  Upload,
  PlusCircle,
  CheckCircle,
  Calendar,
  ChevronRight,
  Filter,
  Clock,
  Grid,
  Layers,
  Settings,
  HelpCircle,
  Check,
  Building,
  Briefcase,
  Sliders,
  AlertCircle,
  TrendingUp,
  LayoutGrid,
  Sparkles,
  RefreshCw,
  Menu,
  X,
  Move,
  Activity
} from 'lucide-react';

// Models & Data
import { Board, Company, Column, Card, AppNotification } from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_BOARDS,
  getInitialColumns,
  getInitialCards
} from '../initialData';

// Sub-components
import BoardSidebar from '../components/BoardSidebar';
import KanbanColumn from '../components/KanbanColumn';
import CardModal from '../components/CardModal';
import ColumnCustomizer from '../components/ColumnCustomizer';
import NotificationCenter from '../components/NotificationCenter';
import PrintReport from '../components/PrintReport';
import FlowchartCanvas from '../components/FlowchartCanvas';
import ActivityLogModal from '../components/ActivityLogModal';

export default function App() {
  // --- PERSISTENT STATE ---
  const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);

  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);

  const [activeBoardId, setActiveBoardId] = useState<string>(() => {
    const saved = localStorage.getItem('canvaboard_active_board');
    return saved || 'board-general';
  });

  const [columns, setColumns] = useState<Column[]>([]);

  const [cards, setCards] = useState<Card[]>([]);

  // Workspace visual theme (Canva style)
  const [workspaceTheme, setWorkspaceTheme] = useState<string>(() => {
    return localStorage.getItem('canvaboard_workspace_theme') || 'slate';
  });

  // View mode state (Kanban vs Canvas/Flowchart)
  const [viewMode, setViewMode] = useState<'kanban' | 'canvas'>(() => {
    return (localStorage.getItem('canvaboard_view_mode') as 'kanban' | 'canvas') || 'kanban';
  });

  // Mobile sidebar open drawer state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // --- FILTER & INTERACTION STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [companyFilter, setCompanyFilter] = useState('all');

  // Modal Control
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [newCardColumnId, setNewCardColumnId] = useState<string | null>(null);

  const [customizingColumn, setCustomizingColumn] = useState<Column | null>(null);
  const [columnIdToDelete, setColumnIdToDelete] = useState<string | null>(null);
  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  // Notifications State
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Add Column Form
  const [showAddColForm, setShowAddColForm] = useState(false);
  const [newColTitle, setNewColTitle] = useState('');

  const navigate = useNavigate();

  // Escutar Firestore em vez de LocalStorage
  useEffect(() => {
    // Clear old localStorage items to prevent stale data mixing
    localStorage.removeItem('canvaboard_companies');
    localStorage.removeItem('canvaboard_boards');
    localStorage.removeItem('canvaboard_columns');
    localStorage.removeItem('canvaboard_cards');

    const unsubCards = onSnapshot(collection(db, 'cards'), (snapshot) => {
      setCards(snapshot.docs.map(doc => doc.data() as Card));
    });

    const unsubCols = onSnapshot(collection(db, 'columns'), (snapshot) => {
      setColumns(snapshot.docs.map(doc => doc.data() as Column));
    });

    const unsubBoards = onSnapshot(collection(db, 'boards'), async (snapshot) => {
      if (snapshot.empty) {
        // Inicializar com INITIAL_BOARDS se não existir nada na nuvem
        setBoards(INITIAL_BOARDS);
        for (const b of INITIAL_BOARDS) {
          await setDoc(doc(db, 'boards', b.id), b);
        }
      } else {
        setBoards(snapshot.docs.map(doc => doc.data() as Board));
      }
    });

    const unsubCompanies = onSnapshot(collection(db, 'companies'), async (snapshot) => {
      if (snapshot.empty) {
        // Inicializar com INITIAL_COMPANIES
        setCompanies(INITIAL_COMPANIES);
        for (const c of INITIAL_COMPANIES) {
          await setDoc(doc(db, 'companies', c.id), c);
        }
      } else {
        // Sort specifically to keep 'all' at top
        const comps = snapshot.docs.map(doc => doc.data() as Company);
        const allComp = comps.find(c => c.id === 'all');
        const rest = comps.filter(c => c.id !== 'all');
        if (allComp) setCompanies([allComp, ...rest]);
        else setCompanies(comps);
      }
    });

    return () => {
      unsubCards();
      unsubCols();
      unsubBoards();
      unsubCompanies();
    };
  }, []);

  const persistCard = async (card: Card) => {
    try { await setDoc(doc(db, 'cards', card.id), card); } catch (e) { console.error(e); }
  };

  const persistColumn = async (column: Column) => {
    try { await setDoc(doc(db, 'columns', column.id), column); } catch (e) { console.error(e); }
  };

  const persistBoard = async (board: Board) => {
    try { await setDoc(doc(db, 'boards', board.id), board); } catch (e) { console.error(e); }
  };

  const persistCompany = async (company: Company) => {
    try { await setDoc(doc(db, 'companies', company.id), company); } catch (e) { console.error(e); }
  };

  const removeCompany = async (id: string) => {
    try { await deleteDoc(doc(db, 'companies', id)); } catch (e) { console.error(e); }
  };

  const removeBoard = async (id: string) => {
    try { await deleteDoc(doc(db, 'boards', id)); } catch (e) { console.error(e); }
  };

  const removeCard = async (id: string) => {
    try { 
      await deleteDoc(doc(db, 'cards', id)); 
      logActivity('Excluiu Cartão', `Cartão excluído com ID: ${id}`);
    } catch (e) { console.error(e); }
  };

  const logActivity = async (action: string, details: string) => {
    try {
      const userEmail = auth.currentUser?.email || 'Usuário Desconhecido';
      const logId = `log-${Date.now()}`;
      await setDoc(doc(db, 'activity_logs', logId), {
        id: logId,
        userEmail,
        action,
        details,
        timestamp: new Date().toISOString()
      });
    } catch (e) { console.error('Error logging activity', e); }
  };

  // Periodic deadline verification loop (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      updateNotifications(cards);
    }, 30000);
    return () => clearInterval(interval);
  }, [cards]);



  // --- NOTIFICATION CALCULATOR ---
  const updateNotifications = (currentCards: Card[]) => {
    const now = new Date();
    const targetNotifs: AppNotification[] = [];

    currentCards.forEach((card) => {
      if (!card.dueDate || card.completed) return;

      const dDate = new Date(card.dueDate);
      const diffMs = dDate.getTime() - now.getTime();

      if (diffMs < 0) {
        // Overdue!
        targetNotifs.push({
          id: `notif-overdue-${card.id}`,
          cardId: card.id,
          cardTitle: card.title,
          companyName: card.companyName,
          dueDate: card.dueDate,
          type: 'overdue',
          read: false
        });
      } else if (diffMs < 24 * 60 * 60 * 1000) {
        // Due soon (< 24 hours)
        targetNotifs.push({
          id: `notif-soon-${card.id}`,
          cardId: card.id,
          cardTitle: card.title,
          companyName: card.companyName,
          dueDate: card.dueDate,
          type: 'due_soon',
          read: false
        });
      }
    });

    // Merge with read states from localStorage
    const savedNotifsStr = localStorage.getItem('canvaboard_notifications');
    if (savedNotifsStr) {
      try {
        const savedNotifs: AppNotification[] = JSON.parse(savedNotifsStr);
        const readMap = new Map(savedNotifs.map((n) => [n.id, n.read]));
        targetNotifs.forEach((n) => {
          if (readMap.has(n.id)) {
            n.read = readMap.get(n.id) || false;
          }
        });
      } catch (e) {
        // Fallback silently on parsing issues
      }
    }

    setNotifications(targetNotifs);
    localStorage.setItem('canvaboard_notifications', JSON.stringify(targetNotifs));
  };

  const handleMarkNotifRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n));
    setNotifications(updated);
    localStorage.setItem('canvaboard_notifications', JSON.stringify(updated));
  };

  const handleClearAllNotifs = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('canvaboard_notifications', JSON.stringify(updated));
  };

  const handleSelectNotifCard = (cardId: string) => {
    const targetCard = cards.find((c) => c.id === cardId);
    if (targetCard) {
      // Find what board this card belongs to and switch to it!
      const targetCol = columns.find((col) => col.id === targetCard.columnId);
      if (targetCol) {
        setActiveBoardId(targetCol.boardId);
      }
      setEditingCard(targetCard);
      setIsCardModalOpen(true);
    }
  };

  // --- COLUMN MANAGEMENT ACTIONS ---
  const handleAddColumn = () => {
    if (!newColTitle.trim()) return;

    const activeCols = columns.filter((c) => c.boardId === activeBoardId);
    const nextOrder = activeCols.length;

    const newCol: Column = {
      id: `col-${Date.now()}`,
      boardId: activeBoardId,
      title: newColTitle.trim(),
      order: nextOrder,
      width: 290,
      borderRadius: 'rounded-xl',
      bgClass: 'bg-slate-50/90 dark:bg-slate-900/40',
      headerBgClass: 'bg-slate-100 dark:bg-slate-800',
      borderClass: 'border border-slate-200/80 dark:border-slate-800',
      textColor: 'text-slate-800 dark:text-slate-200',
      icon: 'Pin'
    };

    setColumns([...columns, newCol]);
    persistColumn(newCol);
    setNewColTitle('');
    setShowAddColForm(false);
  };

  const handleSaveColumnStyle = (updatedCol: Column) => {
    setColumns(columns.map((c) => (c.id === updatedCol.id ? updatedCol : c)));
    persistColumn(updatedCol);
    setCustomizingColumn(null);
  };

  const handleDeleteColumn = (columnId: string) => {
    setColumnIdToDelete(columnId);
  };

  const handleResizeColumn = (columnId: string, newWidth: number) => {
    const col = columns.find(c => c.id === columnId);
    if (!col) return;
    const updated = { ...col, width: newWidth };
    setColumns(columns.map((c) => (c.id === columnId ? updated : c)));
    persistColumn(updated);
  };

  const handleToggleCollapseColumn = (columnId: string) => {
    const col = columns.find(c => c.id === columnId);
    if (!col) return;
    const updated = { ...col, isCollapsed: !col.isCollapsed };
    setColumns(columns.map((c) => (c.id === columnId ? updated : c)));
    persistColumn(updated);
  };

  const handleMoveColumn = (columnId: string, direction: 'left' | 'right') => {
    // Filter columns of this active board
    const boardCols = columns
      .filter((c) => c.boardId === activeBoardId)
      .sort((a, b) => a.order - b.order);

    const activeIndex = boardCols.findIndex((c) => c.id === columnId);
    if (activeIndex === -1) return;

    let targetSwapIndex = -1;
    if (direction === 'left' && activeIndex > 0) {
      targetSwapIndex = activeIndex - 1;
    } else if (direction === 'right' && activeIndex < boardCols.length - 1) {
      targetSwapIndex = activeIndex + 1;
    }

    if (targetSwapIndex !== -1) {
      const activeCol = boardCols[activeIndex];
      const swapCol = boardCols[targetSwapIndex];

      // Swap orders
      const updatedCols = columns.map((c) => {
        if (c.id === activeCol.id) return { ...c, order: swapCol.order };
        if (c.id === swapCol.id) return { ...c, order: activeCol.order };
        return c;
      });

      setColumns(updatedCols);
    }
  };

  // --- CARD MANAGEMENT ACTIONS ---
  const handleOpenAddCardModal = (columnId: string) => {
    setNewCardColumnId(columnId);
    setEditingCard(null);
    setIsCardModalOpen(true);
  };

  const handleOpenEditCardModal = (card: Card) => {
    setNewCardColumnId(null);
    setEditingCard(card);
    setIsCardModalOpen(true);
  };

  const handleSaveCard = (savedCard: Card) => {
    const isNew = !editingCard;
    if (!editingCard) {
      // Find order
      const colCards = cards.filter((c) => c.columnId === savedCard.columnId);
      savedCard.order = colCards.length;
      
      // Make sure card boardId aligns with column boardId
      const colDef = columns.find((c) => c.id === savedCard.columnId);
      if (colDef) {
        savedCard.boardId = colDef.boardId;
      }

      setCards([...cards, savedCard]);
      persistCard(savedCard);
      logActivity('Criou Cartão', `Criou o cartão: ${savedCard.title}`);
    } else {
      // Update existing card
      setCards(cards.map((c) => (c.id === savedCard.id ? savedCard : c)));
      persistCard(savedCard);
      logActivity('Editou Cartão', `Editou o cartão: ${savedCard.title}`);
    }

    setIsCardModalOpen(false);
    setNewCardColumnId(null);
    setEditingCard(null);
  };

  const handleDeleteCard = (cardId: string) => {
    setCards(cards.filter((c) => c.id !== cardId));
    removeCard(cardId);
    setIsCardModalOpen(false);
    setEditingCard(null);
  };

  const handleToggleCardComplete = (cardId: string) => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return;
    const updated = { ...card, completed: !card.completed };
    setCards(cards.map((c) => (c.id === cardId ? updated : c)));
    persistCard(updated);
    logActivity('Marcou Conclusão', `Alterou o status de conclusão do cartão: ${card.title}`);
  };

  const handleUpdateCard = (updatedCard: Card) => {
    setCards(cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)));
    persistCard(updatedCard);
  };

  const handleCardDropped = (cardId: string, targetColumnId: string) => {
    const targetCol = columns.find((c) => c.id === targetColumnId);
    if (!targetCol) return;

    const targetCard = cards.find(c => c.id === cardId);
    if (targetCard) {
      const updated = {
        ...targetCard,
        columnId: targetColumnId,
        boardId: targetCol.boardId
      };
      setCards(cards.map((card) => card.id === cardId ? updated : card));
      persistCard(updated);
    }
  };

  // --- BACKUP & RESTORE ACTIONS ---
  const handleExportData = () => {
    const stateObj = {
      boards,
      companies,
      columns,
      cards,
      workspaceTheme
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(stateObj));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'canvaboard_backup.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.boards && parsed.columns && parsed.cards) {
            setBoards(parsed.boards);
            if (parsed.companies) setCompanies(parsed.companies);
            setColumns(parsed.columns);
            setCards(parsed.cards);
            if (parsed.workspaceTheme) setWorkspaceTheme(parsed.workspaceTheme);
            alert('Parabéns! Seus fluxos de trabalho e colunas estilo Canva foram restaurados.');
          } else {
            alert('Ops! O arquivo selecionado não é um backup válido do CanvaBoard.');
          }
        } catch {
          alert('Houve um erro técnico ao processar o arquivo de backup.');
        }
      };
    }
  };

  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);

  const handleAddCompany = (name: string, tagline: string, color: string) => {
    const newComp: Company = {
      id: `comp-${Date.now()}`,
      name,
      tagline,
      color
    };
    setCompanies([...companies, newComp]);
    persistCompany(newComp);
    logActivity('Criou Empresa', `Adicionou a empresa: ${name}`);
  };

  const handleDeleteCompany = (companyId: string) => {
    const comp = companies.find(c => c.id === companyId);
    if (comp) {
      setCompanyToDelete(comp);
    }
  };

  const handleConfirmDeleteCompany = () => {
    if (!companyToDelete) return;

    const compName = companyToDelete.name;
    
    // Filter out the company
    const nextCompanies = companies.filter((c) => c.id !== companyToDelete.id);
    setCompanies(nextCompanies);

    // Cascading deletion: find boards of this company
    const boardsToDelete = boards.filter((b) => b.companyName === compName);
    const boardIdsToDelete = boardsToDelete.map((b) => b.id);

    // Filter out boards
    const nextBoards = boards.filter((b) => b.companyName !== compName);
    setBoards(nextBoards);

    // Filter out columns of deleted boards
    const nextCols = columns.filter((col) => !boardIdsToDelete.includes(col.boardId));
    setColumns(nextCols);

    // Filter out cards of deleted boards or cards that are explicitly associated with that companyName
    const nextCards = cards.filter((card) => card.companyName !== compName && !boardIdsToDelete.includes(card.boardId));
    setCards(nextCards);
    
    // Execute deletions in Firestore
    removeCompany(companyToDelete.id);
    boardsToDelete.forEach(b => removeBoard(b.id));
    
    // For columns and cards, ideally we delete from Firestore too, 
    // but simplified cascading here by state update is okay if we use deleteDoc for each
    columns.filter((col) => boardIdsToDelete.includes(col.boardId)).forEach(col => {
      deleteDoc(doc(db, 'columns', col.id));
    });
    
    cards.filter((card) => card.companyName === compName || boardIdsToDelete.includes(card.boardId)).forEach(card => {
      deleteDoc(doc(db, 'cards', card.id));
    });

    logActivity('Excluiu Empresa', `Excluiu a empresa e dependências: ${compName}`);

    // If active board was one of the deleted boards, fall back to board-general
    if (boardIdsToDelete.includes(activeBoardId)) {
      setActiveBoardId('board-general');
    }

    setCompanyToDelete(null);
  };

  const handleAddCustomBoard = (name: string, companyNames: string[], color: string) => {
    const newBoardId = `board-${Date.now()}`;
    const newBoard: Board = {
      id: newBoardId,
      name,
      companyNames,
      companyName: companyNames.length > 0 ? companyNames[0] : 'Todas as Empresas', // fallback
      color,
      description: `Quadro personalizado para gerenciar ${companyNames.join(', ')}.`
    };

    setBoards([...boards, newBoard]);
    persistBoard(newBoard);
    logActivity('Criou Quadro', `Criou o quadro personalizado: ${name}`);
    
    // Auto populate this new board with default columns so it is ready to use
    const newCols = getInitialColumns(newBoardId);
    setColumns([...columns, ...newCols]);
    newCols.forEach(col => persistColumn(col));

    // Switch to this board immediately
    setActiveBoardId(newBoardId);
  };

  const handleEditBoard = (boardId: string, newName: string, newCompanyNames: string[], newColor: string) => {
    const updatedBoards = boards.map(b => {
      if (b.id === boardId) {
        const updated = {
          ...b,
          name: newName,
          companyNames: newCompanyNames,
          companyName: newCompanyNames.length > 0 ? newCompanyNames[0] : 'Todas as Empresas',
          color: newColor,
          description: `Quadro gerenciando: ${newCompanyNames.join(', ')}`
        };
        persistBoard(updated);
        return updated;
      }
      return b;
    });
    setBoards(updatedBoards);
    logActivity('Editou Quadro', `Alterou informações do quadro: ${newName}`);
  };

  // --- WORKSPACE STATS AND FILTERING ---
  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  const getFilteredCards = () => {
    return cards.filter((card) => {
      // 1. Board Scope:
      // O cartão OBRIGATORIAMENTE tem que pertencer a este board (nunca aparece em outro quadro)
      if (card.boardId !== activeBoard.id) {
        return false;
      }

      // Se o board tiver empresas específicas vinculadas, filtre também por empresa!
      const boardCompanies = activeBoard.companyNames || [];
      const cardCompanies = card.companyNames || [card.companyName].filter(Boolean);
      
      if (boardCompanies.length > 0) {
        // O cartão deve pertencer a PELO MENOS UMA das empresas do Board
        const matchesBoard = cardCompanies.some(c => boardCompanies.includes(c));
        if (!matchesBoard) return false;
      }

      // 2. Text Search:
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = card.title.toLowerCase().includes(query);
        const matchesDesc = (card.description || '').toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // 3. Priority Filter:
      if (priorityFilter !== 'all' && card.priority !== priorityFilter) return false;

      // 4. Company Select Filter (Dropdown do menu)
      if (companyFilter !== 'all') {
        if (!cardCompanies.includes(companyFilter)) return false;
      }

      return true;
    });
  };

  const displayedCards = getFilteredCards();

  // Get active columns for this board, sorted by order
  const displayedColumns = columns
    .filter((col) => {
      // Columns belong to active board
      // However, if we are on a specific board, we pull columns registered for that board
      return col.boardId === activeBoardId;
    })
    .sort((a, b) => a.order - b.order);

  const totalCardsInView = cards.filter((c) => {
    // Conta apenas os cards que pertencem fisicamente a este board (nunca conta cards de outros quadros)
    if (c.boardId !== activeBoard.id) {
      return false;
    }

    const boardCompanies = activeBoard.companyNames || [];
    if (boardCompanies.length === 0) return true;

    const cardCompanies = c.companyNames || [c.companyName].filter(Boolean);
    return cardCompanies.some(comp => boardCompanies.includes(comp));
  });
  const doneCount = totalCardsInView.filter((c) => c.completed).length;
  const pendingCount = totalCardsInView.length - doneCount;

  // Themes list matching canva mood
  const THEME_STYLES: Record<string, string> = {
    slate: 'bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200',
    sand: 'bg-[#fbf9f4] text-slate-800 dark:bg-[#1a1917] dark:text-slate-200',
    ocean: 'bg-blue-50/40 text-slate-800 dark:bg-slate-950 dark:text-slate-200',
    lavender: 'bg-purple-50/40 text-slate-800 dark:bg-slate-950 dark:text-slate-200',
  };

  return (
    <div className={`flex h-screen font-sans overflow-hidden ${THEME_STYLES[workspaceTheme] || THEME_STYLES.slate}`}>
      
      {/* Desktop Sidebar (hidden on mobile, visible on lg upwards) */}
      <div className="hidden lg:flex shrink-0 h-full">
        <BoardSidebar
          boards={boards}
          activeBoardId={activeBoardId}
          onSelectBoard={(id) => {
            setActiveBoardId(id);
            // Sync header filter if switching board
            setCompanyFilter('all');
          }}
          companies={companies}
          cards={cards}
          onOpenReport={() => setIsPrintReportOpen(true)}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onAddCustomBoard={handleAddCustomBoard}
          onEditBoard={handleEditBoard}
          onAddCompany={handleAddCompany}
          onDeleteCompany={handleDeleteCompany}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setIsSidebarOpen(false)} 
          />
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-slate-950 flex flex-col shadow-2xl z-10">
            <div className="absolute top-4 right-4 z-50">
              <button 
                onClick={() => setIsSidebarOpen(false)} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <BoardSidebar
              boards={boards}
              activeBoardId={activeBoardId}
              onSelectBoard={(id) => {
                setActiveBoardId(id);
                setCompanyFilter('all');
                setIsSidebarOpen(false); // Close sidebar on mobile select
              }}
              companies={companies}
              cards={cards}
              onOpenReport={() => {
                setIsPrintReportOpen(true);
                setIsSidebarOpen(false);
              }}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onAddCustomBoard={handleAddCustomBoard}
              onEditBoard={handleEditBoard}
              onAddCompany={handleAddCompany}
              onDeleteCompany={handleDeleteCompany}
            />
          </div>
        </div>
      )}

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Workspace Top Header Panel */}
        <header className="px-4 sm:px-6 h-16 border-b border-slate-100 dark:border-slate-900 bg-white dark:bg-slate-950 flex items-center justify-between gap-3 shrink-0 print:hidden z-30">
          
          {/* Active Board Identity */}
          <div className="text-left flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0"
              title="Menu Lateral"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 dark:text-white truncate max-w-[100px] sm:max-w-none">
                {activeBoard.name}
              </h1>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal block sm:hidden truncate">
                {activeBoard.companyName === 'Todas as Empresas' ? 'Operations' : activeBoard.companyName}
              </span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-normal truncate hidden sm:inline">
              {activeBoard.companyName === 'Todas as Empresas' ? 'Operations' : activeBoard.companyName}
            </span>
          </div>

          {/* Switch View Mode: Kanban vs Canva Flowchart */}
          <div className="flex bg-slate-100 dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200/60 dark:border-slate-800/80 shrink-0">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                viewMode === 'canvas'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
            >
              <Move className="w-3.5 h-3.5" /> <span className="hidden xs:inline">Canvas</span>
            </button>
          </div>

          {/* Controls: Notifications and Canva Themes */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-4 shrink-0">
            
            {/* Canva-style Workspace Canvas Palette Selector */}
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 p-1 rounded-lg border border-slate-100 dark:border-slate-800" title="Cor do Canvas (Fundo)">
              {[
                { id: 'slate', color: 'bg-slate-300 dark:bg-slate-700' },
                { id: 'sand', color: 'bg-[#f4f1ea] dark:bg-[#272522]' },
                { id: 'ocean', color: 'bg-blue-100 dark:bg-blue-950/40' },
                { id: 'lavender', color: 'bg-purple-100 dark:bg-purple-950/40' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setWorkspaceTheme(theme.id)}
                  className={`w-3.5 h-3.5 rounded-full ${theme.color} cursor-pointer transition-all ${
                    workspaceTheme === theme.id ? 'ring-2 ring-indigo-600 ring-offset-1 dark:ring-offset-slate-950 scale-110' : 'opacity-60 hover:opacity-100'
                  }`}
                />
              ))}
            </div>

            {/* Notification triggers */}
            <NotificationCenter
              notifications={notifications}
              onMarkAsRead={handleMarkNotifRead}
              onClearAll={handleClearAllNotifs}
              onSelectCard={handleSelectNotifCard}
            />
          </div>
        </header>

        {/* Search, Filters, and Actions Bar */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/10 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden z-10">
          
          {/* Search box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar cartões ou tarefas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8.5 pr-4 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500/20 focus:border-indigo-500 text-xs text-slate-700 dark:text-slate-300 font-medium"
            />
          </div>

          {/* Filter badges */}
          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto justify-end">
            <button
              onClick={() => setIsLogModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-500" /> Histórico
            </button>

            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5" /> Filtrar:
            </div>

            {/* Priority level filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none text-slate-600 dark:text-slate-400 font-medium cursor-pointer"
            >
              <option value="all">Prioridade: Todas</option>
              <option value="high">Prioridade: Alta</option>
              <option value="medium">Prioridade: Média</option>
              <option value="low">Prioridade: Baixa</option>
            </select>

            {/* Company selection filter (Available on all boards) */}
            <select
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none text-slate-600 dark:text-slate-400 font-medium cursor-pointer"
            >
              <option value="all">Empresa: Todas</option>
              {companies.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>

            {/* Quick reset button */}
            {(searchQuery || priorityFilter !== 'all' || companyFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setPriorityFilter('all');
                  setCompanyFilter('all');
                }}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-xs text-indigo-600 font-bold cursor-pointer flex items-center gap-1"
                title="Limpar Filtros"
              >
                Limpar
              </button>
            )}
          </div>
        </div>

        {viewMode === 'canvas' ? (
          <FlowchartCanvas
            cards={displayedCards}
            columns={displayedColumns}
            onUpdateCard={handleUpdateCard}
            onEditCard={handleOpenEditCardModal}
            onAddCard={handleOpenAddCardModal}
          />
        ) : (
          /* --- KANBAN BOARD STAGE (HORIZONTAL SCROLL AREA) --- */
          <div className="flex-1 overflow-x-auto p-4 sm:p-6 flex items-start gap-4 sm:gap-5 select-none clean-dots" id="kanban-stage">
            {displayedColumns.map((col) => {
              // Filter cards that belong to this column
              const columnCards = displayedCards.filter((card) => card.columnId === col.id);
              
              return (
                <KanbanColumn
                  key={col.id}
                  column={col}
                  cards={columnCards}
                  onEditColumn={(col) => setCustomizingColumn(col)}
                  onAddCard={handleOpenAddCardModal}
                  onEditCard={handleOpenEditCardModal}
                  onToggleCardComplete={handleToggleCardComplete}
                  onCardDropped={handleCardDropped}
                  onResizeColumn={handleResizeColumn}
                  onToggleCollapseColumn={handleToggleCollapseColumn}
                  onMoveColumn={handleMoveColumn}
                  onDeleteColumn={handleDeleteColumn}
                  onUpdateCard={handleUpdateCard}
                />
              );
            })}

            {/* Add Column button block at end of row */}
            <div className="shrink-0 pr-6">
              {showAddColForm ? (
                <div className="w-68 bg-white/80 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0 space-y-3.5 text-left shadow-md">
                  <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Criar Nova Coluna
                  </h4>
                  <input
                    type="text"
                    placeholder="Nome do fluxo (Ex: Backlog)"
                    value={newColTitle}
                    onChange={(e) => setNewColTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-slate-100 font-bold"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddColumn();
                    }}
                  />
                  <div className="flex items-center gap-1.5 justify-end">
                    <button
                      onClick={() => setShowAddColForm(false)}
                      className="px-2.5 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-[10px] font-bold"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleAddColumn}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold shadow-xs cursor-pointer"
                    >
                      Criar Coluna
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddColForm(true)}
                  className="w-64 h-36 bg-white/40 hover:bg-white/60 dark:bg-slate-900/10 dark:hover:bg-slate-900/20 border border-dashed border-slate-300/80 dark:border-slate-800 rounded-2xl shrink-0 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-all cursor-pointer uppercase tracking-wider"
                >
                  <PlusCircle className="w-5.5 h-5.5 text-slate-400" />
                  <span className="text-[10px] font-black">Nova Coluna</span>
                </button>
              )}
            </div>
          </div>
        )}

      </main>

      {/* --- ALL OVERLAY MODALS --- */}

      {/* 1. Card Editing & Creating Modal */}
      {isCardModalOpen && (
        <CardModal
          card={editingCard}
          companies={companies}
          boards={boards}
          columns={columns}
          initialColumnId={newCardColumnId}
          onClose={() => {
            setIsCardModalOpen(false);
            setEditingCard(null);
            setNewCardColumnId(null);
          }}
          onSave={handleSaveCard}
          onDelete={handleDeleteCard}
        />
      )}

      {/* 2. Canva Style Column Customizer Modal */}
      {customizingColumn && (
        <ColumnCustomizer
          column={customizingColumn}
          onClose={() => setCustomizingColumn(null)}
          onSave={handleSaveColumnStyle}
          onDelete={handleDeleteColumn}
        />
      )}

      {/* 3. Printing weekly activities reports */}
      {isPrintReportOpen && (
        <PrintReport
          cards={cards}
          companies={companies}
          boards={boards}
          onClose={() => setIsPrintReportOpen(false)}
        />
      )}

      {/* 4. Beautiful Custom React Deletion Confirmation Modal */}
      {columnIdToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setColumnIdToDelete(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">Excluir Coluna?</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tem certeza de que deseja excluir esta coluna? Todos os cartões e tarefas associados a ela serão removidos permanentemente. Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setColumnIdToDelete(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const cardsInColumn = cards.filter((card) => card.columnId === columnIdToDelete);

                  setColumns(columns.filter((c) => c.id !== columnIdToDelete));
                  setCards(cards.filter((card) => card.columnId !== columnIdToDelete));

                  // Persistir a exclusão no Firestore, senão a coluna volta ao recarregar a página
                  deleteDoc(doc(db, 'columns', columnIdToDelete));
                  cardsInColumn.forEach((card) => deleteDoc(doc(db, 'cards', card.id)));
                  logActivity('Excluiu Coluna', `Excluiu uma coluna e ${cardsInColumn.length} cartão(ões) associado(s).`);

                  setColumnIdToDelete(null);
                  setCustomizingColumn(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Beautiful Custom React Company Deletion Confirmation Modal */}
      {companyToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={() => setCompanyToDelete(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl z-10 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/30 rounded-xl">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">Excluir Empresa?</h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Tem certeza de que deseja excluir a empresa <span className="font-bold text-rose-600 dark:text-rose-400">"{companyToDelete.name}"</span>? 
              Todos os quadros de fluxos, colunas, cartões e checklists vinculados a ela serão removidos permanentemente do workspace. Essa ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setCompanyToDelete(null)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDeleteCompany}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-sm"
              >
                Excluir de Vez
              </button>
            </div>
          </div>
        </div>
      )}

      {isLogModalOpen && (
        <ActivityLogModal onClose={() => setIsLogModalOpen(false)} />
      )}

    </div>
  );
}
