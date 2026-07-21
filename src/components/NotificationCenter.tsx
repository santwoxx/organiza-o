import React from 'react';
import { Bell, Clock, AlertTriangle, Check, X, ShieldAlert } from 'lucide-react';
import { AppNotification } from '../types';

interface NotificationCenterProps {
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onSelectCard: (cardId: string) => void;
}

export default function NotificationCenter({
  notifications,
  onMarkAsRead,
  onClearAll,
  onSelectCard
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="relative z-40 print:hidden" id="notification-center">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
        title="Notificações de Prazos"
        id="btn-notifications-trigger"
      >
        <Bell className="w-5.5 h-5.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <>
          {/* Click outside backdrop */}
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />

          <div
            className="absolute right-0 mt-3 w-88 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden z-40 transition-all transform origin-top-right scale-100"
            id="notifications-popover"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4.5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4.5 h-4.5 text-slate-700 dark:text-slate-300" />
                <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Lembretes de Prazos
                </h3>
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 cursor-pointer"
                >
                  Limpar todos
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-full mb-3">
                    <Check className="w-6 h-6 text-emerald-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Nenhum prazo urgente!
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                    Todas as suas empresas estão em dia.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 transition-colors flex items-start justify-between gap-2.5 cursor-pointer ${
                      notif.read
                        ? 'bg-transparent hover:bg-slate-50/50 dark:hover:bg-slate-800/20'
                        : 'bg-indigo-50/20 dark:bg-indigo-950/5 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/10'
                    }`}
                    onClick={() => {
                      onSelectCard(notif.cardId);
                      onMarkAsRead(notif.id);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex gap-2.5 items-start">
                      {notif.type === 'overdue' ? (
                        <div className="p-1.5 bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg mt-0.5 shrink-0">
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="p-1.5 bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg mt-0.5 shrink-0">
                          <Clock className="w-4 h-4" />
                        </div>
                      )}

                      <div className="text-left">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {notif.companyName}
                          </span>
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider ${
                              notif.type === 'overdue'
                                ? 'text-red-500'
                                : 'text-amber-600'
                            }`}
                          >
                            {notif.type === 'overdue' ? 'ATRASADO' : 'EM BREVE'}
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 line-clamp-2">
                          {notif.cardTitle}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          Prazo: {formatDate(notif.dueDate)}
                        </p>
                      </div>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMarkAsRead(notif.id);
                        }}
                        className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-800 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                        title="Marcar como lido"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer summary */}
            {notifications.length > 0 && (
              <div className="p-2.5 text-center bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 font-medium">
                Dica: Clique no alerta para inspecionar e editar o cartão.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
