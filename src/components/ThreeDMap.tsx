import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Place } from '../data';
import { 
  Search, Sun, Moon, Sparkles, Navigation, Zap, Layers, Eye, 
  ChevronDown, ChevronUp, Box, RotateCw, Camera, Sliders, Maximize2, ShieldCheck,
  Play, Pause, SkipForward, SkipBack, Leaf, Battery, Compass, Video, Globe, Radio,
  Flame, Filter, AlertTriangle, MapPin, CheckCircle2, MessageSquare,
  Cpu, CloudRain, Thermometer, Wind, Car, Navigation2, Bot, Send, Database, Landmark, Layers3, Activity, ShieldAlert
} from 'lucide-react';
import clsx from 'clsx';

export interface IncidenceHotspot {
  id: string;
  title: string;
  category: 'vialidad' | 'alumbrado' | 'agua' | 'seguridad' | 'trafico';
  categoryLabel: string;
  reportsCount: number;
  density: 'alta' | 'media' | 'baja';
  locationName: string;
  screenPos: { x: number; y: number };
  lat: number;
  lng: number;
  description: string;
  recentReport: string;
}

export const INCIDENCE_HOTSPOTS: IncidenceHotspot[] = [
  {
    id: 'hs-1',
    title: 'Crucero Leyva & Valdez',
    category: 'vialidad',
    categoryLabel: 'Baches / Vialidad',
    reportsCount: 16,
    density: 'alta',
    locationName: 'Av. Gabriel Leyva & Valdez, Los Mochis',
    screenPos: { x: 38, y: 48 },
    lat: 25.7938,
    lng: -108.9950,
    description: 'Zona con alta densidad de desgaste en carpeta asfáltica acumulada tras lluvias.',
    recentReport: 'Bache profundo frente a gasolinera en carril derecho'
  },
  {
    id: 'hs-2',
    title: 'Bulevar Rosales & Centenario',
    category: 'trafico',
    categoryLabel: 'Tráfico / Accidentes',
    reportsCount: 12,
    density: 'alta',
    locationName: 'Blvd. Antonio Rosales & Centenario, Los Mochis',
    screenPos: { x: 62, y: 35 },
    lat: 25.7915,
    lng: -108.9980,
    description: 'Congestión vehicular en horas pico y desacoplamiento de tiempos semafóricos.',
    recentReport: 'Sincronización de semáforo con retraso de 40 segundos'
  },
  {
    id: 'hs-3',
    title: 'Jardín Botánico Acceso Norte',
    category: 'alumbrado',
    categoryLabel: 'Alumbrado Público',
    reportsCount: 8,
    density: 'media',
    locationName: 'Col. Jiquilpan, Los Mochis',
    screenPos: { x: 48, y: 28 },
    lat: 25.7955,
    lng: -108.9912,
    description: 'Tres luminarias LED apagadas en el andador peatonal.',
    recentReport: 'Reporte verificado por Guardián Urbano Carlos Zazueta'
  },
  {
    id: 'hs-4',
    title: 'Centro Histórico - Zaragoza & Valdez',
    category: 'agua',
    categoryLabel: 'Fugas de Agua / JAPAMA',
    reportsCount: 11,
    density: 'alta',
    locationName: 'Centro, Los Mochis',
    screenPos: { x: 28, y: 62 },
    lat: 25.7900,
    lng: -108.9930,
    description: 'Fuga en tubería primaria de agua potable sobre banqueta comercial.',
    recentReport: 'Solicitud urgente de cuadrilla de reparación JAPAMA'
  },
  {
    id: 'hs-5',
    title: 'Bulevar Macario Gaxiola Sur',
    category: 'seguridad',
    categoryLabel: 'Seguridad / Vigilancia',
    reportsCount: 6,
    density: 'media',
    locationName: 'Macario Gaxiola Sur, Los Mochis',
    screenPos: { x: 72, y: 65 },
    lat: 25.7880,
    lng: -108.9890,
    description: 'Petición ciudadana para reforzar rondines nocturnos de tránsito y patrullas.',
    recentReport: 'Solicitud de colocación de señalamientos de velocidad'
  }
];

interface ThreeDMapProps {
  places: Place[];
  selectedPlaceId: string | null;
  onSelectPlace: (place: Place) => void;
  onOpenRegisterModal: (plan?: string) => void;
  onOpenExternalMapsModal: () => void;
  onOpenBlenderStudio?: (place: Place) => void;
  onGoToCitizenRed?: () => void;
  ecoMode?: boolean;
  onToggleEcoMode?: () => void;
}

