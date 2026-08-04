import { ColumnLayer, ArcLayer } from '@deck.gl/layers';
import { HexagonLayer } from '@deck.gl/aggregation-layers';
import { Place } from '../data';

export interface WebGL3DSettings {
  showColumns: boolean;
  showArcs: boolean;
  showHexagons: boolean;
  showDigitalTwins?: boolean;
  columnHeightScale: number;
  arcWidth: number;
}

export const INITIAL_3D_COLUMNS = [
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

export function getDeckGLLayers(
  enabled: boolean, 
  settings: WebGL3DSettings, 
  places: Place[],
  columnsData: any[] = INITIAL_3D_COLUMNS
) {
  if (!enabled) return [];

  const layers = [];

  if (settings.showColumns) {
    layers.push(
      new ColumnLayer({
        id: 'column-3d-layer',
        data: columnsData,
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

  if (settings.showDigitalTwins !== false) {
    const highPresencePlaces = places.filter(p => p.digitalPresence);
    const lowPresencePlaces = places.filter(p => !p.digitalPresence);

    layers.push(
      new ColumnLayer({
        id: 'digital-twin-high-presence',
        data: highPresencePlaces,
        diskResolution: 4,
        radius: 40, 
        extruded: true,
        pickable: true,
        elevationScale: 1,
        getPosition: (d: any) => [d.lng, d.lat],
        getFillColor: [99, 102, 241, 220],
        getLineColor: [255, 255, 255, 255],
        getElevation: (d: any) => 60,
        material: {
          ambient: 0.8,
          diffuse: 1.0,
          shininess: 64,
          specularColor: [255, 255, 255],
        },
      }),
      new ColumnLayer({
        id: 'digital-twin-low-presence',
        data: lowPresencePlaces,
        diskResolution: 4,
        radius: 40,
        extruded: true,
        wireframe: true,
        pickable: true,
        elevationScale: 1,
        getPosition: (d: any) => [d.lng, d.lat],
        getFillColor: [30, 41, 59, 100],
        getLineColor: [148, 163, 184, 100],
        getElevation: (d: any) => 30,
      })
    );
  }

  return layers;
}
