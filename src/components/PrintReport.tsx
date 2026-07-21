import React from 'react';
import { Printer, X, Briefcase, Calendar, CheckSquare, Clock, FileText, ChevronRight, FileSpreadsheet } from 'lucide-react';
import { Card, Board, Column, Company } from '../types';

interface PrintReportProps {
  cards: Card[];
  companies: Company[];
  boards: Board[];
  onClose: () => void;
}

export default function PrintReport({
  cards,
  companies,
  boards,
  onClose
}: PrintReportProps) {
  const [selectedCompanyId, setSelectedCompanyId] = React.useState('all');
  const [reportTitle, setReportTitle] = React.useState('Relatório Semanal de Atividades');
  const [executiveSummary, setExecutiveSummary] = React.useState(
    'Este documento consolida o andamento das pendências, conquistas e cronogramas de atividades das nossas empresas parceiras para fins de alinhamento estratégico semanal.'
  );
  const [reportDate, setReportDate] = React.useState(
    new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  );

  const businessCompanies = companies.filter(c => c.id !== 'all');

  // Filter cards based on selected company
  const getFilteredCards = () => {
    if (selectedCompanyId === 'all') return cards;
    const targetComp = companies.find(c => c.id === selectedCompanyId);
    if (!targetComp) return cards;
    return cards.filter(c => c.companyName === targetComp.name);
  };

  const filteredCards = getFilteredCards();
  const totalTasks = filteredCards.length;
  const completedTasks = filteredCards.filter(c => c.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  // Check if task is overdue (deadline passed and not completed)
  const isOverdue = (card: Card) => {
    if (!card.dueDate || card.completed) return false;
    return new Date(card.dueDate) < new Date();
  };
  const overdueTasksCount = filteredCards.filter(isOverdue).length;

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sem prazo';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/20 dark:text-red-400';
      case 'medium': return 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400';
      default: return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-slate-950 overflow-y-auto flex flex-col min-h-screen">
      
      {/* Configuration Header (Hidden on actual print) */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4.5 sticky top-0 z-20 print:hidden shadow-sm">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Printer className="w-5.5 h-5.5" />
            </span>
            <div className="text-left">
              <h1 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Gerador de Relatórios Semanais
              </h1>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Configure os filtros abaixo e clique em "Imprimir" para gerar o PDF formatado.
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap justify-center gap-2 w-full md:w-auto">
            {/* Filter by company before print */}
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="flex-1 sm:flex-none min-w-0 px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold text-slate-700 dark:text-slate-300 transition-all"
            >
              <option value="all">Filtro: Todas as Empresas</option>
              {businessCompanies.map((c) => (
                <option key={c.id} value={c.id}>
                  Filtro: {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={handlePrint}
              className="shrink-0 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-indigo-600/15 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Imprimir Relatório
            </button>

            <button
              onClick={onClose}
              className="shrink-0 p-2 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-800"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Editor Controls in screen view (Hidden on print) */}
      <div className="max-w-4xl mx-auto w-full p-4.5 mt-4 print:hidden">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-indigo-500" /> Personalizar Dados do Relatório
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Título Principal</span>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 font-semibold"
              />
            </div>
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Subtítulo / Data de Referência</span>
              <input
                type="text"
                value={reportDate}
                onChange={(e) => setReportDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">Sumário Executivo</span>
            <textarea
              value={executiveSummary}
              onChange={(e) => setExecutiveSummary(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>
        </div>
      </div>

      {/* --- PRINT CONTAINER --- */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-3 sm:p-4.5 md:p-10 mb-16 print:p-0 print:mb-0">

        {/* Printable Card A4 simulation */}
        <div className="bg-white text-slate-900 rounded-3xl shadow-xl border border-slate-200/80 p-5 sm:p-8 md:p-12 print:border-none print:shadow-none print:p-0 flex flex-col gap-8 text-left min-h-[1050px]">

          {/* Header section */}
          <div className="border-b-2 border-slate-800 pb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {reportTitle}
              </h1>
              <p className="text-sm font-semibold text-indigo-600 mt-1 flex items-center gap-1.5 uppercase tracking-wide">
                <Calendar className="w-4 h-4 text-indigo-500" /> {reportDate}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Workspace de Gestão
              </span>
              <p className="text-xs font-medium text-slate-600 mt-0.5">
                4 Empresas Integradas
              </p>
            </div>
          </div>

          {/* Executive Notes */}
          <div className="p-4.5 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Sumário Executivo
            </h3>
            <p className="text-xs leading-relaxed text-slate-700 whitespace-pre-wrap font-medium">
              {executiveSummary}
            </p>
          </div>

          {/* Quick numbers summary */}
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-slate-100 rounded-2xl bg-white text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Atividades Totais
              </span>
              <span className="text-2xl font-black text-slate-800">{totalTasks}</span>
            </div>
            <div className="p-4 border-2 border-slate-100 rounded-2xl bg-white text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block mb-1">
                Concluído ✅
              </span>
              <span className="text-2xl font-black text-emerald-600">{completedTasks}</span>
              <span className="text-[9px] text-slate-400 block font-bold mt-0.5">
                {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}% de progresso
              </span>
            </div>
            <div className="p-4 border-2 border-slate-100 rounded-2xl bg-white text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 block mb-1">
                Pendências 📌
              </span>
              <span className="text-2xl font-black text-amber-600">{pendingTasks}</span>
              {overdueTasksCount > 0 && (
                <span className="text-[9px] text-red-600 bg-red-50 font-bold px-1.5 py-0.5 rounded mt-1 inline-block">
                  {overdueTasksCount} Atrasadas
                </span>
              )}
            </div>
          </div>

          {/* Tasks list categorized by Company */}
          <div className="space-y-6">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-2 flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-slate-700" /> Detalhamento por Empresa
            </h2>

            {businessCompanies
              .filter((comp) => selectedCompanyId === 'all' || comp.id === selectedCompanyId)
              .map((comp) => {
                const compCards = cards.filter((c) => c.companyName === comp.name);
                const compPending = compCards.filter(c => !c.completed);
                const compDone = compCards.filter(c => c.completed);

                if (compCards.length === 0) return null;

                return (
                  <div key={comp.id} className="space-y-3 p-4 border border-slate-200 rounded-2xl break-inside-avoid">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-slate-800" />
                        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                          {comp.name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {compCards.length} tarefas listadas
                      </span>
                    </div>

                    {/* Pending Sub-List */}
                    {compPending.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                          📌 Atividades Pendentes
                        </h4>
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white">
                          {compPending.map((card) => (
                            <div key={card.id} className="p-3 flex items-start justify-between gap-4 text-left">
                              <div className="space-y-1">
                                <p className="text-xs font-bold text-slate-800 leading-tight">
                                  {card.title}
                                </p>
                                {card.description && (
                                  <p className="text-[11px] text-slate-500 line-clamp-1">
                                    {card.description}
                                  </p>
                                )}
                                {card.subtasks.length > 0 && (
                                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400">
                                    <CheckSquare className="w-3 h-3 text-slate-400" />
                                    Subtarefas: {card.subtasks.filter(s => s.completed).length} de {card.subtasks.length} concluídas
                                  </div>
                                )}
                              </div>
                              <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase border ${getPriorityColor(card.priority)}`}>
                                  Prioridade {card.priority === 'high' ? 'Alta' : card.priority === 'medium' ? 'Média' : 'Baixa'}
                                </span>
                                <span className={`text-[9px] font-semibold text-slate-500 flex items-center gap-1 ${isOverdue(card) ? 'text-red-600 bg-red-50 px-1 py-0.5 rounded' : ''}`}>
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  Até {formatDate(card.dueDate)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Completed Sub-List */}
                    {compDone.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 flex items-center gap-1">
                          ✅ Atividades Concluídas
                        </h4>
                        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white opacity-85">
                          {compDone.map((card) => (
                            <div key={card.id} className="p-3 flex items-start justify-between gap-4 text-left bg-emerald-50/10">
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-slate-700 line-through leading-tight">
                                  {card.title}
                                </p>
                                {card.description && (
                                  <p className="text-[10px] text-slate-500 line-clamp-1">
                                    {card.description}
                                  </p>
                                )}
                              </div>
                              <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase self-center shrink-0">
                                Concluído
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {compCards.length === 0 && (
                      <p className="text-xs text-slate-400 italic">Nenhuma atividade para esta empresa.</p>
                    )}
                  </div>
                );
              })}
          </div>

          {/* Footer signature */}
          <div className="mt-auto border-t border-slate-200 pt-6 text-center text-[10px] text-slate-400 font-bold flex items-center justify-between">
            <span>Organizador Kanban Canva - Relatório Corporativo</span>
            <span>Gerado por {localStorage.getItem('canva_user_email') || 'brisasofc@gmail.com'}</span>
          </div>

        </div>
      </div>
    </div>
  );
}
