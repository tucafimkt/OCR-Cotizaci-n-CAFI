import { MappableField } from '../types';

export const initialCafiMappableFields: MappableField[] = [
  // 1. Datos de Emisión y Asesoría
  {
    id: 'fecha_emision',
    category: 'emision',
    label: 'Fecha y Hora de Cotización',
    originalName: 'Fecha',
    value: '04/09/2026 17:05',
    targetColumn: 'fecha_emision',
    confidence: 99,
    enabled: true,
    required: true
  },
  {
    id: 'vigencia_cotizacion',
    category: 'emision',
    label: 'Vigencia de Cotización',
    originalName: 'Vigencia Cotizacion',
    value: 'sep-26',
    targetColumn: 'vigencia',
    confidence: 98,
    enabled: true
  },
  {
    id: 'asesor_linea',
    category: 'emision',
    label: 'Línea / Canal Asesor (Resaltado)',
    originalName: 'Asesor',
    value: 'NUEVOS',
    targetColumn: 'linea_inventario',
    confidence: 99,
    enabled: true,
    required: true
  },
  {
    id: 'atencion_asesora',
    category: 'emision',
    label: 'Asesora Digital Emisora',
    originalName: 'LULÚ (Pie de documento)',
    value: 'Lourdes Molina (LULÚ)',
    targetColumn: 'atencion_digital',
    confidence: 99,
    enabled: true,
    required: true
  },
  {
    id: 'email_contacto',
    category: 'emision',
    label: 'E-mail y Teléfono de Contacto',
    originalName: 'E-mail / Tel.',
    value: 'coordinador.digital@tucafi.com • Tel. (967) 674 05 39 Ext.435',
    targetColumn: 'canal_contacto',
    confidence: 96,
    enabled: false
  },

  // 2. Especificaciones de la Unidad
  {
    id: 'tipo_unidad',
    category: 'vehiculo',
    label: 'Tipo y Descripción de Unidad',
    originalName: 'Tipo de Unidad',
    value: 'CT CHEVROLET AVEO HB LT PLUS C',
    targetColumn: 'vehiculo_descripcion',
    confidence: 99,
    enabled: true,
    required: true
  },
  {
    id: 'modelo_anio',
    category: 'vehiculo',
    label: 'Año / Modelo',
    originalName: 'Modelo',
    value: '2026',
    targetColumn: 'vehiculo_anio',
    confidence: 99,
    enabled: true,
    required: true
  },
  {
    id: 'precio_lista',
    category: 'vehiculo',
    label: 'Precio de la Unidad',
    originalName: 'Precio',
    value: '$378,900',
    targetColumn: 'precio_lista',
    confidence: 99,
    enabled: true,
    required: true
  },
  {
    id: 'accesorios',
    category: 'vehiculo',
    label: 'Accesorios Adicionales',
    originalName: 'Accesorios',
    value: 'Sin accesorios especificados',
    targetColumn: 'accesorios_detalle',
    confidence: 92,
    enabled: false
  },

  // 3. Seguro y Perfil del Cliente
  {
    id: 'monto_seguro',
    category: 'seguro',
    label: 'Monto de Seguro Anual',
    originalName: 'Monto de seguro',
    value: '$21,000.00',
    targetColumn: 'costo_seguro',
    confidence: 98,
    enabled: true
  },
  {
    id: 'tipo_seguro',
    category: 'seguro',
    label: 'Tipo de Seguro y Cobertura',
    originalName: 'Tipo de Seguro',
    value: 'AMPLIA QUALITAS',
    targetColumn: 'aseguradora_cobertura',
    confidence: 99,
    enabled: true
  },
  {
    id: 'uso_unidad',
    category: 'seguro',
    label: 'Uso de la Unidad',
    originalName: 'Uso',
    value: 'PARTICULAR',
    targetColumn: 'tipo_uso',
    confidence: 98,
    enabled: true
  },
  {
    id: 'tipo_cliente',
    category: 'seguro',
    label: 'Régimen / Tipo de Cliente',
    originalName: 'Tipo de Cliente',
    value: 'FÍSICA',
    targetColumn: 'tipo_persona',
    confidence: 97,
    enabled: true
  },
  {
    id: 'estado_cp',
    category: 'seguro',
    label: 'Estado y Código Postal',
    originalName: 'Estado',
    value: 'VERACRUZ (C.P. 95400)',
    targetColumn: 'plaza_radicacion',
    confidence: 98,
    enabled: true
  },
  {
    id: 'apertura_credito',
    category: 'seguro',
    label: 'Comisión por Apertura de Crédito',
    originalName: 'Apertura de Crédito',
    value: '$0.00 (Sin costo)',
    targetColumn: 'comision_apertura',
    confidence: 99,
    enabled: true
  },

  // 4. Esquema Financiero y Tabla de Plazos
  {
    id: 'plan_financiero',
    category: 'financiero',
    label: 'Modalidad de Financiamiento',
    originalName: 'Plan Tradicional (Cd)',
    value: 'Plan Tradicional',
    targetColumn: 'esquema_financiero',
    confidence: 99,
    enabled: true
  },
  {
    id: 'enganche_porcentaje',
    category: 'financiero',
    label: 'Porcentaje y Monto de Enganche',
    originalName: 'Enganche / Monto Enganche',
    value: '25% • $99,975',
    targetColumn: 'monto_enganche',
    confidence: 99,
    enabled: true,
    required: true
  },
  {
    id: 'mensualidad_72',
    category: 'financiero',
    label: 'Plazo 72 Meses (Pago Mensual)',
    originalName: 'Fila Plazo 72 Meses',
    value: '$10,389 (Seg. Financiado) / $9,669 (Seg. Contado)',
    targetColumn: 'mensualidad_plazo_maximo',
    confidence: 99,
    enabled: true
  },
  {
    id: 'mensualidad_60',
    category: 'financiero',
    label: 'Plazo 60 Meses (Pago Mensual)',
    originalName: 'Fila Plazo 60 Meses',
    value: '$11,223 (Seg. Financiado) / $10,444 (Seg. Contado)',
    targetColumn: 'mensualidad_60m',
    confidence: 99,
    enabled: false
  },
  {
    id: 'mensualidad_48',
    category: 'financiero',
    label: 'Plazo 48 Meses (Pago Mensual)',
    originalName: 'Fila Plazo 48 Meses',
    value: '$12,472 (Seg. Financiado) / $11,606 (Seg. Contado)',
    targetColumn: 'mensualidad_48m',
    confidence: 99,
    enabled: false
  },
  {
    id: 'mensualidad_36',
    category: 'financiero',
    label: 'Plazo 36 Meses (Pago Mensual)',
    originalName: 'Fila Plazo 36 Meses',
    value: '$14,555 (Seg. Financiado) / $13,543 (Seg. Contado)',
    targetColumn: 'mensualidad_36m',
    confidence: 99,
    enabled: false
  },
  {
    id: 'mensualidad_24',
    category: 'financiero',
    label: 'Plazo 24 Meses (Pago Mensual)',
    originalName: 'Fila Plazo 24 Meses',
    value: '$18,721 (Seg. Financiado) / $17,417 (Seg. Contado)',
    targetColumn: 'mensualidad_24m',
    confidence: 99,
    enabled: false
  },
  {
    id: 'bonificacion_pago',
    category: 'financiero',
    label: 'Bonificación por Pago Puntual',
    originalName: 'NOTA Bonificación',
    value: '$100.00 de bonificación mensual',
    targetColumn: 'bonificacion_puntual',
    confidence: 97,
    enabled: true
  }
];

