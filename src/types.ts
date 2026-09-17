export type Screen = 'dashboard' | 'ocr-upload' | 'auth';

export interface AuthUser {
  id: string;
  nombre: string;
  correo: string;
  cargo: string;
  departamento?: string;
  concesionaria?: string;
  rol: string;
  avatarUrl?: string;
  lastLogin?: string;
}


export type VehicleCategory = 
  | 'Todas'
  | 'Seminuevos'
  | 'Nuevos'
  | 'Sprinter'
  | 'Chofer App'
  | 'Camiones'
  | 'Otros';

export interface QuoteRecord {
  id: string;
  folio: string;
  fechaHora: string;
  solicitante: string;
  atencion: string;
  categoria: 'Seminuevos' | 'Nuevos' | 'Sprinter' | 'Chofer App' | 'Camiones' | 'Otros';
  archivoNombre: string;
  archivoTipo: 'pdf' | 'img';
  montoTotal?: number;
  confianzaOcr?: number;
}

export interface AdvisorStats {
  id: string;
  nombre: string;
  cotizaciones: number;
  porcentaje: number;
}

export interface DigitalAdvisorStats {
  id: string;
  nombre: string;
  atenciones: number;
  porcentaje: number;
}

export interface QueueItem {
  id: string;
  nombre: string;
  tamano: string;
  categoria: VehicleCategory;
  estado: 'mapeado' | 'revision' | 'procesando' | 'pendiente' | 'confirmado';
  confianza: number;
  progreso?: number;
  posicionCola?: number;
  esActivo?: boolean;
}

export interface ExtractedFields {
  solicitante: string;
  solicitanteConf: number;
  atencion: string;
  atencionConf: number;
  categoria: string;
  categoriaConf: number;
  fechaEmision: string;
  fechaEmisionConf: number;
  folio: string;
  folioConf: number;
  vehiculoModelo: string;
  vehiculoPrecio: string;
  garantia: string;
  placas: string;
  subtotal: string;
  iva: string;
  totalCotizado: string;
}

export interface CopilotMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  isForecastCard?: boolean;
  forecastData?: {
    periodo: string;
    confianza: string;
    totalEst: string;
    crecimiento: string;
    drivers: string;
    recomendacion: string;
  };
}

export interface MappableField {
  id: string;
  category: 'emision' | 'vehiculo' | 'seguro' | 'financiero';
  label: string;
  originalName: string;
  value: string;
  targetColumn: string;
  confidence: number;
  enabled: boolean;
  required?: boolean;
}

export interface UserProfile {
  nombre: string;
  cargo: string;
  correo: string;
  departamento?: string;
  concesionaria: string;
  telefono: string;
  rol: string;
  avatarUrl?: string;
}

