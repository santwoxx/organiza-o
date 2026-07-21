import React, { useState, useRef, useEffect } from 'react';
import { 
  GitCommit, 
  GitBranch, 
  Plus, 
  Move, 
  Settings, 
  Calendar, 
  CheckSquare, 
  Paperclip, 
  Trash2, 
  CheckCircle,
  HelpCircle,
  TrendingUp,
  X,
  Link2,
  FileText
} from 'lucide-react';
import { Card, Column, Priority } from '../types';

interface FlowchartCanvasProps {
  cards: Card[];
  columns: Column[];
  onUpdateCard: (updatedCard: Card) => void;
  onEditCard: (card: Card) => void;
  onAddCard: (columnId: string) => void;
}

// Fixed dimensions for layout calculations
const CARD_WIDTH = 260;
const CARD_HEIGHT = 160;

export default function FlowchartCanvas({
  cards,
  columns,
  onUpdateCard,
  onEditCard,
  onAddCard
}: FlowchartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Dragging state
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragCardStartCoords = useRef({ x: 0, y: 0 });

  // Mode: select target for connection
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  // Helper to calculate default layout coordinates if x or y are undefined
  const getCardCoords = (card: Card) => {
    if (card.x !== undefined && card.y !== undefined) {
      return { x: card.x, y: card.y };
    }

    // Fallback: Arrange in columns visually
    const colIndex = columns.findIndex((c) => c.id === card.columnId);
    const colCards = cards.filter((c) => c.columnId === card.columnId);
    const cardIndex = colCards.findIndex((c) => c.id === card.id);

    const calcX = colIndex >= 0 ? colIndex * 340 + 60 : 60;
    const calcY = cardIndex >= 0 ? cardIndex * 210 + 80 : 80;
    return { x: calcX, y: calcY };
  };

  // --- MOUSE & TOUCH DRAGGING EVENT HANDLERS ---
  const handleStartDrag = (cardId: string, e: React.MouseEvent | React.TouchEvent) => {
    // Prevent dragging if clicking a button, select, or input
    const target = e.target as HTMLElement;
    if (
      target.closest('button') || 
      target.closest('select') || 
      target.closest('input') || 
      target.closest('a')
    ) {
      return;
    }

    e.preventDefault();
    const card = cards.find(c => c.id === cardId);
    if (!card) return;

    setDraggingCardId(cardId);

    const coords = getCardCoords(card);
    dragCardStartCoords.current = coords;

    const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    dragStartPos.current = { x: pageX, y: pageY };
  };

  useEffect(() => {
    if (!draggingCardId) return;

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
      const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;

      const deltaX = pageX - dragStartPos.current.x;
      const deltaY = pageY - dragStartPos.current.y;

      // New coordinates with basic bounds checking
      const newX = Math.max(20, dragCardStartCoords.current.x + deltaX);
      const newY = Math.max(20, dragCardStartCoords.current.y + deltaY);

      const activeCard = cards.find(c => c.id === draggingCardId);
      if (activeCard) {
        onUpdateCard({
          ...activeCard,
          x: Math.round(newX),
          y: Math.round(newY)
        });
      }
    };

    const handleMouseUp = () => {
      setDraggingCardId(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove, { passive: false });
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [draggingCardId, cards, onUpdateCard]);

  // --- FLOWCHART CONNECTION HANDLERS ---
  const handleCardConnectSelect = (sourceId: string, targetId: string) => {
    const sourceCard = cards.find(c => c.id === sourceId);
    if (sourceCard) {
      onUpdateCard({
        ...sourceCard,
        connectedTo: targetId === 'none' ? undefined : targetId
      });
    }
  };

  const handleDisconnect = (sourceId: string) => {
    const sourceCard = cards.find(c => c.id === sourceId);
    if (sourceCard) {
      onUpdateCard({
        ...sourceCard,
        connectedTo: undefined
      });
    }
  };

  // Compile active connections to render lines
  const connectionsList: Array<{
    id: string;
    fromId: string;
    toId: string;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    midX: number;
    midY: number;
  }> = [];

  cards.forEach((fromCard) => {
    if (fromCard.connectedTo) {
      const toCard = cards.find(c => c.id === fromCard.connectedTo);
      if (toCard) {
        const fromCoords = getCardCoords(fromCard);
        const toCoords = getCardCoords(toCard);

        const x1 = fromCoords.x + CARD_WIDTH;
        const y1 = fromCoords.y + CARD_HEIGHT / 2;
        const x2 = toCoords.x;
        const y2 = toCoords.y + CARD_HEIGHT / 2;

        connectionsList.push({
          id: `conn-${fromCard.id}-${toCard.id}`,
          fromId: fromCard.id,
          toId: toCard.id,
          x1,
          y1,
          x2,
          y2,
          midX: (x1 + x2) / 2,
          midY: (y1 + y2) / 2
        });
      }
    }
  });

  return (
    <div 
      className="flex-1 overflow-auto p-4 md:p-8 select-none bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] relative min-h-[500px]"
      id="flowchart-stage"
      ref={containerRef}
    >
      {/* Visual Canvas Instruction Header */}
      <div className="absolute top-4 left-6 pointer-events-none bg-white/90 dark:bg-slate-900/95 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 shadow-sm flex items-center gap-2 z-20">
        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
        MESA CANVAS: Arraste os blocos livremente e vincule fluxogramas de ações!
      </div>

      {/* SVG Canvas overlay layer for connections */}
      <svg className="absolute inset-0 pointer-events-none w-[3500px] h-[2500px] z-0">
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" className="fill-indigo-500 dark:fill-indigo-400" />
          </marker>
        </defs>

        {connectionsList.map((conn) => {
          const dx = Math.abs(conn.x2 - conn.x1) * 0.5;
          const pathD = `M ${conn.x1} ${conn.y1} C ${conn.x1 + dx} ${conn.y1}, ${conn.x2 - dx} ${conn.y2}, ${conn.x2} ${conn.y2}`;
          
          return (
            <g key={conn.id} className="group pointer-events-auto">
              {/* Invisible wider interactive line to make hovering and clicking easier */}
              <path
                d={pathD}
                fill="none"
                stroke="transparent"
                strokeWidth="12"
                className="cursor-pointer"
                onClick={() => handleDisconnect(conn.fromId)}
              />
              {/* Elegant dashed line linking the cards */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#grad)" // fallback to solid
                className="stroke-indigo-500 dark:stroke-indigo-400 stroke-[2] stroke-dasharray-[4_4] transition-all group-hover:stroke-indigo-600 group-hover:stroke-[3]"
                style={{ strokeDasharray: '4,4' }}
                markerEnd="url(#arrow)"
              />
              {/* Small interactive disconnect bubble on hover */}
              <foreignObject
                x={conn.midX - 10}
                y={conn.midY - 10}
                width="20"
                height="20"
                className="overflow-visible"
              >
                <button
                  onClick={() => handleDisconnect(conn.fromId)}
                  className="w-5 h-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center text-rose-500 hover:text-rose-700 hover:bg-rose-50 hover:scale-110 shadow-sm cursor-pointer transition-all"
                  title="Excluir Conexão"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </foreignObject>
            </g>
          );
        })}
      </svg>

      {/* Actual canvas stage representing the whiteboard layout */}
      <div className="absolute w-[3500px] h-[2500px] top-0 left-0 pointer-events-none">
        
        {/* Render columns visually as zone cards or watermarks */}
        {columns.map((col, idx) => {
          const zoneX = idx * 340 + 60;
          return (
            <div
              key={col.id}
              className="absolute pointer-events-none select-none text-left"
              style={{ left: `${zoneX}px`, top: '40px', width: `${CARD_WIDTH}px` }}
            >
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-200/50 dark:bg-slate-800/40 border border-slate-300/30 dark:border-slate-800/30 rounded-xl text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                <span>{col.title}</span>
              </div>
            </div>
          );
        })}

        {/* Render absolute-positioned Cards */}
        {cards.map((card) => {
          const coords = getCardCoords(card);
          const isDragging = draggingCardId === card.id;

          // Priority styles
          const PRIORITY_MAP: Record<Priority, { label: string; bg: string; className: string }> = {
            high: { label: 'Alta', bg: 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300', className: 'border-rose-400' },
            medium: { label: 'Média', bg: 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300', className: 'border-amber-400' },
            low: { label: 'Baixa', bg: 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300', className: 'border-emerald-400' }
          };
          const prio = PRIORITY_MAP[card.priority];

          // Compute subtasks stats
          const totalSub = card.subtasks.length;
          const completedSub = card.subtasks.filter(s => s.completed).length;

          return (
            <div
              key={card.id}
              onMouseDown={(e) => handleStartDrag(card.id, e)}
              onTouchStart={(e) => handleStartDrag(card.id, e)}
              className={`absolute pointer-events-auto w-[260px] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 flex flex-col justify-between transition-shadow hover:shadow-xl cursor-grab active:cursor-grabbing ${
                isDragging ? 'shadow-2xl ring-2 ring-indigo-500/30 z-40 scale-[1.02]' : 'shadow-md z-10'
              } ${card.customBg || ''} ${card.customBorder || ''}`}
              style={{
                left: `${coords.x}px`,
                top: `${coords.y}px`,
                height: `${CARD_HEIGHT}px`
              }}
            >
              {/* Card Header & Handle */}
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2 text-left">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans truncate max-w-[130px]">
                    {card.companyName}
                  </span>
                  
                  {/* Priority indicator */}
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${prio.bg}`}>
                    {prio.label}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate text-left tracking-tight">
                  {card.title}
                </h3>

                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 text-left leading-tight">
                  {card.description || 'Sem descrição.'}
                </p>
              </div>

              {/* Middle Section: Checklists or Attachments tracker */}
              <div className="flex items-center justify-between text-[9px] text-slate-400 font-bold border-t border-slate-100 dark:border-slate-800/80 pt-2 text-left">
                <div className="flex items-center gap-1.5">
                  <CheckSquare className="w-3 h-3 text-indigo-500" />
                  <span>{completedSub}/{totalSub} Checklist</span>
                </div>

                {card.attachments && card.attachments.length > 0 && (
                  <div className="flex items-center gap-1 text-[9px] text-slate-400">
                    <Paperclip className="w-3 h-3" />
                    <span>{card.attachments.length}</span>
                  </div>
                )}
              </div>

              {/* Bottom Row Controls: Edit, Connector Dropdown, Columns Select */}
              <div className="flex items-center justify-between gap-1 mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                {/* Column placement selector */}
                <select
                  value={card.columnId}
                  onChange={(e) => {
                    onUpdateCard({ ...card, columnId: e.target.value });
                  }}
                  className="text-[9px] px-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded outline-none text-slate-500 font-semibold max-w-[85px] truncate cursor-pointer py-0.5"
                  title="Mover de Coluna"
                >
                  {columns.map(col => (
                    <option key={col.id} value={col.id}>{col.title}</option>
                  ))}
                </select>

                {/* Flowchart Connector selector */}
                <select
                  value={card.connectedTo || 'none'}
                  onChange={(e) => handleCardConnectSelect(card.id, e.target.value)}
                  className="text-[9px] px-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950 rounded outline-none font-bold max-w-[90px] truncate cursor-pointer py-0.5"
                  title="Conectar ao próximo passo"
                >
                  <option value="none">→ Conectar</option>
                  {cards.filter(c => c.id !== card.id).map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>

                {/* Custom Edit Action button */}
                <button
                  onClick={() => onEditCard(card)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-850 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="Ver / Editar Modal"
                >
                  <Settings className="w-3 h-3" />
                </button>
              </div>

            </div>
          );
        })}

        {/* Global Floating Quick Add Card button on canvas bottom right */}
        {columns.length > 0 && (
          <div className="fixed bottom-6 right-6 pointer-events-auto z-40">
            <button
              onClick={() => onAddCard(columns[0].id)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-all cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4" /> Novo Bloco no Canvas
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