export const databaseColumnsAvailable = [
  { value: 'fecha_emision', label: 'Fecha y Hora (fecha_emision)' },
  { value: 'vigencia', label: 'Vigencia de Oferta (vigencia)' },
  { value: 'linea_inventario', label: 'Categoría / Línea (linea_inventario)' },
  { value: 'atencion_digital', label: 'Asesora Digital (atencion_digital)' },
  { value: 'canal_contacto', label: 'Datos de Contacto (canal_contacto)' },
  { value: 'vehiculo_descripcion', label: 'Descripción de Unidad (vehiculo_descripcion)' },
  { value: 'vehiculo_anio', label: 'Año / Modelo (vehiculo_anio)' },
  { value: 'precio_lista', label: 'Precio Total de Lista (precio_lista)' },
  { value: 'accesorios_detalle', label: 'Accesorios (accesorios_detalle)' },
  { value: 'costo_seguro', label: 'Prima Anual Seguro (costo_seguro)' },
  { value: 'aseguradora_cobertura', label: 'Aseguradora y Póliza (aseguradora_cobertura)' },
  { value: 'tipo_uso', label: 'Uso Declarado (tipo_uso)' },
  { value: 'tipo_persona', label: 'Tipo Persona Fiscal (tipo_persona)' },
  { value: 'plaza_radicacion', label: 'Plaza / Estado (plaza_radicacion)' },
  { value: 'comision_apertura', label: 'Comisión Apertura (comision_apertura)' },
  { value: 'esquema_financiero', label: 'Esquema Financiero (esquema_financiero)' },
  { value: 'monto_enganche', label: 'Monto y % Enganche (monto_enganche)' },
  { value: 'mensualidad_plazo_maximo', label: 'Mensualidad 72m (mensualidad_plazo_maximo)' },
  { value: 'mensualidad_60m', label: 'Mensualidad 60m (mensualidad_60m)' },
  { value: 'mensualidad_48m', label: 'Mensualidad 48m (mensualidad_48m)' },
  { value: 'mensualidad_36m', label: 'Mensualidad 36m (mensualidad_36m)' },
  { value: 'mensualidad_24m', label: 'Mensualidad 24m (mensualidad_24m)' },
  { value: 'bonificacion_puntual', label: 'Bonificación Puntual (bonificacion_puntual)' }
];

