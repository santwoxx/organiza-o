import React from 'react';
import { X, Plus, Trash2, Calendar, ListTodo, Palette, Tag, Briefcase, Paperclip, Link2, FileText, Upload, Download, ExternalLink } from 'lucide-react';
import { Card, Priority, Subtask, Attachment } from '../types';

interface CardModalProps {
  card: Card | null;
  companies: { id: string; name: string; color: string }[];
  columns: { id: string; title: string }[];
  onClose: () => void;
  onSave: (updatedCard: Card) => void;
  onDelete: (cardId: string) => void;
}

export default function CardModal({
  card,
  companies,
  columns,
  onClose,
  onSave,
  onDelete
}: CardModalProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [priority, setPriority] = React.useState<Priority>('medium');
  const [dueDate, setDueDate] = React.useState('');
  const [companyName, setCompanyName] = React.useState('');
  const [columnId, setColumnId] = React.useState('');
  const [subtasks, setSubtasks] = React.useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = React.useState('');

  // Attachments State
  const [attachments, setAttachments] = React.useState<Attachment[]>([]);
  const [newLinkUrl, setNewLinkUrl] = React.useState('');
  const [newLinkName, setNewLinkName] = React.useState('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [attachmentTab, setAttachmentTab] = React.useState<'link' | 'file'>('link');

  // Canva style customizations
  const [accentColor, setAccentColor] = React.useState('indigo');
  const [bgTint, setBgTint] = React.useState('none');

  React.useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setPriority(card.priority);
      setDueDate(card.dueDate ? card.dueDate.substring(0, 16) : ''); // Format to datetime-local
      setCompanyName(card.companyName);
      setColumnId(card.columnId);
      setSubtasks(card.subtasks || []);
      setAttachments(card.attachments || []);

      // Extract accent / tint from customBg or customBorder
      if (card.customBg?.includes('border-l-blue-500')) setAccentColor('blue');
      else if (card.customBg?.includes('border-l-emerald-500') || card.customBg?.includes('border-l-teal-500')) setAccentColor('emerald');
      else if (card.customBg?.includes('border-l-amber-500')) setAccentColor('amber');
      else if (card.customBg?.includes('border-l-red-500') || card.customBg?.includes('border-l-orange-500')) setAccentColor('red');
      else if (card.customBg?.includes('border-l-purple-500') || card.customBg?.includes('border-l-pink-500')) setAccentColor('purple');
      else setAccentColor('indigo');

      if (card.customBg?.includes('bg-red-50')) setBgTint('red');
      else if (card.customBg?.includes('bg-orange-50')) setBgTint('orange');
      else if (card.customBg?.includes('bg-purple-50')) setBgTint('purple');
      else if (card.customBg?.includes('bg-emerald-50')) setBgTint('emerald');
      else setBgTint('none');
    } else {
      // Default state for a NEW card
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setCompanyName(companies[1]?.name || 'Nexus Tech');
      setColumnId(columns[0]?.id || '');
      setSubtasks([]);
      setAttachments([]);
      setAccentColor('indigo');
      setBgTint('none');
    }
  }, [card, companies, columns]);

  if (!card && !columns.length) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}`,
      text: newSubtaskText.trim(),
      completed: false
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskText('');
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map(s => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const handleDeleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(s => s.completed ? s.id !== id : s.id !== id));
  };

  // --- ATTACHMENT HANDLERS ---
  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkUrl.trim()) return;

    let url = newLinkUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    const name = newLinkName.trim() || newLinkUrl.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'Link';

    const newAtt: Attachment = {
      id: `att-${Date.now()}`,
      name,
      url,
      type: 'link'
    };

    setAttachments([...attachments, newAtt]);
    setNewLinkUrl('');
    setNewLinkName('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploading(true);
    setUploadProgress(0);

    let progressVal = 0;
    const interval = setInterval(() => {
      progressVal += 15;
      if (progressVal >= 100) {
        progressVal = 100;
        clearInterval(interval);

        const formatBytes = (bytes: number) => {
          if (bytes === 0) return '0 Bytes';
          const k = 1024;
          const sizes = ['Bytes', 'KB', 'MB'];
          const i = Math.floor(Math.log(bytes) / Math.log(k));
          return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
        };

        const reader = new FileReader();
        reader.onloadend = () => {
          const fileDataUrl = reader.result as string;
          const newAtt: Attachment = {
            id: `att-${Date.now()}`,
            name: file.name,
            url: file.size < 400000 ? fileDataUrl : '#', // limit size to avoid exceeding localStorage
            type: 'file',
            fileSize: formatBytes(file.size)
          };
          setAttachments(prev => [...prev, newAtt]);
          setIsUploading(false);
          setUploadProgress(0);
        };

        if (file.size < 400000) {
          reader.readAsDataURL(file);
        } else {
          const newAtt: Attachment = {
            id: `att-${Date.now()}`,
            name: file.name,
            url: '#', // mock download
            type: 'file',
            fileSize: formatBytes(file.size)
          };
          setAttachments(prev => [...prev, newAtt]);
          setIsUploading(false);
          setUploadProgress(0);
        }
      } else {
        setUploadProgress(progressVal);
      }
    }, 80);
  };

  const handleDeleteAttachment = (id: string) => {
    setAttachments(attachments.filter(att => att.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;

    // Build the custom background class based on accent and tint (Canva style!)
    let borderAccentClass = 'border-l-4 border-l-indigo-500';
    if (accentColor === 'blue') borderAccentClass = 'border-l-4 border-l-blue-500';
    else if (accentColor === 'emerald') borderAccentClass = 'border-l-4 border-l-emerald-500';
    else if (accentColor === 'amber') borderAccentClass = 'border-l-4 border-l-amber-500';
    else if (accentColor === 'red') borderAccentClass = 'border-l-4 border-l-red-500';
    else if (accentColor === 'purple') borderAccentClass = 'border-l-4 border-l-purple-500';

    let tintClass = '';
    if (bgTint === 'red') tintClass = ' bg-red-50/40 dark:bg-red-950/10';
    else if (bgTint === 'orange') tintClass = ' bg-orange-50/40 dark:bg-orange-950/10';
    else if (bgTint === 'purple') tintClass = ' bg-purple-50/30 dark:bg-purple-950/10';
    else if (bgTint === 'emerald') tintClass = ' bg-emerald-50/30 dark:bg-emerald-950/10';

    const mergedBg = `${borderAccentClass}${tintClass}`;

    const savedCard: Card = {
      id: card ? card.id : `card-${Date.now()}`,
      columnId,
      boardId: card ? card.boardId : 'board-general',
      title: title.trim(),
      description: description.trim(),
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
      subtasks,
      attachments, // Persist attachments list!
      companyName,
      customBg: mergedBg,
      order: card ? card.order : 999,
      completed: card ? card.completed : false
    };

    onSave(savedCard);
  };

  // Companies list without "Todas as Empresas"
  const businessCompanies = companies.filter(c => c.id !== 'all');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Box */}
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col z-10 transition-all max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Briefcase className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              {card ? 'Editar Cartão' : 'Criar Novo Cartão'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Card Title Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Título do Cartão *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Desenhar layouts da página principal"
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-slate-800 dark:text-slate-100 font-medium transition-all"
              required
            />
          </div>

          {/* Company & Column Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Empresa Vinculada
              </label>
              <select
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-700 dark:text-slate-300 transition-all font-medium"
              >
                {businessCompanies.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Coluna / Estado
              </label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-700 dark:text-slate-300 transition-all font-medium"
              >
                {columns.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Descrição do Trabalho
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Insira detalhes sobre as tarefas pendentes, referências, links úteis..."
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-sm text-slate-800 dark:text-slate-100 transition-all resize-none"
            />
          </div>

          {/* Priority & Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                Prioridade
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                  const labels = { low: 'Baixa', medium: 'Média', high: 'Alta' };
                  const colors = {
                    low: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/20 dark:text-blue-300 dark:border-blue-900/30',
                    medium: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-300 dark:border-amber-900/30',
                    high: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-300 dark:border-red-900/30'
                  };
                  const activeColors = {
                    low: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 dark:bg-blue-500',
                    medium: 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600 dark:bg-amber-500',
                    high: 'bg-red-600 text-white border-red-600 hover:bg-red-700 dark:bg-red-500'
                  };

                  const isSelected = priority === p;

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border text-center transition-all cursor-pointer ${
                        isSelected ? activeColors[p] : colors[p]
                      }`}
                    >
                      {labels[p]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Prazo Final (Deadline)
              </label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm text-slate-700 dark:text-slate-300 font-medium transition-all"
              />
            </div>
          </div>

          {/* Canva Visual Customization (Accent & Tint) */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3.5">
            <h4 className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Palette className="w-3.5 h-3.5" /> Estilo Visual do Cartão (Estilo Canva)
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Border Accent */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Borda Lateral de Destaque
                </span>
                <div className="flex items-center gap-2">
                  {[
                    { color: 'indigo', bg: 'bg-indigo-500' },
                    { color: 'blue', bg: 'bg-blue-500' },
                    { color: 'emerald', bg: 'bg-emerald-500' },
                    { color: 'amber', bg: 'bg-amber-500' },
                    { color: 'red', bg: 'bg-red-500' },
                    { color: 'purple', bg: 'bg-purple-500' }
                  ].map((accent) => (
                    <button
                      key={accent.color}
                      type="button"
                      onClick={() => setAccentColor(accent.color)}
                      className={`w-6 h-6 rounded-full ${accent.bg} transition-all relative cursor-pointer hover:scale-110 ${
                        accentColor === accent.color
                          ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-slate-100 scale-105'
                          : ''
                      }`}
                      title={`Borda ${accent.color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Background Tint */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Preenchimento do Fundo
                </span>
                <div className="flex items-center gap-1.5">
                  {[
                    { tint: 'none', label: 'Neutro', style: 'bg-white dark:bg-slate-900 text-slate-700 border border-slate-200' },
                    { tint: 'emerald', label: 'Verde', style: 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/20' },
                    { tint: 'orange', label: 'Laranja', style: 'bg-orange-50 text-orange-800 border border-orange-200 dark:bg-orange-950/20' },
                    { tint: 'red', label: 'Alerta', style: 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950/20' },
                    { tint: 'purple', label: 'Roxo', style: 'bg-purple-50 text-purple-800 border border-purple-200 dark:bg-purple-950/20' }
                  ].map((t) => (
                    <button
                      key={t.tint}
                      type="button"
                      onClick={() => setBgTint(t.tint)}
                      className={`px-2 py-1 text-[10px] font-bold rounded-md cursor-pointer transition-all ${t.style} ${
                        bgTint === t.tint ? 'ring-2 ring-slate-800 dark:ring-slate-300 scale-105' : 'opacity-80'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Subtasks Section */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <ListTodo className="w-4 h-4" /> Subtarefas ({subtasks.filter(s => s.completed).length}/{subtasks.length})
            </label>

            {/* Subtask input */}
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                placeholder="Ex: Definir paleta de cores primárias"
                className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-indigo-500/20 outline-none text-xs text-slate-700 dark:text-slate-300"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Adicionar
              </button>
            </form>

            {/* Checklist items */}
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {subtasks.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1.5">
                  Nenhuma subtarefa adicionada. Use-as para monitorar o andamento.
                </p>
              ) : (
                subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1 text-left">
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => handleToggleSubtask(sub.id)}
                        className="rounded text-indigo-600 focus:ring-indigo-500/30 w-3.5 h-3.5"
                      />
                      <span
                        className={`text-xs text-slate-700 dark:text-slate-300 ${
                          sub.completed ? 'line-through opacity-50' : 'font-medium'
                        }`}
                      >
                        {sub.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubtask(sub.id)}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Attachments Section */}
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip className="w-4 h-4 text-slate-400" /> Anexos e Documentos ({attachments.length})
            </label>

            {/* Tabs for Link vs File */}
            <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setAttachmentTab('link')}
                className={`flex-1 pb-2 font-bold border-b-2 text-center transition-all cursor-pointer ${
                  attachmentTab === 'link'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Vincular Link / URL
              </button>
              <button
                type="button"
                onClick={() => setAttachmentTab('file')}
                className={`flex-1 pb-2 font-bold border-b-2 text-center transition-all cursor-pointer ${
                  attachmentTab === 'file'
                    ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Anexar Arquivo / Documento
              </button>
            </div>

            {/* TAB: Web Link */}
            {attachmentTab === 'link' && (
              <form onSubmit={handleAddLink} className="space-y-2 bg-slate-50 dark:bg-slate-950/30 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newLinkName}
                    onChange={(e) => setNewLinkName(e.target.value)}
                    placeholder="Nome do Anexo (Ex: Protótipo Figma)"
                    className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-xs text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-indigo-500/20"
                  />
                  <input
                    type="text"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="URL (Ex: figma.com/...)"
                    className="px-3 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg outline-none text-xs text-slate-700 dark:text-slate-300 font-medium focus:ring-1 focus:ring-indigo-500/20"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Vincular Link
                  </button>
                </div>
              </form>
            )}

            {/* TAB: File Upload */}
            {attachmentTab === 'file' && (
              <div className="bg-slate-50 dark:bg-slate-950/30 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-3 relative">
                <input
                  type="file"
                  id="card-file-upload"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                
                {isUploading ? (
                  <div className="space-y-2.5 py-2">
                    <div className="flex items-center justify-center gap-2">
                      <Upload className="w-4 h-4 text-indigo-500 animate-bounce" />
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Enviando documento...</span>
                    </div>
                    <div className="w-full max-w-xs mx-auto bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-100"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{uploadProgress}%</span>
                  </div>
                ) : (
                  <label
                    htmlFor="card-file-upload"
                    className="flex flex-col items-center justify-center gap-1.5 py-2 cursor-pointer group"
                  >
                    <Upload className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Selecione um arquivo ou arraste aqui
                    </span>
                    <span className="text-[10px] text-slate-400">PDF, PNG, JPG, DOCX ou ZIP (Máx 400KB)</span>
                  </label>
                )}
              </div>
            )}

            {/* Attachments List */}
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {attachments.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-1 text-center">
                  Nenhum anexo ou documento vinculado a este cartão.
                </p>
              ) : (
                attachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50/60 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1 text-left">
                      {att.type === 'link' ? (
                        <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-lg shrink-0">
                          <Link2 className="w-3.5 h-3.5" />
                        </span>
                      ) : (
                        <span className="p-1.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                          <FileText className="w-3.5 h-3.5" />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate leading-tight">
                          {att.name}
                        </p>
                        {att.fileSize && (
                          <span className="text-[10px] font-mono text-slate-400 font-bold leading-none">
                            {att.fileSize}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      {att.url !== '#' && (
                        <a
                          href={att.url}
                          target="_blank"
                          rel="referrer"
                          className="p-1 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 text-indigo-500 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                          title="Abrir / Baixar Anexo"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteAttachment(att.id)}
                        className="p-1 hover:bg-red-50 dark:hover:bg-red-950/25 text-slate-400 hover:text-red-500 rounded transition-colors cursor-pointer"
                        title="Remover Anexo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            {card && (
              <button
                type="button"
                onClick={() => onDelete(card.id)}
                className="px-3.5 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Excluir Cartão
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/15 cursor-pointer"
            >
              Salvar Cartão
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
