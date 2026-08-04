import { MapPin, Search, Map as MapIcon, Compass, Phone, Globe, ExternalLink, ShieldAlert, Building2 } from 'lucide-react';

export type PlaceType = 'plaza' | 'business' | 'clinic' | 'office' | 'smart_node' | 'culture';

export interface Place {
  id: string;
  name: string;
  type: PlaceType;
  lat: number;
  lng: number;
  heading: number;
  pitch: number;
  digitalPresence: boolean;
  description: string;
  category: string;
  smartFeature?: string;
  iotStatus?: 'active' | 'warning' | 'offline';
  wifiSpeedMbps?: number;
  featured?: boolean;
}

export interface SmartSensor {
  id: string;
  name: string;
  type: 'aqi' | 'traffic' | 'energy' | 'waste' | 'wifi';
  value: string;
  status: 'good' | 'moderate' | 'optimal';
  locationName: string;
  lat: number;
  lng: number;
}

export interface CitizenReport {
  id: string;
  title: string;
  category: 'Luminarias' | 'Baches' | 'Agua / Drenaje' | 'Brecha Digital' | 'Seguridad';
  status: 'Pendiente' | 'En Proceso' | 'Resuelto';
  date: string;
  location: string;
  lat: number;
  lng: number;
  description: string;
  upvotes: number;
}

export const MOCK_PLACES: Place[] = [
  {
    id: 'p1',
    name: 'Plazuela 27 de Septiembre',
    type: 'plaza',
    lat: 25.7909335,
    lng: -108.9953258,
    heading: 120,
    pitch: 0,
    digitalPresence: true,
    category: 'Espacio Público',
    smartFeature: 'Nodo Wi-Fi Libre 1Gbps + Totem Informativo Digital',
    iotStatus: 'active',
    wifiSpeedMbps: 850,
    featured: true,
    description: 'Corazón cultural e histórico de Los Mochis. Espacio de convivencia dotado de conectividad de alta velocidad y kiosco interactivo.',
  },
  {
    id: 'p2',
    name: 'Parque Sinaloa (Jardín Botánico)',
    type: 'plaza',
    lat: 25.7831,
    lng: -108.9995,
    heading: 270,
    pitch: 5,
    digitalPresence: true,
    category: 'Espacio Público',
    smartFeature: 'Sensor Ambiental AQI-01 + Estación de Monitoreo Solar',
    iotStatus: 'active',
    wifiSpeedMbps: 500,
    featured: true,
    description: 'Pulmón verde de la ciudad con sensores IoT de calidad del aire e inventario botánico con códigos QR educativos.',
  },
  {
    id: 'p3',
    name: 'Cerro de la Memoria',
    type: 'plaza',
    lat: 25.8055,
    lng: -108.9818,
    heading: 200,
    pitch: 0,
    digitalPresence: true,
    category: 'Espacio Público',
    smartFeature: 'Antena Hub 5G + Mirador con Cámara Smart 360°',
    iotStatus: 'active',
    wifiSpeedMbps: 1200,
    featured: true,
    description: 'Emblemático mirador equipado con cámara de alta definición para turismo virtual en tiempo real y conectividad 5G.',
  },
  {
    id: 'p4',
    name: 'Centro de Innovación y Educación (CIE)',
    type: 'culture',
    lat: 25.7918,
    lng: -108.9968,
    heading: 150,
    pitch: 2,
    digitalPresence: true,
    category: 'Educación & Tech',
    smartFeature: 'Laboratorio FabLab + Hub Digital Ciudadano',
    iotStatus: 'active',
    wifiSpeedMbps: 1000,
    featured: true,
    description: 'Recinto tecnológico y cultural dedicado a la alfabetización digital, desarrollo de talento maker e incubación de startups.',
  },
  {
    id: 'p5',
    name: 'Teatro Ingenio Los Mochis',
    type: 'culture',
    lat: 25.7885,
    lng: -108.9990,
    heading: 80,
    pitch: 0,
    digitalPresence: true,
    category: 'Cultura & Arte',
    smartFeature: 'Boletería Digital QR + Iluminación Arquitectónica IoT',
    iotStatus: 'active',
    wifiSpeedMbps: 650,
    featured: true,
    description: 'Icono arquitectónico de vanguardia con cartelera sincronizada en vivo, boletaje digital y streaming cultural.',
  },
  {
    id: 'b2',
    name: 'Café de la Ciudad',
    type: 'business',
    lat: 25.7930,
    lng: -108.9930,
    heading: 90,
    pitch: 0,
    digitalPresence: true,
    category: 'Comercio Digitalizado',
    smartFeature: 'Menú Interactivo QR + Pagos Contactless + Delivery IoT',
    iotStatus: 'active',
    wifiSpeedMbps: 300,
    featured: true,
    description: 'Ejemplo de éxito comercial digital: sistema de reservas automatizado, cobro NFC y programa de fidelidad móvil.',
  },
  {
    id: 'o1',
    name: 'Agencia TechMochis Smart HQ',
    type: 'office',
    lat: 25.7945,
    lng: -108.9915,
    heading: 270,
    pitch: 0,
    digitalPresence: true,
    category: 'Servicios de TI',
    smartFeature: 'Aceleradora de Negocios Tradicionales a Comercio Electrónico',
    iotStatus: 'active',
    wifiSpeedMbps: 1500,
    featured: true,
    description: 'Sede de aceleración tecnológica que apoya a comercios de la región a dar el salto a Google Maps y tiendas en línea.',
  },
  {
    id: 'b1',
    name: 'Ferretería "El Progreso"',
    type: 'business',
    lat: 25.7925,
    lng: -108.9922,
    heading: 180,
    pitch: 0,
    digitalPresence: false,
    category: 'Comercio Analógico',
    smartFeature: 'Candidato a Subsidio de Digitalización Comercial',
    iotStatus: 'warning',
    featured: false,
    description: 'Negocio tradicional con más de 30 años. Presenta brecha digital: requiere catálogo en línea y geolocalización verificada.',
  },
  {
    id: 'c1',
    name: 'Consultorio Médico Dr. Valdez',
    type: 'clinic',
    lat: 25.7915,
    lng: -108.9960,
    heading: 30,
    pitch: 0,
    digitalPresence: false,
    category: 'Salud Tradicional',
    smartFeature: 'Expediente Físico - En Proceso de Telemedicina',
    iotStatus: 'warning',
    featured: false,
    description: 'Atención médica general tradicional. Integración sugerida: Citas en línea y ficha médica unificada.',
  },
  {
    id: 'b3',
    name: 'Abarrotes "La Esquina"',
    type: 'business',
    lat: 25.7890,
    lng: -108.9940,
    heading: 45,
    pitch: 0,
    digitalPresence: false,
    category: 'Comercio Analógico',
    smartFeature: 'Punto de Inclusión Digital Prioritario',
    iotStatus: 'warning',
    featured: false,
    description: 'Tienda de barrio tradicional. Plan en marcha para incorporar micro-pagos digitales y terminal punto de venta.',
  }
];

