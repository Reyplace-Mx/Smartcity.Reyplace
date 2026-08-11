import { MapPin, Search, Map as MapIcon, Compass, Phone, Globe, ExternalLink, ShieldAlert, Building2 } from 'lucide-react';

export type PlaceType = 'plaza' | 'business' | 'clinic' | 'office';

export interface Review {
  id: string;
  author: string;
  rating: number;
  text: string;
}

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
  address?: string;
  phone?: string;
  website?: string;
  schedule?: string;
  images?: string[];
  views?: number;
  reviews: Review[];
}

export interface CitizenReport {
  id: string;
  citizenName: string;
  category: 'bacheo' | 'alumbrado' | 'agua' | 'basura' | 'parques' | 'seguridad';
  categoryLabel: string;
  location: string;
  description: string;
  date: string;
  status: 'recibido' | 'en_proceso' | 'resuelto';
  statusLabel: string;
  trackingId: string;
}

export const INITIAL_CITIZEN_REPORTS: CitizenReport[] = [
  {
    id: 'rep-1',
    citizenName: 'Carlos Mendívil',
    category: 'bacheo',
    categoryLabel: 'Bacheo / Vialidad',
    location: 'Av. Gabriel Leyva & Valdez, Col. Centro',
    description: 'Bache profundo sobre el carril derecho afectando el tránsito vehicular.',
    date: 'Hace 2 horas',
    status: 'en_proceso',
    statusLabel: 'En Proceso',
    trackingId: 'LM-2026-4891'
  },
  {
    id: 'rep-2',
    citizenName: 'María de la Luz S.',
    category: 'alumbrado',
    categoryLabel: 'Alumbrado Público',
    location: 'Blvd. Rosales frente a Parque Sinaloa',
    description: 'Luminarias apagadas en la acera poniente, área muy oscura por las noches.',
    date: 'Ayer, 9:30 PM',
    status: 'resuelto',
    statusLabel: 'Resuelto',
    trackingId: 'LM-2026-4850'
  },
  {
    id: 'rep-3',
    citizenName: 'Jesús Antonio R.',
    category: 'agua',
    categoryLabel: 'Agua y Drenaje',
    location: 'Calle Hidalgo #450 Ote.',
    description: 'Fuga de agua limpia en banqueta principal desperdiciando flujo continuo.',
    date: 'Hace 4 horas',
    status: 'recibido',
    statusLabel: 'Recibido',
    trackingId: 'LM-2026-4902'
  }
];

export interface NewsItem {
  id: string;
  title: string;
  date: string;
  content: string;
  type: 'alert' | 'event' | 'news';
}

