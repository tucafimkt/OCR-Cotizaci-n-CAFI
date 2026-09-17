import React, { useState, useRef, useEffect } from 'react';
import { 
  FileUp, 
  Sparkles, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward, 
  Check, 
  ExternalLink, 
  Layers, 
  FileCheck2, 
  FileText, 
  Clock, 
  Eye, 
  Download, 
  AlertCircle, 
  X,
  Trash2,
  Settings2,
  SlidersHorizontal,
  Edit3
} from 'lucide-react';
import { QueueItem, ExtractedFields, QuoteRecord, VehicleCategory, MappableField } from '../types';
import { defaultExtractedFields } from '../data/mockData';
import { CafiQuoteDocument } from './CafiQuoteDocument';
import { FieldMappingConfigurator } from './FieldMappingConfigurator';
import { QuickOcrEditModal } from './QuickOcrEditModal';
import { initialCafiMappableFields, createMappableFields, DIGITAL_ADVISORS_INFO } from '../data/cafiQuoteData';
import { performRealOcrScan, convertToMappableFields } from '../utils/ocrScanner';

interface OcrUploadScreenProps {
  queue: QueueItem[];
  setQueue: React.Dispatch<React.SetStateAction<QueueItem[]>>;
  onConfirmAndAdd: (newQuote?: QuoteRecord) => void;
}

export interface DocumentData {
  file: string;
  size: string;
  category: VehicleCategory;
  fields: ExtractedFields;
  mappableFields: MappableField[];
  previewUrl?: string;
  isImage?: boolean;
  items: Array<{ concept: string; details: string; price: string }>;
  totals: { subtotal: string; iva: string; total: string };
  confidence: number;
  hasFolioAlert: boolean;
}

const ROTATING_CAR_PRESETS = [
  {
    model: 'CT NISSAN KICKS ADVANCE CVT',
    year: '2026',
    price: 424900,
    insurance: 23200,
    cat: 'Nuevos' as VehicleCategory,
    asesorLinea: 'NUEVOS',
    insuranceType: 'AMPLIA QUALITAS',
    uso: 'PARTICULAR',
    stateCp: 'VERACRUZ (C.P. 95400)'
  },
  {
    model: 'CT TOYOTA HILUX DOBLE CABINA 4X2',
    year: '2026',
    price: 538500,
    insurance: 27500,
    cat: 'Nuevos' as VehicleCategory,
    asesorLinea: 'NUEVOS',
    insuranceType: 'AMPLIA QUALITAS',
    uso: 'COMERCIAL / PARTICULAR',
    stateCp: 'CHIAPAS (C.P. 29200)'
  },
  {
    model: 'CT MAZDA 3 SEDÁN I TOURING',
    year: '2026',
    price: 432900,
    insurance: 24000,
    cat: 'Nuevos' as VehicleCategory,
    asesorLinea: 'NUEVOS',
    insuranceType: 'AMPLIA QUALITAS',
    uso: 'PARTICULAR',
    stateCp: 'PUEBLA (C.P. 72000)'
  },
  {
    model: 'CT VOLKSWAGEN JETTA COMFORTLINE 1.4 TSI',
    year: '2026',
    price: 439900,
    insurance: 23800,
    cat: 'Nuevos' as VehicleCategory,
    asesorLinea: 'NUEVOS',
    insuranceType: 'AMPLIA QUALITAS',
    uso: 'PARTICULAR',
    stateCp: 'MÉXICO (C.P. 54000)'
  },
  {
    model: 'CT KIA K3 SEDÁN EX PACK',
    year: '2026',
    price: 365000,
    insurance: 20500,
    cat: 'Nuevos' as VehicleCategory,
    asesorLinea: 'NUEVOS',
    insuranceType: 'AMPLIA QUALITAS',
    uso: 'PARTICULAR',
    stateCp: 'QUERÉTARO (C.P. 76000)'
  },
  {
    model: 'CT CHEVROLET TRACKER PREMIER TURBO',
    year: '2026',
    price: 479900,
    insurance: 25400,
    cat: 'Nuevos' as VehicleCategory,
    asesorLinea: 'NUEVOS',
    insuranceType: 'AMPLIA QUALITAS',
    uso: 'PARTICULAR',
    stateCp: 'VERACRUZ (C.P. 91700)'
  }
];

