import React from 'react';
import {
  Briefcase,
  Layout,
  Plus,
  Printer,
  Download,
  Upload,
  User,
  CheckCircle,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  Sliders,
  FolderLock,
  Trash2,
  Edit2
} from 'lucide-react';
import { Board, Company, Card } from '../types';

interface BoardSidebarProps {
  boards: Board[];
  activeBoardId: string;
  onSelectBoard: (boardId: string) => void;
  companies: Company[];
  cards: Card[];
  onOpenReport: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddCustomBoard: (name: string, companyNames: string[], color: string) => void;
  onEditBoard: (boardId: string, name: string, companyNames: string[], color: string) => void;
  onAddCompany: (name: string, tagline: string, color: string) => void;
  onDeleteCompany: (companyId: string) => void;
}

export default function BoardSidebar({
  boards,
  activeBoardId,
  onSelectBoard,
  companies,
  cards,
  onOpenReport,
  onExportData,
  onImportData,
  onAddCustomBoard,
  onEditBoard,
  onAddCompany,
  onDeleteCompany
}: BoardSidebarProps) {
  const [showAddBoardForm, setShowAddBoardForm] = React.useState(false);
  const [newBoardName, setNewBoardName] = React.useState('');
  const [newBoardCompanies, setNewBoardCompanies] = React.useState<string[]>([]);
  const [newBoardColor, setNewBoardColor] = React.useState('indigo');

  // New state for adding companies
  const [showAddCompanyForm, setShowAddCompanyForm] = React.useState(false);
  const [newCompanyName, setNewCompanyName] = React.useState('');
  const [newCompanyTagline, setNewCompanyTagline] = React.useState('');
  const [newCompanyColor, setNewCompanyColor] = React.useState('blue');

  const [editingBoard, setEditingBoard] = React.useState<Board | null>(null);
  const [editBoardName, setEditBoardName] = React.useState('');
  const [editBoardCompanies, setEditBoardCompanies] = React.useState<string[]>([]);
  const [editBoardColor, setEditBoardColor] = React.useState('indigo');

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    onAddCustomBoard(newBoardName.trim(), newBoardCompanies, newBoardColor);
    setNewBoardName('');
    setNewBoardCompanies([]);
    setShowAddBoardForm(false);
  };

  const handleAddCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompanyName.trim()) return;
    onAddCompany(
      newCompanyName.trim(),
      newCompanyTagline.trim() || 'Gestão Corporativa',
      newCompanyColor
    );
    setNewCompanyName('');
    setNewCompanyTagline('');
    setShowAddCompanyForm(false);
  };

  const handleEditBoardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBoard || !editBoardName.trim()) return;
    
    onEditBoard(editingBoard.id, editBoardName.trim(), editBoardCompanies, editBoardColor);
    setEditingBoard(null);
  };

  const getCompanyStats = (boardId?: string, boardCompanyNames?: string[], legacyName?: string) => {
    // Escopo por board: cada quadro só deve contar os cartões que realmente pertencem a ele
    let compCards = boardId ? cards.filter(c => c.boardId === boardId) : cards;

    if (boardCompanyNames && boardCompanyNames.length > 0) {
      compCards = compCards.filter(c =>
        (c.companyNames && c.companyNames.some(n => boardCompanyNames.includes(n))) ||
        (c.companyName && boardCompanyNames.includes(c.companyName))
      );
    } else if (legacyName && legacyName !== 'Todas as Empresas') {
      compCards = compCards.filter(c => c.companyName === legacyName);
    }
    const total = compCards.length;
    const completed = compCards.filter(c => c.completed).length;
    return { total, completed };
  };

  return (
    <aside className="w-68 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col border-r border-slate-200 dark:border-slate-900 shrink-0 h-full print:hidden">
      {/* Brand Profile */}
      <div className="p-4.5 border-b border-slate-100 dark:border-slate-900 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-xs select-none">
          O
        </div>
        <div className="text-left">
          <h2 className="text-sm font-black tracking-wider text-slate-900 dark:text-white leading-tight">
            organiZE
          </h2>
          <span className="text-[9px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest block">
            WORKSPACE PRO
          </span>
        </div>
      </div>

      {/* User profile identifier */}
      <div className="px-4.5 py-3 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/10 flex items-center gap-2.5">
        <div className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg">
          <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
        </div>
        <div className="text-left truncate">
          <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Gestor Ativo
          </p>
          <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate" title="brisasofc@gmail.com">
            brisasofc@gmail.com
          </p>
        </div>
      </div>

      {/* Boards List Section */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
            <span>Fluxos / Quadros</span>
            <button
              onClick={() => setShowAddBoardForm(!showAddBoardForm)}
              className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded transition-all cursor-pointer"
              title="Novo Quadro de Fluxo"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Boards list buttons */}
          <div className="space-y-1">
            {boards.map((b) => {
              const isActive = b.id === activeBoardId;
              const stats = getCompanyStats(b.id, b.companyNames, b.companyName);

              return (
                <div key={b.id} className="group relative flex items-center">
                  <button
                    onClick={() => onSelectBoard(b.id)}
                    className={`flex-1 w-full text-left px-3 py-2.5 rounded-xl transition-all flex items-center gap-3 relative overflow-hidden group ${
                      isActive 
                        ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-bold shadow-sm border border-indigo-100 dark:border-indigo-800/60' 
                        : 'text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-900 border border-transparent'
                    }`}
                  >
                    <Layout className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm">{b.name}</div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5 truncate flex gap-2">
                        <span>{b.companyNames?.join(', ') || b.companyName}</span>
                      </div>
                    </div>
                    {/* Status Badge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                        {stats.total}
                      </div>
                      {stats.completed > 0 && stats.completed === stats.total && (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      )}
                    </div>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-indigo-500 rounded-r-full" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBoard(b);
                      setEditBoardName(b.name);
                      setEditBoardCompanies(b.companyNames || (b.companyName && b.companyName !== 'Todas as Empresas' ? [b.companyName] : []));
                      setEditBoardColor(b.color || 'indigo');
                    }}
                    className={`absolute right-2 opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 transition-all ${isActive ? 'opacity-100 bg-white/50 dark:bg-slate-900/50' : ''}`}
                    title="Editar Quadro"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Segment: Quick Companies Reference List */}
        <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-900">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2">
            <span>Empresas ({companies.filter(c => c.id !== 'all').length})</span>
            <button
              onClick={() => setShowAddCompanyForm(!showAddCompanyForm)}
              className="p-0.5 hover:bg-slate-100 dark:hover:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded transition-all cursor-pointer"
              title="Adicionar Nova Empresa"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Company Popover Form */}
          {showAddCompanyForm && (
            <form onSubmit={handleAddCompanySubmit} className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5 my-2">
              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block text-left">Nome da Empresa</span>
                <input
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Ex: Tesla Motors"
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none text-slate-800 dark:text-slate-200 font-medium"
                  required
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block text-left">Setor / Slogan</span>
                <input
                  type="text"
                  value={newCompanyTagline}
                  onChange={(e) => setNewCompanyTagline(e.target.value)}
                  placeholder="Ex: Energia Sustentável"
                  className="w-full px-2 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-none text-slate-800 dark:text-slate-200 font-medium"
                />
              </div>

              <div className="space-y-1">
                <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 block text-left">Cor Temática</span>
                <select
                  value={newCompanyColor}
                  onChange={(e) => setNewCompanyColor(e.target.value)}
                  className="w-full px-1.5 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[11px] outline-none text-slate-700 dark:text-slate-300 font-medium"
                >
                  <option value="blue">Azul (Tecnologia)</option>
                  <option value="amber">Amarelo (Alimentos)</option>
                  <option value="purple">Roxo (Criativo)</option>
                  <option value="emerald">Verde (Logística)</option>
                  <option value="rose">Rosa (Moda/Vendas)</option>
                  <option value="indigo">Índigo (Geral)</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyForm(false)}
                  className="px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-[10px]"
                >
                  Adicionar
                </button>
              </div>
            </form>
          )}

          <div className="space-y-1.5">
            {companies.filter(c => c.id !== 'all').map((comp) => {
              const stats = getCompanyStats(undefined, [comp.name]);
              const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

              return (
                <div key={comp.id} className="p-2 rounded-xl bg-slate-50/50 dark:bg-slate-900/10 border border-slate-100 dark:border-slate-900 text-left space-y-1 group relative">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 pr-6">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block truncate" title={comp.name}>
                        {comp.name}
                      </span>
                      <span className="text-[8px] font-semibold text-slate-400 dark:text-slate-500 block truncate leading-tight">
                        {comp.tagline}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => onDeleteCompany(comp.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded cursor-pointer transition-colors"
                        title="Excluir Empresa"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500">{pct}%</span>
                  </div>
                  {/* Progress micro-bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        comp.color === 'blue'
                          ? 'bg-blue-500'
                          : comp.color === 'amber'
                          ? 'bg-amber-500'
                          : comp.color === 'purple'
                          ? 'bg-purple-500'
                          : comp.color === 'emerald'
                          ? 'bg-emerald-500'
                          : comp.color === 'rose'
                          ? 'bg-rose-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="p-4 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-900 space-y-2">
        {/* Weekly Report Button */}
        <button
          onClick={onOpenReport}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-medium transition-all cursor-pointer border border-transparent shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" /> Relatório de Impressão
        </button>

        {/* Export / Import Database actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onExportData}
            className="flex items-center justify-center gap-1 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-[10px] font-medium transition-all cursor-pointer"
            title="Exportar backup JSON"
          >
            <Download className="w-3 h-3" /> Backup
          </button>
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-1 py-1.5 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-lg text-[10px] font-medium transition-all cursor-pointer"
            title="Importar backup JSON"
          >
            <Upload className="w-3 h-3" /> Restaurar
          </button>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImportData}
            accept=".json"
            className="hidden"
          />
        </div>

        <div className="text-[9px] text-slate-500 text-center font-semibold pt-1">
          organiZE Workspace v2.0
        </div>
      </div>

      {/* Add Board Popover Form */}
      {showAddBoardForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
              <Layout className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Criar Novo Quadro</h3>
            </div>
            <form onSubmit={handleAddBoard} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Nome do Quadro</label>
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Ex: Sites em geral"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-300"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Vincular a Empresas (Opcional)</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg max-h-32 overflow-y-auto">
                  {companies.filter(c => c.id !== 'all').map(c => {
                    const isSelected = newBoardCompanies.includes(c.name);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setNewBoardCompanies(newBoardCompanies.filter(n => n !== c.name));
                          } else {
                            setNewBoardCompanies([...newBoardCompanies, c.name]);
                          }
                        }}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                  {companies.filter(c => c.id !== 'all').length === 0 && (
                    <span className="text-xs text-slate-400 italic p-1">Nenhuma empresa criada ainda.</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Se não selecionar nenhuma, o quadro será geral ("Todas as Empresas").</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBoardForm(false)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md cursor-pointer"
                >
                  Criar Quadro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Board Modal */}
      {editingBoard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
              <Edit2 className="w-4 h-4 text-indigo-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Editar Quadro</h3>
            </div>
            <form onSubmit={handleEditBoardSubmit} className="p-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Nome do Quadro</label>
                <input
                  type="text"
                  value={editBoardName}
                  onChange={(e) => setEditBoardName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 dark:text-slate-300"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Vincular a Empresas (Opcional)</label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg max-h-32 overflow-y-auto">
                  {companies.filter(c => c.id !== 'all').map(c => {
                    const isSelected = editBoardCompanies.includes(c.name);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setEditBoardCompanies(editBoardCompanies.filter(n => n !== c.name));
                          } else {
                            setEditBoardCompanies([...editBoardCompanies, c.name]);
                          }
                        }}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-800' 
                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                      >
                        {c.name}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Se não selecionar nenhuma, o quadro será geral ("Todas as Empresas").</p>
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingBoard(null)}
                  className="flex-1 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-md cursor-pointer"
                >
                  Salvar Edição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}
