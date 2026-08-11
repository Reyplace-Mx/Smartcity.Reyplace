import React, { useState, useRef } from 'react';
import { 
  X, Cpu, ShieldCheck, Database, Link, Upload, Image as ImageIcon, FileText, 
  Sparkles, CheckCircle2, AlertCircle, RefreshCw, Key, Globe, Lock, Terminal, 
  Layers, HardDrive, Zap, Sliders, Play, Trash2, ArrowRight, Eye, Copy, Check,
  Camera, Video, Radio, Activity, EyeOff, Server, Disc, Scan, AlertTriangle
} from 'lucide-react';
import clsx from 'clsx';
import { Place } from '../data';

interface EmmanAiSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: Place[];
  onAddPlace?: (newPlace: Place) => void;
}

interface UploadedFileItem {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'document' | 'model';
  previewUrl?: string;
  uploadedAt: string;
  extractedMetadata?: {
    suggestedName?: string;
    category?: string;
    gpsCoordinates?: string;
    description?: string;
    detectedType?: string;
  };
}

interface ApiEndpointConfig {
  id: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT';
  status: 'active' | 'testing' | 'offline';
  lastPing?: string;
}

export default function EmmanAiSandboxModal({
  isOpen,
  onClose,
  places,
  onAddPlace
}: EmmanAiSandboxModalProps) {
  const [activeTab, setActiveTab] = useState<'brain' | 'apis' | 'supabase' | 'files' | 'render' | 'hardware'>('brain');

  // Hardware Analysis & Vision Telemetry States
  const [isHardwareCamActive, setIsHardwareCamActive] = useState(true);
  const [hardwareFps, setHardwareFps] = useState(60);
  const [aiObjectDetection, setAiObjectDetection] = useState(true);
  const [anprPlateScanner, setAnprPlateScanner] = useState(true);
  const [potholeDetector, setPotholeDetector] = useState(true);
  const [hardwareAcceleration, setHardwareAcceleration] = useState<'CUDA_NVIDIA' | 'APPLE_NPU' | 'TENSOR_RT'>('CUDA_NVIDIA');
  const [detectedIncidences, setDetectedIncidences] = useState([
    { id: 'inc-1', location: 'Blvd. Gabriel Leyva & Valdez', type: 'Vehículo Detenido', confidence: '98%', status: 'Monitoreando', time: 'Hace 2 min' },
    { id: 'inc-2', location: 'Blvd. Antonio Rosales & Centenario', type: 'Lectura Placa ANPR: VNL-881-B', confidence: '99%', status: 'Verificado', time: 'Hace 4 min' },
    { id: 'inc-3', location: 'Colonia Jiquilpan, Los Mochis', type: 'Detección Bache Vialidad', confidence: '89%', status: 'Reportado a JAPAMA/Obras', time: 'Hace 8 min' }
  ]);

  // Supabase Configuration State
  const [supabaseUrl, setSupabaseUrl] = useState(() => localStorage.getItem('emmanai_sb_url') || 'https://los-mochis-twin.supabase.co');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState(() => localStorage.getItem('emmanai_sb_key') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.demo_key_mochis');
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(true);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [selectedTables, setSelectedTables] = useState<string[]>(['mochis_businesses', 'citizen_reports', '3d_twins_metadata']);

  // Brain & Memory Engine States
  const [systemContextPrompt, setSystemContextPrompt] = useState(
    'Cerebro EmmanAi.Smart: Administra la matriz urbana de Los Mochis, Sinaloa, optimiza gemelos digitales 3D, monitorea notificaciones de proximidad y sincroniza datos cívicos.'
  );
  const [memoryCapacityMb] = useState(256);
  const [memoryUsedMb, setMemoryUsedMb] = useState(48.2);
  const [isMemoryOptimized, setIsMemoryOptimized] = useState(true);
  const [simulatedLog, setSimulatedLog] = useState<string[]>([
    '[SYSTEM]: Inicializando Sandbox EmmanAi.Smart v2.8...',
    '[SECURITY]: Entorno aislado con cifrado AES-256 en memoria.',
    '[CONTEXT]: Cargar 12 comercios de Los Mochis (Leyva, Gabriel Leyva, Valdez).',
    '[SUPABASE]: Sincronización activa con la tabla mochis_businesses.'
  ]);

  // APIs & Webhooks State
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpointConfig[]>([
    { id: '1', name: 'Google Maps Places API', url: 'https://maps.googleapis.com/maps/api/place/nearbysearch/json', method: 'GET', status: 'active', lastPing: 'Hace 2 min' },
    { id: '2', name: 'OpenWeather Los Mochis Sensor', url: 'https://api.openweathermap.org/data/2.5/weather?q=Los+Mochis', method: 'GET', status: 'active', lastPing: 'Hace 5 min' },
    { id: '3', name: 'Supabase Realtime Webhook', url: 'https://los-mochis-twin.supabase.co/rest/v1/business', method: 'POST', status: 'active', lastPing: 'Hace 1 min' }
  ]);
  const [newApiName, setNewApiName] = useState('');
  const [newApiUrl, setNewApiUrl] = useState('');
  const [newApiMethod, setNewApiMethod] = useState<'GET' | 'POST'>('GET');
  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);

  // Files & Images State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>([
    {
      id: 'f1',
      name: 'fachada_botanico_mochis.png',
      size: '2.4 MB',
      type: 'image',
      previewUrl: 'https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=600&auto=format&fit=crop&q=80',
      uploadedAt: 'Hace 10 min',
      extractedMetadata: {
        suggestedName: 'Jardín Botánico Benjamín Francis Johnston',
        category: 'Turismo / Parque',
        gpsCoordinates: '25.7928, -108.9902',
        description: 'Parque emblemático Sinaloense con vegetación exótica y recorridos.',
        detectedType: 'Parque / Recreación'
      }
    },
    {
      id: 'f2',
      name: 'plano_clinica_privada_mochis.pdf',
      size: '5.1 MB',
      type: 'document',
      uploadedAt: 'Hace 1 hora',
      extractedMetadata: {
        suggestedName: 'Centro Médico Quirúrgico Los Mochis',
        category: 'Salud / Clínica',
        gpsCoordinates: '25.7910, -108.9880',
        description: 'Infraestructura hospitalaria con quirófanos de alta precisión.',
        detectedType: 'Hospital / Salud'
      }
    }
  ]);
  const [copiedKey, setCopiedKey] = useState(false);

  // Render & Engine parameters
  const [textureUpscaling, setTextureUpscaling] = useState<'4K' | '8K' | 'Native'>('4K');
  const [rayBounceLimit, setRayBounceLimit] = useState(4);
  const [ambientOcclusionLevel, setAmbientOcclusionLevel] = useState(85);

  if (!isOpen) return null;

  // Handlers
  const handleTestSupabaseConnection = () => {
    setIsTestingSupabase(true);
    setTimeout(() => {
      setIsTestingSupabase(false);
      setIsSupabaseConnected(true);
      localStorage.setItem('emmanai_sb_url', supabaseUrl);
      localStorage.setItem('emmanai_sb_key', supabaseAnonKey);
      setSimulatedLog(prev => [
        `[SUPABASE SUCCESS]: Conexión verificada con ${supabaseUrl}`,
        ...prev
      ]);
    }, 1200);
  };

  const handleAddApiEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiName || !newApiUrl) return;

    const newEndpoint: ApiEndpointConfig = {
      id: `api-${Date.now()}`,
      name: newApiName,
      url: newApiUrl,
      method: newApiMethod,
      status: 'active',
      lastPing: 'Justo ahora'
    };

    setApiEndpoints(prev => [newEndpoint, ...prev]);
    setNewApiName('');
    setNewApiUrl('');
    setSimulatedLog(prev => [
      `[API INTEGRADA]: Endpoint HTTPS registrado '${newEndpoint.name}'`,
      ...prev
    ]);
  };

  const handleTestEndpoint = (id: string) => {
    setTestingEndpointId(id);
    setTimeout(() => {
      setTestingEndpointId(null);
      setSimulatedLog(prev => [
        `[HTTPS TEST 200 OK]: Respuesta recibida de endpoint ${id}`,
        ...prev
      ]);
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const isImg = file.type.startsWith('image/');
    const preview = isImg ? URL.createObjectURL(file) : undefined;

    const newFileItem: UploadedFileItem = {
      id: `file-${Date.now()}`,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: isImg ? 'image' : 'document',
      previewUrl: preview,
      uploadedAt: 'Justo ahora',
      extractedMetadata: {
        suggestedName: file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " "),
        category: isImg ? 'Establecimiento Comercial' : 'Plano Documentado',
        gpsCoordinates: '25.7928, -108.9902',
        description: 'Archivo procesado por la red neuronal de EmmanAi.Smart para la Maqueta 3D.',
        detectedType: isImg ? 'Captura Urbana / Fachada' : 'Certificado Técnico'
      }
    };

    setUploadedFiles(prev => [newFileItem, ...prev]);
    setSimulatedLog(prev => [
      `[FILE AI PROCESS]: '${file.name}' analizado exitosamente. Metadatos listos.`,
      ...prev
    ]);
  };

  const handleIntegrateFileTo3D = (fileItem: UploadedFileItem) => {
    if (!onAddPlace) return;

    const newPlace: Place = {
      id: `place-ai-${Date.now()}`,
      name: fileItem.extractedMetadata?.suggestedName || fileItem.name,
      category: fileItem.extractedMetadata?.category || 'Comercio Digital',
      type: 'business',
      lat: 25.7928 + (Math.random() - 0.5) * 0.015,
      lng: -108.9902 + (Math.random() - 0.5) * 0.015,
      heading: 0,
      pitch: 0,
      address: 'Av. Gabriel Leyva, Los Mochis, Sinaloa',
      phone: '(668) 812-9000',
      schedule: '09:00 AM - 08:00 PM',
      images: fileItem.previewUrl ? [fileItem.previewUrl] : ['https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80'],
      description: fileItem.extractedMetadata?.description || 'Negocio integrado vía EmmanAi.Smart Sandbox.',
      digitalPresence: true,
      reviews: [
        {
          id: 'r1',
          author: 'EmmanAi.Smart Guardian',
          rating: 5,
          text: 'Comercio verificado e integrado mediante escaneo con Inteligencia Artificial.'
        }
      ]
    };

    onAddPlace(newPlace);
    alert(`¡${newPlace.name} ha sido integrado al Gemelo Digital 3D de Los Mochis!`);
  };

  const handleOptimizeMemory = () => {
    setMemoryUsedMb(28.4);
    setIsMemoryOptimized(true);
    setSimulatedLog(prev => [
      `[GARBAGE COLLECTOR]: Memoria optimizada. 19.8 MB liberados.`,
      ...prev
    ]);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 pointer-events-auto">
      {/* Dark Blur Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Main Sandbox Card */}
      <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-emerald-500/40 rounded-3xl shadow-2xl shadow-emerald-500/10 text-white overflow-hidden flex flex-col max-h-[92vh] z-10 animate-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                  EmmanAi.Smart <span className="text-emerald-400 font-mono text-xs bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">SANDBOX AISLADO</span>
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Cerebro de Lógica, Conector de APIs, Sincronización Segura Supabase e Ingesta de Archivos para Los Mochis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>AES-256 TLS 1.3</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
              title="Cerrar Sandbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/60 px-6 py-2 border-b border-slate-800 flex items-center gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('brain')}
            className={clsx(
              "px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition border whitespace-nowrap",
              activeTab === 'brain'
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
            )}
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            Cerebro & Memoria AI
          </button>

          <button
            onClick={() => setActiveTab('apis')}
            className={clsx(
              "px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition border whitespace-nowrap",
              activeTab === 'apis'
                ? "bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-sm"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
            )}
          >
            <Globe className="w-4 h-4 text-sky-400" />
            APIs, HTTPS & Webhooks
          </button>

          <button
            onClick={() => setActiveTab('supabase')}
            className={clsx(
              "px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition border whitespace-nowrap",
              activeTab === 'supabase'
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
            )}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            Almacenamiento Supabase
          </button>

          <button
            onClick={() => setActiveTab('files')}
            className={clsx(
              "px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition border whitespace-nowrap",
              activeTab === 'files'
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
            )}
          >
            <Upload className="w-4 h-4 text-amber-400" />
            Ingesta de Archivos e Imágenes
          </button>

          <button
            onClick={() => setActiveTab('render')}
            className={clsx(
              "px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition border whitespace-nowrap",
              activeTab === 'render'
                ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
            )}
          >
            <Sliders className="w-4 h-4 text-indigo-400" />
            Motor de Render 3D
          </button>

          <button
            onClick={() => setActiveTab('hardware')}
            className={clsx(
              "px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition border whitespace-nowrap",
              activeTab === 'hardware'
                ? "bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm"
                : "bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white"
            )}
          >
            <Camera className="w-4 h-4 text-rose-400 animate-pulse" />
            Análisis Hardware & Visión AI
          </button>
        </div>

        {/* Tab Content Container */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: BRAIN & MEMORY ENGINE */}
          {activeTab === 'brain' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Estado del Cerebro</span>
                    <span className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Operativo 100%
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center gap-3">
                  <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
                    <HardDrive className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-slate-400 font-medium">Memoria Contextual</span>
                      <span className="font-mono text-sky-300 font-bold">{memoryUsedMb} MB / {memoryCapacityMb} MB</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${(memoryUsedMb / memoryCapacityMb) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">Recolección de Basura</span>
                    <span className="text-xs text-emerald-400 font-bold">Optimización Lista</span>
                  </div>
                  <button
                    onClick={handleOptimizeMemory}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition border border-slate-700 flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" /> Purgar
                  </button>
                </div>
              </div>

              {/* System Context Prompt Editor */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Prompt de Contexto Urbano (Los Mochis)
                  </label>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded border border-emerald-500/30">
                    Modo Alta Prioridad
                  </span>
                </div>
                <textarea
                  value={systemContextPrompt}
                  onChange={(e) => setSystemContextPrompt(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:border-emerald-500 focus:outline-none font-mono resize-none leading-relaxed"
                />
                <p className="text-[11px] text-slate-400">
                  Este prompt gobierna el razonamiento para clasificar comercios en Los Mochis, analizar rutas de transporte y activar avisos de proximidad.
                </p>
              </div>

              {/* Console Execution Log */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    Registro de Ejecución Aislada (Sandbox Log)
                  </span>
                  <button
                    onClick={() => setSimulatedLog([])}
                    className="text-[10px] text-slate-500 hover:text-slate-300 font-bold"
                  >
                    Limpiar Consola
                  </button>
                </div>
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-3.5 font-mono text-[11px] text-emerald-400 space-y-1.5 max-h-40 overflow-y-auto">
                  {simulatedLog.map((log, index) => (
                    <div key={index} className="leading-snug">{log}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: APIS, HTTPS & WEBHOOKS */}
          {activeTab === 'apis' && (
            <div className="space-y-6">
              {/* Form to add Endpoint */}
              <form onSubmit={handleAddApiEndpoint} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-sky-400 flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Registrar Nuevo Endpoint HTTPS / API Externa
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Nombre (ej. API Tráfico Mochis)"
                    value={newApiName}
                    onChange={(e) => setNewApiName(e.target.value)}
                    className="sm:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                    required
                  />
                  <input
                    type="url"
                    placeholder="URL HTTPS (https://api.ejemplo.com/v1)"
                    value={newApiUrl}
                    onChange={(e) => setNewApiUrl(e.target.value)}
                    className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none font-mono"
                    required
                  />
                  <button
                    type="submit"
                    className="sm:col-span-1 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs p-2.5 rounded-xl transition flex items-center justify-center gap-1 shadow-md shadow-sky-500/20"
                  >
                    <Link className="w-4 h-4" /> Conectar Endpoint
                  </button>
                </div>
              </form>

              {/* Endpoints Table */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Endpoints Registrados ({apiEndpoints.length})
                </h3>
                <div className="space-y-2.5">
                  {apiEndpoints.map((ep) => (
                    <div key={ep.id} className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{ep.name}</span>
                          <span className="text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded border border-sky-500/30">
                            {ep.method}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block truncate mt-0.5">{ep.url}</span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 font-mono">
                          200 OK • {ep.lastPing}
                        </span>
                        <button
                          onClick={() => handleTestEndpoint(ep.id)}
                          disabled={testingEndpointId === ep.id}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-300 rounded-lg transition border border-slate-700 flex items-center gap-1"
                        >
                          <Play className={clsx("w-3 h-3", testingEndpointId === ep.id && "animate-spin")} />
                          {testingEndpointId === ep.id ? 'Probando...' : 'Probar HTTPS'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SUPABASE SECURE CLOUD SYNC */}
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-emerald-500/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Configuración de Proyecto Supabase (Los Mochis)
                    </h3>
                  </div>
                  <span className={clsx(
                    "text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5",
                    isSupabaseConnected ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  )}>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {isSupabaseConnected ? 'Sincronizado & Cifrado' : 'Desconectado'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold block">URL del Proyecto Supabase</label>
                    <input
                      type="text"
                      value={supabaseUrl}
                      onChange={(e) => setSupabaseUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-emerald-300 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-slate-400 font-bold block">Clave Anon Public Key / Service Key</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={supabaseAnonKey}
                        onChange={(e) => setSupabaseAnonKey(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs font-mono text-slate-300 focus:border-emerald-500 focus:outline-none pr-10"
                      />
                      <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <p className="text-[11px] text-slate-400">
                    Solo se almacenan datos optimizados y eficaces (Comercios verificados, Reportes cívicos y Metadatos 3D).
                  </p>
                  <button
                    onClick={handleTestSupabaseConnection}
                    disabled={isTestingSupabase}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
                  >
                    <RefreshCw className={clsx("w-3.5 h-3.5", isTestingSupabase && "animate-spin")} />
                    {isTestingSupabase ? 'Verificando...' : 'Guardar y Probar Conexión'}
                  </button>
                </div>
              </div>

              {/* Table Sync Selector */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Tablas Activas en Supabase para Sincronizar
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'mochis_businesses', label: 'Comercios & Maqueta 3D', count: '12 registros' },
                    { id: 'citizen_reports', label: 'Reportes Cívicos', count: '8 reportes' },
                    { id: '3d_twins_metadata', label: 'Metadatos Nanite 3D', count: '1.85M polígonos' }
                  ].map(table => (
                    <div 
                      key={table.id}
                      onClick={() => {
                        setSelectedTables(prev => 
                          prev.includes(table.id) ? prev.filter(t => t !== table.id) : [...prev, table.id]
                        );
                      }}
                      className={clsx(
                        "p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between",
                        selectedTables.includes(table.id)
                          ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                      )}
                    >
                      <div>
                        <span className="font-bold text-xs block">{table.label}</span>
                        <span className="text-[10px] font-mono text-slate-500">{table.count}</span>
                      </div>
                      <CheckCircle2 className={clsx("w-4 h-4", selectedTables.includes(table.id) ? "text-emerald-400" : "text-slate-700")} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FILE & IMAGE UPLOAD */}
          {activeTab === 'files' && (
            <div className="space-y-6">
              {/* Drag and drop zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-950 border-2 border-dashed border-amber-500/40 hover:border-amber-400 p-8 rounded-2xl text-center space-y-3 cursor-pointer transition group"
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  accept="image/*,.pdf,.obj,.gltf,.json,.csv"
                />
                <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/30 group-hover:scale-110 transition">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    Arrastra imágenes de fachadas, planos o documentos aquí
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Soporta imágenes (PNG, JPG), PDF de licencias y archivos 3D. EmmanAi.Smart los procesará para la Maqueta 3D.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition"
                >
                  Seleccionar Archivo Local
                </button>
              </div>

              {/* Uploaded Files Library */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                  Archivos Procesados por la Red Neuronal ({uploadedFiles.length})
                </h3>

                <div className="space-y-3">
                  {uploadedFiles.map(file => (
                    <div key={file.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        {file.previewUrl ? (
                          <img src={file.previewUrl} alt={file.name} className="w-14 h-14 rounded-xl object-cover border border-slate-800 shrink-0" />
                        ) : (
                          <div className="w-14 h-14 bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shrink-0">
                            <FileText className="w-6 h-6 text-amber-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-xs text-white truncate">{file.name}</h4>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            {file.size} • {file.uploadedAt}
                          </span>
                          {file.extractedMetadata && (
                            <p className="text-[11px] text-amber-300 font-medium mt-1">
                              ✨ Detectado: {file.extractedMetadata.suggestedName} ({file.extractedMetadata.category})
                            </p>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleIntegrateFileTo3D(file)}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition shadow-md flex items-center gap-1.5 shrink-0"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Integrar a Maqueta 3D
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RENDER & ENGINE CONTROL */}
          {activeTab === 'render' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-indigo-500/30 space-y-5">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <Sliders className="w-4 h-4" /> Parámetros del Motor de Renderizado 3D
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-300 font-bold block">Resolución de Texturas PBR</label>
                    <div className="flex gap-2">
                      {(['Native', '4K', '8K'] as const).map(res => (
                        <button
                          key={res}
                          onClick={() => setTextureUpscaling(res)}
                          className={clsx(
                            "flex-1 py-2 text-xs font-black rounded-xl border transition",
                            textureUpscaling === res
                              ? "bg-indigo-500 text-white border-indigo-400 shadow-md"
                              : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
                          )}
                        >
                          {res}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-bold">Rebotes de Rayos RTX</span>
                      <span className="font-mono text-indigo-300 font-bold">{rayBounceLimit} rebotes</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="12"
                      value={rayBounceLimit}
                      onChange={(e) => setRayBounceLimit(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-bold">Oclusión Ambiental RTAO</span>
                      <span className="font-mono text-indigo-300 font-bold">{ambientOcclusionLevel}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={ambientOcclusionLevel}
                      onChange={(e) => setAmbientOcclusionLevel(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: Hardware Analysis & AI Vision Stream */}
          {activeTab === 'hardware' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              {/* Header card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-rose-500/30 flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-xl">
                    <Video className="w-5 h-5 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-2">
                      Procesamiento de Flujos de Video, Cámaras CCTV & Sensores IoT
                    </h3>
                    <p className="text-xs text-slate-400">
                      Integración en tiempo real de hardware de video para la matriz urbana de Los Mochis
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsHardwareCamActive(!isHardwareCamActive)}
                    className={clsx(
                      "px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 border",
                      isHardwareCamActive
                        ? "bg-rose-500 text-slate-950 border-rose-400 shadow-md shadow-rose-500/20"
                        : "bg-slate-800 text-slate-400 border-slate-700"
                    )}
                  >
                    {isHardwareCamActive ? <Camera className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{isHardwareCamActive ? 'Cámara Hardware ON' : 'Cámara Pausada'}</span>
                  </button>

                  <select
                    value={hardwareAcceleration}
                    onChange={(e) => setHardwareAcceleration(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 text-rose-300 text-xs font-mono font-bold px-3 py-1.5 rounded-xl outline-none"
                  >
                    <option value="CUDA_NVIDIA">Aceleración: NVIDIA CUDA RTX</option>
                    <option value="APPLE_NPU">Aceleración: Apple Neural Engine (NPU)</option>
                    <option value="TENSOR_RT">Aceleración: TensorRT FP16</option>
                  </select>
                </div>
              </div>

              {/* Grid with Live Feed + Telemetry Controls */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* Simulated Live Camera Stream Box */}
                <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-3 space-y-3 relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                  
                  {/* Stream Canvas Overlay Simulation */}
                  <div className="relative w-full h-56 bg-slate-900 rounded-xl overflow-hidden border border-slate-800 flex items-center justify-center group">
                    <img
                      src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&auto=format&fit=crop&q=80"
                      alt="Cámara Urbana Los Mochis"
                      className={clsx(
                        "w-full h-full object-cover transition-all duration-300",
                        !isHardwareCamActive && "grayscale opacity-30"
                      )}
                    />

                    {/* HUD Bounding Boxes Overlay */}
                    {isHardwareCamActive && (
                      <div className="absolute inset-0 pointer-events-none p-4 flex flex-col justify-between">
                        {/* Top HUD Stats */}
                        <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400 font-bold bg-slate-950/80 p-2 rounded-lg backdrop-blur-md border border-slate-800">
                          <span className="flex items-center gap-1">
                            <Radio className="w-3 h-3 text-rose-500 animate-ping" />
                            CÁMARA LEYVA-ROSALES #04
                          </span>
                          <span>{hardwareFps} FPS • 1080p60</span>
                          <span className="text-amber-400">LATENCIA: 12ms</span>
                        </div>

                        {/* Bounding Box 1 */}
                        {aiObjectDetection && (
                          <div className="absolute top-16 left-1/4 w-32 h-20 border-2 border-emerald-400 bg-emerald-500/10 rounded backdrop-blur-[1px] flex flex-col justify-between p-1 text-[9px] font-mono font-bold text-emerald-300 animate-pulse">
                            <div className="bg-emerald-500/80 text-slate-950 px-1 py-0.5 rounded self-start">
                              VEHÍCULO 98.4%
                            </div>
                            <span className="text-[8px] bg-slate-950/80 px-1 rounded text-white">ANPR: VNL-881-B</span>
                          </div>
                        )}

                        {/* Bounding Box 2 - Pothole Detection */}
                        {potholeDetector && (
                          <div className="absolute bottom-8 right-1/3 w-28 h-16 border-2 border-rose-500 bg-rose-500/10 rounded backdrop-blur-[1px] flex flex-col justify-between p-1 text-[9px] font-mono font-bold text-rose-300">
                            <div className="bg-rose-600 text-white px-1 py-0.5 rounded self-start flex items-center gap-1">
                              <AlertTriangle className="w-2.5 h-2.5" /> BACHE 89%
                            </div>
                            <span className="text-[8px] bg-slate-950/80 px-1 rounded text-rose-200">REPARACIÓN PRIO</span>
                          </div>
                        )}

                        {/* Bottom Telemetry Stamp */}
                        <div className="text-[9px] font-mono text-slate-400 bg-slate-950/90 px-2 py-1 rounded self-end border border-slate-800">
                          LOG: GPU ACCEL {hardwareAcceleration} • FRAME_ID: #894,201
                        </div>
                      </div>
                    )}

                    {!isHardwareCamActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-slate-400 gap-2">
                        <EyeOff className="w-8 h-8 text-slate-600" />
                        <span className="text-xs font-bold">Flujo de Cámara Hardware Detenido</span>
                      </div>
                    )}
                  </div>

                  {/* Hardware Toggles Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setAiObjectDetection(!aiObjectDetection)}
                        className={clsx(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition",
                          aiObjectDetection ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40" : "bg-slate-900 text-slate-500 border-slate-800"
                        )}
                      >
                        Visión Detección
                      </button>
                      <button
                        onClick={() => setAnprPlateScanner(!anprPlateScanner)}
                        className={clsx(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition",
                          anprPlateScanner ? "bg-sky-500/20 text-sky-300 border-sky-500/40" : "bg-slate-900 text-slate-500 border-slate-800"
                        )}
                      >
                        Lector ANPR
                      </button>
                      <button
                        onClick={() => setPotholeDetector(!potholeDetector)}
                        className={clsx(
                          "px-2.5 py-1 rounded-lg text-[10px] font-bold border transition",
                          potholeDetector ? "bg-rose-500/20 text-rose-300 border-rose-500/40" : "bg-slate-900 text-slate-500 border-slate-800"
                        )}
                      >
                        Escaner Baches
                      </button>
                    </div>

                    <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
                      <span>FPS:</span>
                      <input
                        type="range"
                        min="24"
                        max="120"
                        value={hardwareFps}
                        onChange={(e) => setHardwareFps(Number(e.target.value))}
                        className="w-16 accent-rose-500 cursor-pointer"
                      />
                      <strong className="text-rose-400 font-bold">{hardwareFps}</strong>
                    </div>
                  </div>
                </div>

                {/* Detected Events & Hardware Telemetry Panel */}
                <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <Scan className="w-4 h-4 text-rose-400" /> Registro de Detección Hardware
                    </h4>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded font-mono font-bold border border-rose-500/30">
                      {detectedIncidences.length} Eventos
                    </span>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {detectedIncidences.map((inc) => (
                      <div key={inc.id} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-[11px]">{inc.type}</span>
                          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                            {inc.confidence}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">{inc.location}</p>
                        <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1">
                          <span>{inc.status}</span>
                          <span>{inc.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      const newEvt = {
                        id: `inc-${Date.now()}`,
                        location: 'Jardín Botánico Benjamín Francis Johnston',
                        type: 'Detección Sensores Exposición UV',
                        confidence: '96%',
                        status: 'Sincronizado',
                        time: 'Ahora'
                      };
                      setDetectedIncidences([newEvt, ...detectedIncidences]);
                    }}
                    className="w-full py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs rounded-xl transition border border-rose-500/30 flex items-center justify-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5" /> Forzar Escaneo de Cuadro Instantáneo
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3.5 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-mono">
            <Lock className="w-3.5 h-3.5 text-emerald-400" /> Cúpula de Seguridad Digital EmmanAi.Smart Activa
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition border border-slate-700"
          >
            Aceptar y Guardar Cambios
          </button>
        </div>

      </div>
    </div>
  );
}