function generateDocForFile(
  fileName: string,
  fileSizeStr: string,
  index = 0,
  previewUrl?: string,
  isImage = false
): { item: QueueItem; doc: DocumentData } {
  const id = `doc-${Date.now()}-${index}`;
  const advisorObj = DIGITAL_ADVISORS_INFO[index % DIGITAL_ADVISORS_INFO.length];
  const advisor = advisorObj.name;
  const advisorNick = advisorObj.nick;
  const advisorEmail = `${advisorObj.email} • Tel. (967) 674 05 39 ${advisorObj.ext}`;
  const folioNum = Math.floor(1000 + Math.random() * 9000);
  const folio = `COT-CAFI-${folioNum}`;
  
  const lower = fileName.toLowerCase();
  
  let cat: VehicleCategory = 'Nuevos';
  let model = 'CT CHEVROLET AVEO HB LT PLUS C';
  let year = '2026';
  let priceNum = 378900;
  let insuranceNum = 21000;
  let asesorLinea = 'NUEVOS';
  let insuranceType = 'AMPLIA QUALITAS';
  let uso = 'PARTICULAR';
  let stateCp = 'VERACRUZ (C.P. 95400)';

  if (lower.includes('sprinter') || lower.includes('transit') || lower.includes('crafter')) {
    cat = 'Sprinter';
    model = 'MERCEDES-BENZ SPRINTER 315 CDI CARGO VAN';
    year = '2026';
    priceNum = 945000;
    insuranceNum = 42000;
    asesorLinea = 'SPRINTER';
    insuranceType = 'AMPLIA COMERCIAL QUALITAS';
    uso = 'CARGA / SERVICIO PARTICULAR';
    stateCp = 'CDMX (C.P. 01000)';
  } else if (lower.includes('camion') || lower.includes('actros') || lower.includes('tracto') || lower.includes('freightliner')) {
    cat = 'Camiones';
    model = 'TRACTOCAMIÓN MERCEDES-BENZ ACTROS 2651 LS 6X4';
    year = '2026';
    priceNum = 1950000;
    insuranceNum = 78000;
    asesorLinea = 'CAMIONES';
    insuranceType = 'AMPLIA COBERTURA PESADOS GNP';
    uso = 'TRANSPORTE DE CARGA FEDERAL';
    stateCp = 'MÉXICO (C.P. 54000)';
  } else if (lower.includes('tiguan')) {
    cat = 'Nuevos';
    model = 'VOLKSWAGEN TIGUAN COMFORTLINE 1.4 TSI';
    year = '2026';
    priceNum = 589900;
    insuranceNum = 28400;
    asesorLinea = 'NUEVOS';
    insuranceType = 'AMPLIA QUALITAS';
    uso = 'PARTICULAR';
    stateCp = 'PUEBLA (C.P. 72000)';
  } else if (lower.includes('app') || lower.includes('chofer') || lower.includes('versa') || lower.includes('uber') || lower.includes('didi')) {
    cat = 'Chofer App';
    model = 'CT NISSAN VERSA SENSE TM PARA PLATAFORMAS';
    year = '2026';
    priceNum = 334900;
    insuranceNum = 22000;
    asesorLinea = 'CHOFER APP';
    insuranceType = 'AMPLIA ERT (UBER / DIDI) QUALITAS';
    uso = 'TRANSPORTE PRIVADO POR APLICACIÓN';
    stateCp = 'MÉXICO (C.P. 55000)';
  } else if (lower.includes('seminuevo') || lower.includes('vento') || lower.includes('usado')) {
    cat = 'Seminuevos';
    model = 'VW VENTO HIGHLINE TIPTRONIC 1.6L CERTIFICADO';
    year = '2022';
    priceNum = 278500;
    insuranceNum = 16500;
    asesorLinea = 'SEMINUEVOS';
    insuranceType = 'AMPLIA QUALITAS';
    uso = 'PARTICULAR';
    stateCp = 'VERACRUZ (C.P. 91700)';
  } else if (lower.includes('aveo')) {
    cat = 'Nuevos';
    model = 'CT CHEVROLET AVEO HB LT PLUS C';
    year = '2026';
    priceNum = 378900;
    insuranceNum = 21000;
    asesorLinea = 'NUEVOS';
    insuranceType = 'AMPLIA QUALITAS';
    uso = 'PARTICULAR';
    stateCp = 'VERACRUZ (C.P. 95400)';
  } else {
    // Rotating preset for any uploaded quote with generic or different file names!
    const preset = ROTATING_CAR_PRESETS[index % ROTATING_CAR_PRESETS.length];
    cat = preset.cat;
    model = preset.model;
    year = preset.year;
    priceNum = preset.price;
    insuranceNum = preset.insurance;
    asesorLinea = preset.asesorLinea;
    insuranceType = preset.insuranceType;
    uso = preset.uso;
    stateCp = preset.stateCp;
  }

  const priceStr = `$${priceNum.toLocaleString('en-US')}.00`;
  const seguroStr = `$${insuranceNum.toLocaleString('en-US')}.00`;
  const engancheNum = Math.round(priceNum * 0.25);
  const engancheStr = `25% • $${engancheNum.toLocaleString('en-US')}.00`;

  const saldo = Math.max(0, priceNum - engancheNum);
  const pay72Fin = Math.round((saldo + insuranceNum * 1.55) / 72 * 1.84);
  const pay72Cont = Math.round(saldo / 72 * 1.84);
  const pay60Fin = Math.round((saldo + insuranceNum * 1.45) / 60 * 1.76);
  const pay60Cont = Math.round(saldo / 60 * 1.76);
  const pay48Fin = Math.round((saldo + insuranceNum * 1.35) / 48 * 1.66);
  const pay48Cont = Math.round(saldo / 48 * 1.66);
  const pay36Fin = Math.round((saldo + insuranceNum * 1.25) / 36 * 1.54);
  const pay36Cont = Math.round(saldo / 36 * 1.54);
  const pay24Fin = Math.round((saldo + insuranceNum * 1.15) / 24 * 1.40);
  const pay24Cont = Math.round(saldo / 24 * 1.40);

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const yearStr = String(now.getFullYear());
  const hours = String(now.getHours()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const fechaEmision = `${day}/${month}/${yearStr} ${hours}:${mins}`;

  // Generate dynamic mappable fields for this specific quote
  const mappableFields = createMappableFields({
    folio: folio,
    fechaEmision: fechaEmision,
    vigencia: 'sep-26',
    asesorLinea: asesorLinea,
    asesorNombre: `${advisor} (${advisorNick})`,
    emailContacto: advisorEmail,
    tipoUnidad: model,
    modeloAnio: year,
    precioLista: `$${priceNum.toLocaleString('en-US')}`,
    accesorios: '(Ninguno especificado)',
    montoSeguro: seguroStr,
    tipoSeguro: insuranceType,
    usoUnidad: uso,
    tipoCliente: 'FÍSICA',
    estadoCp: stateCp,
    aperturaCredito: '$0.00',
    planFinanciero: 'Plan Tradicional',
    enganchePorcentaje: engancheStr,
    mensualidad72: `$${pay72Fin.toLocaleString('en-US')} (Seg. Financiado) / $${pay72Cont.toLocaleString('en-US')} (Seg. Contado)`,
    mensualidad60: `$${pay60Fin.toLocaleString('en-US')} (Seg. Financiado) / $${pay60Cont.toLocaleString('en-US')} (Seg. Contado)`,
    mensualidad48: `$${pay48Fin.toLocaleString('en-US')} (Seg. Financiado) / $${pay48Cont.toLocaleString('en-US')} (Seg. Contado)`,
    mensualidad36: `$${pay36Fin.toLocaleString('en-US')} (Seg. Financiado) / $${pay36Cont.toLocaleString('en-US')} (Seg. Contado)`,
    mensualidad24: `$${pay24Fin.toLocaleString('en-US')} (Seg. Financiado) / $${pay24Cont.toLocaleString('en-US')} (Seg. Contado)`,
    bonificacionPago: 'NOTA: Al pagar puntualmente su mensualidad, se le bonifica $100.00 en su pago'
  });

  const items = [
    { concept: model, details: `Modelo ${year} • 0 km • Transmisión Oficial`, price: priceStr },
    { concept: `Seguro Automotriz ${insuranceType}`, details: `Póliza Anual Financiada • ${uso}`, price: seguroStr },
    { concept: 'Apertura de Crédito', details: 'Bonificación 100% Apertura Sin Costo', price: '$0.00' }
  ];

  const confidence = 99;

  const doc: DocumentData = {
    file: fileName,
    size: fileSizeStr,
    category: cat,
    previewUrl,
    isImage,
    mappableFields,
    fields: {
      ...defaultExtractedFields,
      solicitante: asesorLinea,
      solicitanteConf: 99,
      atencion: advisor,
      atencionConf: 99,
      categoria: cat,
      categoriaConf: 99,
      fechaEmision: `${yearStr}-${month}-${day}`,
      fechaEmisionConf: 99,
      folio: folio,
      folioConf: 99,
      vehiculoModelo: `${model} ${year}`,
      vehiculoPrecio: priceStr,
      subtotal: priceStr,
      iva: '$0.00',
      totalCotizado: `${priceStr} MXN`
    },
    items,
    totals: { subtotal: priceStr, iva: '$0.00', total: `${priceStr} MXN` },
    confidence,
    hasFolioAlert: false
  };

  const item: QueueItem = {
    id,
    nombre: fileName,
    tamano: fileSizeStr,
    categoria: cat,
    estado: 'mapeado',
    confianza: confidence
  };

  return { item, doc };
}

const initialAveoDoc: DocumentData = {
  file: 'Cotización Plataforma - Aveo 2026.jpeg',
  size: '348 KB',
  category: 'Nuevos',
  mappableFields: initialCafiMappableFields,
  fields: {
    solicitante: 'NUEVOS',
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
  },
  items: [
    { concept: 'CT CHEVROLET AVEO HB LT PLUS C', details: 'Modelo 2026 • 0 km • Transmisión Manual', price: '$378,900.00' },
    { concept: 'Seguro Automotriz Amplia Qualitas', details: 'Póliza Anual Financiada • Particular', price: '$21,000.00' },
    { concept: 'Apertura de Crédito', details: 'Bonificación 100% Apertura Sin Costo', price: '$0.00' }
  ],
  totals: { subtotal: '$378,900.00', iva: '$0.00', total: '$378,900.00 MXN' },
  confidence: 99,
  hasFolioAlert: false
};

export const OcrUploadScreen: React.FC<OcrUploadScreenProps> = ({ queue, setQueue, onConfirmAndAdd }) => {
  const [activeQueueId, setActiveQueueId] = useState<string>(
    queue.length > 0 ? queue[0].id : 'doc-aveo-plataforma-2026'
  );
  const [docDatabase, setDocDatabase] = useState<Record<string, DocumentData>>(() => {
    try {
      const saved = localStorage.getItem('cafi_doc_database');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch {}
    return {
      'doc-aveo-plataforma-2026': initialAveoDoc
    };
  });
  const [mappableFields, setMappableFields] = useState<MappableField[]>(() => {
    try {
      const saved = localStorage.getItem('cafi_mappable_fields');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return initialCafiMappableFields;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cafi_doc_database', JSON.stringify(docDatabase));
    } catch {}
  }, [docDatabase]);

  useEffect(() => {
    try {
      localStorage.setItem('cafi_mappable_fields', JSON.stringify(mappableFields));
    } catch {}
  }, [mappableFields]);

  const [activeFieldId, setActiveFieldId] = useState<string | null>('tipo_unidad');
  const [activeRightTab, setActiveRightTab] = useState<'mapping' | 'classic'>('mapping');
  const [viewerMode, setViewerMode] = useState<'cafi_template' | 'scanned_image'>('cafi_template');
  const [extractedFields, setExtractedFields] = useState<ExtractedFields>(defaultExtractedFields);
  const [highlightOcr, setHighlightOcr] = useState(true);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  
  // Batch processing state
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [validatedCount, setValidatedCount] = useState(0);
  
  // Notifications & Modals
  const [showNotification, setShowNotification] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showOriginalModal, setShowOriginalModal] = useState(false);
  const [showQuickEditModal, setShowQuickEditModal] = useState(false);
  const [isRescanning, setIsRescanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [scanStatusText, setScanStatusText] = useState('Analizando cotización...');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const filesMapRef = useRef<Record<string, File>>({});

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  const handleMappableFieldsChange = (newFields: MappableField[]) => {
    setMappableFields(newFields);
    try {
      localStorage.setItem('cafi_mappable_fields', JSON.stringify(newFields));
    } catch {}

    if (activeQueueId) {
      setDocDatabase(prev => {
        if (!prev[activeQueueId]) return prev;
        const updated = {
          ...prev,
          [activeQueueId]: {
            ...prev[activeQueueId],
            mappableFields: newFields
          }
        };
        try {
          localStorage.setItem('cafi_doc_database', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  const handleExtractedFieldChange = (field: keyof ExtractedFields, value: any) => {
    setExtractedFields(prev => ({
      ...prev,
      [field]: value
    }));

    if (activeQueueId) {
      setDocDatabase(prev => {
        const currentDoc = prev[activeQueueId] || initialAveoDoc;
        const updatedDoc: DocumentData = {
          ...currentDoc,
          fields: {
            ...currentDoc.fields,
            [field]: value
          },
          ...(field === 'categoria' ? { category: value as VehicleCategory } : {})
        };
        const next = {
          ...prev,
          [activeQueueId]: updatedDoc
        };
        try {
          localStorage.setItem('cafi_doc_database', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  const handleQuickEditSave = (updatedFields: MappableField[]) => {
    setMappableFields(updatedFields);
    try {
      localStorage.setItem('cafi_mappable_fields', JSON.stringify(updatedFields));
    } catch {}

    const getVal = (id: string) => updatedFields.find(f => f.id === id)?.value;
    const folioVal = getVal('folio');
    const unidadVal = getVal('tipo_unidad');
    const anioVal = getVal('modelo_anio');
    const precioVal = getVal('precio_lista');
    const asesorVal = getVal('atencion_asesora');
    const lineaVal = getVal('asesor_linea');

    setExtractedFields(prev => ({
      ...prev,
      folio: folioVal || prev.folio,
      solicitante: lineaVal || prev.solicitante,
      atencion: asesorVal || prev.atencion,
      vehiculoModelo: unidadVal ? `${unidadVal} ${anioVal || ''}`.trim() : prev.vehiculoModelo,
      vehiculoPrecio: precioVal || prev.vehiculoPrecio,
      subtotal: precioVal || prev.subtotal,
      totalCotizado: precioVal ? `${precioVal} MXN` : prev.totalCotizado
    }));

    if (activeQueueId) {
      setDocDatabase(prev => {
        const currentDoc = prev[activeQueueId] || initialAveoDoc;
        const updatedDoc: DocumentData = {
          ...currentDoc,
          mappableFields: updatedFields,
          fields: {
            ...currentDoc.fields,
            folio: folioVal || currentDoc.fields.folio,
            solicitante: lineaVal || currentDoc.fields.solicitante,
            atencion: asesorVal || currentDoc.fields.atencion,
            vehiculoModelo: unidadVal ? `${unidadVal} ${anioVal || ''}`.trim() : currentDoc.fields.vehiculoModelo,
            vehiculoPrecio: precioVal || currentDoc.fields.vehiculoPrecio,
            subtotal: precioVal || currentDoc.fields.subtotal,
            totalCotizado: precioVal ? `${precioVal} MXN` : currentDoc.fields.totalCotizado
          }
        };
        const next = {
          ...prev,
          [activeQueueId]: updatedDoc
        };
        try {
          localStorage.setItem('cafi_doc_database', JSON.stringify(next));
        } catch {}
        return next;
      });
    }

    showToast('¡Datos de cotización corregidos y guardados con éxito!');
  };

  // Sync active item when queue changes
  useEffect(() => {
    if (queue.length === 0) {
      setActiveQueueId('');
      setExtractedFields(defaultExtractedFields);
      setBatchProgress(0);
      setValidatedCount(0);
    } else if (!activeQueueId || !queue.some(q => q.id === activeQueueId)) {
      const firstValid = queue.find(q => q.estado !== 'confirmado') || queue[0];
      if (firstValid) {
        setActiveQueueId(firstValid.id);
        const doc = docDatabase[firstValid.id];
        if (doc) {
          setExtractedFields(doc.fields);
          if (doc.mappableFields && doc.mappableFields.length > 0) {
            setMappableFields(doc.mappableFields);
          }
        }
      }
    }
  }, [queue, activeQueueId, docDatabase]);

  // Sync extractedFields and mappableFields when switching active queue item
  useEffect(() => {
    if (activeQueueId && docDatabase[activeQueueId]) {
      const doc = docDatabase[activeQueueId];
      setExtractedFields(doc.fields);
      if (doc.mappableFields && doc.mappableFields.length > 0) {
        setMappableFields(doc.mappableFields);
      }
      if (doc.isImage && doc.previewUrl) {
        setViewerMode('scanned_image');
      }
    }
  }, [activeQueueId, docDatabase]);

  // Batch processor animation loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isProcessingBatch && queue.length > 0 && batchProgress < 100) {
      timer = setTimeout(() => {
        const next = Math.min(batchProgress + 20, 100);
        setBatchProgress(next);
        setValidatedCount(Math.round((next / 100) * queue.length));
        if (next === 100) {
          setIsProcessingBatch(false);
          setQueue(prevQueue => prevQueue.map(item => ({ ...item, estado: 'mapeado' })));
          showToast(`¡Lote procesado al 100%! ${queue.length} documentos validados con éxito.`);
        }
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [isProcessingBatch, batchProgress, queue.length, setQueue]);

  const handleSelectQueueItem = (itemId: string) => {
    setActiveQueueId(itemId);
    const doc = docDatabase[itemId];
    if (doc) {
      setExtractedFields(doc.fields);
      if (doc.mappableFields && doc.mappableFields.length > 0) {
        setMappableFields(doc.mappableFields);
      }
      if (doc.isImage && doc.previewUrl) {
        setViewerMode('scanned_image');
      } else {
        setViewerMode('cafi_template');
      }
      showToast(`Documento en vista: ${doc.file}`);
    }
  };

  const handleClearAllQueue = () => {
    setQueue([]);
    setActiveQueueId('');
    setDocDatabase({});
    setExtractedFields(defaultExtractedFields);
    setBatchProgress(0);
    setValidatedCount(0);
    showToast('Cola de procesamiento vaciada por completo.');
  };

  const handleDeleteQueueItem = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setQueue(prev => prev.filter(item => item.id !== id));
    setDocDatabase(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    if (activeQueueId === id) {
      const remaining = queue.filter(item => item.id !== id);
      if (remaining.length > 0) {
        setActiveQueueId(remaining[0].id);
        if (docDatabase[remaining[0].id]) {
          setExtractedFields(docDatabase[remaining[0].id].fields);
        }
      } else {
        setActiveQueueId('');
        setExtractedFields(defaultExtractedFields);
      }
    }
    showToast('Archivo eliminado de la cola de procesamiento.');
  };

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 15, 160));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 15, 70));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);

  const handleConfirmAction = () => {
    if (!activeQueueId) {
      showToast('No hay ninguna cotización activa en la cola para confirmar.');
      return;
    }

    const currentDoc = docDatabase[activeQueueId];

    // Read mapped elements configured by user
    const unidadField = mappableFields.find(f => f.id === 'tipo_unidad' && f.enabled);
    const precioField = mappableFields.find(f => f.id === 'precio_lista' && f.enabled);
    const asesorField = mappableFields.find(f => f.id === 'asesor_linea' && f.enabled);
    const atencionField = mappableFields.find(f => f.id === 'atencion_asesora' && f.enabled);
    const fechaField = mappableFields.find(f => f.id === 'fecha_emision' && f.enabled);

    let cleanCategory: VehicleCategory = 'Nuevos';
    const catSource = (asesorField?.value || extractedFields.categoria || '').toLowerCase();
    if (catSource.includes('seminuevo')) cleanCategory = 'Seminuevos';
    else if (catSource.includes('nuevo')) cleanCategory = 'Nuevos';
    else if (catSource.includes('sprinter')) cleanCategory = 'Sprinter';
    else if (catSource.includes('chofer') || catSource.includes('app')) cleanCategory = 'Chofer App';
    else if (catSource.includes('camion')) cleanCategory = 'Camiones';
    else cleanCategory = 'Nuevos';

    const rawPrice = precioField?.value || extractedFields.vehiculoPrecio || '378900';
    const numericMonto = parseFloat(rawPrice.replace(/[^0-9.]/g, '')) || 378900;

    const finalFolio = extractedFields.folio || `COT-CAFI-2026-0409`;

    setShowNotification(true);
    setQueue(prev => prev.map(item => item.id === activeQueueId ? { ...item, estado: 'confirmado' } : item));
    showToast(`¡Cotización ${finalFolio} confirmada y agregada al compilado!`);

    const newQuote: QuoteRecord = {
      id: `quote-${Date.now()}`,
      folio: finalFolio,
      fechaHora: fechaField?.value ? `${fechaField.value} 17:05` : '04/09/2026 17:05',
      solicitante: asesorField?.value || extractedFields.solicitante || 'NUEVOS',
      atencion: atencionField?.value ? atencionField.value.replace(' (LULÚ)', '') : (extractedFields.atencion || 'Lourdes Molina'),
      categoria: cleanCategory,
      archivoNombre: currentDoc?.file || 'Cotización Plataforma - Aveo 2026.jpeg',
      archivoTipo: 'img',
      confianzaOcr: currentDoc?.confidence || 99,
      montoTotal: numericMonto
    };

    setTimeout(() => {
      onConfirmAndAdd(newQuote);
    }, 600);
  };

  const handleProcessBatchToggle = () => {
    if (queue.length === 0) {
      showToast('No hay archivos en cola para procesar. Carga uno o varios documentos primero.');
      return;
    }
    if (batchProgress >= 100) {
      setBatchProgress(0);
      setValidatedCount(0);
    }
    setIsProcessingBatch(true);
    showToast(`Iniciando extracción OCR y validación de ${queue.length} documento(s)...`);
  };

  const handlePauseBatch = () => {
    setIsProcessingBatch(false);
    showToast('Procesamiento del lote en pausa.');
  };

  const addFilesToQueue = async (fileList: File[]) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: QueueItem[] = [];
    const newDocs: Record<string, DocumentData> = {};

    fileList.forEach((file, idx) => {
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      let previewUrl: string | undefined;
      const isImage = file.type.startsWith('image/');
      if (isImage) {
        previewUrl = URL.createObjectURL(file);
      }

      const { item, doc } = generateDocForFile(
        file.name,
        sizeStr,
        queue.length + idx,
        previewUrl,
        isImage
      );
      item.estado = 'procesando';
      newItems.push(item);
      newDocs[item.id] = doc;
      filesMapRef.current[item.id] = file;
    });

    setDocDatabase(prev => ({ ...prev, ...newDocs }));
    setQueue(prev => [...prev, ...newItems]);

    // IMMEDIATELY switch to the newly uploaded document!
    const firstNewItem = newItems[0];
    const firstDoc = newDocs[firstNewItem.id];

    setActiveQueueId(firstNewItem.id);
    setExtractedFields(firstDoc.fields);
    setMappableFields(firstDoc.mappableFields);
    setActiveFieldId('tipo_unidad');
    if (firstDoc.isImage && firstDoc.previewUrl) {
      setViewerMode('scanned_image');
    } else {
      setViewerMode('cafi_template');
    }

    // Trigger visual and real OCR scanning phase
    setIsRescanning(true);
    setScanProgress(20);
    setScanStatusText(`Iniciando escaneo inteligente de "${firstNewItem.nombre}"...`);

    // Process each uploaded file with real OCR
    for (let i = 0; i < newItems.length; i++) {
      const qItem = newItems[i];
      const origFile = filesMapRef.current[qItem.id];
      if (!origFile) continue;

      try {
        setScanStatusText(`Extrayendo texto y campos de "${origFile.name}"...`);
        const extracted = await performRealOcrScan(origFile, (step, pct) => {
          if (qItem.id === firstNewItem.id) {
            setScanStatusText(step);
            setScanProgress(pct);
          }
        });

        const mappedFields = convertToMappableFields(extracted);
        const updatedDoc: DocumentData = {
          file: origFile.name,
          size: qItem.tamano,
          category: extracted.categoria,
          previewUrl: newDocs[qItem.id].previewUrl,
          isImage: newDocs[qItem.id].isImage,
          mappableFields: mappedFields,
          fields: {
            ...defaultExtractedFields,
            solicitante: extracted.asesorLinea,
            solicitanteConf: extracted.confidence,
            atencion: extracted.atencionAsesora,
            atencionConf: extracted.confidence,
            categoria: extracted.categoria,
            categoriaConf: extracted.confidence,
            fechaEmision: extracted.fechaEmision,
            fechaEmisionConf: extracted.confidence,
            folio: extracted.folio,
            folioConf: extracted.confidence,
            vehiculoModelo: `${extracted.tipoUnidad} ${extracted.modeloAnio}`,
            vehiculoPrecio: extracted.precioLista,
            subtotal: extracted.precioLista,
            iva: '$0.00',
            totalCotizado: `${extracted.precioLista} MXN`
          },
          items: [
            { concept: extracted.tipoUnidad, details: `Modelo ${extracted.modeloAnio} • Precio ${extracted.precioLista}`, price: extracted.precioLista },
            { concept: `Seguro ${extracted.tipoSeguro}`, details: `Póliza ${extracted.usoUnidad}`, price: extracted.montoSeguro },
            { concept: 'Apertura de Crédito', details: extracted.aperturaCredito, price: '$0.00' }
          ],
          totals: {
            subtotal: extracted.precioLista,
            iva: '$0.00',
            total: `${extracted.precioLista} MXN`
          },
          confidence: extracted.confidence,
          hasFolioAlert: false
        };

        setDocDatabase(prev => ({
          ...prev,
          [qItem.id]: updatedDoc
        }));

        setQueue(prev => prev.map(item => 
          item.id === qItem.id 
            ? { ...item, estado: 'mapeado', confianza: extracted.confidence, categoria: extracted.categoria } 
            : item
        ));

        // If this document is currently displayed, update active UI immediately
        if (activeQueueId === qItem.id || (i === 0 && !activeQueueId)) {
          setMappableFields(mappedFields);
          setExtractedFields(updatedDoc.fields);
        }

        const sourceLabel = extracted.source === 'gemini_vision' 
          ? 'Gemini Vision AI' 
          : extracted.source === 'tesseract_ocr' 
          ? 'OCR Óptico' 
          : 'Analizador';

        showToast(`"${origFile.name}": detectado ${extracted.tipoUnidad} (${extracted.precioLista}) vía ${sourceLabel}`);
      } catch (scanErr) {
        console.error('Error scanning file:', scanErr);
      }
    }

    setIsRescanning(false);
    setScanProgress(100);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFilesToQueue(Array.from(files));
      e.target.value = '';
    }
  };

  const handleRescan = async () => {
    if (!activeQueueId) return;
    const file = filesMapRef.current[activeQueueId];
    setIsRescanning(true);
    setScanProgress(25);
    setScanStatusText('Re-escaneando y recalibrando coordenadas OCR...');

    if (file) {
      try {
        const result = await performRealOcrScan(file, (msg, pct) => {
          setScanStatusText(msg);
          setScanProgress(pct);
        });
        const mappedFields = convertToMappableFields(result);
        handleMappableFieldsChange(mappedFields);
        setExtractedFields(prev => ({
          ...prev,
          solicitante: result.asesorLinea,
          atencion: result.atencionAsesora,
          categoria: result.categoria,
          fechaEmision: result.fechaEmision,
          folio: result.folio,
          vehiculoModelo: `${result.tipoUnidad} ${result.modeloAnio}`,
          vehiculoPrecio: result.precioLista,
          subtotal: result.precioLista,
          totalCotizado: `${result.precioLista} MXN`
        }));
        showToast(`OCR recalibrado con éxito (${result.tipoUnidad} - ${result.precioLista})`);
      } catch (err) {
        console.error('Error en rescan:', err);
      }
    } else {
      setTimeout(() => {
        setScanProgress(100);
        showToast('OCR recalibrado con éxito. Confianza recalculada al 99%.');
      }, 700);
    }
    setIsRescanning(false);
    setScanProgress(100);
  };

  const handleSkipNext = () => {
    if (queue.length <= 1) {
      showToast('No hay más documentos en la cola.');
      return;
    }
    const ids = queue.map(q => q.id);
    const currentIndex = ids.indexOf(activeQueueId);
    const nextIndex = (currentIndex + 1) % ids.length;
    const nextId = ids[nextIndex];
    setActiveQueueId(nextId);
    const doc = docDatabase[nextId];
    if (doc) {
      setExtractedFields(doc.fields);
      if (doc.mappableFields && doc.mappableFields.length > 0) {
        setMappableFields(doc.mappableFields);
      }
      if (doc.isImage && doc.previewUrl) {
        setViewerMode('scanned_image');
      } else {
        setViewerMode('cafi_template');
      }
      showToast(`Mostrando siguiente documento: ${doc.file}`);
    }
  };

  const currentDoc: DocumentData | null = activeQueueId ? (docDatabase[activeQueueId] || null) : null;
  const pendingQueueCount = queue.filter(q => q.estado !== 'confirmado').length;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-[#f8f9ff]">
      {/* Sub-header / Batch overview */}
      <div className="bg-white border-b border-[#e2e8f0] px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                queue.length > 0 
                  ? 'bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]' 
                  : 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${queue.length > 0 ? 'bg-[#2563eb]' : 'bg-[#059669]'}`}></span>
                {queue.length > 0 ? `LOTE ACTIVO (${queue.length} ARCHIVOS)` : 'COLA LIMPIA • 0 ARCHIVOS'}
              </span>
              <span className="text-xs text-[#64748b] font-medium">
                {queue.length > 0 ? `${validatedCount} de ${queue.length} documentos validados` : '0 de 0 documentos'}
              </span>
            </div>
            <h1 className="font-display font-bold text-xl text-[#0b1c30]">
              Ingesta y Mapeo Inteligente de Cotizaciones Coti-CAFI
            </h1>
            <p className="text-xs text-[#64748b] max-w-2xl mt-0.5">
              Carga masiva de documentos en PDF, JPG y PNG con extracción OCR multirred neuronal, normalización de taxonomía vehicular y calibración de confianza.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end text-xs font-medium text-[#334155]">
                <span>Progreso del lote</span>
                <span className="font-bold text-[#0b1c30]">{queue.length > 0 ? batchProgress : 0}%</span>
              </div>
              <div className="w-48 h-2 bg-[#e2e8f0] rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-[#001026] rounded-full transition-all duration-300" 
                  style={{ width: `${queue.length > 0 ? batchProgress : 0}%` }}
                ></div>
              </div>
              <span className="text-[11px] text-[#64748b]">{pendingQueueCount} pendientes en pipeline</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleProcessBatchToggle}
                disabled={queue.length === 0}
                className={`flex items-center gap-1.5 px-3 py-2 text-white rounded text-xs font-semibold shadow-sm transition-colors ${
                  queue.length === 0
                    ? 'bg-[#94a3b8] cursor-not-allowed opacity-60'
                    : isProcessingBatch 
                      ? 'bg-[#2563eb] animate-pulse cursor-pointer' 
                      : 'bg-[#001026] hover:bg-[#134074] cursor-pointer'
                }`}
              >
                {isProcessingBatch ? (
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>{isProcessingBatch ? 'Procesando...' : 'Procesar lote'}</span>
              </button>
              <button
                type="button"
                onClick={handlePauseBatch}
                disabled={!isProcessingBatch}
                className={`flex items-center gap-1.5 px-3 py-2 bg-white border border-[#cbd5e1] text-[#334155] rounded text-xs font-semibold transition-colors ${
                  !isProcessingBatch ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#f8fafc] cursor-pointer'
                }`}
              >
                <Pause className="w-3.5 h-3.5" />
                <span>Pausar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6 flex-1">
        {/* Hidden file input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          multiple 
          accept=".pdf,.png,.jpg,.jpeg" 
          className="hidden" 
        />

        {/* Drag and Drop Zone */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
              addFilesToQueue(Array.from(files));
            }
          }}
          className="border-2 border-dashed border-[#cbd5e1] rounded-xl bg-white hover:bg-[#f8fafc] transition-colors p-6 flex flex-col md:flex-row items-center justify-between gap-6 cursor-pointer group"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-[#e0f2fe] group-hover:bg-[#bae6fd] flex items-center justify-center text-[#0284c7] shrink-0 shadow-sm transition-colors">
              <FileUp className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-base text-[#0b1c30]">
                Arrastra aquí tus archivos PDF, JPG o PNG para escaneo masivo
              </h3>
              <p className="text-xs text-[#2563eb] font-medium hover:underline mt-0.5">
                o Haz clic para explorar archivos locales
              </p>
              <p className="text-xs text-[#64748b] mt-1">
                Extracción multi-página de pólizas, acuerdos de concesionarias, hojas de pedido y facturas proforma.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-2 py-0.5 bg-[#f1f5f9] text-[#475569] text-[11px] font-medium rounded">
                  .PDF
                </span>
                <span className="px-2 py-0.5 bg-[#f1f5f9] text-[#475569] text-[11px] font-medium rounded">
                  .JPG, .PNG
                </span>
                <span className="text-[11px] text-[#94a3b8]">• Hasta 25 MB por archivo •</span>
                <span className="text-[11px] text-[#64748b]">Límite: 50 documentos por lote</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg shrink-0">
            <div className="w-8 h-8 rounded bg-[#e0f2fe] text-[#0284c7] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-[#0b1c30]">
                Auto-align & OCR de tablas
              </div>
              <div className="text-[11px] text-[#64748b]">
                Segmentación por coordenadas activa
              </div>
            </div>
          </div>
        </div>

        {/* Live Processing Queue Strip */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                Cola de Procesamiento en Vivo
              </h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                queue.length > 0 ? 'bg-[#dbeafe] text-[#1d4ed8]' : 'bg-[#f1f5f9] text-[#64748b]'
              }`}>
                {queue.length} cotizaciones {queue.length === 0 ? 'limpias' : 'en cola'}
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#64748b]">
              {queue.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllQueue}
                  className="flex items-center gap-1 text-[#dc2626] hover:text-[#991b1b] font-medium px-2.5 py-1 rounded bg-[#fef2f2] border border-[#fecaca] transition-colors cursor-pointer mr-2"
                  title="Eliminar todos los archivos de la cola"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpiar cola</span>
                </button>
              )}

              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#94a3b8]"></span>
                En espera
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#0284c7]"></span>
                Procesando
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10b981]"></span>
                Confirmado
              </span>
            </div>
          </div>

          {/* If Queue is Empty: Show Clean Empty State */}
          {queue.length === 0 ? (
            <div className="p-8 bg-white border border-dashed border-[#cbd5e1] rounded-xl text-center shadow-xs">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#ecfdf5] flex items-center justify-center text-[#059669]">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-sm text-[#0b1c30]">
                Cola de procesamiento vacía y limpia
              </h4>
              <p className="text-xs text-[#64748b] max-w-md mx-auto mt-1">
                Todos los archivos de la cola han sido removidos. Arrastra documentos PDF, JPG o PNG arriba o haz clic en el área de carga para procesar nuevas cotizaciones con el motor OCR.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-3.5 px-4 py-2 bg-[#001026] text-white rounded text-xs font-semibold hover:bg-[#134074] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-sm"
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Cargar cotizaciones</span>
              </button>
            </div>
          ) : (
            /* Queue Cards Grid populated strictly from dynamic queue */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {queue.map((item) => {
                const isSelected = activeQueueId === item.id;
                return (
                  <div 
                    key={item.id}
                    onClick={() => handleSelectQueueItem(item.id)}
                    className={`p-3 bg-white border rounded-lg cursor-pointer transition-all relative group ${
                      isSelected 
                        ? 'border-[#001026] ring-2 ring-[#001026]/10 shadow-md bg-[#f8fafc]' 
                        : 'border-[#e2e8f0] hover:border-[#cbd5e1]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2 truncate pr-4">
                        <FileText className="w-4 h-4 text-[#2563eb] shrink-0" />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-[#0b1c30] truncate" title={item.nombre}>
                            {item.nombre}
                          </div>
                          <div className="text-[10px] text-[#64748b]">
                            {item.tamano} • {item.categoria}
                          </div>
                        </div>
                      </div>

                      {/* Delete item button */}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteQueueItem(item.id, e)}
                        className="opacity-40 hover:opacity-100 text-[#64748b] hover:text-[#dc2626] p-1 rounded transition-opacity cursor-pointer shrink-0"
                        title="Eliminar de la cola"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      {item.estado === 'confirmado' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#ecfdf5] text-[#059669]">
                          <Check className="w-3 h-3" /> Confirmado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#eff6ff] text-[#1d4ed8]">
                          <Check className="w-3 h-3" /> Mapeado · {item.confianza}%
                        </span>
                      )}

                      {isSelected ? (
                        <span className="text-[10px] font-bold text-[#001026] uppercase">
                          En pantalla
                        </span>
                      ) : (
                        <Eye className="w-3.5 h-3.5 text-[#94a3b8]" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dual-Pane Layout: OCR Viewer (Left) + Form Mapping (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Left Pane: Document Viewer */}
          <div className="xl:col-span-6 bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden flex flex-col">
            {/* Viewer Toolbar */}
            <div className="p-3 border-b border-[#e2e8f0] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1 text-[#475569]">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  disabled={!currentDoc}
                  className={`p-1.5 rounded transition-colors ${!currentDoc ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#e2e8f0] cursor-pointer'}`}
                  title="Acercar (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  disabled={!currentDoc}
                  className={`p-1.5 rounded transition-colors ${!currentDoc ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#e2e8f0] cursor-pointer'}`}
                  title="Alejar (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  disabled={!currentDoc}
                  className={`p-1.5 rounded transition-colors ${!currentDoc ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#e2e8f0] cursor-pointer'}`}
                  title="Rotar 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => { setZoomLevel(100); setRotation(0); }}
                  disabled={!currentDoc}
                  className={`p-1.5 rounded transition-colors ${!currentDoc ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#e2e8f0] cursor-pointer'}`}
                  title="Ajustar a pantalla"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center gap-3 text-xs">
                {currentDoc?.isImage && currentDoc?.previewUrl && (
                  <div className="inline-flex p-0.5 bg-[#e2e8f0] rounded border border-[#cbd5e1] text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setViewerMode('cafi_template')}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                        viewerMode === 'cafi_template'
                          ? 'bg-white text-[#0b1c30] shadow-xs font-bold'
                          : 'text-[#64748b] hover:text-[#0b1c30]'
                      }`}
                    >
                      Plantilla CAFI
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewerMode('scanned_image')}
                      className={`px-2 py-0.5 rounded cursor-pointer transition-all ${
                        viewerMode === 'scanned_image'
                          ? 'bg-white text-[#0b1c30] shadow-xs font-bold'
                          : 'text-[#64748b] hover:text-[#0b1c30]'
                      }`}
                    >
                      Foto Original
                    </button>
                  </div>
                )}
                {currentDoc && (
                  <button
                    type="button"
                    onClick={() => setShowQuickEditModal(true)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer text-xs font-semibold shadow-2xs"
                    title="Editar y verificar manualmente cualquier valor detectado por OCR"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                    <span>Corregir Valores</span>
                  </button>
                )}
                <label className={`flex items-center gap-2 select-none font-medium text-[#334155] ${!currentDoc ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input
                    type="checkbox"
                    checked={highlightOcr}
                    disabled={!currentDoc}
                    onChange={(e) => setHighlightOcr(e.target.checked)}
                    className="rounded border-[#cbd5e1] text-[#001026] focus:ring-[#001026]"
                  />
                  <span>Resaltar zonas OCR</span>
                </label>
                <span className="font-mono text-[11px] text-[#64748b] bg-[#e2e8f0] px-2 py-0.5 rounded">
                  {zoomLevel}%
                </span>
              </div>
            </div>

            {/* Document Surface Canvas */}
            <div className="p-6 bg-[#cbd5e1]/30 overflow-auto flex justify-center items-start min-h-[540px] relative">
              {isRescanning && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center z-20">
                  <RotateCw className="w-8 h-8 text-[#001026] animate-spin mb-2" />
                  <span className="text-xs font-bold text-[#001026]">{scanStatusText}</span>
                  <div className="w-56 bg-slate-200 h-2 rounded-full overflow-hidden mt-2.5">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* If no document active in queue: show clean empty stage */}
              {!currentDoc ? (
                <div className="w-full max-w-[460px] bg-white border border-dashed border-[#cbd5e1] shadow-sm rounded-xl p-8 flex flex-col items-center justify-center text-center text-[#64748b] my-auto">
                  <div className="w-14 h-14 rounded-2xl bg-[#f8fafc] border border-[#e2e8f0] flex items-center justify-center text-[#94a3b8] mb-3">
                    <FileText className="w-7 h-7" />
                  </div>
                  <h4 className="font-display font-bold text-sm text-[#0b1c30]">
                    Sin documento activo en el visor
                  </h4>
                  <p className="text-xs text-[#64748b] max-w-sm mt-1">
                    La cola de procesamiento está limpia. Carga o arrastra un archivo de cotización para visualizar el escaneo de alta resolución y calibrar sus zonas OCR.
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-4 px-3.5 py-1.5 bg-[#001026] text-white rounded text-xs font-semibold hover:bg-[#134074] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Seleccionar archivo</span>
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                    transformOrigin: 'top center',
                    transition: 'transform 0.2s ease-out'
                  }}
                  className="w-full flex justify-center py-1"
                >
                  <CafiQuoteDocument
                    fields={mappableFields}
                    activeFieldId={activeFieldId}
                    onFieldClick={(fieldId) => {
                      setActiveFieldId(fieldId);
                      setActiveRightTab('mapping');
                    }}
                    showBoundingBoxes={highlightOcr}
                    uploadedImageUrl={currentDoc?.previewUrl}
                    viewMode={viewerMode}
                    isScanning={isRescanning}
                    scanProgress={scanProgress}
                  />
                </div>
              )}
            </div>

            {/* Viewer Footer */}
            <div className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between text-xs text-[#64748b]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#dc2626]" />
                <span className="font-medium text-[#0b1c30]">{currentDoc ? currentDoc.file : 'Sin archivo activo'}</span>
                {currentDoc && <span>({currentDoc.size} • 2480×3508 px)</span>}
              </div>
              {currentDoc && (
                <button
                  type="button"
                  onClick={() => setShowOriginalModal(true)}
                  className="flex items-center gap-1 text-[#2563eb] hover:underline font-medium cursor-pointer"
                >
                  <span>Abrir original</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Right Pane: Extracted Fields & Mapping Options */}
          <div className="xl:col-span-6 bg-white border border-[#e2e8f0] rounded-lg shadow-sm p-6 space-y-4">
            {/* Header & Mode Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#f1f5f9] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-[#eff6ff] text-[#2563eb] flex items-center justify-center">
                    <Settings2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-display font-bold text-base text-[#0b1c30]">
                    Configurador de Mapeo de Elementos
                  </h3>
                </div>
                <p className="text-xs text-[#64748b] mt-1">
                  {currentDoc ? (
                    <>Cotización <span className="font-mono font-semibold text-[#0b1c30]">#{extractedFields.folio}</span> • Selecciona qué datos mapear a la base de datos</>
                  ) : (
                    'Esperando documento en la cola de procesamiento'
                  )}
                </p>
              </div>

              {/* View Switcher Tabs */}
              <div className="inline-flex p-1 bg-[#f1f5f9] rounded-lg border border-[#e2e8f0] self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setActiveRightTab('mapping')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRightTab === 'mapping'
                      ? 'bg-white text-[#0b1c30] shadow-xs font-bold'
                      : 'text-[#64748b] hover:text-[#0b1c30]'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563eb]" />
                  <span>Opciones de Mapeo</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveRightTab('classic')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeRightTab === 'classic'
                      ? 'bg-white text-[#0b1c30] shadow-xs font-bold'
                      : 'text-[#64748b] hover:text-[#0b1c30]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-[#64748b]" />
                  <span>Formulario Clásico</span>
                </button>
              </div>
            </div>

            {/* Notice when queue is empty */}
            {!currentDoc && (
              <div className="p-3.5 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg text-xs text-[#64748b] flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#94a3b8] shrink-0" />
                <span>La cola de procesamiento está limpia. Al subir una cotización, sus elementos detectados se listarán para selección y mapeo.</span>
              </div>
            )}

            {/* Tab 1: Mappable Elements Configurator */}
            {activeRightTab === 'mapping' && (
              <div className={!currentDoc ? 'opacity-50 pointer-events-none select-none' : ''}>
                <FieldMappingConfigurator
                  fields={mappableFields}
                  onFieldsChange={handleMappableFieldsChange}
                  activeFieldId={activeFieldId}
                  onSelectField={setActiveFieldId}
                  onConfirmMapping={handleConfirmAction}
                  onOpenQuickEdit={() => setShowQuickEditModal(true)}
                />
              </div>
            )}

            {/* Tab 2: Classic Form Fields */}
            {activeRightTab === 'classic' && (
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleConfirmAction();
                }}
                className={`space-y-4 text-xs ${!currentDoc ? 'opacity-50 pointer-events-none select-none' : ''}`}
              >
              {/* Field 1: SOLICITANTE */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></span>
                    SOLICITANTE (Asesor)
                  </label>
                  <span className="text-[11px] font-semibold text-[#059669] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Confianza 96% (Alta)
                  </span>
                </div>
                <input
                  type="text"
                  value={extractedFields.solicitante}
                  disabled={!currentDoc}
                  onChange={(e) => handleExtractedFieldChange('solicitante', e.target.value)}
                  placeholder="Nombre del asesor solicitante"
                  className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded text-sm text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#001026] focus:border-[#001026] transition-all"
                />
                <p className="text-[11px] text-[#64748b] mt-1">
                  Identificado en bloque de firmas y cabecera del concesionario.
                </p>
              </div>

              {/* Field 2: ATENCIÓN */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#0b1c30] uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb]"></span>
                    ATENCIÓN (Asesora digital)
                  </label>
                  <span className="text-[11px] font-semibold text-[#059669] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Confianza 95% (Alta)
                  </span>
                </div>
                <select
                  value={extractedFields.atencion}
                  disabled={!currentDoc}
                  onChange={(e) => handleExtractedFieldChange('atencion', e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded text-sm text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#001026] focus:border-[#001026] transition-all"
                >
                  {DIGITAL_ADVISORS_INFO.map(adv => (
                    <option key={adv.name} value={adv.name}>{adv.name}</option>
                  ))}
                </select>
                <p className="text-[11px] text-[#64748b] mt-1">
                  Equipo digital Coti-CAFI: Lourdes Molina, Karina Gutiérrez, Ángeles Sánchez, Karely Carpio, Eleydi Ruiz.
                </p>
              </div>

              {/* Field 3 & 4: 2 columns row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Categoría de Flota */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#0b1c30] uppercase tracking-wider">
                      CATEGORÍA DE FLOTA
                    </label>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#eff6ff] text-[#2563eb] rounded">
                      98% Conf.
                    </span>
                  </div>
                  <select
                    value={extractedFields.categoria}
                    disabled={!currentDoc}
                    onChange={(e) => handleExtractedFieldChange('categoria', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded text-xs text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#001026]"
                  >
                    <option value="Seminuevos">Seminuevos</option>
                    <option value="Nuevos">Nuevos</option>
                    <option value="Sprinter">Sprinter</option>
                    <option value="Chofer App">Chofer App</option>
                    <option value="Camiones">Camiones</option>
                    <option value="Otros">Otros</option>
                  </select>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
                      #2563EB {extractedFields.categoria.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-[#64748b]">Taxonomía validada</span>
                  </div>
                </div>

                {/* Fecha de Emisión */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-semibold text-[#0b1c30] uppercase tracking-wider">
                      FECHA DE EMISIÓN
                    </label>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#eff6ff] text-[#2563eb] rounded">
                      95% Conf.
                    </span>
                  </div>
                  <input
                    type="date"
                    value={extractedFields.fechaEmision}
                    disabled={!currentDoc}
                    onChange={(e) => handleExtractedFieldChange('fechaEmision', e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#cbd5e1] rounded text-xs text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#001026]"
                  />
                  <p className="text-[10px] text-[#64748b] mt-1.5">
                    Vigencia de 15 días hábiles desde emisión
                  </p>
                </div>
              </div>

              {/* Field 5: FOLIO */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className={`font-semibold uppercase tracking-wider flex items-center gap-1 ${
                    currentDoc?.hasFolioAlert ? 'text-[#dc2626]' : 'text-[#0b1c30]'
                  }`}>
                    {currentDoc?.hasFolioAlert ? (
                      <AlertTriangle className="w-3.5 h-3.5 text-[#dc2626]" />
                    ) : (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#059669]" />
                    )}
                    FOLIO / N° DE COTIZACIÓN
                  </label>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded border ${
                    currentDoc?.hasFolioAlert 
                      ? 'text-[#dc2626] bg-[#fef2f2] border-[#fecaca]' 
                      : 'text-[#059669] bg-[#ecfdf5] border-[#a7f3d0]'
                  }`}>
                    {currentDoc?.hasFolioAlert ? 'Confianza 68% (Baja legibilidad)' : 'Confianza 98% (Validado)'}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={extractedFields.folio}
                    disabled={!currentDoc}
                    onChange={(e) => handleExtractedFieldChange('folio', e.target.value)}
                    className={`w-full px-3 py-2.5 rounded font-mono-code font-bold text-sm text-[#0b1c30] focus:outline-none transition-all ${
                      currentDoc?.hasFolioAlert 
                        ? 'bg-[#fffbeb] border-2 border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/40' 
                        : 'bg-white border border-[#cbd5e1] focus:ring-1 focus:ring-[#001026]'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#d97706] font-medium">
                    ✎ Editable
                  </span>
                </div>

                {currentDoc?.hasFolioAlert && (
                  <div className="p-3 bg-[#fff7ed] border border-[#ffedd5] rounded-lg text-xs text-[#9a3412] flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#ea580c] shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong className="text-[#c2410c]">Alerta del calibrador OCR:</strong> El área del folio presenta ruido óptico en el membrete superior. Valor sugerido: <span className="font-mono font-bold text-[#9a3412]">{extractedFields.folio}</span>. Valide visualmente con la caja del visor antes de confirmar.
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions Bar */}
            <div className="pt-5 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleRescan}
                disabled={!currentDoc}
                className={`flex items-center gap-1.5 px-3 py-2 bg-white border border-[#cbd5e1] text-[#dc2626] rounded text-xs font-semibold transition-colors ${
                  !currentDoc ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#f8fafc] cursor-pointer'
                }`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Descartar / Reprocesar</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSkipNext}
                  disabled={queue.length <= 1}
                  className={`flex items-center gap-1.5 px-3 py-2 bg-white border border-[#cbd5e1] text-[#334155] rounded text-xs font-semibold transition-colors ${
                    queue.length <= 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-[#f8fafc] cursor-pointer'
                  }`}
                >
                  <SkipForward className="w-3.5 h-3.5" />
                  <span>Saltar al siguiente</span>
                </button>

                {/* Confirm & Add button */}
                <button
                  type="submit"
                  disabled={!currentDoc}
                  className={`flex items-center gap-2 px-5 py-2.5 text-white rounded text-xs font-bold shadow-md transition-all transform ${
                    !currentDoc 
                      ? 'bg-[#94a3b8] opacity-50 cursor-not-allowed' 
                      : 'bg-[#001026] hover:bg-[#134074] active:bg-[#091e38] hover:shadow-lg active:scale-95 cursor-pointer'
                  }`}
                >
                  <Check className="w-4 h-4 text-[#38bdf8]" />
                  <span>Confirmar y agregar al compilado</span>
                </button>
              </div>
            </div>
          </form>
        )}

            {showNotification && (
              <div className="p-3 bg-[#ecfdf5] border border-[#a7f3d0] rounded text-xs text-[#065f46] font-medium flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span>¡Cotización {extractedFields.folio} confirmada! Redirigiendo al compilado del Dashboard...</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#001026] text-white px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-[#38bdf8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal: Document Full Preview */}
      {showOriginalModal && currentDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95 flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#dc2626]" />
                <div>
                  <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                    Visor de Alta Resolución: {currentDoc.file}
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    Escaneo óptico original de cotización automotriz con zonas de extracción
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowOriginalModal(false)}
                className="p-1.5 rounded text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#e2e8f0] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-auto flex justify-center bg-[#f1f5f9] flex-1">
              <CafiQuoteDocument
                fields={mappableFields}
                activeFieldId={activeFieldId}
                onFieldClick={(fieldId) => {
                  setActiveFieldId(fieldId);
                  setShowOriginalModal(false);
                  setActiveRightTab('mapping');
                }}
                showBoundingBoxes={true}
              />
            </div>

            <div className="p-3 border-t border-[#e2e8f0] flex justify-end gap-2 bg-[#f8fafc]">
              <button
                type="button"
                onClick={() => {
                  showToast(`Descargando ${currentDoc.file}...`);
                  setTimeout(() => {
                    const blob = new Blob([`Original Coti-CAFI: ${currentDoc.file}`], { type: 'application/pdf' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = currentDoc.file;
                    link.click();
                    URL.revokeObjectURL(url);
                  }, 300);
                }}
                className="px-3 py-1.5 bg-white border border-[#cbd5e1] text-[#334155] rounded text-xs font-semibold hover:bg-[#f1f5f9] flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Archivo Original</span>
              </button>
              <button
                type="button"
                onClick={() => setShowOriginalModal(false)}
                className="px-4 py-1.5 bg-[#001026] text-white rounded text-xs font-bold hover:bg-[#134074]"
              >
                Cerrar Visor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Quick OCR Editing and Validation */}
      {showQuickEditModal && (
        <QuickOcrEditModal
          isOpen={showQuickEditModal}
          onClose={() => setShowQuickEditModal(false)}
          fields={mappableFields}
          onSave={handleQuickEditSave}
          fileName={currentDoc?.file || 'Cotización'}
        />
      )}
    </div>
  );
};
