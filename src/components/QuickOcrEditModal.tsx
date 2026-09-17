import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Car, 
  Calendar, 
  DollarSign, 
  UserCheck, 
  ShieldCheck, 
  CreditCard,
  Hash,
  Layers,
  AlertCircle
} from 'lucide-react';
import { MappableField, VehicleCategory } from '../types';
import { DIGITAL_ADVISORS_INFO } from '../data/cafiQuoteData';

interface QuickOcrEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  fields: MappableField[];
  onSave: (updatedFields: MappableField[]) => void;
}

export const QuickOcrEditModal: React.FC<QuickOcrEditModalProps> = ({
  isOpen,
  onClose,
  fileName,
  fields,
  onSave
}) => {
  if (!isOpen) return null;

  // Local state for all editable values
  const getFieldVal = (id: string) => fields.find(f => f.id === id)?.value || '';

  const [folio, setFolio] = useState(getFieldVal('folio') || 'COT-CAFI-2026-0409');
  const [fecha, setFecha] = useState(getFieldVal('fecha_emision') || '04/09/2026 17:05');
  const [vigencia, setVigencia] = useState(getFieldVal('vigencia_cotizacion') || 'sep-26');
  const [asesorLinea, setAsesorLinea] = useState(getFieldVal('asesor_linea') || 'NUEVOS');
  const [atencion, setAtencion] = useState(getFieldVal('atencion_asesora') || 'Lourdes Molina (LULÚ)');
  const [tipoUnidad, setTipoUnidad] = useState(getFieldVal('tipo_unidad') || 'CT CHEVROLET AVEO HB LT PLUS C');
  const [modeloAnio, setModeloAnio] = useState(getFieldVal('modelo_anio') || '2026');
  const [precioLista, setPrecioLista] = useState(getFieldVal('precio_lista') || '$378,900');
  const [montoSeguro, setMontoSeguro] = useState(getFieldVal('monto_seguro') || '$21,000.00');
  const [tipoSeguro, setTipoSeguro] = useState(getFieldVal('tipo_seguro') || 'AMPLIA QUALITAS');
  const [enganche, setEnganche] = useState(getFieldVal('enganche_porcentaje') || '25% • $94,725.00');
  const [pago72, setPago72] = useState(getFieldVal('mensualidad_72') || '$11,400.00');
  const [pago60, setPago60] = useState(getFieldVal('mensualidad_60') || '$12,800.00');
  const [pago48, setPago48] = useState(getFieldVal('mensualidad_48') || '$14,900.00');

  const handleSave = () => {
    const updated = fields.map(field => {
      switch (field.id) {
        case 'folio':
          return { ...field, value: folio, confidence: 100 };
        case 'fecha_emision':
          return { ...field, value: fecha, confidence: 100 };
        case 'vigencia_cotizacion':
          return { ...field, value: vigencia, confidence: 100 };
        case 'asesor_linea':
          return { ...field, value: asesorLinea, confidence: 100 };
        case 'atencion_asesora':
          return { ...field, value: atencion, confidence: 100 };
        case 'tipo_unidad':
          return { ...field, value: tipoUnidad, confidence: 100 };
        case 'modelo_anio':
          return { ...field, value: modeloAnio, confidence: 100 };
        case 'precio_lista':
          return { ...field, value: precioLista, confidence: 100 };
        case 'monto_seguro':
          return { ...field, value: montoSeguro, confidence: 100 };
        case 'tipo_seguro':
          return { ...field, value: tipoSeguro, confidence: 100 };
        case 'enganche_porcentaje':
          return { ...field, value: enganche, confidence: 100 };
        case 'mensualidad_72':
          return { ...field, value: pago72, confidence: 100 };
        case 'mensualidad_60':
          return { ...field, value: pago60, confidence: 100 };
        case 'mensualidad_48':
          return { ...field, value: pago48, confidence: 100 };
        default:
          return field;
      }
    });

    onSave(updated);
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#001026] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Corrector de Datos OCR</h3>
              <p className="text-xs text-slate-300">
                Archivo: <span className="font-mono text-white">{fileName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-2.5 flex items-center gap-2 text-xs text-blue-800">
          <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Puedes corregir manualmente cualquier dato leído por el escáner. Al guardar, se actualizará el documento, el mapeo y la base compilada.</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 flex-1">
          
          {/* Section 1: Folio & Emision */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-3">
              <Hash className="w-4 h-4 text-blue-600" />
              <span>1. Folio y Datos de Emisión</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Folio Cotización</label>
                <input
                  type="text"
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-mono text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Fecha de Emisión</label>
                <input
                  type="text"
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Vigencia</label>
                <input
                  type="text"
                  value={vigencia}
                  onChange={(e) => setVigencia(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Advisor & Line */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-3">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>2. Canal y Asesor(a) Digital</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Línea de Inventario</label>
                <select
                  value={asesorLinea}
                  onChange={(e) => setAsesorLinea(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                >
                  <option value="NUEVOS">NUEVOS</option>
                  <option value="SEMINUEVOS">SEMINUEVOS</option>
                  <option value="SPRINTER">SPRINTER</option>
                  <option value="CHOFER APP">CHOFER APP</option>
                  <option value="CAMIONES">CAMIONES</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Asesora Digital Emisora</label>
                <input
                  type="text"
                  value={atencion}
                  onChange={(e) => setAtencion(e.target.value)}
                  placeholder="Ej. Lourdes Molina (LULÚ)"
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Vehicle & Price */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-3">
              <Car className="w-4 h-4 text-indigo-600" />
              <span>3. Vehículo y Precios</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Descripción de la Unidad</label>
                <input
                  type="text"
                  value={tipoUnidad}
                  onChange={(e) => setTipoUnidad(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Año / Modelo</label>
                <input
                  type="text"
                  value={modeloAnio}
                  onChange={(e) => setModeloAnio(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Precio de Lista</label>
                <input
                  type="text"
                  value={precioLista}
                  onChange={(e) => setPrecioLista(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded font-bold text-xs text-emerald-700 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Monto Seguro Anual</label>
                <input
                  type="text"
                  value={montoSeguro}
                  onChange={(e) => setMontoSeguro(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tipo de Seguro</label>
                <input
                  type="text"
                  value={tipoSeguro}
                  onChange={(e) => setTipoSeguro(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Financing */}
          <div>
            <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm mb-3">
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>4. Plan Financiero y Mensualidades</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Enganche</label>
                <input
                  type="text"
                  value={enganche}
                  onChange={(e) => setEnganche(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mensualidad 72M</label>
                <input
                  type="text"
                  value={pago72}
                  onChange={(e) => setPago72(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mensualidad 60M</label>
                <input
                  type="text"
                  value={pago60}
                  onChange={(e) => setPago60(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Mensualidad 48M</label>
                <input
                  type="text"
                  value={pago48}
                  onChange={(e) => setPago48(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>
            </div>
          </div>

          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#001026] text-white text-xs font-bold rounded-lg hover:bg-blue-950 flex items-center gap-2 shadow-xs transition-all cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Guardar y Aplicar Correcciones</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
