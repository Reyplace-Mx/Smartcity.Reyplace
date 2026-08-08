import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Activity, RefreshCw, Zap, Sliders, Play, Pause } from 'lucide-react';
import clsx from 'clsx';

interface TrafficRoute {
  id: string;
  name: string;
  density: 'low' | 'moderate' | 'high';
  flowSpeed: number; // 1 to 5
  points: [number, number][]; // Screen percentage coordinates
}

interface D3TrafficFlowOverlayProps {
  isVisible: boolean;
  trafficDensityMultiplier?: number;
}

const DEFAULT_ROUTES: TrafficRoute[] = [
  {
    id: 'r1',
    name: 'Av. Gabriel Leyva & Degollado',
    density: 'high',
    flowSpeed: 1.8,
    points: [[10, 30], [25, 45], [50, 50], [75, 55], [90, 70]],
  },
  {
    id: 'r2',
    name: 'Blvd. Rosendo G. Castro',
    density: 'moderate',
    flowSpeed: 3.2,
    points: [[5, 20], [30, 25], [60, 22], [85, 28]],
  },
  {
    id: 'r3',
    name: 'Blvd. Antonio Rosales & Jiquilpan',
    density: 'low',
    flowSpeed: 4.5,
    points: [[20, 80], [40, 60], [60, 40], [80, 20]],
  },
  {
    id: 'r4',
    name: 'Av. Centenario Corredor Industrial',
    density: 'moderate',
    flowSpeed: 2.8,
    points: [[15, 85], [35, 75], [65, 70], [92, 85]],
  },
];

export const D3TrafficFlowOverlay: React.FC<D3TrafficFlowOverlayProps> = ({ 
  isVisible,
  trafficDensityMultiplier = 1.0 
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState<TrafficRoute | null>(null);

  useEffect(() => {
    if (!isVisible || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = svgRef.current.clientWidth || 800;
    const height = svgRef.current.clientHeight || 600;

    // Gradient Definitions for Traffic Density
    const defs = svg.append('defs');

    // High Density Coral Red
    const gradHigh = defs.append('linearGradient').attr('id', 'flow-high').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');
    gradHigh.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0.9);
    gradHigh.append('stop').attr('offset', '100%').attr('stop-color', '#fb7185').attr('stop-opacity', 0.9);

    // Moderate Density Amber
    const gradMod = defs.append('linearGradient').attr('id', 'flow-moderate').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');
    gradMod.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0.85);
    gradMod.append('stop').attr('offset', '100%').attr('stop-color', '#fbbf24').attr('stop-opacity', 0.85);

    // Low Density Emerald Green
    const gradLow = defs.append('linearGradient').attr('id', 'flow-low').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');
    gradLow.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.9);
    gradLow.append('stop').attr('offset', '100%').attr('stop-color', '#34d399').attr('stop-opacity', 0.9);

    // Glow Filter
    const filter = defs.append('filter').attr('id', 'glow-traffic');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    const lineGenerator = d3.line<[number, number]>()
      .x(d => (d[0] / 100) * width)
      .y(d => (d[1] / 100) * height)
      .curve(d3.curveBasis);

    // Render Routes
    DEFAULT_ROUTES.forEach((route) => {
      const pathData = lineGenerator(route.points);
      if (!pathData) return;

      const gradId = route.density === 'high' ? 'url(#flow-high)' : route.density === 'moderate' ? 'url(#flow-moderate)' : 'url(#flow-low)';
      const strokeWidth = route.density === 'high' ? 6 : route.density === 'moderate' ? 4.5 : 3.5;

      // Outer Glowing Streamline
      svg.append('path')
        .attr('d', pathData)
        .attr('fill', 'none')
        .attr('stroke', gradId)
        .attr('stroke-width', strokeWidth + 4)
        .attr('opacity', 0.3)
        .attr('filter', 'url(#glow-traffic)');

      // Animated Vector Dash Path
      const mainPath = svg.append('path')
        .attr('d', pathData)
        .attr('fill', 'none')
        .attr('stroke', gradId)
        .attr('stroke-width', strokeWidth)
        .attr('stroke-linecap', 'round')
        .attr('stroke-dasharray', route.density === 'high' ? '12, 8' : '18, 12')
        .style('cursor', 'pointer')
        .on('click', () => setSelectedRoute(route));

      // D3 Animated Particle Flow along route
      if (isPlaying) {
        let offset = 0;
        const animate = () => {
          offset -= route.flowSpeed * trafficDensityMultiplier;
          mainPath.attr('stroke-dashoffset', offset);
        };
        d3.timer(animate);
      }
    });

  }, [isVisible, isPlaying, trafficDensityMultiplier]);

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
      {/* SVG Canvas Driven by D3 */}
      <svg
        ref={svgRef}
        className="w-full h-full pointer-events-auto"
      />

      {/* Floating Traffic Flow HUD Control Panel */}
      <div className="absolute top-16 sm:top-20 right-2 sm:right-6 pointer-events-auto bg-slate-950/90 backdrop-blur-md border border-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-2xl text-xs text-white max-w-[220px] sm:max-w-xs space-y-2">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="font-bold text-xs">Flujos de Tráfico D3.js</span>
          </div>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors"
            title={isPlaying ? "Pausar Vectores" : "Reanudar Vectores"}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="space-y-1.5 text-[10px] text-slate-300">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500" />
              Congestión Alta
            </span>
            <span className="font-mono font-bold text-rose-400">1.8 km/h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500" />
              Densidad Moderada
            </span>
            <span className="font-mono font-bold text-amber-400">3.2 km/h</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
              Fluidez Libre
            </span>
            <span className="font-mono font-bold text-emerald-400">4.5 km/h</span>
          </div>
        </div>

        {selectedRoute && (
          <div className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-[10px] space-y-1 mt-2">
            <span className="font-bold text-indigo-300 block">{selectedRoute.name}</span>
            <p className="text-slate-400">
              Estado: <span className="font-bold text-white capitalize">{selectedRoute.density}</span> • Velocidad vectorial D3: {selectedRoute.flowSpeed}x
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