export const DIGITAL_ADVISORS_INFO = [
  { name: 'Lourdes Molina', nick: 'LULÚ', email: 'coordinador.digital@tucafi.com', ext: '435' },
  { name: 'Karina Gutiérrez', nick: 'KARI', email: 'ventas.digital@tucafi.com', ext: '436' },
  { name: 'Ángeles Sánchez', nick: 'ANGIE', email: 'asesor.digital1@tucafi.com', ext: '438' },
  { name: 'Karely Carpio', nick: 'KARE', email: 'asesor.digital2@tucafi.com', ext: '439' },
  { name: 'Eleydi Ruiz', nick: 'ELEY', email: 'atencion.digital@tucafi.com', ext: '440' }
];

export interface GenerateMappableFieldsParams {
  folio?: string;
  fechaEmision?: string;
  vigencia?: string;
  asesorLinea?: string;
  asesorNombre?: string;
  emailContacto?: string;
  tipoUnidad?: string;
  modeloAnio?: string;
  precioLista?: string;
  accesorios?: string;
  montoSeguro?: string;
  tipoSeguro?: string;
  usoUnidad?: string;
  tipoCliente?: string;
  estadoCp?: string;
  aperturaCredito?: string;
  planFinanciero?: string;
  enganchePorcentaje?: string;
  mensualidad72?: string;
  mensualidad60?: string;
  mensualidad48?: string;
  mensualidad36?: string;
  mensualidad24?: string;
  bonificacionPago?: string;
}

