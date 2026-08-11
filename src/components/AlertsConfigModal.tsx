import React, { useState } from 'react';
import { Bell, CheckCircle2, ShieldCheck, Smartphone, Mail, X, Sparkles, Check } from 'lucide-react';

interface AlertsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AlertsConfigModal({ isOpen, onClose }: AlertsConfigModalProps) {
  const [categories, setCategories] = useState({
    agua: true,
    alumbrado: true,
    bacheo: true,
    basura: false,
    parques: false,
    seguridad: true
  });

  const [channels, setChannels] = useState({
    push: true,
    whatsapp: true,
    email: false
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testNotification, setTestNotification] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleCategory = (key: keyof typeof categories) => {
    setCategories(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleChannel = (key: keyof typeof channels) => {
    setChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  const triggerTestAlert = () => {
    setTestNotification('¡Notificación de Prueba! Reporte #8492 de Alumbrado Público en Col. Centro ha sido marcado como RESUELTO por Municipio.');
    setTimeout(() => {
      setTestNotification(null);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-white flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">Configuración de Alertas Ciudadanas</h3>
              <p className="text-xs text-slate-400">Notificaciones en tiempo real cuando un reporte cambie a 'Resuelto'</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Test Alert Banner if active */}
        {testNotification && (
          <div className="bg-emerald-500 text-slate-950 p-3.5 px-5 font-bold text-xs flex items-center gap-2.5 animate-in slide-in-from-top duration-300">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-slate-950" />
            <span className="flex-1">{testNotification}</span>
          </div>
        )}

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Categories Selector */}
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2.5">
              1. Selecciona las Categorías de Interés
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { id: 'agua', label: '💧 Agua y Drenaje', key: 'agua' },
                { id: 'alumbrado', label: '💡 Alumbrado Público', key: 'alumbrado' },
                { id: 'bacheo', label: '🛣️ Bacheo y Vialidades', key: 'bacheo' },
                { id: 'basura', label: '🗑️ Recolección de Basura', key: 'basura' },
                { id: 'parques', label: '🌳 Parques y Árboles', key: 'parques' },
                { id: 'seguridad', label: '🛡️ Seguridad / Vigilancia', key: 'seguridad' }
              ].map(cat => {
                const isActive = categories[cat.key as keyof typeof categories];
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.key as keyof typeof categories)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-sm'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                      isActive ? 'bg-amber-500 border-amber-500 text-slate-950' : 'border-slate-700'
                    }`}>
                      {isActive && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Delivery Channels */}
          <div>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2.5">
              2. Canales de Notificación Preferidos
            </span>
            <div className="space-y-2">
              {[
                { key: 'push', icon: Bell, title: 'Notificaciones Push Web', desc: 'Alertas emergentes en navegador mientras navegas' },
                { key: 'whatsapp', icon: Smartphone, title: 'Alertas por WhatsApp Bot', desc: 'Notificación directa al número registrado' },
                { key: 'email', icon: Mail, title: 'Correo Resumen Diario', desc: 'Boletín de reportes resueltos en tu colonia' }
              ].map(ch => {
                const Icon = ch.icon;
                const isActive = channels[ch.key as keyof typeof channels];
                return (
                  <div
                    key={ch.key}
                    onClick={() => toggleChannel(ch.key as keyof typeof channels)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition ${
                      isActive ? 'bg-slate-800/90 border-slate-700' : 'bg-slate-950/40 border-slate-900 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-white block">{ch.title}</span>
                        <span className="text-[11px] text-slate-400">{ch.desc}</span>
                      </div>
                    </div>
                    <div className={`w-9 h-5 rounded-full p-0.5 transition-colors ${isActive ? 'bg-amber-500' : 'bg-slate-800'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isActive ? 'translate-x-4' : 'translate-x-0'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Trigger Section */}
          <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-xs text-slate-300 font-medium">¿Quieres comprobar cómo luce la notificación?</span>
            </div>
            <button
              onClick={triggerTestAlert}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 font-bold text-xs rounded-xl transition-colors shrink-0"
            >
              Probar Alerta
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-amber-500/20"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                ¡Preferencias Guardadas!
              </>
            ) : (
              'Guardar Preferencias'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
