import { QuoteRecord, AdvisorStats, DigitalAdvisorStats, QueueItem, ExtractedFields, CopilotMessage } from '../types';

export const initialQuotes: QuoteRecord[] = [];

export const topAdvisors: AdvisorStats[] = [];

export const digitalAdvisors: DigitalAdvisorStats[] = [
  { id: '1', nombre: 'Lourdes Molina', atenciones: 0, porcentaje: 0 },
  { id: '2', nombre: 'Karina Gutiérrez', atenciones: 0, porcentaje: 0 },
  { id: '3', nombre: 'Ángeles Sánchez', atenciones: 0, porcentaje: 0 },
  { id: '4', nombre: 'Karely Carpio', atenciones: 0, porcentaje: 0 },
  { id: '5', nombre: 'Eleydi Ruiz', atenciones: 0, porcentaje: 0 },
];

export const categoryVolumes = [
  { name: 'Seminuevos', count: 0, pct: '0%', color: '#2563EB' },
  { name: 'Nuevos', count: 0, pct: '0%', color: '#10B981' },
  { name: 'Sprinter', count: 0, pct: '0%', color: '#6366F1' },
  { name: 'Chofer App', count: 0, pct: '0%', color: '#F59E0B' },
  { name: 'Camiones', count: 0, pct: '0%', color: '#DC2626' },
  { name: 'Otros', count: 0, pct: '0%', color: '#64748B' },
];

export const monthlyEvolution = [
  { mes: 'May', total: '0', seminuevos: 0, nuevos: 0, sprinter: 0, chofer: 0, camiones: 0, otros: 0 },
  { mes: 'Jun', total: '0', seminuevos: 0, nuevos: 0, sprinter: 0, chofer: 0, camiones: 0, otros: 0 },
  { mes: 'Jul', total: '0', seminuevos: 0, nuevos: 0, sprinter: 0, chofer: 0, camiones: 0, otros: 0 },
  { mes: 'Ago', total: '0', seminuevos: 0, nuevos: 0, sprinter: 0, chofer: 0, camiones: 0, otros: 0 },
  { mes: 'Sep', total: '0', seminuevos: 0, nuevos: 0, sprinter: 0, chofer: 0, camiones: 0, otros: 0 },
  { mes: 'Oct', total: '0', seminuevos: 0, nuevos: 0, sprinter: 0, chofer: 0, camiones: 0, otros: 0 },
];

export const initialQueueItems: QueueItem[] = [
  {
    id: 'doc-aveo-plataforma-2026',
    nombre: 'Cotización Plataforma - Aveo 2026.jpeg',
    tamano: '348 KB',
    categoria: 'Nuevos',
    estado: 'mapeado',
    confianza: 99,
    posicionCola: 1,
    esActivo: true
  }
];

export const defaultExtractedFields: ExtractedFields = {
  solicitante: 'NUEVOS (Canal Digital)',
  solicitanteConf: 99,
  atencion: 'Lourdes Molina',
  atencionConf: 99,
  categoria: 'Nuevos',
  categoriaConf: 99,
  fechaEmision: '2026-09-04',
  fechaEmisionConf: 99,
  folio: 'COT-CAFI-2026-0409',
  folioConf: 99,
  vehiculoModelo: 'CT CHEVROLET AVEO HB LT PLUS C 2026',
  vehiculoPrecio: '$378,900.00',
  garantia: '$21,000.00',
  placas: '$0.00',
  subtotal: '$378,900.00',
  iva: '$0.00',
  totalCotizado: '$378,900.00 MXN'
};

export const initialCopilotMessages: CopilotMessage[] = [
  {
    id: 'm1',
    sender: 'assistant',
    timestamp: 'Coti-CAFI Copilot · IA Operativa 2026',
    text: '¡Hola! Soy Coti-CAFI Copilot. El cotizador está configurado para el ejercicio 2026 y listo para compilar cotizaciones vía OCR multimodal con el equipo de asesoras digitales (Lourdes Molina, Karina Gutiérrez, Ángeles Sánchez, Karely Carpio y Eleydi Ruiz).\n\nComandos rápidos disponibles:\n• /pronósticos — Proyección y forecast 2026\n• /cotizaciones — Estado del compilador OCR y categorías\n• /asesores — Distribución de carga de las 5 asesoras'
  }
];

