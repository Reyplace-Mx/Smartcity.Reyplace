import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle2, ThumbsUp, MapPin, MessageSquare, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CitizenReport } from '../data';

interface CitizenReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: CitizenReport[];
  onSubmitReport: (report: Omit<CitizenReport, 'id' | 'date' | 'upvotes'>) => void;
  onUpvote: (id: string) => void;
}

export const CitizenReportModal: React.FC<CitizenReportModalProps> = ({
  isOpen,
  onClose,
  reports,
  onSubmitReport,
  onUpvote,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create'>('list');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CitizenReport['category']>('Luminarias');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onSubmitReport({
      title,
      category,
      location: location || 'Los Mochis Centro',
      lat: 25.7928,
      lng: -108.9902,
      description,
      status: 'Pendiente',
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTitle('');
      setLocation('');
      setDescription('');
      setActiveTab('list');
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Reportes Ciudadanos Smart</h2>
              <p className="text-xs text-slate-400">Plataforma de atención urbana colaborativa de Los Mochis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'list'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-950/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" /> Reportes Activos ({reports.length})
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'create'
                ? 'text-indigo-400 border-b-2 border-indigo-500 bg-indigo-950/30'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <Plus className="w-4 h-4" /> Nuevo Reporte
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'list' ? (
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 bg-indigo-900/40 text-indigo-300 border border-indigo-800 rounded text-[10px] font-bold uppercase">
                        {report.category}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          report.status === 'En Proceso'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {report.status}
                      </span>
                      <span className="text-[10px] text-slate-500">{report.date}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white">{report.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{report.description}</p>

                    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-slate-400" /> {report.location}
                    </p>
                  </div>

                  <div className="flex md:flex-col items-center justify-between shrink-0 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-4">
                    <button
                      onClick={() => onUpvote(report.id)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-bold transition-all border border-slate-700"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{report.upvotes}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center space-y-3"
                >
                  <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-white">¡Reporte Enviado con Éxito!</h3>
                  <p className="text-xs text-slate-400 max-w-md">
                    Tu reporte ha sido georreferenciado y turnado al Departamento de Servicios Urbanos de Ahome.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Título del Incidente / Petición
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej: Bache en Av. Gabriel Leyva"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Categoría
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Luminarias">Luminarias IoT</option>
                        <option value="Baches">Vialidades / Baches</option>
                        <option value="Agua / Drenaje">Agua y Drenaje Smart</option>
                        <option value="Brecha Digital">Brecha Digital / Conectividad</option>
                        <option value="Seguridad">Seguridad y Vigilancia</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                        Ubicación o Calle
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ej: Calle Allende y Serdán"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                      Descripción Detallada
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                      placeholder="Explica el problema para que las cuadrillas urbanas atiendan con precisión..."
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Enviar Reporte a Gestión Urbana
                  </button>
                </form>
              )}
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </div>
  );
};
