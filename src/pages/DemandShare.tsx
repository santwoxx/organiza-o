import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Card, Attachment } from '../types';
import { CheckCircle, Paperclip, CheckSquare, Layers, Clock, AlertCircle, MessageSquare, Send } from 'lucide-react';

export default function DemandShare() {
  const { cardId } = useParams<{ cardId: string }>();
  const [card, setCard] = useState<Card | null>(null);
  const [loading, setLoading] = useState(true);
  const [newAttachment, setNewAttachment] = useState('');
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchCard = async () => {
      if (!cardId) return;
      try {
        const docRef = doc(db, 'cards', cardId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCard(docSnap.data() as Card);
        }
      } catch (error) {
        console.error("Error fetching demand:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCard();
  }, [cardId]);

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!card || !cardId) return;
    const updatedSubtasks = card.subtasks.map(s => 
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    const updatedCard = { ...card, subtasks: updatedSubtasks };
    
    setCard(updatedCard);
    
    try {
      await updateDoc(doc(db, 'cards', cardId), { subtasks: updatedSubtasks });
    } catch (error) {
      console.error("Error updating subtask:", error);
    }
  };

  const handleAddAttachment = async () => {
    if (!card || !cardId || !newAttachment.trim()) return;
    
    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name: 'Link Anexado (Externo)',
      url: newAttachment.trim(),
      type: 'link'
    };

    const updatedAttachments = [...(card.attachments || []), newAtt];
    const updatedCard = { ...card, attachments: updatedAttachments };
    
    setCard(updatedCard);
    setNewAttachment('');

    try {
      await updateDoc(doc(db, 'cards', cardId), { attachments: updatedAttachments });
    } catch (error) {
      console.error("Error adding attachment:", error);
    }
  };

  const handleAddComment = async () => {
    if (!card || !cardId || !newComment.trim()) return;
    
    const comment = {
      id: `msg-${Date.now()}`,
      text: newComment.trim(),
      author: 'Colaborador (Link Externo)',
      createdAt: new Date().toISOString()
    };

    const updatedComments = [...(card.comments || []), comment];
    const updatedCard = { ...card, comments: updatedComments };
    
    setCard(updatedCard);
    setNewComment('');

    try {
      await updateDoc(doc(db, 'cards', cardId), { comments: updatedComments });
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleMarkAsDone = async () => {
    if (!card || !cardId) return;
    const updatedCard = { ...card, completed: true };
    setCard(updatedCard);

    try {
      await updateDoc(doc(db, 'cards', cardId), { completed: true });
      alert('Serviço marcado como concluído com sucesso! Muito obrigado.');
    } catch (error) {
      console.error("Error updating status:", error);
      alert('Erro ao confirmar serviço.');
    }
  };

  const getPendingTime = (createdAt?: string) => {
    if (!createdAt) return 'Tempo não registrado';
    const start = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diff = now - start;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days} dia(s) e ${hours} hr(s) pendente`;
    if (hours > 0) return `${hours} hr(s) pendente`;
    const mins = Math.floor((diff / (1000 * 60)) % 60);
    return `${mins} min(s) pendente`;
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Carregando Demanda...</div>;
  }

  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
        <AlertCircle className="w-12 h-12 text-rose-500" />
        <h1 className="text-xl font-bold text-slate-800">Demanda não encontrada</h1>
        <p className="text-slate-500">O link pode estar quebrado ou o card foi deletado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans p-4 sm:p-8">
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-8 text-white relative">
          <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
            {card.companyName}
          </div>
          <h1 className="text-3xl font-bold mb-2">{card.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-indigo-100 text-sm mt-4">
            <span className="flex items-center gap-1 bg-indigo-700/50 px-3 py-1 rounded-full"><Clock className="w-4 h-4"/> {getPendingTime(card.createdAt)}</span>
            {card.dueDate && (
              <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4"/> Prazo: {new Date(card.dueDate).toLocaleDateString()}</span>
            )}
            <span className="flex items-center gap-1"><Layers className="w-4 h-4"/> Prioridade {card.priority}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-8">
          <div>
            <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Descrição</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {card.description || 'Nenhuma descrição fornecida.'}
            </p>
          </div>

          {/* Checklist */}
          {card.subtasks && card.subtasks.length > 0 && (
            <div>
              <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" /> Checklist de Atividades
              </h2>
              <div className="space-y-2">
                {card.subtasks.map(task => (
                  <label key={task.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <input 
                      type="checkbox" 
                      checked={task.completed}
                      onChange={() => handleToggleSubtask(task.id)}
                      className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className={`flex-1 font-medium ${task.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                      {task.text}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Attachments */}
          <div>
            <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Paperclip className="w-4 h-4" /> Anexos e Entregáveis
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="url" 
                placeholder="Cole um link do Google Drive, Dropbox, etc..."
                value={newAttachment}
                onChange={e => setNewAttachment(e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              />
              <button 
                onClick={handleAddAttachment}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
              >
                Anexar
              </button>
            </div>

            {card.attachments && card.attachments.length > 0 && (
              <div className="space-y-2">
                {card.attachments.map(att => (
                  <a 
                    key={att.id} 
                    href={att.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-300 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <span className="flex-1 truncate">{att.url}</span>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Comments Section */}
          <div>
            <h2 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" /> Comentários
            </h2>
            
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Escreva um comentário ou feedback..."
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-slate-800 dark:text-slate-200"
              />
              <button 
                onClick={handleAddComment}
                className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" /> Enviar
              </button>
            </div>

            {card.comments && card.comments.length > 0 && (
              <div className="space-y-3">
                {card.comments.map(c => (
                  <div key={c.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-300">{c.author}</span>
                      <span className="text-xs text-slate-400">{new Date(c.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm whitespace-pre-wrap">{c.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
            {card.completed ? (
              <div className="flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 py-4 rounded-2xl font-bold text-lg">
                <CheckCircle className="w-6 h-6" />
                Serviço Concluído
              </div>
            ) : (
              <button 
                onClick={handleMarkAsDone}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer"
              >
                <CheckCircle className="w-6 h-6" />
                Confirmar Finalização do Serviço
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
