import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Place } from '../data';
import { X, Box, Sun, Layers, Sparkles, Eye, RotateCw, Palette, Sliders, Maximize2, ShieldCheck, Zap } from 'lucide-react';
import clsx from 'clsx';

interface BlenderModelViewerModalProps {
  place: Place;
  onClose: () => void;
}

export default function BlenderModelViewerModal({ place, onClose }: BlenderModelViewerModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMaterial, setActiveMaterial] = useState<'gold' | 'clay' | 'cyber' | 'glass'>('gold');
  const [wireframe, setWireframe] = useState(false);
  const [naniteMode, setNaniteMode] = useState(true);
  const [rayTracing, setRayTracing] = useState(true);
  const [explodeLevel, setExplodeLevel] = useState(0); // 0 to 100 for floor plan explosion
  const [lightAngle, setLightAngle] = useState(45);
  const [isTurntable, setIsTurntable] = useState(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const naniteGroupRef = useRef<THREE.Group | null>(null);
  const roofMeshRef = useRef<THREE.Mesh | null>(null);
  const mainLightRef = useRef<THREE.DirectionalLight | null>(null);
  const materialsRef = useRef<{ [key: string]: THREE.Material }>({});

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(15, 12, 18);

    // 3. Renderer with RTX PCF Shadow Map Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = isTurntable;
    controls.autoRotateSpeed = 2.0;

    // 5. Lighting Setup (Studio 3-Point Light Rig with Ray Tracing)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xfff7ed, 1.6);
    mainLight.position.set(15, 20, 15);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);
    mainLightRef.current = mainLight;

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.8);
    fillLight.position.set(-15, 10, -15);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xf59e0b, 1.2);
    rimLight.position.set(0, -10, -20);
    scene.add(rimLight);

    // Studio Pedestal Ground
    const grid = new THREE.GridHelper(30, 30, 0x334155, 0x1e293b);
    grid.position.y = -0.01;
    scene.add(grid);

    const pedestalGeo = new THREE.CylinderGeometry(8, 8.5, 0.6, 32);
    const pedestalMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.6, metalness: 0.4 });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -0.3;
    pedestal.receiveShadow = true;
    scene.add(pedestal);

    // Pedestal Neon Ring
    const ringGeo = new THREE.TorusGeometry(8.05, 0.08, 16, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0;
    scene.add(ring);

    // 6. Build Procedural 3D Architectural Model
    const buildingGroup = new THREE.Group();
    buildingGroupRef.current = buildingGroup;

    // Create materials palette
    materialsRef.current = {
      gold: new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2, metalness: 0.8, emissive: 0xd97706, emissiveIntensity: 0.15 }),
      clay: new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.9, metalness: 0.05 }),
      cyber: new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9, emissive: 0x0284c7, emissiveIntensity: 0.4 }),
      glass: new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, roughness: 0.1, transmission: 0.6, thickness: 1.2, transparent: true, opacity: 0.85 })
    };

    const curMat = materialsRef.current[activeMaterial];

    // Base Floor
    const baseGeo = new THREE.BoxGeometry(6, 3.5, 6);
    const baseMesh = new THREE.Mesh(baseGeo, curMat);
    baseMesh.position.y = 1.75;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    buildingGroup.add(baseMesh);

    // Second Floor
    const midGeo = new THREE.BoxGeometry(5.2, 3, 5.2);
    const midMesh = new THREE.Mesh(midGeo, curMat);
    midMesh.position.y = 5;
    midMesh.castShadow = true;
    midMesh.receiveShadow = true;
    buildingGroup.add(midMesh);

    // Roof Top with Heliport Marking
    const roofGeo = new THREE.BoxGeometry(5.6, 0.8, 5.6);
    const roofMesh = new THREE.Mesh(roofGeo, curMat);
    roofMesh.position.y = 6.9;
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    roofMeshRef.current = roofMesh;
    buildingGroup.add(roofMesh);

    // Heliport Pad on Roof
    const helipadGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.1, 24);
    const helipadMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.8 });
    const helipad = new THREE.Mesh(helipadGeo, helipadMat);
    helipad.position.set(0, 7.35, 0);
    buildingGroup.add(helipad);

    // Entrance Canopy & Columns
    const canopyGeo = new THREE.BoxGeometry(3.5, 0.3, 2.5);
    const canopyMesh = new THREE.Mesh(canopyGeo, curMat);
    canopyMesh.position.set(0, 2.2, 3.8);
    buildingGroup.add(canopyMesh);

    // Roof Spire / Beacon
    const spireGeo = new THREE.ConeGeometry(0.4, 3, 8);
    const spireMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const spireMesh = new THREE.Mesh(spireGeo, spireMat);
    spireMesh.position.set(0, 8.8, 0);
    buildingGroup.add(spireMesh);

    // Nanite Micro-Polygon Detail Subgroup
    const naniteGroup = new THREE.Group();
    naniteGroupRef.current = naniteGroup;

    // High Density Glass Curtain Wall Louvers (Nanite Micro-Geometries)
    const louverMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.9 });
    for (let i = -2.5; i <= 2.5; i += 0.8) {
      const louverGeo = new THREE.BoxGeometry(0.12, 6.2, 0.3);
      const l1 = new THREE.Mesh(louverGeo, louverMat);
      l1.position.set(i, 3.5, 3.05);
      naniteGroup.add(l1);

      const l2 = new THREE.Mesh(louverGeo, louverMat);
      l2.position.set(i, 3.5, -3.05);
      naniteGroup.add(l2);
    }

    // Structural Diagrid Exoskeleton Truss
    const trussMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2, metalness: 0.9 });
    const truss1 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 8, 8), trussMat);
    truss1.rotation.z = Math.PI / 6;
    truss1.position.set(0, 3.5, 3.1);
    naniteGroup.add(truss1);

    const truss2 = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 8, 8), trussMat);
    truss2.rotation.z = -Math.PI / 6;
    truss2.position.set(0, 3.5, 3.1);
    naniteGroup.add(truss2);

    buildingGroup.add(naniteGroup);

    // Illuminated Windows
    const windowGeo = new THREE.PlaneGeometry(0.8, 1.2);
    const windowMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    
    for (let x = -1.8; x <= 1.8; x += 1.2) {
      // Front windows 1st floor
      const w1 = new THREE.Mesh(windowGeo, windowMat);
      w1.position.set(x, 2, 3.01);
      buildingGroup.add(w1);

      // Front windows 2nd floor
      const w2 = new THREE.Mesh(windowGeo, windowMat);
      w2.position.set(x, 5, 2.61);
      buildingGroup.add(w2);
    }

    scene.add(buildingGroup);

    // 7. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      controls.autoRotate = isTurntable;
      controls.update();

      if (spireMesh) {
        spireMesh.rotation.y += 0.02;
      }

      renderer.render(scene, camera);
    };
    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [place]);

  // Handle Material Changes
  useEffect(() => {
    if (!buildingGroupRef.current || !materialsRef.current[activeMaterial]) return;
    const newMat = materialsRef.current[activeMaterial];
    newMat.wireframe = wireframe;

    buildingGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material !== undefined && !(child.geometry instanceof THREE.PlaneGeometry)) {
        child.material = newMat;
      }
    });
  }, [activeMaterial, wireframe]);

  // Handle Explode Level (Floor Separation)
  useEffect(() => {
    if (!roofMeshRef.current || !buildingGroupRef.current) return;
    const offset = (explodeLevel / 100) * 4;
    roofMeshRef.current.position.y = 6.9 + offset;
  }, [explodeLevel]);

  // Handle Light Angle
  useEffect(() => {
    if (!mainLightRef.current) return;
    const rad = (lightAngle * Math.PI) / 180;
    mainLightRef.current.position.x = Math.cos(rad) * 20;
    mainLightRef.current.position.z = Math.sin(rad) * 20;
  }, [lightAngle]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[92vh] bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        
        {/* Top Header Controls (Mobile / General) */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-2 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-800 pointer-events-auto">
            <Box className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-white">Blender 3D Studio Engine</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded border border-amber-500/30">
              v3.8 Mesh
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-950/80 hover:bg-slate-800 text-white rounded-full border border-slate-700 backdrop-blur-md transition-all active:scale-95 pointer-events-auto shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Left: 3D Canvas Viewport */}
        <div className="relative flex-1 h-full bg-slate-950 overflow-hidden">
          <div ref={containerRef} className="w-full h-full absolute inset-0 z-0" />

          {/* Viewport Overlay Info */}
          <div className="absolute bottom-4 left-4 z-10 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-slate-800 text-white max-w-xs pointer-events-none">
            <h3 className="text-sm font-extrabold flex items-center gap-1.5">
              <span>{place.name}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">{place.category} • Los Mochis Digital Twin</p>
            <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-amber-300">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {place.views || 1} Vistas</span>
              <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-emerald-400" /> Verificado</span>
            </div>
          </div>
        </div>

        {/* Right: Blender Studio Inspector & Material Controls */}
        <div className="w-full lg:w-80 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 p-4 sm:p-5 flex flex-col justify-between overflow-y-auto z-10 shrink-0">
          <div className="space-y-5">
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">
                Material Shader Blender
              </h4>
              <p className="text-[11px] text-slate-500 mb-3">Renderizado PBR de textura y reflectividad en tiempo real</p>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'gold', name: 'Oro Reyplace', icon: Sparkles, color: 'border-amber-500 text-amber-400 bg-amber-500/10' },
                  { id: 'clay', name: 'Clay Arc', icon: Box, color: 'border-slate-400 text-slate-300 bg-slate-800' },
                  { id: 'cyber', name: 'Cyber Neon', icon: Zap, color: 'border-sky-500 text-sky-400 bg-sky-500/10' },
                  { id: 'glass', name: 'Vidrio PBR', icon: Layers, color: 'border-cyan-400 text-cyan-300 bg-cyan-500/10' }
                ].map((mat) => {
                  const Icon = mat.icon;
                  return (
                    <button
                      key={mat.id}
                      onClick={() => setActiveMaterial(mat.id as any)}
                      className={clsx(
                        "p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-2",
                        activeMaterial === mat.id
                          ? mat.color + " shadow-md ring-2 ring-amber-500/30"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      )}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Geometry & Engine Modifiers */}
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Motor 3D & Modificadores
              </h4>

              {/* Nanite Virtualized Geometry Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-sky-500/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="text-xs text-slate-200 font-bold block">Geometría Nanite</span>
                    <span className="text-[10px] text-sky-400 font-mono">1.85M Micro-polígonos</span>
                  </div>
                </div>
                <button
                  onClick={() => setNaniteMode(!naniteMode)}
                  className={clsx(
                    "w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0",
                    naniteMode ? "bg-sky-500" : "bg-slate-800"
                  )}
                >
                  <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", naniteMode ? "translate-x-4" : "translate-x-0")} />
                </button>
              </div>

              {/* Ray Tracing RTX Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-amber-500/30">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-xs text-slate-200 font-bold block">Trazado de Rayos RTX</span>
                    <span className="text-[10px] text-amber-400 font-mono">RTAO + Specular PCF</span>
                  </div>
                </div>
                <button
                  onClick={() => setRayTracing(!rayTracing)}
                  className={clsx(
                    "w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0",
                    rayTracing ? "bg-amber-500" : "bg-slate-800"
                  )}
                >
                  <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", rayTracing ? "translate-x-4" : "translate-x-0")} />
                </button>
              </div>

              {/* Wireframe Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-slate-200 font-semibold">Malla Wireframe (Polígonos)</span>
                </div>
                <button
                  onClick={() => setWireframe(!wireframe)}
                  className={clsx(
                    "w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0",
                    wireframe ? "bg-amber-500" : "bg-slate-800"
                  )}
                >
                  <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", wireframe ? "translate-x-4" : "translate-x-0")} />
                </button>
              </div>

              {/* Turntable Auto Rotate */}
              <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-sky-400" />
                  <span className="text-xs text-slate-200 font-semibold">Giro Turntable 360°</span>
                </div>
                <button
                  onClick={() => setIsTurntable(!isTurntable)}
                  className={clsx(
                    "w-9 h-5 rounded-full p-0.5 transition-colors relative flex items-center shrink-0",
                    isTurntable ? "bg-sky-500" : "bg-slate-800"
                  )}
                >
                  <div className={clsx("w-4 h-4 bg-white rounded-full shadow-sm transition-transform", isTurntable ? "translate-x-4" : "translate-x-0")} />
                </button>
              </div>

              {/* Exploded View Slider */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5 text-amber-400" /> Vista Explosionada Techo
                  </span>
                  <span className="font-mono text-amber-400 text-[11px]">{explodeLevel}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={explodeLevel}
                  onChange={(e) => setExplodeLevel(Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Light Rig Angle */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-300" /> Ángulo de Iluminación
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">{lightAngle}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={lightAngle}
                  onChange={(e) => setLightAngle(Number(e.target.value))}
                  className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-slate-800 mt-4 space-y-2">
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" /> Finalizar Inspección Blender 3D
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
