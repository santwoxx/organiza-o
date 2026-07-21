import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { X, Activity, User, Clock } from 'lucide-react';

interface ActivityLog {
  id: string;
  userEmail: string;
  action: string;
  details: string;
  timestamp: string;
}

interface ActivityLogModalProps {
  onClose: () => void;
}

export default function ActivityLogModal({ onClose }: ActivityLogModalProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'activity_logs'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logsData = snapshot.docs.map(doc => doc.data() as ActivityLog);
      setLogs(logsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col z-10 transition-all max-h-[85vh]">
        
        <div className="flex items-center justify-between px-6 py-4.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Logs de Atividade do Sistema
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex justify-center p-8 text-slate-400 text-sm font-bold">Carregando logs...</div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 text-center space-y-3">
              <Activity className="w-10 h-10 text-slate-300 dark:text-slate-700" />
              <p className="text-sm font-bold text-slate-500">Nenhuma atividade recente encontrada.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map(log => (
                <div key={log.id} className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-900/80 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {log.userEmail}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {log.action}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                      {log.details}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
