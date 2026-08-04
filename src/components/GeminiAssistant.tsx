import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, MapPin, Search, Cpu, Video, Image as ImageIcon, Loader2, X, Settings2, Database, ShieldCheck, Zap, Bot } from 'lucide-react';
import clsx from 'clsx';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { Place, MOCK_PLACES, MOCK_SENSORS, INITIAL_CITIZEN_REPORTS } from '../data';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isLocalMemory?: boolean;
  imageUrl?: string;
};

interface GeminiAssistantProps {
  selectedPlace?: Place | null;
}

// Emmanai.smart Local Memory Processing Engine (0 Tokens Consumed)
function queryEmmanaiMemory(query: string, selectedPlace?: Place | null): string {
  const q = query.toLowerCase().trim();

  // Selected place priority context
  if (selectedPlace && (q.includes('este') || q.includes('lugar') || q.includes('aquí') || q.includes('lugar seleccionado') || q.includes(selectedPlace.name.toLowerCase()))) {
    return `### 📍 **Emmanai.smart — Memoria de ${selectedPlace.name}**

**Categoría:** ${selectedPlace.category}  
**Ubicación:** Coordenadas (${selectedPlace.lat.toFixed(4)}, ${selectedPlace.lng.toFixed(4)})  
**Nivel Digital:** ${selectedPlace.digitalPresence ? '🟢 Conectado / Digitalizado' : '⚠️ Brecha Digital (Analógico)'}  
**Feature Smart:** ${selectedPlace.smartFeature || 'Registrado en sistema municipal'}  
${selectedPlace.wifiSpeedMbps ? `**Ancho de Banda Wi-Fi:** ⚡ ${selectedPlace.wifiSpeedMbps} Mbps` : ''}  

**Resumen en Memoria:**
> ${selectedPlace.description}

---
*⚡ Respuesta ultra-rápida (0 ms) • Generado desde Memoria Local Emmanai.smart (0 Tokens Consumidos)*`;
  }

  // Air Quality / AQI
  if (q.includes('aqi') || q.includes('aire') || q.includes('contamina') || q.includes('ambiente') || q.includes('ecolog')) {
    const aqiSensor = MOCK_SENSORS.find(s => s.type === 'aqi');
    return `### 🍃 **Emmanai.smart — Calidad del Aire (AQI)**

- **Estación Monitora:** ${aqiSensor?.locationName || 'Parque Sinaloa'}
- **Estado Actual:** **${aqiSensor?.value || '34 AQI (Excelente)'}**
- **Diagnóstico Ambiental:** 🟢 Calidad de aire de nivel óptimo. Partículas en suspensión dentro de normas de salud internacional.
- **Visualización 3D:** Renderizado en columnas verdes WebGL sobre el mapa.

---
*⚡ Memoria Local Emmanai.smart (0 Tokens Consumidos)*`;
  }

  // Traffic / Mobility
  if (q.includes('trafico') || q.includes('tráfico') || q.includes('vial') || q.includes('movilidad') || q.includes('autos') || q.includes('rutas')) {
    return `### 🚘 **Emmanai.smart — Flujo Vial y Tránsito Urbano**

- **Fluidez Promedio de Ciudad:** **88% (Tránsito Normal)**
- **Nodo Crítico Monitor:** Av. Gabriel Leyva y Degollado
- **Zonas con Extrusión WebGL 3D:**
  1. *Blvd. Rosales & Jiquilpan* (Densidad 92%)
  2. *Gabriel Leyva & Degollado* (Densidad 88%)
  3. *Zona Industrial / Centenario* (Densidad 95%)

---
*⚡ Memoria Local Emmanai.smart (0 Tokens Consumidos)*`;
  }

  // Wi-Fi / Conectividad
  if (q.includes('wifi') || q.includes('wi-fi') || q.includes('internet') || q.includes('red') || q.includes('5g') || q.includes('velocidad')) {
    return `### 📡 **Emmanai.smart — Red de Wi-Fi Libre y Nodos 5G**

- **Total Puntos de Acceso Activos:** **142 Nodos Municipales**
- **Sedes Principales en Memoria:**
  - 📶 **Plazuela 27 de Septiembre:** Wi-Fi 850 Mbps Libre
  - 📶 **Parque Sinaloa:** Wi-Fi 500 Mbps Libre
  - 📶 **Cerro de la Memoria:** Antena 5G Hub (1,200 Mbps)
  - 📶 **CIE (Centro de Innovación):** FabLab Hub (1,000 Mbps)

---
*⚡ Memoria Local Emmanai.smart (0 Tokens Consumidos)*`;
  }

  // Places / Directory
  if (q.includes('lugar') || q.includes('directorio') || q.includes('puntos') || q.includes('turismo') || q.includes('visitar') || q.includes('que hay') || q.includes('qué hay') || q.includes('donde ir') || q.includes('dónde ir')) {
    const list = MOCK_PLACES.map(p => `- **${p.name}** (${p.category}): ${p.smartFeature || p.description}`).join('\n');
    return `### 🗺️ **Emmanai.smart — Directorio de Mochis Smart City**

Registrados **${MOCK_PLACES.length} puntos clave** en la memoria local:

${list}

---
*⚡ Memoria Local Emmanai.smart (0 Tokens Consumidos)*`;
  }

  // Citizen Reports
  if (q.includes('reporte') || q.includes('queja') || q.includes('bache') || q.includes('luminaria') || q.includes('fuga') || q.includes('ciudadan')) {
    const reports = INITIAL_CITIZEN_REPORTS.map(r => `- 🔴 **[${r.category}]** ${r.title} — *${r.location}* (Votos: 👍 ${r.upvotes}) [${r.status}]`).join('\n');
    return `### 📣 **Emmanai.smart — Reportes Ciudadanos Registrados**

${reports}

---
*💡 Registra nuevos reportes usando el botón **"Reporte Ciudadano"** en el panel superior.*
*⚡ Memoria Local Emmanai.smart (0 Tokens Consumidos)*`;
  }

  // Direct Keyword Matching for Places
  const matched = MOCK_PLACES.find(p => q.includes(p.name.toLowerCase()) || p.description.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
  if (matched) {
    return `### 📍 **Emmanai.smart — Búsqueda en Memoria: ${matched.name}**

**Categoría:** ${matched.category}  
**Estatus:** ${matched.digitalPresence ? '✅ Digitalizado (Ficha Inteligente)' : '⚠️ Brecha Digital (Comercio Analógico)'}  
**Equipamiento:** ${matched.smartFeature || 'N/D'}  

> ${matched.description}

---
*⚡ Memoria Local Emmanai.smart (0 Tokens Consumidos)*`;
  }

  // Default Knowledge Base Summary
  return `### 🧠 **Emmanai.smart — Memoria Inteligente Cero Tokens**

He analizado tu consulta con la información precargada de **Los Mochis Smart City**:

- 📍 **Puntos de Interés:** ${MOCK_PLACES.length} lugares monitoreados en tiempo real.
- 🍃 **Calidad del Aire:** 34 AQI (Excelente en Parque Sinaloa).
- 🚘 **Tráfico Urbano:** 88% de fluidez promedio.
- 📡 **Red Wi-Fi Pública:** 142 Nodos activos de alta velocidad.
- 🎮 **Aceleración GPU 3D:** Motor WebGL con Deck.gl habilitado.

*💡 Consulta sobre cualquier sitio, calidad del aire, tráfico o reportes sin costo alguno.*

---
*⚡ Memoria Local Emmanai.smart (0 Tokens Consumidos)*`;
}

export function GeminiAssistant({ selectedPlace }: GeminiAssistantProps = {}) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '¡Hola! Soy **Emmanai.smart**, tu asistente urbano con memoria local integrada. Tengo precargada toda la información de la ciudad, sensores IoT, calidad de aire, lugares y reportes sin consumo de tokens.',
      isLocalMemory: true,
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [videoMode, setVideoMode] = useState(false);
  const [imageMode, setImageMode] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoStatus, setVideoStatus] = useState<'idle' | 'generating' | 'done' | 'error'>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading, videoStatus]);

  const handleSend = async () => {
    if (!input.trim() && !imageFile && !imageMode) return;

    if (videoMode) {
      handleVideoGeneration();
      return;
    }

    if (imageMode) {
      handleImageGeneration();
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };
    
    setMessages(prev => [...prev, newMessage]);
    const userQuery = input;
    setInput('');
    setLoading(true);

    // Process instantly via Emmanai.smart Local Memory Engine (0 Tokens)
    setTimeout(() => {
      const memoryResponse = queryEmmanaiMemory(userQuery, selectedPlace);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: memoryResponse,
        isLocalMemory: true
      }]);
      setLoading(false);
    }, 120);
  };

  const handleImageGeneration = async () => {
    setImageMode(false);
    const messageContent = `Generando imagen: ${input} (Aspect Ratio: ${aspectRatio})`;
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
    }]);
    
    setLoading(true);
    try {
      const res = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          aspectRatio,
        })
      });
      const { imageBase64, error } = await res.json();
      
      if (error) throw new Error(error);
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Imagen generada:`,
        imageUrl: `data:image/jpeg;base64,${imageBase64}`
      }]);
      
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error al generar la imagen: ${err.message}`,
      }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleVideoGeneration = async () => {
    setVideoStatus('generating');
    setVideoMode(false);
    
    const messageContent = `Generando video: ${input} ${imageFile ? '(con imagen de referencia)' : ''}`;
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
    }]);
    
    let base64 = "";
    let mimeType = "";
    
    if (imageFile) {
      base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]);
        };
        reader.readAsDataURL(imageFile);
      });
      mimeType = imageFile.type;
    }

    try {
      const resStart = await fetch('/api/gemini/video/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: input,
          imageBytes: base64,
          mimeType
        })
      });
      const { operationName, error } = await resStart.json();
      
      if (error) throw new Error(error);
      
      const poll = async () => {
        const resStatus = await fetch('/api/gemini/video/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName })
        });
        const statusData = await resStatus.json();
        
        if (statusData.done) {
          const resDownload = await fetch('/api/gemini/video/download', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ operationName })
          });
          
          if (!resDownload.ok) throw new Error("Failed to download video");
          
          const blob = await resDownload.blob();
          const url = URL.createObjectURL(blob);
          setVideoUrl(url);
          setVideoStatus('done');
          
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            role: 'assistant',
            content: `¡El video está listo!`,
          }]);
          
        } else {
          setTimeout(poll, 10000);
        }
      };
      
      poll();
      
    } catch (err: any) {
      setVideoStatus('error');
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Error al generar el video: ${err.message}`,
      }]);
    }
    
    setInput('');
    setImageFile(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
      {/* Header with Emmanai.smart Branding */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md z-10 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              Emmanai.smart
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-bold rounded-md flex items-center gap-1">
                <Database className="w-2.5 h-2.5" /> 0 Tokens
              </span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">Memoria Local de Los Mochis Cargada</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">En Vivo</span>
        </div>
      </div>

      {/* Preset Quick Memory Queries */}
      <div className="px-3 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
        <button
          onClick={() => { setInput("¿Cuáles son los niveles de calidad de aire?"); }}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
        >
          🍃 Calidad del Aire (AQI)
        </button>
        <button
          onClick={() => { setInput("¿Cómo está el tráfico en Los Mochis?"); }}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
        >
          🚘 Estado del Tráfico
        </button>
        <button
          onClick={() => { setInput("¿Dónde hay Wi-Fi libre de alta velocidad?"); }}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
        >
          📡 Red Wi-Fi Pública
        </button>
        <button
          onClick={() => { setInput("Muestra los reportes ciudadanos activos"); }}
          className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 whitespace-nowrap transition-colors flex items-center gap-1 shrink-0"
        >
          📣 Reportes Urbanos
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div 
              key={m.id} 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={clsx("flex flex-col max-w-[92%]", m.role === 'user' ? "ml-auto" : "mr-auto")}
            >
              <div className={clsx(
                "p-3.5 rounded-2xl text-sm leading-relaxed relative",
                m.role === 'user' 
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "bg-slate-800/90 text-slate-200 border border-slate-700/80 shadow-md"
              )}>
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-emerald-400 border-b border-slate-700/60 pb-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Emmanai.smart — Memoria Local (0 Tokens)</span>
                  </div>
                )}
                <div className="markdown-body text-xs sm:text-sm">
                  <Markdown>{m.content}</Markdown>
                </div>
                {m.imageUrl && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-slate-700">
                    <img src={m.imageUrl} alt="Generated" className="w-full h-auto" />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mr-auto bg-slate-800 text-slate-200 border border-slate-700 p-3 rounded-2xl text-xs flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Consultando memoria de Emmanai.smart...</span>
          </motion.div>
        )}
        
        {videoStatus === 'generating' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mr-auto bg-slate-800 text-slate-200 border border-slate-700 p-4 rounded-xl text-sm flex flex-col gap-3 max-w-[90%]">
            <div className="flex items-center gap-2 text-pink-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Generando Video con Veo...
            </div>
            <p className="text-xs text-slate-400">Este proceso puede tardar unos minutos. Te avisaremos cuando esté listo.</p>
          </motion.div>
        )}
        
        {videoStatus === 'done' && videoUrl && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mr-auto max-w-[90%] w-full">
            <video src={videoUrl} controls className="w-full rounded-xl border border-slate-700 shadow-xl" />
          </motion.div>
        )}
      </div>

      {/* Input controls */}
      <div className="p-4 border-t border-slate-800 bg-slate-950">
        <AnimatePresence>
          {videoMode && (
             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-2 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs overflow-hidden">
               <div className="flex items-center justify-between mb-3">
                 <span className="font-bold text-pink-400 flex items-center gap-2"><Video className="w-4 h-4" /> Generador de Video</span>
                 <button onClick={() => setVideoMode(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
               </div>
               {imageFile ? (
                 <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-700">
                   <span className="truncate text-slate-300 max-w-[150px] font-medium">{imageFile.name}</span>
                   <button onClick={() => setImageFile(null)} className="text-red-400 hover:text-red-300 p-1 bg-red-950/30 rounded-md"><X className="w-3 h-3" /></button>
                 </div>
               ) : (
                 <button 
                   onClick={() => fileInputRef.current?.click()}
                   className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 hover:bg-slate-950 text-slate-300 rounded-lg border border-slate-700 border-dashed transition-colors"
                 >
                   <ImageIcon className="w-4 h-4 text-indigo-400" /> Subir Imagen de Referencia (Opcional)
                 </button>
               )}
               <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
             </motion.div>
          )}

          {imageMode && (
             <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-2 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-xs overflow-hidden">
               <div className="flex items-center justify-between mb-3">
                 <span className="font-bold text-emerald-400 flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Generador de Imágenes</span>
                 <button onClick={() => setImageMode(false)} className="text-slate-400 hover:text-white"><X className="w-4 h-4" /></button>
               </div>
               <div className="flex flex-col gap-2">
                 <span className="text-slate-400 font-medium">Relación de Aspecto:</span>
                 <div className="flex flex-wrap gap-2">
                   {['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'].map(ratio => (
                     <button
                       key={ratio}
                       onClick={() => setAspectRatio(ratio)}
                       className={clsx("px-2 py-1 rounded-md text-[10px] font-bold tracking-wider border transition-colors", aspectRatio === ratio ? "bg-emerald-600 border-emerald-500 text-white" : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-700")}
                     >
                       {ratio}
                     </button>
                   ))}
                 </div>
               </div>
             </motion.div>
          )}
        </AnimatePresence>

        <div className="flex gap-2 relative">
          <button
            onClick={() => {
              setShowSettings(!showSettings);
              if (!showSettings) {
                setVideoMode(false);
                setImageMode(false);
              }
            }}
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors shrink-0 flex items-center justify-center border border-slate-700"
            title="Herramientas Multimedia"
          >
            <Settings2 className="w-4 h-4" />
          </button>
          
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-full left-0 mb-3 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 flex flex-col gap-1 w-48 z-20"
              >
                <button 
                  onClick={() => {
                    setImageMode(!imageMode);
                    setVideoMode(false);
                    setShowSettings(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> Crear Imagen
                </button>
                <button 
                  onClick={() => {
                    setVideoMode(!videoMode);
                    setImageMode(false);
                    setShowSettings(false);
                  }}
                  className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 rounded-lg transition-colors"
                >
                  <Video className="w-4 h-4 text-pink-400" /> Crear Video
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={videoMode ? "Describe el video..." : imageMode ? "Describe la imagen..." : "Pregunta a Emmanai.smart (0 tokens)..."}
            className="flex-1 bg-slate-800 border border-slate-700 text-slate-100 text-xs sm:text-sm rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder-slate-500 transition-all shadow-inner"
          />
          <button 
            onClick={handleSend}
            disabled={loading || (!input.trim() && !imageFile && !imageMode)}
            className="px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/20 disabled:shadow-none flex items-center justify-center shrink-0 border border-indigo-500/50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
