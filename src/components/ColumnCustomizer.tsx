import React from 'react';
import { X, Trash2, Sliders, Layout, CheckCircle, Eye, Activity, Pin, Zap, Flame, Award, Palette } from 'lucide-react';
import { Column } from '../types';

interface ColumnCustomizerProps {
  column: Column;
  onClose: () => void;
  onSave: (updatedCol: Column) => void;
  onDelete: (columnId: string) => void;
}

const PRESET_STYLES = [
  {
    name: 'Neutral Slate',
    bgClass: 'bg-slate-50/90 dark:bg-slate-900/40',
    headerBgClass: 'bg-slate-100 dark:bg-slate-800',
    borderClass: 'border border-slate-200/80 dark:border-slate-800',
    textColor: 'text-slate-800 dark:text-slate-200',
  },
  {
    name: 'Creative Purple',
    bgClass: 'bg-purple-50/50 dark:bg-purple-950/10',
    headerBgClass: 'bg-purple-100/50 dark:bg-purple-900/30',
    borderClass: 'border border-purple-300 dark:border-purple-800',
    textColor: 'text-purple-800 dark:text-purple-200',
  },
  {
    name: 'Warning Amber',
    bgClass: 'bg-amber-50/40 dark:bg-amber-950/10',
    headerBgClass: 'bg-amber-50 dark:bg-amber-950/20',
    borderClass: 'border border-amber-200/50 dark:border-amber-900/30',
    textColor: 'text-amber-800 dark:text-amber-200',
  },
  {
    name: 'Success Emerald',
    bgClass: 'bg-emerald-50/40 dark:bg-emerald-950/10',
    headerBgClass: 'bg-emerald-50 dark:bg-emerald-950/20',
    borderClass: 'border border-emerald-200/50 dark:border-emerald-900/30',
    textColor: 'text-emerald-800 dark:text-emerald-200',
  },
  {
    name: 'Urgent Rose',
    bgClass: 'bg-rose-50/40 dark:bg-rose-950/10',
    headerBgClass: 'bg-rose-100/50 dark:bg-rose-900/30',
    borderClass: 'border border-rose-300/60 dark:border-rose-900/40',
    textColor: 'text-rose-800 dark:text-rose-200',
  },
  {
    name: 'Digital Sky',
    bgClass: 'bg-sky-50/40 dark:bg-sky-950/10',
    headerBgClass: 'bg-sky-100/50 dark:bg-sky-900/30',
    borderClass: 'border border-sky-300/60 dark:border-sky-900/40',
    textColor: 'text-sky-800 dark:text-sky-200',
  },
];

const ICONS = [
  { name: 'Pin', component: Pin },
  { name: 'Activity', component: Activity },
  { name: 'Eye', component: Eye },
  { name: 'CheckCircle', component: CheckCircle },
  { name: 'Zap', component: Zap },
  { name: 'Flame', component: Flame },
  { name: 'Award', component: Award },
  { name: 'Palette', component: Palette }
];

export default function ColumnCustomizer({
  column,
  onClose,
  onSave,
  onDelete
}: ColumnCustomizerProps) {
  const [title, setTitle] = React.useState(column.title);
  const [width, setWidth] = React.useState(column.width || 280);
  const [borderRadius, setBorderRadius] = React.useState(column.borderRadius || 'rounded-xl');
  const [bgClass, setBgClass] = React.useState(column.bgClass);
  const [headerBgClass, setHeaderBgClass] = React.useState(column.headerBgClass);
  const [borderClass, setBorderClass] = React.useState(column.borderClass);
  const [textColor, setTextColor] = React.useState(column.textColor);
  const [icon, setIcon] = React.useState(column.icon || 'Pin');

  const handleApplyPreset = (preset: typeof PRESET_STYLES[number]) => {
    setBgClass(preset.bgClass);
    setHeaderBgClass(preset.headerBgClass);
    setBorderClass(preset.borderClass);
    setTextColor(preset.textColor);
  };

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      ...column,
      title: title.trim(),
      width: Number(width),
      borderRadius,
      bgClass,
      headerBgClass,
      borderClass,
      textColor,
      icon
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Box */}
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col z-10 max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5.5 py-4 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Personalizar Coluna (Canva-Style)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5.5 space-y-5 text-left">
          
          {/* Column Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Nome da Coluna
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none text-xs text-slate-800 dark:text-slate-100 font-medium"
              placeholder="Ex: A Fazer"
            />
          </div>

          {/* Width Slider (Resize column size) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Largura da Coluna (Tamanho)
              </label>
              <span className="text-xs font-mono text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                {width}px
              </span>
            </div>
            <input
              type="range"
              min={220}
              max={450}
              step={10}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-ew-resize accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-medium">
              <span>Estreito (220px)</span>
              <span>Largo (450px)</span>
            </div>
          </div>

          {/* Corner format changes (mudar o formato) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Formato dos Cantos (Bordas)
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: 'rounded-none', label: 'Reto', preview: 'rounded-none' },
                { id: 'rounded-md', label: 'Suave', preview: 'rounded-md' },
                { id: 'rounded-xl', label: 'Arredondado', preview: 'rounded-xl' },
                { id: 'rounded-3xl', label: 'Cápsula', preview: 'rounded-3xl' }
              ].map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBorderRadius(b.id as any)}
                  className={`py-2 text-[10px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    borderRadius === b.id
                      ? 'bg-slate-800 border-slate-800 text-white dark:bg-slate-100 dark:border-slate-100 dark:text-slate-900 shadow-md'
                      : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-6 h-4 mx-auto mb-1 border border-slate-400 ${b.preview} bg-slate-200/50`} />
                  {b.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preset Styles */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Paleta de Cores Canva
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_STYLES.map((style) => {
                const isActive = bgClass === style.bgClass;
                return (
                  <button
                    key={style.name}
                    type="button"
                    onClick={() => handleApplyPreset(style)}
                    className={`p-2.5 rounded-xl text-[10px] text-left border cursor-pointer transition-all ${
                      style.bgClass
                    } ${style.borderClass} ${
                      isActive ? 'ring-2 ring-indigo-500 scale-102 font-bold' : 'opacity-85 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${style.headerBgClass} border border-black/5`} />
                      <span className={style.textColor}>{style.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Header Icons Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Ícone da Coluna
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ICONS.map((ic) => {
                const IconComponent = ic.component;
                const isSelected = icon === ic.name;
                return (
                  <button
                    key={ic.name}
                    type="button"
                    onClick={() => setIcon(ic.name)}
                    className={`p-2 flex flex-col items-center justify-center gap-1 border rounded-xl transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 scale-105 font-bold'
                        : 'border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span className="text-[9px]">{ic.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5.5 py-3.5 bg-slate-50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onDelete(column.id)}
            className="px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" /> Excluir
          </button>

          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-white dark:bg-slate-950 hover:bg-slate-100 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Aplicar Estilos
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