export function createMappableFields(params: GenerateMappableFieldsParams): MappableField[] {
  return [
    {
      id: 'fecha_emision',
      category: 'emision',
      label: 'Fecha y Hora de Cotización',
      originalName: 'Fecha',
      value: params.fechaEmision || '10/09/2026 15:45',
      targetColumn: 'fecha_emision',
      confidence: 99,
      enabled: true,
      required: true
    },
    {
      id: 'vigencia_cotizacion',
      category: 'emision',
      label: 'Vigencia de Cotización',
      originalName: 'Vigencia Cotizacion',
      value: params.vigencia || 'sep-26',
      targetColumn: 'vigencia',
      confidence: 98,
      enabled: true
    },
    {
      id: 'asesor_linea',
      category: 'emision',
      label: 'Línea / Canal Asesor (Resaltado)',
      originalName: 'Asesor',
      value: params.asesorLinea || 'NUEVOS',
      targetColumn: 'linea_inventario',
      confidence: 99,
      enabled: true,
      required: true
    },
    {
      id: 'atencion_asesora',
      category: 'emision',
      label: 'Asesora Digital Emisora',
      originalName: 'Asesora Digital',
      value: params.asesorNombre || 'Lourdes Molina (LULÚ)',
      targetColumn: 'atencion_digital',
      confidence: 99,
      enabled: true,
      required: true
    },
    {
      id: 'email_contacto',
      category: 'emision',
      label: 'E-mail y Teléfono de Contacto',
      originalName: 'E-mail / Tel.',
      value: params.emailContacto || 'coordinador.digital@tucafi.com • Tel. (967) 674 05 39 Ext.435',
      targetColumn: 'canal_contacto',
      confidence: 96,
      enabled: false
    },
    {
      id: 'tipo_unidad',
      category: 'vehiculo',
      label: 'Tipo y Descripción de Unidad',
      originalName: 'Tipo de Unidad',
      value: params.tipoUnidad || 'CT CHEVROLET AVEO HB LT PLUS C',
      targetColumn: 'vehiculo_descripcion',
      confidence: 99,
      enabled: true,
      required: true
    },
    {
      id: 'modelo_anio',
      category: 'vehiculo',
      label: 'Año / Modelo',
      originalName: 'Modelo',
      value: params.modeloAnio || '2026',
      targetColumn: 'vehiculo_anio',
      confidence: 99,
      enabled: true,
      required: true
    },
    {
      id: 'precio_lista',
      category: 'vehiculo',
      label: 'Precio de la Unidad',
      originalName: 'Precio',
      value: params.precioLista || '$378,900',
      targetColumn: 'precio_lista',
      confidence: 99,
      enabled: true,
      required: true
    },
    {
      id: 'accesorios',
      category: 'vehiculo',
      label: 'Accesorios Adicionales',
      originalName: 'Accesorios',
      value: params.accesorios || 'Sin accesorios especificados',
      targetColumn: 'accesorios_detalle',
      confidence: 92,
      enabled: false
    },
    {
      id: 'monto_seguro',
      category: 'seguro',
      label: 'Monto de Seguro Anual',
      originalName: 'Monto de seguro',
      value: params.montoSeguro || '$21,000.00',
      targetColumn: 'costo_seguro',
      confidence: 98,
      enabled: true
    },
    {
      id: 'tipo_seguro',
      category: 'seguro',
      label: 'Tipo de Seguro y Cobertura',
      originalName: 'Tipo de Seguro',
      value: params.tipoSeguro || 'AMPLIA QUALITAS',
      targetColumn: 'aseguradora_cobertura',
      confidence: 99,
      enabled: true
    },
    {
      id: 'uso_unidad',
      category: 'seguro',
      label: 'Uso de la Unidad',
      originalName: 'Uso',
      value: params.usoUnidad || 'PARTICULAR',
      targetColumn: 'tipo_uso',
      confidence: 98,
      enabled: true
    },
    {
      id: 'tipo_cliente',
      category: 'seguro',
      label: 'Régimen / Tipo de Cliente',
      originalName: 'Tipo de Cliente',
      value: params.tipoCliente || 'FÍSICA',
      targetColumn: 'tipo_persona',
      confidence: 97,
      enabled: true
    },
    {
      id: 'estado_cp',
      category: 'seguro',
      label: 'Estado y Código Postal',
      originalName: 'Estado',
      value: params.estadoCp || 'VERACRUZ (C.P. 95400)',
      targetColumn: 'plaza_radicacion',
      confidence: 98,
      enabled: true
    },
    {
      id: 'apertura_credito',
      category: 'seguro',
      label: 'Comisión por Apertura de Crédito',
      originalName: 'Apertura de Crédito',
      value: params.aperturaCredito || '$0.00 (Sin costo)',
      targetColumn: 'comision_apertura',
      confidence: 99,
      enabled: true
    },
    {
      id: 'plan_financiero',
      category: 'financiero',
      label: 'Modalidad de Financiamiento',
      originalName: 'Plan Tradicional (Cd)',
      value: params.planFinanciero || 'Plan Tradicional',
      targetColumn: 'esquema_financiero',
      confidence: 99,
      enabled: true
    },
    {
      id: 'enganche_porcentaje',
      category: 'financiero',
      label: 'Porcentaje y Monto de Enganche',
      originalName: 'Enganche / Monto Enganche',
      value: params.enganchePorcentaje || '25% • $99,975',
      targetColumn: 'monto_enganche',
      confidence: 99,
      enabled: true,
      required: true
    },
    {
      id: 'mensualidad_72',
      category: 'financiero',
      label: 'Plazo 72 Meses (Pago Mensual)',
      originalName: 'Fila Plazo 72 Meses',
      value: params.mensualidad72 || '$10,389 (Seg. Financiado) / $9,669 (Seg. Contado)',
      targetColumn: 'mensualidad_plazo_maximo',
      confidence: 99,
      enabled: true
    },
    {
      id: 'mensualidad_60',
      category: 'financiero',
      label: 'Plazo 60 Meses (Pago Mensual)',
      originalName: 'Fila Plazo 60 Meses',
      value: params.mensualidad60 || '$11,223 (Seg. Financiado) / $10,444 (Seg. Contado)',
      targetColumn: 'mensualidad_60m',
      confidence: 99,
      enabled: false
    },
    {
      id: 'mensualidad_48',
      category: 'financiero',
      label: 'Plazo 48 Meses (Pago Mensual)',
      originalName: 'Fila Plazo 48 Meses',
      value: params.mensualidad48 || '$12,472 (Seg. Financiado) / $11,606 (Seg. Contado)',
      targetColumn: 'mensualidad_48m',
      confidence: 99,
      enabled: false
    },
    {
      id: 'mensualidad_36',
      category: 'financiero',
      label: 'Plazo 36 Meses (Pago Mensual)',
      originalName: 'Fila Plazo 36 Meses',
      value: params.mensualidad36 || '$14,555 (Seg. Financiado) / $13,543 (Seg. Contado)',
      targetColumn: 'mensualidad_36m',
      confidence: 99,
      enabled: false
    },
    {
      id: 'mensualidad_24',
      category: 'financiero',
      label: 'Plazo 24 Meses (Pago Mensual)',
      originalName: 'Fila Plazo 24 Meses',
      value: params.mensualidad24 || '$18,721 (Seg. Financiado) / $17,417 (Seg. Contado)',
      targetColumn: 'mensualidad_24m',
      confidence: 99,
      enabled: false
    },
    {
      id: 'bonificacion_pago',
      category: 'financiero',
      label: 'Bonificación por Pago Puntual',
      originalName: 'NOTA Bonificación',
      value: params.bonificacionPago || '$100.00 de bonificación mensual',
      targetColumn: 'bonificacion_puntual',
      confidence: 97,
      enabled: true
    }
  ];
}