export const MOCK_SENSORS: SmartSensor[] = [
  { id: 's1', name: 'Calidad del Aire (AQI)', type: 'aqi', value: '34 AQI (Excelente)', status: 'good', locationName: 'Parque Sinaloa', lat: 25.7831, lng: -108.9995 },
  { id: 's2', name: 'Tráfico Inteligente', type: 'traffic', value: '88% Fluidez (Normal)', status: 'optimal', locationName: 'Av. Leyva y Gabriel Leyva', lat: 25.7928, lng: -108.9902 },
  { id: 's3', name: 'Generación Solar Urbana', type: 'energy', value: '420 kWh (45% Red)', status: 'optimal', locationName: 'Palacio Municipal Ahome', lat: 25.7910, lng: -108.9970 },
  { id: 's4', name: 'Nodos Wi-Fi Públicos', type: 'wifi', value: '42 Puntos Activos', status: 'good', locationName: 'Zona Centro Histórico', lat: 25.7909, lng: -108.9953 },
];

export const INITIAL_CITIZEN_REPORTS: CitizenReport[] = [
  {
    id: 'r1',
    title: 'Falta iluminación inteligente en calle degollado',
    category: 'Luminarias',
    status: 'En Proceso',
    date: 'Hace 2 horas',
    location: 'Degollado esquina con Allende',
    lat: 25.7912,
    lng: -108.9935,
    description: 'Se solicita reemplazo de luminaria tradicional por LED IoT con sensor de movimiento.',
    upvotes: 14,
  },
  {
    id: 'r2',
    title: 'Solicitud de digitalización para Mercado Zona 03',
    category: 'Brecha Digital',
    status: 'Pendiente',
    date: 'Ayer',
    location: 'Mercado Independencia',
    lat: 25.7895,
    lng: -108.9928,
    description: 'Locatarios solicitan capacitación en cobro QR y alta masiva en Google Maps.',
    upvotes: 28,
  },
];

