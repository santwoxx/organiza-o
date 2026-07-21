import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Settings,
  CheckSquare,
  Paperclip,
  X,
  Link2,
  ZoomIn,
  ZoomOut,
  Maximize,
  Repeat
} from 'lucide-react';
import { Card, Column, Priority } from '../types';
import { getStreak } from '../utils/recurring';

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

// Virtual canvas size (the free space cards can be placed within)
const CANVAS_WIDTH = 5200;
const CANVAS_HEIGHT = 3400;

const MIN_SCALE = 0.25;
const MAX_SCALE = 2.5;

// Reads connections from a card, tolerating legacy data saved as a single string
const getConnections = (card: Card): string[] => {
  const raw = card.connectedTo as unknown;
  if (!raw) return [];
  return Array.isArray(raw) ? (raw as string[]) : [raw as string];
};

export default function FlowchartCanvas({
  cards,
  columns,
  onUpdateCard,
  onEditCard,
  onAddCard
}: FlowchartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // --- ZOOM & PAN STATE ---
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 40, y: 40 });
  const scaleRef = useRef(scale);
  const panRef = useRef(pan);
  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { panRef.current = pan; }, [pan]);

  const [isPanning, setIsPanning] = useState(false);
  const panPointerStart = useRef({ x: 0, y: 0 });
  const panOriginStart = useRef({ x: 0, y: 0 });

  const [touchMode, setTouchMode] = useState<'none' | 'pan' | 'pinch'>('none');
  const touchPanStart = useRef({ x: 0, y: 0 });
  const touchPanOrigin = useRef({ x: 0, y: 0 });
  const pinchStartDist = useRef(0);
  const pinchStartScale = useRef(1);

  // Dragging state (moving a card around the canvas)
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragCardStartCoords = useRef({ x: 0, y: 0 });

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

  // Keeps the content point under (screenX, screenY) fixed on screen while zooming
  const zoomAtPoint = (newScaleRaw: number, screenX: number, screenY: number) => {
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, newScaleRaw));
    const prevScale = scaleRef.current;
    if (newScale === prevScale) return;
    const prevPan = panRef.current;

    const contentX = (screenX - prevPan.x) / prevScale;
    const contentY = (screenY - prevPan.y) / prevScale;
    const nextPan = {
      x: screenX - contentX * newScale,
      y: screenY - contentY * newScale
    };

    scaleRef.current = newScale;
    panRef.current = nextPan;
    setScale(newScale);
    setPan(nextPan);
  };

  const applyPan = (dx: number, dy: number) => {
    const next = { x: panRef.current.x + dx, y: panRef.current.y + dy };
    panRef.current = next;
    setPan(next);
  };

  // --- WHEEL: scroll to pan, Ctrl/Cmd+scroll (or trackpad pinch) to zoom ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      if (e.ctrlKey || e.metaKey) {
        const zoomFactor = Math.exp(-e.deltaY * 0.01);
        zoomAtPoint(scaleRef.current * zoomFactor, screenX, screenY);
      } else {
        applyPan(-e.deltaX, -e.deltaY);
      }
    };

    el.addEventListener('wheel', handleWheelNative, { passive: false });
    return () => el.removeEventListener('wheel', handleWheelNative);
  }, []);

  // --- MOUSE PAN: click-drag on empty canvas background ---
  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('input') || target.closest('a')) return;
    if (target.closest('[data-canvas-card]')) return;

    setIsPanning(true);
    panPointerStart.current = { x: e.pageX, y: e.pageY };
    panOriginStart.current = { ...panRef.current };
  };

  useEffect(() => {
    if (!isPanning) return;

    const handleMove = (e: MouseEvent) => {
      const dx = e.pageX - panPointerStart.current.x;
      const dy = e.pageY - panPointerStart.current.y;
      const next = { x: panOriginStart.current.x + dx, y: panOriginStart.current.y + dy };
      panRef.current = next;
      setPan(next);
    };
    const handleUp = () => setIsPanning(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isPanning]);

  // --- TOUCH PAN & PINCH-ZOOM: one finger drags, two fingers pinch ---
  const handleBackgroundTouchStart = (e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('select') || target.closest('input') || target.closest('a')) return;
    if (target.closest('[data-canvas-card]')) return;

    if (e.touches.length === 2) {
      const [t1, t2] = [e.touches[0], e.touches[1]];
      pinchStartDist.current = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      pinchStartScale.current = scaleRef.current;
      setTouchMode('pinch');
    } else if (e.touches.length === 1) {
      touchPanStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      touchPanOrigin.current = { ...panRef.current };
      setTouchMode('pan');
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (touchMode === 'none' || !el) return;

    const handleTouchMoveNative = (e: TouchEvent) => {
      e.preventDefault();
      const rect = el.getBoundingClientRect();

      if (touchMode === 'pinch' && e.touches.length === 2) {
        const [t1, t2] = [e.touches[0], e.touches[1]];
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
        const midX = (t1.clientX + t2.clientX) / 2 - rect.left;
        const midY = (t1.clientY + t2.clientY) / 2 - rect.top;
        const ratio = dist / (pinchStartDist.current || dist);
        zoomAtPoint(pinchStartScale.current * ratio, midX, midY);
      } else if (touchMode === 'pan' && e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchPanStart.current.x;
        const dy = e.touches[0].clientY - touchPanStart.current.y;
        const next = { x: touchPanOrigin.current.x + dx, y: touchPanOrigin.current.y + dy };
        panRef.current = next;
        setPan(next);
      }
    };

    const handleTouchEndNative = (e: TouchEvent) => {
      if (e.touches.length === 0) setTouchMode('none');
    };

    el.addEventListener('touchmove', handleTouchMoveNative, { passive: false });
    el.addEventListener('touchend', handleTouchEndNative);
    el.addEventListener('touchcancel', handleTouchEndNative);
    return () => {
      el.removeEventListener('touchmove', handleTouchMoveNative);
      el.removeEventListener('touchend', handleTouchEndNative);
      el.removeEventListener('touchcancel', handleTouchEndNative);
    };
  }, [touchMode]);

  // --- ZOOM CONTROLS (buttons) ---
  const zoomByFactor = (factor: number) => {
    const el = containerRef.current;
    const cx = el ? el.clientWidth / 2 : 0;
    const cy = el ? el.clientHeight / 2 : 0;
    zoomAtPoint(scaleRef.current * factor, cx, cy);
  };
  const handleZoomIn = () => zoomByFactor(1.25);
  const handleZoomOut = () => zoomByFactor(1 / 1.25);
  const handleResetZoom = () => {
    const el = containerRef.current;
    const cx = el ? el.clientWidth / 2 : 0;
    const cy = el ? el.clientHeight / 2 : 0;
    zoomAtPoint(1, cx, cy);
  };

  // Fit every card into view
  const handleFitView = () => {
    const el = containerRef.current;
    if (!el || cards.length === 0) return;

    const coordsList = cards.map(getCardCoords);
    const minX = Math.min(...coordsList.map((c) => c.x));
    const minY = Math.min(...coordsList.map((c) => c.y));
    const maxX = Math.max(...coordsList.map((c) => c.x + CARD_WIDTH));
    const maxY = Math.max(...coordsList.map((c) => c.y + CARD_HEIGHT));

    const contentW = Math.max(1, maxX - minX);
    const contentH = Math.max(1, maxY - minY);
    const padding = 90;
    const newScale = Math.min(
      MAX_SCALE,
      Math.max(MIN_SCALE, Math.min((el.clientWidth - padding * 2) / contentW, (el.clientHeight - padding * 2) / contentH, 1))
    );
    const nextPan = {
      x: (el.clientWidth - contentW * newScale) / 2 - minX * newScale,
      y: (el.clientHeight - contentH * newScale) / 2 - minY * newScale
    };

    scaleRef.current = newScale;
    panRef.current = nextPan;
    setScale(newScale);
    setPan(nextPan);
  };

  // --- CARD DRAGGING EVENT HANDLERS ---
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

    e.stopPropagation();
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

      // Screen-pixel delta must be converted to content-space delta based on the current zoom level
      const deltaX = (pageX - dragStartPos.current.x) / scaleRef.current;
      const deltaY = (pageY - dragStartPos.current.y) / scaleRef.current;

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

  // --- FLOWCHART CONNECTION HANDLERS (a card can branch into several next steps) ---
  const handleAddConnection = (sourceId: string, targetId: string) => {
    if (!targetId) return;
    const sourceCard = cards.find(c => c.id === sourceId);
    if (!sourceCard) return;
    const current = getConnections(sourceCard);
    if (current.includes(targetId)) return;
    onUpdateCard({ ...sourceCard, connectedTo: [...current, targetId] });
  };

  const handleRemoveConnection = (sourceId: string, targetId: string) => {
    const sourceCard = cards.find(c => c.id === sourceId);
    if (!sourceCard) return;
    const next = getConnections(sourceCard).filter(id => id !== targetId);
    onUpdateCard({ ...sourceCard, connectedTo: next.length > 0 ? next : undefined });
  };

  // Compile active connections to render lines (a card may now link to several targets)
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
    getConnections(fromCard).forEach((targetId) => {
      const toCard = cards.find(c => c.id === targetId);
      if (!toCard) return;

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
    });
  });

  const gridSize = 24 * scale;
  const gridOffsetX = pan.x % gridSize;
  const gridOffsetY = pan.y % gridSize;

  return (
    <div
      className={`flex-1 overflow-hidden select-none bg-slate-50 dark:bg-slate-950 relative min-h-[500px] ${
        isPanning || touchMode === 'pan' ? 'cursor-grabbing' : 'cursor-grab'
      }`}
      style={{
        backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
        backgroundSize: `${gridSize}px ${gridSize}px`,
        backgroundPosition: `${gridOffsetX}px ${gridOffsetY}px`,
        color: 'var(--canvas-dot-color, #e2e8f0)'
      }}
      id="flowchart-stage"
      ref={containerRef}
      onMouseDown={handleBackgroundMouseDown}
      onTouchStart={handleBackgroundTouchStart}
    >
      <style>{`
        #flowchart-stage { --canvas-dot-color: #e2e8f0; }
        .dark #flowchart-stage { --canvas-dot-color: #1e293b; }
      `}</style>

      {/* Visual Canvas Instruction Header (fixed to viewport, unaffected by pan/zoom) */}
      <div className="absolute top-4 left-6 pointer-events-none bg-white/90 dark:bg-slate-900/95 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 shadow-sm flex items-center gap-2 z-20 max-w-[calc(100%-3rem)]">
        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shrink-0" />
        <span className="truncate">MESA CANVAS: arraste os blocos, role para navegar, Ctrl+Scroll (ou pinça) para zoom, e conecte quantos passos quiser!</span>
      </div>

      {/* Zoom controls (fixed to viewport, unaffected by pan/zoom) */}
      <div className="absolute bottom-6 left-6 pointer-events-auto z-40 flex items-center gap-0.5 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg p-1">
        <button
          onClick={handleZoomOut}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
          title="Diminuir Zoom"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleResetZoom}
          className="px-1.5 min-w-[38px] text-center text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
          title="Redefinir Zoom (100%)"
        >
          {Math.round(scale * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
          title="Aumentar Zoom"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-0.5" />
        <button
          onClick={handleFitView}
          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer transition-colors"
          title="Ajustar Todos os Cartões à Tela"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Transformed content layer: pan + zoom applied here only */}
      <div
        className="absolute top-0 left-0"
        style={{
          width: `${CANVAS_WIDTH}px`,
          height: `${CANVAS_HEIGHT}px`,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
          transformOrigin: '0 0'
        }}
      >
        {/* SVG Canvas overlay layer for connections */}
        <svg className="absolute inset-0 pointer-events-none w-full h-full z-0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT}>
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
                  onClick={() => handleRemoveConnection(conn.fromId, conn.toId)}
                />
                {/* Elegant dashed line linking the cards */}
                <path
                  d={pathD}
                  fill="none"
                  className="stroke-indigo-500 dark:stroke-indigo-400 stroke-[2] transition-all group-hover:stroke-indigo-600 group-hover:stroke-[3]"
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
                    onClick={() => handleRemoveConnection(conn.fromId, conn.toId)}
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
        <div className="absolute w-full h-full top-0 left-0 pointer-events-none">

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
            const connections = getConnections(card);
            const availableTargets = cards.filter(c => c.id !== card.id && !connections.includes(c.id));
            const recurring = !!card.isRecurring;
            const streak = recurring ? getStreak(card.completedDates) : 0;

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
                data-canvas-card
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
                    <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans truncate max-w-[110px]">
                      {card.companyName}
                    </span>

                    <div className="flex items-center gap-1 shrink-0">
                      {recurring && (
                        <span
                          className="flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400"
                          title={`Demanda recorrente (diária)${streak > 0 ? ` — ${streak} dia(s) em sequência` : ''}`}
                        >
                          <Repeat className="w-2.5 h-2.5" />
                          {streak > 0 && streak}
                        </span>
                      )}
                      {connections.length > 0 && (
                        <span className="flex items-center gap-0.5 text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400" title={`${connections.length} conexão(ões)`}>
                          <Link2 className="w-2.5 h-2.5" /> {connections.length}
                        </span>
                      )}
                      {/* Priority indicator */}
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${prio.bg}`}>
                        {prio.label}
                      </span>
                    </div>
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
                    value={columns.some(col => col.id === card.columnId) ? card.columnId : '__missing__'}
                    onChange={(e) => {
                      if (e.target.value === '__missing__') return;
                      onUpdateCard({ ...card, columnId: e.target.value });
                    }}
                    className={`text-[9px] px-1 bg-slate-50 dark:bg-slate-950 border rounded outline-none font-semibold max-w-[75px] truncate cursor-pointer py-0.5 ${
                      columns.some(col => col.id === card.columnId)
                        ? 'border-slate-200 dark:border-slate-800 text-slate-500'
                        : 'border-amber-300 dark:border-amber-800 text-amber-600 dark:text-amber-400'
                    }`}
                    title="Mover de Coluna"
                  >
                    {!columns.some(col => col.id === card.columnId) && (
                      <option value="__missing__" disabled>⚠ Sem coluna</option>
                    )}
                    {columns.map(col => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>

                  {/* Flowchart Connector selector: adds a new branch without replacing existing ones */}
                  <select
                    value=""
                    onChange={(e) => handleAddConnection(card.id, e.target.value)}
                    className="text-[9px] px-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950 rounded outline-none font-bold max-w-[90px] truncate cursor-pointer py-0.5"
                    title="Conectar a um próximo passo (pode ligar a vários)"
                  >
                    <option value="">→ Conectar</option>
                    {availableTargets.map(c => (
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
        </div>
      </div>

      {/* Global Floating Quick Add Card button on canvas bottom right (fixed to viewport) */}
      {columns.length > 0 && (
        <div className="absolute bottom-6 right-6 pointer-events-auto z-40">
          <button
            onClick={() => onAddCard(columns[0].id)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-all cursor-pointer text-xs"
          >
            <Plus className="w-4 h-4" /> Novo Bloco no Canvas
          </button>
        </div>
      )}

    </div>
  );
}
