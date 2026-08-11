import React, { useState } from 'react';
import { X, Zap, Building2, Phone, MapPin, CheckCircle2, Send } from 'lucide-react';

interface RegisterBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultPlan?: string;
  onSuccessDigitalize?: (name: string) => void;
}

export default function RegisterBusinessModal({
  isOpen,
  onClose,
  defaultPlan = 'Pro',
  onSuccessDigitalize
}: RegisterBusinessModalProps) {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [category, setCategory] = useState('Gastronomía / Restaurante');
  const [phone, setPhone] = useState('');
  const [plan, setPlan] = useState(defaultPlan);
  const [address, setAddress] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const message = `Hola! Solicito la Digitalización 3D y alineación con Google Business/Maps para mi negocio:\n\n` +
      `- Local: ${name}\n` +
      `- Categoría: ${category}\n` +
      `- Teléfono: ${phone}\n` +
      `- Plan Elegido: ${plan}\n` +
      `- Ubicación: ${address || 'Los Mochis, Sinaloa'}`;

    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/526680000000?text=${encodedText}`, '_blank');

    if (onSuccessDigitalize && name) {
      onSuccessDigitalize(name);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
            Digitalización Comercial
          </span>
          <h3 className="text-xl font-extrabold text-white mt-2">
            Sumar mi Negocio al Mapa 3D & Google Business
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Destaca en el ecosistema digital de Los Mochis con ficha técnica, modelo 3D y posicionamiento en buscadores.
          </p>
        </div>

        {submitted ? (
          <div className="p-6 bg-slate-950 rounded-xl border border-emerald-500/40 text-center space-y-3">
            <div className="inline-block p-3 bg-emerald-500/20 text-emerald-400 rounded-full">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-white">¡Solicitud Generada!</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              Te estamos redirigiendo a WhatsApp para sincronizar los detalles técnicos de tu establecimiento con un especialista de Reyplace.
            </p>
            <button
              onClick={onClose}
              className="mt-3 w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition"
            >
              Cerrar Ventana
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Nombre Comercial del Negocio *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Mariscos El Chino Mochis"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Categoría *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                >
                  <option>Gastronomía / Restaurante</option>
                  <option>Cafetería / Comercio</option>
                  <option>Servicios Profesionales</option>
                  <option>Salud y Bienestar</option>
                  <option>Cultura y Entretenimiento</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="668 123 4567"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Plan Seleccionado
              </label>
              <select
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-amber-300 font-bold focus:outline-none"
              >
                <option value="Básico">Plan Básico ($2,499 MXN)</option>
                <option value="Pro">Plan Pro ($4,999 MXN) - Recomendado</option>
                <option value="Corporativo">Plan Corporativo (Proyecto a medida)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Dirección o Referencia en Los Mochis
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej. Bulevar Rosales esquina con Leyva, Centro"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black rounded-xl transition shadow-lg shadow-amber-500/20 text-xs uppercase tracking-wide flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Enviar Solicitud por WhatsApp
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
