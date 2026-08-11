import React, { useState } from 'react';
import { X, CheckCircle2, GraduationCap, Calendar, MapPin, QrCode } from 'lucide-react';

interface CourseRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
}

export default function CourseRegistrationModal({
  isOpen,
  onClose,
  courseTitle
}: CourseRegistrationModalProps) {
  if (!isOpen) return null;

  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName || !userPhone) return;
    setIsRegistered(true);
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
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
            Registro a Capacitación
          </span>
          <h3 className="text-lg font-bold text-white mt-1">
            {courseTitle || 'Programa de Inclusión Digital'}
          </h3>
        </div>

        {!isRegistered ? (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nombre Completo del Participante *
              </label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Ej. Roberto Gastélum"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Teléfono de Contacto / WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                placeholder="668 987 6543"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition text-xs shadow-lg shadow-emerald-600/20"
            >
              Generar Pase Digital de Entrada
            </button>
          </form>
        ) : (
          <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/40 text-center space-y-3">
            <div className="inline-block p-3 bg-emerald-500/20 text-emerald-400 rounded-full">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-sm font-bold text-white">¡Inscripción Confirmada!</h4>
            
            <div className="text-left bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1 text-xs">
              <p className="text-slate-300 font-bold"><span className="text-slate-500">Participante:</span> {userName}</p>
              <p className="text-slate-300"><span className="text-slate-500">Curso:</span> {courseTitle}</p>
              <p className="text-emerald-400 font-mono text-[11px] pt-1 border-t border-slate-800">
                Sede: Centro Comunitario Rosales, Los Mochis
              </p>
            </div>

            <div className="p-3 bg-white rounded-xl inline-block my-1 border-2 border-emerald-500 shadow-lg">
              <div className="w-28 h-28 bg-slate-950 flex flex-col items-center justify-center text-[10px] text-emerald-400 font-mono p-2 text-center rounded-lg">
                <QrCode className="w-12 h-12 text-emerald-400 mb-1" />
                <span>LM3D-ACCESO</span>
              </div>
            </div>

            <p className="text-[10px] text-slate-400">
              Muestra este pase digital al asistir al taller presencial o en línea.
            </p>

            <button
              onClick={onClose}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
            >
              Entendido
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