export interface Course {
  id: string;
  title: string;
  instructor: string;
  level: string;
  duration: string;
  image: string;
}

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    title: 'Cierre de vialidades por maratón',
    date: '2026-08-15',
    content: 'Se informa a la ciudadanía que las calles del centro estarán cerradas este domingo de 6:00 AM a 1:00 PM.',
    type: 'alert'
  },
  {
    id: 'n2',
    title: 'Feria de Emprendimiento',
    date: '2026-08-20',
    content: 'Únete a la feria local para digitalizar tu negocio con apoyo de expertos.',
    type: 'event'
  },
  {
    id: 'n3',
    title: 'Nueva plataforma de pago de agua',
    date: '2026-08-10',
    content: 'Ya puedes pagar tus servicios municipales en línea desde la nueva app del municipio.',
    type: 'news'
  }
];

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Uso de WhatsApp y Videollamadas',
    instructor: 'María G.',
    level: 'Básico',
    duration: '2 semanas',
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'c2',
    title: 'Banca en Línea Segura',
    instructor: 'Roberto V.',
    level: 'Intermedio',
    duration: '3 semanas',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=300&auto=format&fit=crop'
  },
  {
    id: 'c3',
    title: 'Redes Sociales para Abuelos',
    instructor: 'Ana T.',
    level: 'Básico',
    duration: '2 semanas',
    image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=300&auto=format&fit=crop'
  }
];

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
    address: 'Álvaro Obregón s/n, Col. Centro, Los Mochis, Sin.',
    phone: '668-812-0044',
    schedule: 'Lunes a Domingo • Abierto 24 Horas',
    website: 'https://losmochis.gob.mx/turismo',
    images: [
      'https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Corazón cultural de Los Mochis. Espacio de convivencia, arte y gastronomía.',
    reviews: [
      { id: 'r1', author: 'Juan P.', rating: 5, text: 'Excelente lugar para pasear en familia.' },
      { id: 'r2', author: 'Ana M.', rating: 4, text: 'Muy bonito, ideal para los fines de semana.' }
    ]
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
    address: 'Blvd. Antonio Rosales & Gabriel Leyva, Los Mochis',
    phone: '668-818-1000',
    schedule: 'Martes a Domingo • 6:00 AM - 8:00 PM',
    website: 'https://jardinbotanico.org.mx',
    images: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Pulmón verde de la ciudad con una inmensa variedad de flora internacional y andadores.',
    reviews: [
      { id: 'r3', author: 'Carlos R.', rating: 5, text: 'Hermosos jardines y senderos tranquilos.' }
    ]
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
    address: 'Acceso por Av. Degollado Nte., Los Mochis',
    phone: '668-816-4020',
    schedule: 'Abierto todos los días • Mirador de la Ciudad',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'El mirador principal de la ciudad con la estatua de la Virgen del Valle y vistas panorámicas increíbles.',
    reviews: [
      { id: 'r4', author: 'Luis F.', rating: 5, text: 'La mejor vista panorámica de la ciudad.' },
      { id: 'r5', author: 'Diana C.', rating: 4, text: 'Ideal para hacer ejercicio por las mañanas.' }
    ]
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
    address: 'Calle Guillermo Prieto #210, Col. Centro, Los Mochis',
    phone: '668-812-3490',
    schedule: 'Lunes a Sábado • 8:00 AM - 6:30 PM',
    images: [
      'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Negocio tradicional sin sitio web, catálogo digital ni redes sociales optimizadas.',
    reviews: [
      { id: 'r6', author: 'Mario T.', rating: 3, text: 'Buenos precios pero falta atención digital e inventario en línea.' }
    ]
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
    address: 'Calle Zaragoza #145 Nte, Col. Centro, Los Mochis',
    phone: '668-815-9988',
    schedule: 'Lunes a Domingo • 7:00 AM - 10:00 PM',
    website: 'https://cafedelaciudad.com.mx',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Cafetería moderna con reservas en línea, menú QR, pedidos por WhatsApp y presencia activa en Maps.',
    reviews: [
      { id: 'r7', author: 'Sofía L.', rating: 5, text: 'El mejor café de la región y excelente ambiente para trabajar.' },
      { id: 'r8', author: 'Roberto G.', rating: 5, text: 'Excelente velocidad de Wi-Fi y menú digital muy práctico.' }
    ]
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
    address: 'Av. Independencia #320 Ote., Los Mochis',
    phone: '668-812-7711',
    schedule: 'Lunes a Viernes • 9:00 AM - 2:00 PM, 4:00 PM - 7:00 PM',
    images: [
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Atención médica general de calidad. Requiere agenda electrónica de citas y ficha optimizada en Google.',
    reviews: [
      { id: 'r9', author: 'Elena V.', rating: 4, text: 'Excelente médico, muy recomendado.' }
    ]
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
    address: 'Blvd. Jiquilpan #502, Col. Scally, Los Mochis',
    phone: '668-818-4000',
    schedule: 'Lunes a Viernes • 9:00 AM - 6:00 PM',
    website: 'https://techmochis.com',
    images: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Agencia especializada en transformación digital de empresas, desarrollo web, apps y marketing en Los Mochis.',
    reviews: [
      { id: 'r10', author: 'Empresa X', rating: 5, text: 'Nos ayudaron a digitalizar todas nuestras sucursales con éxito.' },
      { id: 'r11', author: 'Startup Y', rating: 5, text: 'Altamente profesionales en estrategia digital.' }
    ]
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
    address: 'Calle Miguel Hidalgo #89, Col. Centro, Los Mochis',
    phone: '668-812-0012',
    schedule: 'Todos los días • 7:00 AM - 9:00 PM',
    images: [
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Tienda de conveniencia con décadas de tradición que busca integrarse al ecosistema digital local.',
    reviews: [
      { id: 'r12', author: 'Doña Rosa', rating: 4, text: 'Muy céntrico y surtido.' }
    ]
  },
  {
    id: 'p4',
    name: 'Plaza Paseo Los Mochis',
    type: 'plaza',
    lat: 25.7720,
    lng: -108.9810,
    heading: 90,
    pitch: 0,
    digitalPresence: true,
    category: 'Comercio Local',
    address: 'Blvd. Centenario & Gabriel Leyva, Los Mochis',
    phone: '668-816-1200',
    schedule: 'Lunes a Domingo • 10:00 AM - 9:00 PM',
    images: [
      'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Centro comercial moderno con cines, restaurantes y tiendas departamentales a 2.6 km del centro.',
    reviews: [
      { id: 'r13', author: 'Claudia R.', rating: 5, text: 'Excelente centro comercial con amplios estacionamientos.' }
    ]
  },
  {
    id: 'b4',
    name: 'Bodega AgroIndustrial Jiquilpan',
    type: 'office',
    lat: 25.7510,
    lng: -108.9710,
    heading: 0,
    pitch: 0,
    digitalPresence: true,
    category: 'Servicios',
    address: 'Carr. Los Mochis-Ahome Km 4.5, Los Mochis',
    phone: '668-818-9000',
    schedule: 'Lunes a Sábado • 8:00 AM - 5:00 PM',
    images: [
      'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Centro logístico y agroindustrial abastecedor de la región a 5.1 km del centro.',
    reviews: [
      { id: 'r14', author: 'Ing. Pacheco', rating: 5, text: 'Gran capacidad logística y rapidez en envíos.' }
    ]
  },
  {
    id: 'b5',
    name: 'Distribuidora del Norte Ahome',
    type: 'business',
    lat: 25.7310,
    lng: -108.9410,
    heading: 180,
    pitch: 0,
    digitalPresence: false,
    category: 'Comercio Local',
    address: 'Parque Industrial Ahome Lote 12, Los Mochis',
    phone: '668-811-2233',
    schedule: 'Lunes a Viernes • 8:30 AM - 6:00 PM',
    images: [
      'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Empresa mayorista requiriendo digitalización y presencia en mapa a 8.8 km del centro.',
    reviews: [
      { id: 'r15', author: 'Ramon N.', rating: 4, text: 'Buen surtido industrial.' }
    ]
  },
  {
    id: 'p5',
    name: 'Restaurante & Mariscos El Maviri',
    type: 'business',
    lat: 25.6810,
    lng: -109.0410,
    heading: 45,
    pitch: 0,
    digitalPresence: true,
    category: 'Comercio Local',
    address: 'Isla El Maviri, Ahome, Sin.',
    phone: '668-812-9900',
    schedule: 'Todos los días • 10:00 AM - 8:00 PM',
    images: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop'
    ],
    description: 'Tradicional palapa de mariscos frescos en la playa El Maviri a 13.5 km del centro de Los Mochis.',
    reviews: [
      { id: 'r16', author: 'Gustavo P.', rating: 5, text: 'Pescado zarandeado inigualable frente al mar.' }
    ]
  }
];
