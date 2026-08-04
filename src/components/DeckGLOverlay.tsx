import React, { useEffect, useMemo } from 'react';
import { useMap } from '@vis.gl/react-google-maps';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { ColumnLayer, ArcLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';

export interface WebGL3DSettings {
  showColumns: boolean;
  showArcs: boolean;
  showHexagons: boolean;
  columnHeightScale: number;
  arcWidth: number;
}

interface DeckGLOverlayProps {
  enabled: boolean;
  settings: WebGL3DSettings;
}

// 3D Pollution & Traffic Sensor Points around Los Mochis
const MOCK_3D_COLUMNS = [
  { id: 'c1', name: 'Centro Histórico', coordinates: [-108.9953, 25.7909], aqi: 34, trafficDensity: 85, color: [16, 185, 129] },
  { id: 'c2', name: 'Parque Sinaloa', coordinates: [-108.9995, 25.7831], aqi: 18, trafficDensity: 40, color: [52, 211, 153] },
  { id: 'c3', name: 'Cerro de la Memoria', coordinates: [-108.9818, 25.8055], aqi: 22, trafficDensity: 30, color: [99, 102, 241] },
  { id: 'c4', name: 'Blvd. Rosales & Jiquilpan', coordinates: [-108.9980, 25.7980], aqi: 58, trafficDensity: 92, color: [245, 158, 11] },
  { id: 'c5', name: 'Gabriel Leyva & Degollado', coordinates: [-108.9910, 25.7920], aqi: 48, trafficDensity: 88, color: [239, 68, 68] },
  { id: 'c6', name: 'Plaza Paseo Los Mochis', coordinates: [-108.9850, 25.7860], aqi: 42, trafficDensity: 78, color: [168, 85, 247] },
  { id: 'c7', name: 'Teatro Ingenio Area', coordinates: [-108.9990, 25.7885], aqi: 26, trafficDensity: 55, color: [16, 185, 129] },
  { id: 'c8', name: 'Zona Industrial / Centenario', coordinates: [-108.9750, 25.7780], aqi: 65, trafficDensity: 95, color: [239, 68, 68] },
  { id: 'c9', name: 'Blvd. Pedro Anaya Norte', coordinates: [-108.9920, 25.8120], aqi: 30, trafficDensity: 60, color: [14, 165, 233] },
  { id: 'c10', name: 'Salida a Topolobampo', coordinates: [-108.9880, 25.7680], aqi: 52, trafficDensity: 82, color: [245, 158, 11] },
];

// 3D Motion Arcs representing smart city data transfers / transit routes
const MOCK_3D_ARCS = [
  { id: 'a1', source: [-108.9953, 25.7909], target: [-108.9995, 25.7831], value: 100, sourceColor: [99, 102, 241], targetColor: [16, 185, 129] },
  { id: 'a2', source: [-108.9953, 25.7909], target: [-108.9818, 25.8055], value: 80, sourceColor: [99, 102, 241], targetColor: [168, 85, 247] },
  { id: 'a3', source: [-108.9818, 25.8055], target: [-108.9850, 25.7860], value: 60, sourceColor: [168, 85, 247], targetColor: [245, 158, 11] },
  { id: 'a4', source: [-108.9980, 25.7980], target: [-108.9910, 25.7920], value: 90, sourceColor: [245, 158, 11], targetColor: [239, 68, 68] },
  { id: 'a5', source: [-108.9990, 25.7885], target: [-108.9953, 25.7909], value: 75, sourceColor: [16, 185, 129], targetColor: [99, 102, 241] },
  { id: 'a6', source: [-108.9920, 25.8120], target: [-108.9818, 25.8055], value: 50, sourceColor: [14, 165, 233], targetColor: [168, 85, 247] },
];

// Density distribution for 3D Hexagon Aggregation Layer
const MOCK_DENSITY_POINTS = Array.from({ length: 120 }, (_, i) => {
  const baseLat = 25.7910;
  const baseLng = -108.9910;
  const rLat = (Math.random() - 0.5) * 0.04;
  const rLng = (Math.random() - 0.5) * 0.04;
  return {
    coordinates: [baseLng + rLng, baseLat + rLat],
    weight: Math.floor(Math.random() * 10) + 1,
  };
});

export const DeckGLOverlay: React.FC<DeckGLOverlayProps> = ({ enabled, settings }) => {
  const map = useMap();

  const overlay = useMemo(() => {
    if (!map) return null;
    return new GoogleMapsOverlay({
      layers: [],
    });
  }, [map]);

  useEffect(() => {
    if (!map || !overlay || typeof window === 'undefined' || !window.google || !window.google.maps) return;
    
    let isMounted = true;

    const applyMap = () => {
      if (!isMounted) return;
      if (!map.getProjection()) {
        setTimeout(applyMap, 50);
        return;
      }
      
      try {
        if (enabled) {
          overlay.setMap(map);
        } else {
          overlay.setMap(null);
        }
      } catch (err) {
        console.warn('DeckGLOverlay setMap gracefully handled:', err);
      }
    };

    applyMap();

    return () => {
      isMounted = false;
      try {
        if (overlay) overlay.setMap(null);
      } catch (err) {
        // Safe cleanup
      }
    };
  }, [map, enabled, overlay]);

  useEffect(() => {
    if (!enabled || !overlay || !map) {
      try {
        if (overlay) overlay.setProps({ layers: [] });
      } catch (err) {}
      return;
    }

    const layers = [];

    // 1. 3D Column Layer (AQI / Traffic Extrusions)
    if (settings.showColumns) {
      layers.push(
        new ColumnLayer({
          id: 'column-3d-layer',
          data: MOCK_3D_COLUMNS,
          diskResolution: 12,
          radius: 45,
          extruded: true,
          pickable: true,
          elevationScale: settings.columnHeightScale,
          getPosition: (d: any) => d.coordinates,
          getFillColor: (d: any) => d.color,
          getElevation: (d: any) => d.aqi * 12 + d.trafficDensity * 8,
          material: {
            ambient: 0.65,
            diffuse: 0.8,
            shininess: 32,
            specularColor: [255, 255, 255],
          },
        })
      );
    }

    // 2. 3D Motion Arcs Layer
    if (settings.showArcs) {
      layers.push(
        new ArcLayer({
          id: 'arc-3d-layer',
          data: MOCK_3D_ARCS,
          pickable: true,
          getWidth: settings.arcWidth,
          getSourcePosition: (d: any) => d.source,
          getTargetPosition: (d: any) => d.target,
          getSourceColor: (d: any) => d.sourceColor,
          getTargetColor: (d: any) => d.targetColor,
        })
      );
    }

    // 3. 3D Extruded Hexagon Heatmap Aggregation Layer
    if (settings.showHexagons) {
      layers.push(
        new HexagonLayer({
          id: 'hexagon-3d-layer',
          data: MOCK_DENSITY_POINTS,
          pickable: true,
          extruded: true,
          radius: 100,
          elevationScale: 15,
          getPosition: (d: any) => d.coordinates,
          colorRange: [
            [1, 152, 189],
            [73, 227, 206],
            [216, 254, 181],
            [254, 237, 177],
            [254, 173, 84],
            [209, 55, 78],
          ],
        })
      );
    }

    let isMounted = true;
    
    const applyProps = () => {
      if (!isMounted) return;
      if (!map.getProjection()) {
        setTimeout(applyProps, 50);
        return;
      }
      
      try {
        if (overlay) overlay.setProps({ layers });
      } catch (err) {
        console.warn('DeckGLOverlay setProps gracefully handled:', err);
      }
    };
    
    applyProps();
    
    return () => {
      isMounted = false;
    };
  }, [enabled, settings, overlay, map]);

  return null;
};
