import React, { useState } from 'react';
import { X, Send, Bell } from 'lucide-react';

interface NewCitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (title: string, category: 'bacheo' | 'alumbrado' | 'agua' | 'basura' | 'parques' | 'seguridad', description: string) => void;
}

export default function NewCitizenReportModal({
  isOpen,
  onClose,
  onSubmitReport
}: NewCitizenReportModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'bacheo' | 'alumbrado' | 'agua' | 'basura' | 'parques' | 'seguridad'>('bacheo');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    onSubmitReport(title, category, description);
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs font-bold text-sky-400 uppercase tracking-wider bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
            Red Ciudadana Mochitense
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            Crear Reporte o Aviso Comunitario
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Título del Aviso *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Evento gastronómico en Parque Sinaloa"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Categoría
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500"
            >
              <option value="bacheo">🛣️ Bacheo / Obras / Vialidad</option>
              <option value="alumbrado">💡 Alumbrado Público</option>
              <option value="agua">💧 Agua y Drenaje</option>
              <option value="basura">🗑️ Recolección de Basura</option>
              <option value="parques">🌳 Parques y Espacios Públicos</option>
              <option value="seguridad">🛡️ Seguridad / Reporte</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">
              Descripción de la Publicación *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Escribe los detalles aquí..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
          >
            <Send className="w-4 h-4" /> Publicar en la Red Mochitense
          </button>
        </form>
      </div>
    </div>
  );
}
