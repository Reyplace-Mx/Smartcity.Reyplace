import { MapPin, Search, Map as MapIcon, Compass, Phone, Globe, ExternalLink, ShieldAlert, Building2 } from 'lucide-react';

export type PlaceType = 'plaza' | 'business' | 'clinic' | 'office';

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
    description: 'Corazón cultural de Los Mochis. Espacio de convivencia, arte y gastronomía.',
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
    description: 'Pulmón verde de la ciudad con una inmensa variedad de flora internacional.',
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
    description: 'El mirador principal de la ciudad con vistas panorámicas increíbles.',
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
    category: 'Comercio Local',
    description: 'Negocio tradicional sin sitio web, menú digital ni redes sociales optimizadas.',
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
    category: 'Comercio Local',
    description: 'Cafetería moderna con reservas en línea, menú QR y presencia activa en Maps.',
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
    category: 'Salud',
    description: 'Atención médica general. Carece de agenda digital y ficha de Google My Business.',
  },
  {
    id: 'o1',
    name: 'Agencia TechMochis',
    type: 'office',
    lat: 25.7945,
    lng: -108.9915,
    heading: 270,
    pitch: 0,
    digitalPresence: true,
    category: 'Servicios',
    description: 'Agencia de software y digitalización con alto alcance y branding optimizado.',
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
    category: 'Comercio Local',
    description: 'Tienda de conveniencia histórica que necesita transformación digital para sobrevivir.',
  }
];