export default function ThreeDMap({
  places,
  selectedPlaceId,
  onSelectPlace,
  onOpenRegisterModal,
  onOpenExternalMapsModal,
  onOpenBlenderStudio,
  onGoToCitizenRed,
  ecoMode = false,
  onToggleEcoMode
}: ThreeDMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Blender Viewport States
  const [shaderMode, setShaderMode] = useState<'rendered' | 'material' | 'solid' | 'wireframe'>('rendered');
  const [lightingPreset, setLightingPreset] = useState<'cyber' | 'studio' | 'sunset' | 'clay'>('cyber');
  const [isTurntable, setIsTurntable] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'todos' | 'digitalizados'>('todos');

  // Heatmap States
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [heatmapCategory, setHeatmapCategory] = useState<'todos' | 'vialidad' | 'alumbrado' | 'agua' | 'seguridad' | 'trafico'>('todos');
  const [selectedHotspot, setSelectedHotspot] = useState<IncidenceHotspot | null>(null);

  // High-End Graphic Engine & Physics Simulation States
  const [graphicsEngine, setGraphicsEngine] = useState<'unreal_lumen' | 'unity_hdrp' | 'cesium_tiles'>('unreal_lumen');
  const [physicsMode, setPhysicsMode] = useState<'orbit' | 'drone_flyover' | 'street_walk'>('orbit');
  const [cartographyLayer, setCartographyLayer] = useState<'wgs84_utm' | 'inegi_topo' | 'satelital_rgb' | 'catastro_ahome'>('wgs84_utm');

  // IoT Live Sensors & AI Spatial Assistant Drawers
  const [showIotDrawer, setShowIotDrawer] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: '¡Hola! Soy EmmanAI, tu Asistente Geoespacial Urbano para Los Mochis. ¿En qué puedo guiarte hoy? Puedo calcular rutas óptimas, consultar la densidad de tráfico o mostrarte datos INEGI de cualquier zona.',
      time: 'Ahora'
    }
  ]);

  const filteredHotspots = useMemo(() => {
    if (heatmapCategory === 'todos') return INCIDENCE_HOTSPOTS;
    return INCIDENCE_HOTSPOTS.filter(h => h.category === heatmapCategory);
  }, [heatmapCategory]);

  // Engine & Architectural Rendering States
  const [naniteMode, setNaniteMode] = useState(true);
  const [rayTracingMode, setRayTracingMode] = useState(true);
  const [enginePreset, setEnginePreset] = useState<'unreal5' | 'lumen' | 'cycles'>('unreal5');
  const [showNaniteMeshWire, setShowNaniteMeshWire] = useState(false);

  // Auto Tour 3D States
  const [isAutoTouring, setIsAutoTouring] = useState(false);
  const [tourIndex, setTourIndex] = useState(0);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);
  const interactiveObjectsRef = useRef<THREE.Mesh[]>([]);
  const naniteDetailGroupRef = useRef<THREE.Group | null>(null);
  const carsRef = useRef<THREE.Mesh[]>([]);

  // Camera Presets
  const setCameraPreset = (preset: 'drone' | 'street' | 'zenith' | 'horizon') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    let targetPos = new THREE.Vector3(45, 40, 60);
    let targetLook = new THREE.Vector3(0, 0, 0);

    if (preset === 'street') {
      targetPos = new THREE.Vector3(0, 3, 22);
      targetLook = new THREE.Vector3(0, 2, 0);
    } else if (preset === 'zenith') {
      targetPos = new THREE.Vector3(0, 85, 2);
      targetLook = new THREE.Vector3(0, 0, 0);
    } else if (preset === 'horizon') {
      targetPos = new THREE.Vector3(65, 12, 15);
      targetLook = new THREE.Vector3(0, 6, 0);
    }

    const startPos = camera.position.clone();
    const startTarget = controls.target.clone();
    const startTime = performance.now();
    const duration = 900;

    function animateCam(now: number) {
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      camera.position.lerpVectors(startPos, targetPos, ease);
      controls.target.lerpVectors(startTarget, targetLook, ease);
      controls.update();

      if (progress < 1) requestAnimationFrame(animateCam);
    }
    requestAnimationFrame(animateCam);
  };
  const tourPlaces = useMemo(() => {
    return places.filter(p => p.digitalPresence || (p.reviews && p.reviews.length > 0));
  }, [places]);

  // Selected place object data for Blender Inspector
  const selectedPlace = places.find(p => p.id === selectedPlaceId) || null;

  // Filtered places
  const filteredPlaces = places.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'todos' || (filterType === 'digitalizados' && p.digitalPresence);
    return matchesSearch && matchesFilter;
  });

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    scene.fog = new THREE.FogExp2(0x020617, 0.012);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 1, 1000);
    camera.position.set(45, 40, 60);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Orbit Controls (Blender Style Navigation)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;
    controls.minDistance = 8;
    controls.maxDistance = 150;
    controls.autoRotateSpeed = 1.5;
    controlsRef.current = controls;

    // 5. Lights setup
    const ambientLight = new THREE.AmbientLight(0x38bdf8, 0.6);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(40, 65, 25);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // 6. Urban Base & Grid Pedestal
    const planeGeo = new THREE.PlaneGeometry(170, 170);
    const planeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.8, metalness: 0.2 });
    const plane = new THREE.Mesh(planeGeo, planeMat);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);

    const grid = new THREE.GridHelper(170, 42, 0x1e293b, 0x1e293b);
    grid.position.y = 0.02;
    scene.add(grid);

    // Boulevards (Rosales & Leyva)
    const roadGeo = new THREE.PlaneGeometry(14, 170);
    const roadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
    const road1 = new THREE.Mesh(roadGeo, roadMat);
    road1.rotation.x = -Math.PI / 2;
    road1.position.y = 0.03;
    scene.add(road1);

    const road2 = new THREE.Mesh(roadGeo, roadMat);
    road2.rotation.x = -Math.PI / 2;
    road2.rotation.z = Math.PI / 2;
    road2.position.y = 0.03;
    scene.add(road2);

    // Streetlights
    const postGeo = new THREE.CylinderGeometry(0.1, 0.1, 3, 8);
    const postMat = new THREE.MeshBasicMaterial({ color: 0x64748b });
    const lampGeo = new THREE.SphereGeometry(0.3, 8, 8);
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });

    for (let z = -70; z <= 70; z += 20) {
      if (Math.abs(z) < 10) continue;
      const p1 = new THREE.Mesh(postGeo, postMat);
      p1.position.set(8, 1.5, z);
      scene.add(p1);

      const l1 = new THREE.Mesh(lampGeo, lampMat);
      l1.position.set(8, 3, z);
      scene.add(l1);

      const p2 = new THREE.Mesh(postGeo, postMat);
      p2.position.set(-8, 1.5, z);
      scene.add(p2);

      const l2 = new THREE.Mesh(lampGeo, lampMat);
      l2.position.set(-8, 3, z);
      scene.add(l2);
    }

    // 7. Interactive Procedural Buildings
    interactiveObjectsRef.current = [];

    places.forEach((place, index) => {
      const isCerro = place.id === 'p3' || place.name.includes('Cerro');
      const isBotanico = place.id === 'p2' || place.name.includes('Parque');
      const isPlaza = place.type === 'plaza';
      const isClinic = place.type === 'clinic';

      let width = 8, height = 8, depth = 8;
      let posX = (index % 3) * 24 - 24;
      let posZ = Math.floor(index / 3) * 24 - 24;

      if (isCerro) {
        posX = -34; posZ = -34; width = 22; height = 16; depth = 22;
      } else if (isBotanico) {
        posX = -20; posZ = 14; width = 20; height = 6; depth = 18;
      } else if (isPlaza) {
        width = 12; height = 9; depth = 12;
      } else if (isClinic) {
        width = 9; height = 14; depth = 9;
      }

      const isDigital = place.digitalPresence;
      let colorHex = 0x3b82f6;
      if (isPlaza) colorHex = 0x10b981;
      else if (place.type === 'business') colorHex = 0xf59e0b;
      else if (isClinic) colorHex = 0xec4899;

      let geo: THREE.BufferGeometry;
      if (isCerro) {
        geo = new THREE.ConeGeometry(width / 1.2, height, 16);
      } else if (isBotanico) {
        geo = new THREE.DodecahedronGeometry(height, 1);
      } else {
        geo = new THREE.BoxGeometry(width, height, depth);
      }

      const mat = new THREE.MeshStandardMaterial({
        color: isDigital ? colorHex : 0x334155,
        emissive: isDigital ? colorHex : 0x000000,
        emissiveIntensity: isDigital ? 0.35 : 0,
        roughness: isDigital ? 0.25 : 0.8,
        metalness: isDigital ? 0.75 : 0.1
      });

      const building = new THREE.Mesh(geo, mat);
      building.position.set(posX, height / 2, posZ);
      building.castShadow = true;
      building.receiveShadow = true;
      building.userData = { place, height, posX, posZ, colorHex, isDigital, width, depth };

      scene.add(building);

      // Wireframe Outline
      const edges = new THREE.EdgesGeometry(geo);
      const lineMat = new THREE.LineBasicMaterial({
        color: isDigital ? 0xffffff : 0x64748b
      });
      const wireframeMesh = new THREE.LineSegments(edges, lineMat);
      building.add(wireframeMesh);

      // Special Nanite Micro-Polygon Architectural Details & Exoskeletons
      if (isDigital) {
        // Nanite Curtain Wall Vertical Glass Louvers
        const louverMat = new THREE.MeshStandardMaterial({
          color: 0x38bdf8,
          roughness: 0.1,
          metalness: 0.9,
          transparent: true,
          opacity: 0.85
        });

        // Generate Nanite Architectural Fins along the facade
        const finCount = 6;
        for (let f = 0; f < finCount; f++) {
          const finGeo = new THREE.BoxGeometry(0.15, height * 0.95, 0.4);
          const finFront = new THREE.Mesh(finGeo, louverMat);
          finFront.position.set(-width / 2 + (f + 0.5) * (width / finCount), 0, depth / 2 + 0.1);
          finFront.castShadow = true;
          building.add(finFront);

          const finBack = new THREE.Mesh(finGeo, louverMat);
          finBack.position.set(-width / 2 + (f + 0.5) * (width / finCount), 0, -depth / 2 - 0.1);
          finBack.castShadow = true;
          building.add(finBack);
        }

        // Nanite Rooftop HVAC & Solar Array Complex
        const hvacGeo = new THREE.BoxGeometry(width * 0.35, 1.2, depth * 0.35);
        const hvacMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5, metalness: 0.8 });
        const hvac = new THREE.Mesh(hvacGeo, hvacMat);
        hvac.position.set(width * 0.2, height / 2 + 0.6, -depth * 0.2);
        hvac.castShadow = true;
        building.add(hvac);

        // Nanite Diagonal Diagrid Steel Truss Exoskeleton (for high rise / clinic / plaza)
        const diagridMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2, metalness: 0.95 });
        const diagridGeo = new THREE.CylinderGeometry(0.12, 0.12, Math.sqrt(width * width + height * height), 8);
        
        const diag1 = new THREE.Mesh(diagridGeo, diagridMat);
        diag1.rotation.z = Math.atan2(width, height);
        diag1.position.set(0, 0, depth / 2 + 0.15);
        building.add(diag1);

        const diag2 = new THREE.Mesh(diagridGeo, diagridMat);
        diag2.rotation.z = -Math.atan2(width, height);
        diag2.position.set(0, 0, depth / 2 + 0.15);
        building.add(diag2);

        if (isCerro) {
          // Monumento Virgen de la Paz en la cima del Cerro de la Memoria
          const monumentPedestalG = new THREE.BoxGeometry(2.5, 3, 2.5);
          const monumentPedestalM = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1 });
          const pedestal = new THREE.Mesh(monumentPedestalG, monumentPedestalM);
          pedestal.position.y = height / 2 + 1.5;
          building.add(pedestal);

          // Virgen Cross Spire
          const crossVertG = new THREE.BoxGeometry(0.5, 4.5, 0.5);
          const crossHorizG = new THREE.BoxGeometry(2.5, 0.5, 0.5);
          const crossMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
          const cVert = new THREE.Mesh(crossVertG, crossMat);
          cVert.position.y = height / 2 + 5;
          building.add(cVert);

          const cHoriz = new THREE.Mesh(crossHorizG, crossMat);
          cHoriz.position.y = height / 2 + 5.5;
          building.add(cHoriz);

          // Rotating Beacon Light
          const virgenLight = new THREE.PointLight(0x38bdf8, 4, 35);
          virgenLight.position.y = height / 2 + 6;
          building.add(virgenLight);
        } else if (isBotanico) {
          // Geodesic Glass Greenhouse Dome & Palm Tree Canopy
          const domeG = new THREE.SphereGeometry(4, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
          const domeM = new THREE.MeshStandardMaterial({ color: 0x10b981, transparent: true, opacity: 0.7, roughness: 0.1, metalness: 0.8 });
          const dome = new THREE.Mesh(domeG, domeM);
          dome.position.y = height / 2;
          building.add(dome);

          // Surrounding Palm Trees
          const trunkG = new THREE.CylinderGeometry(0.2, 0.3, 3.5, 8);
          const trunkM = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9 });
          const frondG = new THREE.ConeGeometry(1.8, 1.2, 6);
          const frondM = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.4 });

          [[-6, -4], [6, 4], [-5, 5], [7, -5]].forEach(([px, pz]) => {
            const trunk = new THREE.Mesh(trunkG, trunkM);
            trunk.position.set(px, 1.75, pz);
            building.add(trunk);

            const frond = new THREE.Mesh(frondG, frondM);
            frond.position.set(px, 3.5, pz);
            building.add(frond);
          });
        } else if (isClinic) {
          // Medical Cross Spire
          const spireG = new THREE.BoxGeometry(0.8, 3, 0.8);
          const spireM = new THREE.MeshBasicMaterial({ color: 0xec4899 });
          const spire = new THREE.Mesh(spireG, spireM);
          spire.position.y = height / 2 + 1.5;
          building.add(spire);
        } else if (isPlaza) {
          // Kiosco Central de la Plazuela 28 de Julio con Cúpula de Bronce
          const kioskBaseG = new THREE.CylinderGeometry(2.2, 2.6, 1.2, 8);
          const kioskBaseM = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4 });
          const kioskBase = new THREE.Mesh(kioskBaseG, kioskBaseM);
          kioskBase.position.y = height / 2 + 0.6;
          building.add(kioskBase);

          const kioskDomeG = new THREE.SphereGeometry(2.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);
          const kioskDomeM = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.9, roughness: 0.2 });
          const kioskDome = new THREE.Mesh(kioskDomeG, kioskDomeM);
          kioskDome.position.y = height / 2 + 2.2;
          building.add(kioskDome);
        }

        // Volumetric Ray-Tracing Beacon & GI Point Light
        const beaconGeo = new THREE.CylinderGeometry(0.1, 0.9, 7, 12);
        const beaconMat = new THREE.MeshBasicMaterial({ color: colorHex, transparent: true, opacity: 0.75 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.y = height / 2 + 3.8;
        building.add(beacon);

        const pLight = new THREE.PointLight(colorHex, 3.2, 24);
        pLight.position.y = height / 2 + 1;
        pLight.castShadow = true;
        building.add(pLight);
      }

      interactiveObjectsRef.current.push(building);
    });

    // 8. Traffic Vehicles with Headlights
    const carGeo = new THREE.BoxGeometry(1.4, 0.9, 2.8);
    const carMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.8 });
    carsRef.current = [];

    for (let i = 0; i < 8; i++) {
      const car = new THREE.Mesh(carGeo, carMat);
      car.position.set(0, 0.5, (i - 4) * 22);
      car.castShadow = true;

      // Headlights
      const hlGeo = new THREE.SphereGeometry(0.2, 8, 8);
      const hlMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const hl1 = new THREE.Mesh(hlGeo, hlMat);
      hl1.position.set(0.4, 0.2, 1.4);
      car.add(hl1);
      const hl2 = new THREE.Mesh(hlGeo, hlMat);
      hl2.position.set(-0.4, 0.2, 1.4);
      car.add(hl2);

      scene.add(car);
      carsRef.current.push(car);
    }

    // 9. Raycasting for Click Selection
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(interactiveObjectsRef.current);

      if (intersects.length > 0) {
        const selected = intersects[0].object as THREE.Mesh;
        const data = selected.userData;
        if (data && data.place) {
          onSelectPlace(data.place);
          animateCameraTo(data.posX, data.height, data.posZ);
        }
      }
    };

    renderer.domElement.addEventListener('click', handlePointerClick);

    // Camera animation helper
    function animateCameraTo(x: number, h: number, z: number) {
      const targetPos = new THREE.Vector3(x + 20, h + 16, z + 22);
      const startPos = camera.position.clone();
      const startTarget = controls.target.clone();
      const endTarget = new THREE.Vector3(x, h / 2, z);

      const duration = 850;
      const startTime = performance.now();

      function step(now: number) {
        const progress = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        camera.position.lerpVectors(startPos, targetPos, ease);
        controls.target.lerpVectors(startTarget, endTarget, ease);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }
      requestAnimationFrame(step);
    }

    // 10. Animation Loop
    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.autoRotate = isTurntable;
      controls.update();

      // Rotate beacons (slower in eco mode)
      const rotSpeed = ecoMode ? 0.005 : 0.025;
      interactiveObjectsRef.current.forEach(obj => {
        if (obj.userData.place?.digitalPresence && obj.children.length > 1) {
          obj.children[1].rotation.y += rotSpeed;
        }
      });

      // Move traffic (reduced in eco mode to save CPU)
      if (!ecoMode) {
        carsRef.current.forEach((car, idx) => {
          car.position.z += 0.38 + idx * 0.03;
          if (car.position.z > 80) car.position.z = -80;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // 11. Handle Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handlePointerClick);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [places]);

  // Eco Mode Pixel Ratio Effect
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setPixelRatio(ecoMode ? 1 : Math.min(window.devicePixelRatio, 2));
    }
  }, [ecoMode]);

  // Auto Tour 3D Camera Loop
  useEffect(() => {
    if (!isAutoTouring || tourPlaces.length === 0) return;

    const currentPlace = tourPlaces[tourIndex % tourPlaces.length];
    if (currentPlace) {
      onSelectPlace(currentPlace);
      
      const found = interactiveObjectsRef.current.find(obj => obj.userData.place?.id === currentPlace.id);
      if (found && cameraRef.current && controlsRef.current) {
        const { posX, height, posZ } = found.userData;
        const targetPos = new THREE.Vector3(posX + 22, height + 18, posZ + 24);
        
        const startPos = cameraRef.current.position.clone();
        const startTarget = controlsRef.current.target.clone();
        const endTarget = new THREE.Vector3(posX, height / 2, posZ);

        const duration = 1200;
        const startTime = performance.now();

        function step(now: number) {
          const progress = Math.min((now - startTime) / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);

          cameraRef.current?.position.lerpVectors(startPos, targetPos, ease);
          controlsRef.current?.target.lerpVectors(startTarget, endTarget, ease);

          if (progress < 1) {
            requestAnimationFrame(step);
          }
        }
        requestAnimationFrame(step);
      }
    }

    const timer = setTimeout(() => {
      setTourIndex(prev => (prev + 1) % tourPlaces.length);
    }, 5500);

    return () => clearTimeout(timer);
  }, [isAutoTouring, tourIndex, tourPlaces]);

  // Lighting Preset Handler
  useEffect(() => {
    if (!sceneRef.current || !ambientLightRef.current || !dirLightRef.current) return;
    const scene = sceneRef.current;

    if (lightingPreset === 'cyber') {
      scene.background = new THREE.Color(0x020617);
      scene.fog = new THREE.FogExp2(0x020617, 0.012);
      ambientLightRef.current.color.setHex(0x38bdf8);
      ambientLightRef.current.intensity = 0.6;
      dirLightRef.current.color.setHex(0xffffff);
      dirLightRef.current.intensity = 1.0;
    } else if (lightingPreset === 'studio') {
      scene.background = new THREE.Color(0x0f172a);
      scene.fog = new THREE.FogExp2(0x0f172a, 0.008);
      ambientLightRef.current.color.setHex(0xffffff);
      ambientLightRef.current.intensity = 1.2;
      dirLightRef.current.color.setHex(0xfff7ed);
      dirLightRef.current.intensity = 1.4;
    } else if (lightingPreset === 'sunset') {
      scene.background = new THREE.Color(0x291528);
      scene.fog = new THREE.FogExp2(0x291528, 0.01);
      ambientLightRef.current.color.setHex(0xf59e0b);
      ambientLightRef.current.intensity = 0.8;
      dirLightRef.current.color.setHex(0xf97316);
      dirLightRef.current.intensity = 1.5;
    } else if (lightingPreset === 'clay') {
      scene.background = new THREE.Color(0x1e293b);
      scene.fog = new THREE.FogExp2(0x1e293b, 0.006);
      ambientLightRef.current.color.setHex(0xe2e8f0);
      ambientLightRef.current.intensity = 1.0;
      dirLightRef.current.color.setHex(0xffffff);
      dirLightRef.current.intensity = 1.1;
    }
  }, [lightingPreset]);

  // Shader Mode Handler
  useEffect(() => {
    interactiveObjectsRef.current.forEach(obj => {
      const data = obj.userData;
      if (!data) return;

      if (shaderMode === 'wireframe') {
        if (obj.material instanceof THREE.MeshStandardMaterial) {
          obj.material.wireframe = true;
        }
      } else if (shaderMode === 'solid') {
        if (obj.material instanceof THREE.MeshStandardMaterial) {
          obj.material.wireframe = false;
          obj.material.color.setHex(0x94a3b8);
          obj.material.emissive.setHex(0x000000);
          obj.material.roughness = 0.9;
        }
      } else {
        // Material & Rendered
        if (obj.material instanceof THREE.MeshStandardMaterial) {
          obj.material.wireframe = false;
          const col = data.isDigital ? data.colorHex : 0x334155;
          obj.material.color.setHex(col);
          obj.material.emissive.setHex(data.isDigital ? col : 0x000000);
          obj.material.roughness = data.isDigital ? 0.25 : 0.8;
        }
      }
    });
  }, [shaderMode]);

  // Camera Focus when selectedPlaceId changes
  useEffect(() => {
    if (!selectedPlaceId || !cameraRef.current || !controlsRef.current) return;
    const found = interactiveObjectsRef.current.find(obj => obj.userData.place?.id === selectedPlaceId);
    if (found) {
      const { posX, height, posZ } = found.userData;
      const targetPos = new THREE.Vector3(posX + 20, height + 16, posZ + 22);
      cameraRef.current.position.copy(targetPos);
      controlsRef.current.target.set(posX, height / 2, posZ);
    }
  }, [selectedPlaceId]);

  return (
    <div className="relative w-full h-full min-h-[550px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
      {/* 3D WebGL Viewport Canvas */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Top Blender Viewport Header Bar */}
      <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-10 flex items-center justify-between pointer-events-none gap-2 flex-wrap">
        
        {/* Left: Studio Title & Lighting Presets */}
        <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-slate-800 shadow-xl pointer-events-auto">
          <div className="flex items-center gap-2 px-2">
            <Box className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider text-white hidden sm:inline">
              Blender Studio 3D
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* Lighting Mode Switchers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLightingPreset('cyber')}
              className={clsx(
                "p-1.5 rounded-xl text-[10px] font-bold transition flex items-center gap-1",
                lightingPreset === 'cyber' ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:bg-slate-800"
              )}
              title="Iluminación Cyber Nocturna"
            >
              <Moon className="w-3.5 h-3.5" /> <span className="hidden md:inline">Nocturno</span>
            </button>
            <button
              onClick={() => setLightingPreset('studio')}
              className={clsx(
                "p-1.5 rounded-xl text-[10px] font-bold transition flex items-center gap-1",
                lightingPreset === 'studio' ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:bg-slate-800"
              )}
              title="Estudio Neutro"
            >
              <Sun className="w-3.5 h-3.5" /> <span className="hidden md:inline">Estudio</span>
            </button>
            <button
              onClick={() => setLightingPreset('sunset')}
              className={clsx(
                "p-1.5 rounded-xl text-[10px] font-bold transition flex items-center gap-1",
                lightingPreset === 'sunset' ? "bg-amber-500 text-slate-950" : "text-slate-400 hover:bg-slate-800"
              )}
              title="Atardecer Mochitense"
            >
              <Sparkles className="w-3.5 h-3.5" /> <span className="hidden md:inline">Atardecer</span>
            </button>
          </div>
        </div>

        {/* Right: Shader Render Modes */}
        <div className="flex items-center gap-1 bg-slate-900/90 backdrop-blur-xl p-1.5 sm:p-2 rounded-2xl border border-slate-800 shadow-xl pointer-events-auto">
          {[
            { id: 'rendered', label: 'Cycles', icon: Sparkles },
            { id: 'material', label: 'LookDev', icon: Layers },
            { id: 'solid', label: 'Solid', icon: Box },
            { id: 'wireframe', label: 'Wire', icon: Sliders }
          ].map(mode => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.id}
                onClick={() => setShaderMode(mode.id as any)}
                className={clsx(
                  "px-2.5 py-1 rounded-xl text-[11px] font-bold transition flex items-center gap-1",
                  shaderMode === mode.id
                    ? "bg-sky-500 text-white shadow-md"
                    : "text-slate-400 hover:bg-slate-800"
                )}
              >
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{mode.label}</span>
              </button>
            );
          })}

          <button
            onClick={onOpenExternalMapsModal}
            className="px-3 py-1.5 rounded-xl font-black text-xs bg-sky-500/20 text-sky-300 border border-sky-400/50 hover:bg-sky-500/30 transition flex items-center gap-1.5 shadow-lg shadow-sky-500/10 active:scale-95 ml-1"
            title="Abrir Escáner Satelital Multiespectral de Los Mochis"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="hidden sm:inline">Escáner Satelital</span>
          </button>

          <button
            onClick={() => {
              setShowHeatmap(!showHeatmap);
              if (selectedHotspot) setSelectedHotspot(null);
            }}
            className={clsx(
              "px-3 py-1.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow-lg active:scale-95 ml-1 border",
              showHeatmap
                ? "bg-rose-600 text-white border-rose-400 shadow-rose-500/30 ring-2 ring-rose-400/50"
                : "bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30"
            )}
            title="Activar Mapa de Calor de Incidencias Ciudadanas"
          >
            <Flame className={clsx("w-3.5 h-3.5 text-rose-400", showHeatmap && "animate-bounce text-white")} />
            <span className="hidden sm:inline">Mapa de Calor</span>
          </button>

          <button
            onClick={() => setIsTurntable(!isTurntable)}
            className={clsx(
              "p-1.5 rounded-xl text-xs font-bold transition border ml-1",
              isTurntable ? "bg-emerald-500 text-slate-950 border-emerald-400" : "bg-slate-800 text-slate-400 border-slate-700"
            )}
            title="Giro 360° Turntable"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Eco Mode Toggle */}
          {onToggleEcoMode && (
            <button
              onClick={onToggleEcoMode}
              className={clsx(
                "p-1.5 rounded-xl text-xs font-bold transition border ml-1 flex items-center gap-1",
                ecoMode
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                  : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
              )}
              title={ecoMode ? "Modo Eco Activo (Ahorro de Batería)" : "Activar Modo Eco"}
            >
              <Leaf className="w-3.5 h-3.5" />
              <span className="hidden lg:inline text-[10px]">{ecoMode ? "Eco ON" : "Eco"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Auto Tour 3D Floating Control Bar, Graphic Engine, Cartography & IoT Bar */}
      <div className="absolute top-16 right-3 sm:top-18 sm:right-4 z-10 pointer-events-auto flex flex-col items-end gap-2">
        {/* Engine, Physics & Cartography HUD */}
        <div className="flex flex-wrap items-center justify-end gap-1.5 bg-slate-900/95 backdrop-blur-xl p-2 rounded-2xl border border-slate-800 shadow-2xl">
          {/* Graphics Engine Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <select
              value={graphicsEngine}
              onChange={(e) => setGraphicsEngine(e.target.value as any)}
              className="bg-transparent text-purple-300 font-mono text-[10px] outline-none cursor-pointer"
            >
              <option value="unreal_lumen">Unreal Engine 5 (Lumen GI)</option>
              <option value="unity_hdrp">Unity HDRP (Path Tracing)</option>
              <option value="cesium_tiles">Cesium 3D Tiles (Streaming)</option>
            </select>
          </div>

          {/* Physics Navigation Mode */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
            <Navigation2 className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={physicsMode}
              onChange={(e) => setPhysicsMode(e.target.value as any)}
              className="bg-transparent text-sky-300 font-mono text-[10px] outline-none cursor-pointer"
            >
              <option value="orbit">Físicas: Órbita Libre</option>
              <option value="drone_flyover">Físicas: Dron Topográfico</option>
              <option value="street_walk">Físicas: Peatón Calle</option>
            </select>
          </div>

          {/* Cartografía & Capa INEGI */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-bold">
            <Landmark className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={cartographyLayer}
              onChange={(e) => setCartographyLayer(e.target.value as any)}
              className="bg-transparent text-emerald-300 font-mono text-[10px] outline-none cursor-pointer"
            >
              <option value="wgs84_utm">INEGI: UTM Zona 12N (WGS84)</option>
              <option value="inegi_topo">INEGI: Topográfico 1:50,000</option>
              <option value="satelital_rgb">Satelital: Sentinel RGB</option>
              <option value="catastro_ahome">INEGI: Catastro Digital Ahome</option>
            </select>
          </div>

          {/* IoT Sensors Toggle */}
          <button
            onClick={() => {
              setShowIotDrawer(!showIotDrawer);
              if (showAiAssistant) setShowAiAssistant(false);
            }}
            className={clsx(
              "px-2.5 py-1.5 rounded-xl text-[10px] font-black transition flex items-center gap-1 border",
              showIotDrawer
                ? "bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20"
                : "bg-slate-800 text-amber-400 border-amber-500/30 hover:bg-slate-700"
            )}
          >
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            <span>Sensores IoT</span>
          </button>

          {/* EmmanAI Assistant Toggle */}
          <button
            onClick={() => {
              setShowAiAssistant(!showAiAssistant);
              if (showIotDrawer) setShowIotDrawer(false);
            }}
            className={clsx(
              "px-2.5 py-1.5 rounded-xl text-[10px] font-black transition flex items-center gap-1 border",
              showAiAssistant
                ? "bg-sky-500 text-white border-sky-400 shadow-md shadow-sky-500/20"
                : "bg-slate-800 text-sky-400 border-sky-500/30 hover:bg-slate-700"
            )}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Asistente IA</span>
          </button>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/95 backdrop-blur-xl p-2 rounded-2xl border border-amber-500/30 shadow-2xl">
          <button
            onClick={() => setIsAutoTouring(!isAutoTouring)}
            className={clsx(
              "px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-md",
              isAutoTouring
                ? "bg-amber-500 text-slate-950 animate-pulse"
                : "bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30"
            )}
          >
            {isAutoTouring ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isAutoTouring ? 'Pausar Tour 3D' : 'Tour Automático 3D'}</span>
          </button>

          {isAutoTouring && (
            <div className="flex items-center gap-1 text-xs text-slate-200 pl-1 border-l border-slate-800">
              <button
                onClick={() => setTourIndex((prev) => (prev - 1 + tourPlaces.length) % tourPlaces.length)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Anterior negocio"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>
              <span className="font-mono text-[10px] text-amber-400 font-bold max-w-[130px] truncate">
                {tourIndex + 1}/{tourPlaces.length}: {tourPlaces[tourIndex]?.name}
              </span>
              <button
                onClick={() => setTourIndex((prev) => (prev + 1) % tourPlaces.length)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
                title="Siguiente negocio"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Unlimited Viewpoints Presets (Reemplazo de bocetos 2D estáticos) */}
        <div className="flex items-center gap-1 bg-slate-950/90 backdrop-blur-xl p-1.5 rounded-2xl border border-emerald-500/30 shadow-2xl text-xs">
          <span className="text-[10px] text-emerald-400 font-extrabold uppercase px-1.5 hidden md:inline">
            Perspectivas:
          </span>
          <button
            onClick={() => setCameraPreset('drone')}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-bold flex items-center gap-1 transition text-[11px]"
            title="Vista Dron Orbital 3D"
          >
            <Camera className="w-3 h-3 text-sky-400" />
            <span>Dron</span>
          </button>
          <button
            onClick={() => setCameraPreset('street')}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-bold flex items-center gap-1 transition text-[11px]"
            title="Vista Peatón (Nivel Calle)"
          >
            <Eye className="w-3 h-3 text-emerald-400" />
            <span>Peatón</span>
          </button>
          <button
            onClick={() => setCameraPreset('zenith')}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-bold flex items-center gap-1 transition text-[11px]"
            title="Vista Aérea Zenital"
          >
            <Compass className="w-3 h-3 text-amber-400" />
            <span>Zenital</span>
          </button>
          <button
            onClick={() => setCameraPreset('horizon')}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-bold flex items-center gap-1 transition text-[11px]"
            title="Vista Panorama 360° Ilimitada"
          >
            <Video className="w-3 h-3 text-indigo-400" />
            <span>Panorama</span>
          </button>
        </div>

        {/* Nanite Virtualized Geometry & Ray Tracing (RTX) Control Panel */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-xl p-1.5 rounded-2xl border border-sky-500/30 shadow-2xl text-xs">
          <button
            onClick={() => setNaniteMode(!naniteMode)}
            className={clsx(
              "px-2.5 py-1 rounded-xl font-extrabold transition flex items-center gap-1.5 border",
              naniteMode
                ? "bg-sky-500/20 text-sky-300 border-sky-400/60 shadow-lg shadow-sky-500/10"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            )}
            title="Geometría Nanite Virtualizada (Micro-Polígonos en tiempo real)"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Nanite {naniteMode ? 'ON' : 'OFF'}</span>
            {naniteMode && <span className="text-[9px] bg-sky-500/30 font-mono px-1 rounded text-sky-200">1.85M Tris</span>}
          </button>

          <button
            onClick={() => setRayTracingMode(!rayTracingMode)}
            className={clsx(
              "px-2.5 py-1 rounded-xl font-extrabold transition flex items-center gap-1.5 border",
              rayTracingMode
                ? "bg-amber-500/20 text-amber-300 border-amber-400/60 shadow-lg shadow-amber-500/10"
                : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
            )}
            title="Trazado de Rayos RTX (Sombras Suaves, Reflexiones PBR y Oclusión RTAO)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>RTX {rayTracingMode ? 'ON' : 'OFF'}</span>
            {rayTracingMode && <span className="text-[9px] bg-amber-500/30 font-mono px-1 rounded text-amber-200">RTAO</span>}
          </button>

          <button
            onClick={() => setShowNaniteMeshWire(!showNaniteMeshWire)}
            className={clsx(
              "p-1.5 rounded-xl transition border",
              showNaniteMeshWire
                ? "bg-indigo-500/30 text-indigo-300 border-indigo-400"
                : "bg-slate-900 text-slate-400 border-slate-800 hover:text-white"
            )}
            title="Ver Malla de Micro-Polígonos Nanite (Wireframe)"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Control & Search Overlay */}
      <div className="absolute top-16 left-3 sm:top-18 sm:left-4 z-10 w-72 sm:w-80 max-w-[calc(100vw-1.5rem)] p-3 sm:p-4 bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-800/80 shadow-2xl space-y-3 pointer-events-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
              Directorio 3D Los Mochis
            </span>
          </div>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center justify-center"
            title={isMinimized ? "Expandir panel" : "Minimizar panel"}
          >
            {isMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!isMinimized && (
          <>
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar modelo 3D en la ciudad..."
                className="w-full bg-slate-950/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 pl-8"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setFilterType('todos')}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition border ${
                  filterType === 'todos'
                    ? 'bg-sky-600 text-white border-sky-500'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('digitalizados')}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition border ${
                  filterType === 'digitalizados'
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-extrabold'
                    : 'bg-slate-800 text-amber-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                ✨ Digitales 3D
              </button>
            </div>

            {/* Scrolleable Location List */}
            <div className="max-h-28 sm:max-h-36 overflow-y-auto space-y-1.5 pr-1">
              {filteredPlaces.map((place) => (
                <div
                  key={place.id}
                  onClick={() => onSelectPlace(place)}
                  className={`p-2 rounded-xl text-xs cursor-pointer transition border flex items-center justify-between ${
                    selectedPlaceId === place.id
                      ? 'bg-sky-600/30 border-sky-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="truncate pr-2">
                    <span className="font-bold block truncate text-[11px]">{place.name}</span>
                    <span className="text-[9px] text-slate-400">{place.category}</span>
                  </div>
                  {place.digitalPresence ? (
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono border border-amber-500/30">
                      3D Pro
                    </span>
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                onClick={onOpenExternalMapsModal}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-sky-300 font-bold text-[10px] sm:text-[11px] rounded-xl border border-slate-700 flex items-center justify-center gap-1 transition"
              >
                <Navigation className="w-3.5 h-3.5 text-sky-400 shrink-0" /> Maps Satelital
              </button>
              <button
                onClick={() => onOpenRegisterModal('Pro')}
                className="py-2 px-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-[10px] sm:text-[11px] rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-1 transition shrink-0"
              >
                <Zap className="w-3.5 h-3.5" /> + Sumar
              </button>
            </div>
          </>
        )}
      </div>

      {/* Blender Object Inspector Sidebar (Panel de Propiedades del Objeto) */}
      {selectedPlace && (
        <div className="absolute bottom-4 right-4 z-10 w-80 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl p-4 rounded-3xl border border-slate-800 shadow-2xl text-white space-y-3 pointer-events-auto animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                Propiedades Objeto Blender
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Mesh_{selectedPlace.id}
            </span>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-white">{selectedPlace.name}</h3>
            <p className="text-xs text-slate-400">{selectedPlace.category} • {selectedPlace.address || 'Los Mochis'}</p>
          </div>

          {/* Technical Specs Grid */}
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-slate-950 p-2.5 rounded-2xl border border-slate-800">
            <div>
              <span className="text-slate-500 block">Dimensiones XYZ</span>
              <span className="text-slate-200 font-bold">14.2m x 18.5m x 12m</span>
            </div>
            <div>
              <span className="text-slate-500 block">Vistas Ficha</span>
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Eye className="w-3 h-3" /> {selectedPlace.views || 1}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Material</span>
              <span className="text-sky-300">{selectedPlace.digitalPresence ? 'Mat_Reyplace_Gold' : 'Mat_Slate_Analog'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Estatus 3D</span>
              <span className={selectedPlace.digitalPresence ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                {selectedPlace.digitalPresence ? 'Reyplace Pro' : 'Analógico'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            {onOpenBlenderStudio && (
              <button
                onClick={() => onOpenBlenderStudio(selectedPlace)}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5" /> Inspeccionar en 3D Blender
              </button>
            )}
          </div>
        </div>
      )}

      {/* Heatmap Category HUD Filter Bar & Hotspot Overlays */}
      {showHeatmap && (
        <>
          {/* Top Floating Heatmap Controls */}
          <div className="absolute top-16 left-3 sm:top-18 sm:left-4 z-20 pointer-events-auto bg-slate-950/90 backdrop-blur-xl p-3 rounded-2xl border border-rose-500/40 shadow-2xl space-y-2 max-w-sm sm:max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/40">
                  <Flame className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white flex items-center gap-1.5">
                    Mapa de Calor de Incidencias
                  </h4>
                  <p className="text-[10px] text-slate-400">Densidad de reportes ciudadanos en Los Mochis</p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">
                {filteredHotspots.reduce((acc, h) => acc + h.reportsCount, 0)} Reportes
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1 pt-1">
              {[
                { id: 'todos', label: 'Todos' },
                { id: 'vialidad', label: 'Baches / Vialidad' },
                { id: 'alumbrado', label: 'Alumbrado' },
                { id: 'agua', label: 'Fugas Agua' },
                { id: 'trafico', label: 'Tráfico' },
                { id: 'seguridad', label: 'Seguridad' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setHeatmapCategory(cat.id as any)}
                  className={clsx(
                    "px-2.5 py-1 rounded-lg text-[10px] font-bold transition border",
                    heatmapCategory === cat.id
                      ? "bg-rose-500 text-white border-rose-400 shadow-md shadow-rose-500/20"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Screen Pulsing Hotspot Overlay Rings */}
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {filteredHotspots.map((hotspot) => {
              const isSelected = selectedHotspot?.id === hotspot.id;
              
              // Color mapping by density/category
              const ringColor = 
                hotspot.category === 'vialidad' ? 'from-rose-500/60 to-amber-500/20 border-rose-500' :
                hotspot.category === 'agua' ? 'from-sky-500/60 to-cyan-500/20 border-sky-400' :
                hotspot.category === 'alumbrado' ? 'from-amber-400/60 to-yellow-500/20 border-amber-300' :
                hotspot.category === 'trafico' ? 'from-orange-500/60 to-red-500/20 border-orange-400' :
                'from-purple-500/60 to-indigo-500/20 border-purple-400';

              return (
                <div
                  key={hotspot.id}
                  style={{ top: `${hotspot.screenPos.y}%`, left: `${hotspot.screenPos.x}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer group"
                  onClick={() => setSelectedHotspot(hotspot)}
                >
                  {/* Outer Pulsing Heat Ring */}
                  <div className={clsx(
                    "w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-r border animate-ping opacity-75 transition-all",
                    ringColor
                  )} />

                  {/* Inner Heat Core */}
                  <div className={clsx(
                    "absolute inset-0 m-auto w-10 h-10 rounded-full bg-gradient-to-br border flex items-center justify-center shadow-lg transition-transform group-hover:scale-125",
                    ringColor,
                    isSelected && "ring-4 ring-white scale-125"
                  )}>
                    <Flame className="w-5 h-5 text-white animate-bounce" />
                    
                    {/* Badge Count */}
                    <span className="absolute -top-1.5 -right-1.5 bg-slate-950 text-white font-mono text-[9px] font-black px-1.5 py-0.2 rounded-full border border-rose-500 shadow">
                      {hotspot.reportsCount}
                    </span>
                  </div>

                  {/* Hover Tag */}
                  <div className="absolute top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/95 text-white text-[10px] font-bold px-2 py-1 rounded-md border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
                    {hotspot.title} ({hotspot.reportsCount} rep.)
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Hotspot Detail Card */}
          {selectedHotspot && (
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 pointer-events-auto bg-slate-950/95 backdrop-blur-2xl p-4 rounded-2xl border-2 border-rose-500 shadow-2xl w-[90%] max-w-md animate-in slide-in-from-bottom-5 duration-200">
              <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/40">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                      {selectedHotspot.categoryLabel}
                    </span>
                    <h3 className="text-sm font-black text-white mt-1">{selectedHotspot.title}</h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  ✕
                </button>
              </div>

              <div className="py-3 space-y-2 text-xs">
                <div className="flex justify-between items-center text-[11px] text-slate-400 font-mono">
                  <span>📍 {selectedHotspot.locationName}</span>
                  <span className="text-amber-400 font-bold">🔥 {selectedHotspot.reportsCount} Reportes</span>
                </div>

                <p className="text-slate-300 leading-relaxed text-xs">
                  {selectedHotspot.description}
                </p>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-300 flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block text-[10px]">Última Notificación Ciudadana:</strong>
                    <span>"{selectedHotspot.recentReport}"</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex gap-2">
                {onGoToCitizenRed && (
                  <button
                    onClick={() => {
                      onGoToCitizenRed();
                      setSelectedHotspot(null);
                    }}
                    className="flex-1 py-2 bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-xs rounded-xl transition shadow-lg shadow-rose-500/20 flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> Ir al Canal Ciudadano
                  </button>
                )}
                <button
                  onClick={() => setSelectedHotspot(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* IoT Sensors & Clima Real Floating Drawer */}
      {showIotDrawer && (
        <div className="absolute top-28 right-3 sm:top-32 sm:right-4 z-20 pointer-events-auto bg-slate-950/95 backdrop-blur-2xl p-3.5 rounded-2xl border border-amber-500/40 shadow-2xl w-80 sm:w-96 space-y-3 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/40">
                <Activity className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Sensores IoT Urbano Los Mochis</h4>
                <p className="text-[10px] text-slate-400 font-mono">Telemetría en Vivo & Clima Sincronizado</p>
              </div>
            </div>
            <button onClick={() => setShowIotDrawer(false)} className="text-slate-400 hover:text-white text-xs p-1">✕</button>
          </div>

          {/* Clima Sincronizado */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" /> Clima Sincronizado:
              </span>
              <span className="font-mono font-black text-amber-400 text-xs">33°C (Sensación 36°C)</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-400 block text-[9px]">Humedad</span>
                <span className="font-bold text-sky-400">62%</span>
              </div>
              <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-400 block text-[9px]">Viento NW</span>
                <span className="font-bold text-emerald-400">16 km/h</span>
              </div>
              <div className="bg-slate-950 p-1.5 rounded-lg border border-slate-800 text-center">
                <span className="text-slate-400 block text-[9px]">Sol Azimut</span>
                <span className="font-bold text-amber-300">254° (Sombra)</span>
              </div>
            </div>
          </div>

          {/* Tráfico en Vivo por Sensores */}
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-sky-400" /> Tráfico Radar Urbano:
              </span>
              <span className="font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 text-[9px]">
                FLUIDO (51 km/h)
              </span>
            </div>

            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between items-center bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-300">Blvd. Rosales & Centenario</span>
                <span className="font-mono text-amber-400 font-bold">48 veh/min • Verde 24s</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-300">Av. Gabriel Leyva & Valdez</span>
                <span className="font-mono text-sky-400 font-bold">36 veh/min • Verde 18s</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EmmanAI Spatial AI Assistant Floating Drawer */}
      {showAiAssistant && (
        <div className="absolute top-28 right-3 sm:top-32 sm:right-4 z-20 pointer-events-auto bg-slate-950/95 backdrop-blur-2xl p-3.5 rounded-2xl border border-sky-500/40 shadow-2xl w-80 sm:w-96 flex flex-col h-[380px] animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 shrink-0">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg border border-sky-500/40">
                <Bot className="w-4 h-4 animate-bounce" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white">Asistente IA EmmanAI Geoespacial</h4>
                <p className="text-[10px] text-sky-400 font-mono">Guía Urbano & Rutas Los Mochis</p>
              </div>
            </div>
            <button onClick={() => setShowAiAssistant(false)} className="text-slate-400 hover:text-white text-xs p-1">✕</button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto my-2 space-y-2 pr-1 custom-scrollbar text-xs">
            {aiChatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={clsx(
                  "p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed",
                  msg.sender === 'user'
                    ? "ml-auto bg-sky-600 text-white font-medium"
                    : "bg-slate-900 border border-slate-800 text-slate-200"
                )}
              >
                <div className="text-[9px] opacity-60 mb-0.5 font-mono">
                  {msg.sender === 'ai' ? '🤖 EmmanAI' : '👤 Tú'} • {msg.time}
                </div>
                {msg.text}
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="flex gap-1 overflow-x-auto pb-1 shrink-0">
            {[
              'Ruta a Plazuela 28 de Julio',
              'Clima del Cerro de la Memoria',
              'Reportes de baches en Leyva'
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  setAiInput(p);
                }}
                className="whitespace-nowrap px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-[9px] font-bold rounded-lg border border-slate-800 transition shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!aiInput.trim()) return;
              const userText = aiInput;
              setAiInput('');
              setAiChatMessages(prev => [...prev, { sender: 'user', text: userText, time: 'Ahora' }]);

              setTimeout(() => {
                let aiResponse = `Entendido. Basado en la cartografía INEGI y los sensores IoT de Los Mochis: la zona consultada presenta tráfico fluido a 48 km/h con clima de 33°C. Te recomiendo tomar Blvd. Rosales para un trayecto óptimo de 6 minutos.`;
                if (userText.toLowerCase().includes('cerro')) {
                  aiResponse = `El Cerro de la Memoria se encuentra a 285m sobre el nivel del mar (Cota INEGI). Accesible por el andador pavimentado de la Pista Perimetral. Clima ideal con brisa del noroeste a 16 km/h.`;
                } else if (userText.toLowerCase().includes('bache') || userText.toLowerCase().includes('reporte')) {
                  aiResponse = `Existen 16 reportes ciudadanos activos de vialidad registrados en el Canal Ciudadano Reyplace sobre Av. Gabriel Leyva y Valdez. Cuadrilla JAPAMA/Obras Públicas programada.`;
                }
                setAiChatMessages(prev => [...prev, { sender: 'ai', text: aiResponse, time: 'Ahora' }]);
              }, 800);
            }}
            className="flex gap-1.5 pt-1 shrink-0"
          >
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Pregunta a EmmanAI sobre la ciudad..."
              className="flex-1 bg-slate-900 border border-slate-800 text-white text-xs px-3 py-1.5 rounded-xl outline-none focus:border-sky-500 font-sans"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs rounded-xl transition flex items-center justify-center"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* Instruction Toast */}
      {!selectedPlace && (
        <div className="hidden sm:flex absolute bottom-4 right-4 z-10 bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-800 text-[10px] text-slate-400 items-center gap-2 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Arrastra para navegar • Haz clic en un edificio para ver sus propiedades Blender</span>
        </div>
      )}
    </div>
  );
}
