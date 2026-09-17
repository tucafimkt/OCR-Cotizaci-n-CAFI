import React, { useState } from 'react';
import { 
  Check, 
  CheckSquare, 
  Square, 
  Sparkles, 
  Layers, 
  Settings2, 
  Sliders, 
  Eye, 
  AlertCircle, 
  HelpCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Edit3
} from 'lucide-react';
import { MappableField } from '../types';
import { databaseColumnsAvailable } from '../data/cafiQuoteData';

interface FieldMappingConfiguratorProps {
  fields: MappableField[];
  onFieldsChange: (updatedFields: MappableField[]) => void;
  activeFieldId?: string;
  onSelectField: (fieldId: string) => void;
  onConfirmMapping: () => void;
  onOpenQuickEdit?: () => void;
}

export const FieldMappingConfigurator: React.FC<FieldMappingConfiguratorProps> = ({
  fields,
  onFieldsChange,
  activeFieldId,
  onSelectField,
  onConfirmMapping,
  onOpenQuickEdit
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<'all' | 'emision' | 'vehiculo' | 'seguro' | 'financiero'>('all');

  const enabledCount = fields.filter(f => f.enabled).length;
  const totalCount = fields.length;

  const handleToggleField = (id: string) => {
    const updated = fields.map(f => f.id === id ? { ...f, enabled: !f.enabled } : f);
    onFieldsChange(updated);
  };

  const handleValueChange = (id: string, newVal: string) => {
    const updated = fields.map(f => f.id === id ? { ...f, value: newVal } : f);
    onFieldsChange(updated);
  };

  const handleTargetColumnChange = (id: string, newCol: string) => {
    const updated = fields.map(f => f.id === id ? { ...f, targetColumn: newCol } : f);
    onFieldsChange(updated);
  };

  // Presets
  const handleSelectAll = () => {
    onFieldsChange(fields.map(f => ({ ...f, enabled: true })));
  };

  const handleDeselectAll = () => {
    onFieldsChange(fields.map(f => ({ ...f, enabled: false })));
  };

  const handlePresetEssentials = () => {
    const essentialIds = [
      'fecha_emision',
      'asesor_linea',
      'atencion_asesora',
      'tipo_unidad',
      'modelo_anio',
      'precio_lista',
      'enganche_porcentaje',
      'mensualidad_72'
    ];
    onFieldsChange(fields.map(f => ({
      ...f,
      enabled: essentialIds.includes(f.id)
    })));
  };

  const handlePresetFinancial = () => {
    const financialIds = [
      'tipo_unidad',
      'precio_lista',
      'monto_seguro',
      'tipo_seguro',
      'plan_financiero',
      'enganche_porcentaje',
      'mensualidad_72',
      'mensualidad_60',
      'mensualidad_48',
      'mensualidad_36',
      'mensualidad_24',
      'bonificacion_pago'
    ];
    onFieldsChange(fields.map(f => ({
      ...f,
      enabled: financialIds.includes(f.id)
    })));
  };

  // Filtering
  const filteredFields = fields.filter(field => {
    const matchesCategory = selectedCategoryTab === 'all' || field.category === selectedCategoryTab;
    const matchesSearch = searchFilter.trim() === '' || 
      field.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
      field.originalName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      field.value.toLowerCase().includes(searchFilter.toLowerCase()) ||
      field.targetColumn.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryLabels = {
    emision: { label: 'Cabecera y Asesoría', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    vehiculo: { label: 'Vehículo y Precio', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    seguro: { label: 'Póliza y Perfil Cliente', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    financiero: { label: 'Esquema Financiero y Pagos', color: 'bg-amber-50 text-amber-800 border-amber-200' }
  };

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-xl shadow-xs overflow-hidden flex flex-col h-full">
      {/* Top Header */}
      <div className="p-5 border-b border-[#e2e8f0] bg-[#fcfdfd]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#001026] text-white">
                <Settings2 className="w-4 h-4" />
              </span>
              <h2 className="font-display font-bold text-base text-[#0b1c30]">
                Opciones de Mapeo de Elementos OCR
              </h2>
            </div>
            <p className="text-xs text-[#64748b] mt-1">
              Activa o desactiva qué elementos de la cotización deseas extraer y asignar a cada columna del compilado Coti-CAFI.
            </p>
          </div>

          {/* Badge count & quick edit */}
          <div className="flex items-center gap-2">
            {onOpenQuickEdit && (
              <button
                type="button"
                onClick={onOpenQuickEdit}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors cursor-pointer shadow-2xs"
              >
                <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                <span>Corregir Datos OCR</span>
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2563eb]" />
              {enabledCount} de {totalCount} elementos seleccionados
            </span>
          </div>
        </div>

        {/* Quick Presets Buttons */}
        <div className="mt-4 pt-3 border-t border-[#f1f5f9] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-[#475569] uppercase tracking-wider mr-1">
            Plantillas Rápidas:
          </span>
          <button
            type="button"
            onClick={handleSelectAll}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-[#cbd5e1] text-[#334155] hover:bg-[#f8fafc] hover:border-[#94a3b8] transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#059669]" />
            <span>Mapear Todo ({totalCount})</span>
          </button>
          <button
            type="button"
            onClick={handlePresetEssentials}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-[#cbd5e1] text-[#334155] hover:bg-[#f8fafc] hover:border-[#94a3b8] transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2563eb]" />
            <span>Solo Esenciales (8)</span>
          </button>
          <button
            type="button"
            onClick={handlePresetFinancial}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-[#cbd5e1] text-[#334155] hover:bg-[#f8fafc] hover:border-[#94a3b8] transition-colors cursor-pointer inline-flex items-center gap-1"
          >
            <Layers className="w-3.5 h-3.5 text-[#d97706]" />
            <span>Financiero & Póliza</span>
          </button>
          <button
            type="button"
            onClick={handleDeselectAll}
            className="px-2.5 py-1 text-xs font-medium rounded-md bg-white border border-[#cbd5e1] text-[#64748b] hover:bg-[#fef2f2] hover:text-[#dc2626] transition-colors cursor-pointer inline-flex items-center gap-1 ml-auto"
          >
            <Square className="w-3.5 h-3.5" />
            <span>Deseleccionar todo</span>
          </button>
        </div>

        {/* Category Tabs & Search Filter */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('all')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
                selectedCategoryTab === 'all'
                  ? 'bg-[#001026] text-white font-semibold'
                  : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
              }`}
            >
              Todos ({fields.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('emision')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
                selectedCategoryTab === 'emision'
                  ? 'bg-[#001026] text-white font-semibold'
                  : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
              }`}
            >
              Emisión ({fields.filter(f => f.category === 'emision').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('vehiculo')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
                selectedCategoryTab === 'vehiculo'
                  ? 'bg-[#001026] text-white font-semibold'
                  : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
              }`}
            >
              Vehículo ({fields.filter(f => f.category === 'vehiculo').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('seguro')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
                selectedCategoryTab === 'seguro'
                  ? 'bg-[#001026] text-white font-semibold'
                  : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
              }`}
            >
              Póliza ({fields.filter(f => f.category === 'seguro').length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryTab('financiero')}
              className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
                selectedCategoryTab === 'financiero'
                  ? 'bg-[#001026] text-white font-semibold'
                  : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
              }`}
            >
              Financiamiento ({fields.filter(f => f.category === 'financiero').length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar elemento..."
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-md text-[#0b1c30] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#001026]"
            />
          </div>
        </div>
      </div>

      {/* Field List Container */}
      <div className="p-4 space-y-3 overflow-y-auto flex-1 max-h-[640px]">
        {filteredFields.length === 0 ? (
          <div className="p-8 text-center text-[#64748b] bg-[#f8fafc] rounded-lg border border-dashed border-[#cbd5e1]">
            <AlertCircle className="w-6 h-6 mx-auto mb-2 text-[#94a3b8]" />
            <p className="text-xs">No se encontraron elementos con los filtros seleccionados.</p>
          </div>
        ) : (
          filteredFields.map((field) => {
            const isSelected = field.enabled;
            const isHighlighted = activeFieldId === field.id;
            const catInfo = categoryLabels[field.category];

            return (
              <div
                key={field.id}
                onClick={() => onSelectField(field.id)}
                className={`p-3.5 rounded-lg border transition-all relative ${
                  isHighlighted
                    ? 'border-[#2563eb] ring-2 ring-[#2563eb]/20 bg-[#eff6ff]/30 shadow-xs'
                    : isSelected
                    ? 'border-[#cbd5e1] bg-white hover:border-[#94a3b8]'
                    : 'border-[#e2e8f0] bg-[#f8fafc]/70 opacity-75 hover:opacity-100'
                }`}
              >
                {/* Header Row: Checkbox, Name, Category Tag, Confidence */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Checkbox Toggle */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleField(field.id);
                      }}
                      className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#001026] text-white hover:bg-[#134074]'
                          : 'border-2 border-[#94a3b8] hover:border-[#475569] bg-white'
                      }`}
                      title={isSelected ? 'Clic para omitir del mapeo' : 'Clic para incluir en el mapeo'}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-[#0b1c30]">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-[10px] font-bold text-[#b91c1c] bg-[#fee2e2] px-1.5 py-0.2 rounded">
                            Clave
                          </span>
                        )}
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded border ${catInfo.color}`}>
                          {catInfo.label}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748b] mt-0.5">
                        Texto original en la cotización: <span className="font-semibold text-[#334155]">"{field.originalName}"</span>
                      </div>
                    </div>
                  </div>

                  {/* Badges: Confidence & View in doc */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-bold text-[#059669] bg-[#ecfdf5] px-2 py-0.5 rounded border border-[#a7f3d0]">
                      {field.confidence}% OCR
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectField(field.id);
                      }}
                      className="p-1 text-[#64748b] hover:text-[#2563eb] rounded hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                      title="Ver ubicación exacta en la cotización"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body: Value and Target Column */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  {/* Extracted Value (Editable) */}
                  <div className="md:col-span-7">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#64748b] mb-1">
                      Valor Extraído por OCR (Editable):
                    </label>
                    <input
                      type="text"
                      value={field.value}
                      disabled={!isSelected}
                      onChange={(e) => handleValueChange(field.id, e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors ${
                        isSelected
                          ? 'bg-white border-[#cbd5e1] text-[#0b1c30] focus:ring-1 focus:ring-[#001026] focus:border-[#001026]'
                          : 'bg-[#f1f5f9] border-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
                      }`}
                    />
                  </div>

                  {/* Arrow separator */}
                  <div className="hidden md:flex md:col-span-1 justify-center text-[#94a3b8] pt-4">
                    <ArrowRight className="w-4 h-4" />
                  </div>

                  {/* Destination Database Column */}
                  <div className="md:col-span-4">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#64748b] mb-1 flex items-center gap-1">
                      <Database className="w-3 h-3 text-[#2563eb]" />
                      <span>Columna Destino:</span>
                    </label>
                    <select
                      value={field.targetColumn}
                      disabled={!isSelected}
                      onChange={(e) => handleTargetColumnChange(field.id, e.target.value)}
                      className={`w-full px-2.5 py-1.5 text-xs rounded border transition-colors ${
                        isSelected
                          ? 'bg-white border-[#cbd5e1] text-[#0b1c30] focus:ring-1 focus:ring-[#001026]'
                          : 'bg-[#f1f5f9] border-[#e2e8f0] text-[#94a3b8] cursor-not-allowed'
                      }`}
                    >
                      {databaseColumnsAvailable.map((col) => (
                        <option key={col.value} value={col.value}>
                          {col.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc] flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#64748b]">
          <span className="font-semibold text-[#0b1c30]">{enabledCount} campos listos</span> para ser persistidos en la base de datos Coti-CAFI.
        </div>

        <button
          type="button"
          onClick={onConfirmMapping}
          disabled={enabledCount === 0}
          className={`px-4 py-2.5 rounded-lg text-xs font-bold text-white shadow-sm flex items-center gap-2 transition-colors ${
            enabledCount > 0
              ? 'bg-[#001026] hover:bg-[#134074] cursor-pointer'
              : 'bg-[#94a3b8] cursor-not-allowed opacity-60'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Confirmar e Incorporar ({enabledCount} campos)</span>
        </button>
      </div>
    </div>
  );
};
