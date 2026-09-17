import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  ChevronDown, 
  Download, 
  Search, 
  Filter, 
  Columns3, 
  TrendingUp, 
  CheckCircle2, 
  FileText, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  X,
  Check,
  FileSpreadsheet,
  Users,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Edit3,
  Save
} from 'lucide-react';
import { VehicleCategory, QuoteRecord } from '../types';
import { 
  initialQuotes, 
  topAdvisors, 
  digitalAdvisors, 
  categoryVolumes, 
  monthlyEvolution 
} from '../data/mockData';
import { CopilotPanel } from './CopilotPanel';

interface DashboardScreenProps {
  quotes?: QuoteRecord[];
  onNavigateToUpload?: () => void;
  onDeleteQuote?: (id: string) => void;
  onUpdateQuote?: (updatedQuote: QuoteRecord) => void;
}

export const DIGITAL_ADVISOR_NAMES = [
  'Lourdes Molina',
  'Karina Gutiérrez',
  'Ángeles Sánchez',
  'Karely Carpio',
  'Eleydi Ruiz'
];

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ 
  quotes = [], 
  onNavigateToUpload,
  onDeleteQuote,
  onUpdateQuote
}) => {
  const activeQuotes = quotes;
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory>(() => {
    try {
      const saved = localStorage.getItem('cafi_dashboard_category');
      if (saved) return saved as VehicleCategory;
    } catch {}
    return 'Todas';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    try {
      const saved = localStorage.getItem('cafi_dashboard_rows_per_page');
      if (saved) return Number(saved) || 10;
    } catch {}
    return 10;
  });

  useEffect(() => {
    try {
      localStorage.setItem('cafi_dashboard_category', selectedCategory);
    } catch {}
  }, [selectedCategory]);

  useEffect(() => {
    try {
      localStorage.setItem('cafi_dashboard_rows_per_page', String(rowsPerPage));
    } catch {}
  }, [rowsPerPage]);
  
  // Dynamic stats calculated from real active quotes
  const advisorsFromQuotes = useMemo(() => {
    const map = new Map<string, number>();
    activeQuotes.forEach(q => {
      const name = q.solicitante?.trim();
      if (name) {
        map.set(name, (map.get(name) || 0) + 1);
      }
    });
    const total = activeQuotes.length;
    return Array.from(map.entries())
      .map(([nombre, count], idx) => ({
        id: `adv-${idx + 1}`,
        nombre,
        sucursal: 'Sucursal Coti-CAFI',
        cotizaciones: count,
        porcentaje: total > 0 ? (count / total) * 100 : 0
      }))
      .sort((a, b) => b.cotizaciones - a.cotizaciones);
  }, [activeQuotes]);

  const digitalAdvisorStats = useMemo(() => {
    const total = activeQuotes.length;
    return DIGITAL_ADVISOR_NAMES.map((nombre, idx) => {
      const atenciones = activeQuotes.filter(q => q.atencion?.toLowerCase() === nombre.toLowerCase()).length;
      const porcentaje = total > 0 ? (atenciones / total) * 100 : 0;
      return {
        id: String(idx + 1),
        nombre,
        atenciones,
        porcentaje
      };
    });
  }, [activeQuotes]);

  // Filter dropdown states
  const [selectedPeriod, setSelectedPeriod] = useState('Septiembre 2026');
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false);
  const [selectedAdvisor, setSelectedAdvisor] = useState('Todos los Asesores');
  const [showAdvisorDropdown, setShowAdvisorDropdown] = useState(false);
  const [selectedDigitalAdvisor, setSelectedDigitalAdvisor] = useState('Todas las Asesoras (5)');
  const [showDigitalAdvisorDropdown, setShowDigitalAdvisorDropdown] = useState(false);
  const [showDownloadDropdown, setShowDownloadDropdown] = useState(false);

  // Modals & Panels
  const [showAllAdvisorsModal, setShowAllAdvisorsModal] = useState(false);
  const [advisorSearchQuery, setAdvisorSearchQuery] = useState('');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [showAdvancedFiltersModal, setShowAdvancedFiltersModal] = useState(false);
  const [showColumnsModal, setShowColumnsModal] = useState(false);
  const [selectedQuoteForInspect, setSelectedQuoteForInspect] = useState<QuoteRecord | null>(null);
  const [editingQuote, setEditingQuote] = useState<QuoteRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCopilotVisible, setIsCopilotVisible] = useState(true);

  const handleQuoteFieldChange = (field: keyof QuoteRecord, value: any) => {
    if (!editingQuote) return;
    setEditingQuote(prev => prev ? { ...prev, [field]: value } : null);
  };

  const handleSaveQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;

    if (onUpdateQuote) {
      onUpdateQuote(editingQuote);
    }

    if (selectedQuoteForInspect && selectedQuoteForInspect.id === editingQuote.id) {
      setSelectedQuoteForInspect(editingQuote);
    }

    showToast(`¡Cotización ${editingQuote.folio} guardada con éxito!`);
    setEditingQuote(null);
  };

  // Advanced filter state
  const [minConfidence, setMinConfidence] = useState<number>(0);
  const [priceFilter, setPriceFilter] = useState<'all' | 'under300k' | 'above300k'>('all');

  // Column visibility
  const [visibleColumns, setVisibleColumns] = useState({
    folio: true,
    fechaHora: true,
    solicitante: true,
    atencion: true,
    categoria: true,
    archivo: true
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredAdvisorsModal = useMemo(() => {
    return advisorsFromQuotes.filter(a => 
      a.nombre.toLowerCase().includes(advisorSearchQuery.toLowerCase()) ||
      a.sucursal.toLowerCase().includes(advisorSearchQuery.toLowerCase())
    );
  }, [advisorsFromQuotes, advisorSearchQuery]);

  // Category counts computed dynamically
  const categoryCounts = useMemo(() => {
    const categories: Array<{ name: VehicleCategory; color: string }> = [
      { name: 'Todas', color: '#0b1c30' },
      { name: 'Seminuevos', color: '#2563EB' },
      { name: 'Nuevos', color: '#10B981' },
      { name: 'Sprinter', color: '#6366F1' },
      { name: 'Chofer App', color: '#F59E0B' },
      { name: 'Camiones', color: '#DC2626' },
      { name: 'Otros', color: '#64748B' },
    ];
    return categories.map(cat => ({
      ...cat,
      count: cat.name === 'Todas' ? activeQuotes.length : activeQuotes.filter(q => q.categoria === cat.name).length
    }));
  }, [activeQuotes]);

  // Category volumes for charts
  const dynamicCategoryVolumes = useMemo(() => {
    const cats = [
      { name: 'Seminuevos', color: '#2563EB' },
      { name: 'Nuevos', color: '#10B981' },
      { name: 'Sprinter', color: '#6366F1' },
      { name: 'Chofer App', color: '#F59E0B' },
      { name: 'Camiones', color: '#DC2626' },
      { name: 'Otros', color: '#64748B' },
    ];
    const total = activeQuotes.length;
    return cats.map(c => {
      const count = activeQuotes.filter(q => q.categoria === c.name).length;
      const pct = total > 0 ? `${((count / total) * 100).toFixed(1)}%` : '0%';
      return {
        ...c,
        count,
        pct
      };
    });
  }, [activeQuotes]);

  // Filtered quotes based on category, search, advisor, digital advisor, and advanced criteria
  const filteredQuotes = useMemo(() => {
    return activeQuotes.filter((q) => {
      const matchCat = selectedCategory === 'Todas' || q.categoria === selectedCategory;
      const matchSearch = 
        q.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.solicitante.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.atencion.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchAdvisor = 
        selectedAdvisor === 'Todos los Asesores' ||
        selectedAdvisor.startsWith('Todos los Asesores') ||
        q.solicitante.toLowerCase().includes(selectedAdvisor.toLowerCase().replace(' (solicitante)', ''));

      const matchDigitalAdvisor = 
        selectedDigitalAdvisor === 'Todas las Asesoras (5)' ||
        q.atencion.toLowerCase().includes(selectedDigitalAdvisor.toLowerCase().replace(' (atención)', ''));

      const matchConfidence = q.confianzaOcr >= minConfidence;

      let matchPrice = true;
      if (priceFilter === 'under300k') {
        matchPrice = q.montoTotal < 300000;
      } else if (priceFilter === 'above300k') {
        matchPrice = q.montoTotal >= 300000;
      }

      return matchCat && matchSearch && matchAdvisor && matchDigitalAdvisor && matchConfidence && matchPrice;
    });
  }, [activeQuotes, selectedCategory, searchQuery, selectedAdvisor, selectedDigitalAdvisor, minConfidence, priceFilter]);

  // Top category
  const topCategoryItem = useMemo(() => {
    if (activeQuotes.length === 0) return { name: 'Sin datos', count: 0 };
    const sorted = [...dynamicCategoryVolumes].sort((a, b) => b.count - a.count);
    return sorted[0] && sorted[0].count > 0 ? sorted[0] : { name: 'Sin datos', count: 0 };
  }, [activeQuotes.length, dynamicCategoryVolumes]);

  // Average confidence
  const avgConfidence = useMemo(() => {
    if (activeQuotes.length === 0) return '100%';
    const sum = activeQuotes.reduce((acc, q) => acc + (q.confianzaOcr || 95), 0);
    return (sum / activeQuotes.length).toFixed(1) + '%';
  }, [activeQuotes]);
  // Pagination calculation
  const totalPages = Math.ceil(filteredQuotes.length / rowsPerPage) || 1;
  const paginatedQuotes = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredQuotes.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredQuotes, currentPage, rowsPerPage]);

  const handleDownloadCSV = (reportType: string) => {
    setShowDownloadDropdown(false);
    let filename = '';
    let csvData = '';

    if (reportType === 'general') {
      filename = `Coti-CAFI_Reporte_General_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['Folio', 'Fecha_Hora', 'Solicitante_Asesor', 'Atencion_Digital', 'Categoria_Vehicular', 'Monto_Total_MXN', 'Confianza_OCR'];
      const rows = filteredQuotes.map(q => [
        q.folio,
        q.fechaHora,
        `"${q.solicitante}"`,
        `"${q.atencion}"`,
        q.categoria,
        q.montoTotal,
        `${q.confianzaOcr}%`
      ]);
      csvData = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else if (reportType === 'asesores') {
      filename = `Coti-CAFI_Metricas_Asesores_38_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['Ranking', 'Asesor', 'Sucursal', 'Cotizaciones_Procesadas', 'Participacion_Porcentual'];
      const rows = advisorsFromQuotes.map((a, idx) => [
        idx + 1,
        `"${a.nombre}"`,
        `"${a.sucursal}"`,
        a.cotizaciones,
        `${a.porcentaje}%`
      ]);
      csvData = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    } else {
      filename = `Coti-CAFI_Metricas_Digitales_SLA_${new Date().toISOString().slice(0, 10)}.csv`;
      const headers = ['Asesora_Digital', 'Atenciones_Realizadas', 'Participacion_Pct', 'SLA_Respuesta_Promedio'];
      const rows = digitalAdvisors.map(d => [
        `"${d.nombre}"`,
        d.atenciones,
        `${d.porcentaje}%`,
        '18.2 min'
      ]);
      csvData = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    }

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Archivo "${filename}" descargado con éxito.`);
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Seminuevos':
        return 'bg-[#eff6ff] text-[#1d4ed8] border border-[#bfdbfe]';
      case 'Nuevos':
        return 'bg-[#ecfdf5] text-[#047857] border border-[#a7f3d0]';
      case 'Sprinter':
        return 'bg-[#eef2ff] text-[#4338ca] border border-[#c7d2fe]';
      case 'Chofer App':
        return 'bg-[#fffbeb] text-[#b45309] border border-[#fde68a]';
      case 'Camiones':
        return 'bg-[#fef2f2] text-[#b91c1c] border border-[#fecaca]';
      default:
        return 'bg-[#f8fafc] text-[#475569] border border-[#e2e8f0]';
    }
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#f8f9ff]">
      {/* Scrollable Main Dashboard Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Top Filter Bar */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Periodo Fiscal */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
                  Periodo Fiscal
                </label>
                <button
                  type="button"
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded text-xs font-semibold text-[#0b1c30] transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
                  <span>{selectedPeriod}</span>
                  <ChevronDown className="w-3 h-3 text-[#94a3b8]" />
                </button>

                {showPeriodDropdown && (
                  <div className="absolute left-0 mt-1 w-52 bg-white border border-[#cbd5e1] rounded-lg shadow-lg py-1 z-40 text-xs animate-in fade-in zoom-in-95">
                    {['Septiembre 2026 (Mes en curso)', 'Agosto 2026', 'Julio 2026', 'Tercer Trimestre (Q3-2026)', 'Año Fiscal Completo 2026'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setSelectedPeriod(p);
                          setShowPeriodDropdown(false);
                          showToast(`Periodo actualizado a ${p}`);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#f1f5f9] ${
                          selectedPeriod === p ? 'font-bold text-[#001026] bg-[#f8fafc]' : 'text-[#334155]'
                        }`}
                      >
                        <span>{p}</span>
                        {selectedPeriod === p && <Check className="w-3.5 h-3.5 text-[#2563eb]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Asesor Solicitante */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
                  Asesor (Solicitante)
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdvisorDropdown(!showAdvisorDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded text-xs font-medium text-[#334155] transition-colors cursor-pointer"
                >
                  <span>{selectedAdvisor}</span>
                  <ChevronDown className="w-3 h-3 text-[#94a3b8]" />
                </button>

                {showAdvisorDropdown && (
                  <div className="absolute left-0 mt-1 w-64 bg-white border border-[#cbd5e1] rounded-lg shadow-lg py-1 z-40 text-xs animate-in fade-in zoom-in-95 max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedAdvisor('Todos los Asesores');
                        setShowAdvisorDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 font-semibold hover:bg-[#f1f5f9] border-b border-[#f1f5f9]"
                    >
                      Todos los Asesores ({advisorsFromQuotes.length})
                    </button>
                    {advisorsFromQuotes.length === 0 ? (
                      <div className="p-3 text-center text-xs text-[#64748b]">
                        Sin asesores solicitantes registrados
                      </div>
                    ) : (
                      advisorsFromQuotes.map((adv) => (
                        <button
                          key={adv.id}
                          type="button"
                          onClick={() => {
                            setSelectedAdvisor(adv.nombre);
                            setShowAdvisorDropdown(false);
                            showToast(`Filtrando por asesor: ${adv.nombre}`);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-[#f1f5f9] text-[#334155] flex items-center justify-between"
                        >
                          <span>{adv.nombre}</span>
                          <span className="text-[10px] text-[#64748b]">({adv.cotizaciones})</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Asesora Digital */}
              <div className="relative">
                <label className="block text-[11px] font-semibold text-[#64748b] uppercase tracking-wider mb-1">
                  Asesora Digital (Atención)
                </label>
                <button
                  type="button"
                  onClick={() => setShowDigitalAdvisorDropdown(!showDigitalAdvisorDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded text-xs font-medium text-[#334155] transition-colors cursor-pointer"
                >
                  <span>{selectedDigitalAdvisor}</span>
                  <ChevronDown className="w-3 h-3 text-[#94a3b8]" />
                </button>

                {showDigitalAdvisorDropdown && (
                  <div className="absolute left-0 mt-1 w-64 bg-white border border-[#cbd5e1] rounded-lg shadow-lg py-1 z-40 text-xs animate-in fade-in zoom-in-95">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDigitalAdvisor('Todas las Asesoras (5)');
                        setShowDigitalAdvisorDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 font-semibold hover:bg-[#f1f5f9] border-b border-[#f1f5f9]"
                    >
                      Todas las Asesoras (5)
                    </button>
                    {digitalAdvisorStats.map((adv) => (
                      <button
                        key={adv.id}
                        type="button"
                        onClick={() => {
                          setSelectedDigitalAdvisor(adv.nombre);
                          setShowDigitalAdvisorDropdown(false);
                          showToast(`Filtrando por asesora digital: ${adv.nombre}`);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-[#f1f5f9] text-[#334155] flex items-center justify-between"
                      >
                        <span>{adv.nombre}</span>
                        <span className="text-[10px] text-[#64748b]">({adv.atenciones})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Download Reports Button */}
            <div className="self-end relative">
              <button
                type="button"
                onClick={() => setShowDownloadDropdown(!showDownloadDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-[#001026] hover:bg-[#134074] text-white rounded text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar Reportes</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showDownloadDropdown && (
                <div className="absolute right-0 mt-1 w-64 bg-white border border-[#cbd5e1] rounded-lg shadow-xl py-1 z-40 text-xs animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider border-b border-[#f1f5f9]">
                    Descargas Coti-CAFI
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDownloadCSV('general')}
                    className="w-full text-left px-3 py-2 hover:bg-[#f1f5f9] text-[#0f172a] flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
                    <div>
                      <div className="font-semibold">Detalle de Cotizaciones (.CSV)</div>
                      <div className="text-[10px] text-[#64748b]">Registros filtrados actuales</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadCSV('asesores')}
                    className="w-full text-left px-3 py-2 hover:bg-[#f1f5f9] text-[#0f172a] flex items-center gap-2 border-t border-[#f1f5f9]"
                  >
                    <Users className="w-4 h-4 text-[#2563eb]" />
                    <div>
                      <div className="font-semibold">Métricas de Asesores (38) (.CSV)</div>
                      <div className="text-[10px] text-[#64748b]">Volúmenes y cuotas de participación</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadCSV('digitales')}
                    className="w-full text-left px-3 py-2 hover:bg-[#f1f5f9] text-[#0f172a] flex items-center gap-2 border-t border-[#f1f5f9]"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#7c3aed]" />
                    <div>
                      <div className="font-semibold">Capacidad Digital y SLA (.CSV)</div>
                      <div className="text-[10px] text-[#64748b]">Distribución de carga operativa</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Categorías Pills Strip */}
          <div className="pt-2 border-t border-[#f1f5f9] flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#475569] mr-2">CATEGORÍA:</span>
            {categoryCounts.map((cat) => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat.name);
                    setCurrentPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#001026] text-white shadow-sm'
                      : 'bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: isSelected ? '#ffffff' : cat.color }}
                  ></span>
                  <span>{cat.name}</span>
                  <span className={isSelected ? 'text-white/80' : 'text-[#64748b]'}>
                    ({cat.count.toLocaleString()})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* KPI Cards (5 cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1 */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm flex flex-col justify-between">
            <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
              Total de Cotizaciones
            </div>
            <div className="my-2">
              <div className="text-2xl font-display font-bold text-[#0b1c30]">
                {activeQuotes.length.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-[#059669]">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{activeQuotes.length > 0 ? '+100% activo' : '0 registros'}</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm flex flex-col justify-between">
            <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
              Solicitudes / Asesor
            </div>
            <div className="my-2">
              <div className="text-2xl font-display font-bold text-[#0b1c30]">
                {advisorsFromQuotes.length}{' '}
                <span className="text-xs font-normal text-[#64748b]">Asesores activos</span>
              </div>
            </div>
            <div className="text-xs text-[#64748b]">
              <span className="font-semibold text-[#0b1c30]">
                {advisorsFromQuotes.length > 0 ? (activeQuotes.length / advisorsFromQuotes.length).toFixed(1) : '0'}
              </span>{' '}
              prom/asesor
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm flex flex-col justify-between">
            <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
              Atenciones Digitales
            </div>
            <div className="my-2">
              <div className="text-2xl font-display font-bold text-[#0b1c30]">
                {activeQuotes.length.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-[#64748b]">
              <span className="text-[#059669] font-semibold">5 Asesoras</span>
              <span>100% Asignadas</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm flex flex-col justify-between">
            <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
              Cat. Más Movimiento
            </div>
            <div className="my-2">
              <div className="text-xl font-display font-bold text-[#2563eb]">
                {topCategoryItem.name}
              </div>
            </div>
            <div className="text-xs text-[#64748b]">
              <span className="font-semibold text-[#0b1c30]">{topCategoryItem.count}</span> cotizaciones
            </div>
          </div>

          {/* Card 5 */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-4 shadow-sm flex flex-col justify-between">
            <div className="text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
              Efectividad Ingesta OCR
            </div>
            <div className="my-2">
              <div className="text-2xl font-display font-bold text-[#059669]">
                {avgConfidence}
              </div>
            </div>
            <div className="text-xs text-[#64748b]">
              <span className="font-semibold text-[#0b1c30]">{activeQuotes.length}</span> procesadas
            </div>
          </div>
        </div>

        {/* Analytics Widgets (Solicitudes por Asesor + Atenciones por Asesora Digital) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Solicitudes por Asesor */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                  Solicitudes por Asesor (Solicitante)
                </h3>
                <p className="text-xs text-[#64748b]">
                  Colaboradores por volumen de cotizaciones procesadas
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold px-2 py-0.5 bg-[#eff6ff] text-[#2563eb] rounded">
                  {advisorsFromQuotes.length} Activos
                </span>
                {advisorsFromQuotes.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setShowAllAdvisorsModal(true)}
                    className="text-xs text-[#2563eb] hover:underline font-semibold cursor-pointer"
                  >
                    Ver todos ({advisorsFromQuotes.length})
                  </button>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {advisorsFromQuotes.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#64748b]">
                  <Users className="w-7 h-7 text-[#cbd5e1] mx-auto mb-2" />
                  <p className="font-medium text-[#0b1c30]">No hay asesores solicitantes registrados</p>
                  <p className="text-[11px] text-[#94a3b8] mt-0.5">Se registrarán conforme se procesen cotizaciones en el sistema.</p>
                </div>
              ) : (
                advisorsFromQuotes.slice(0, 6).map((adv, idx) => {
                  const maxCount = advisorsFromQuotes[0]?.cotizaciones || 1;
                  return (
                    <div key={adv.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-[#0b1c30]">
                          <span className="text-[#64748b] mr-1">{idx + 1}.</span> {adv.nombre}
                        </span>
                        <span className="tabular-nums font-semibold text-[#334155]">
                          {adv.cotizaciones} cotiz <span className="text-[#64748b] font-normal">({adv.porcentaje.toFixed(1)}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#001026] rounded-full"
                          style={{ width: `${(adv.cotizaciones / maxCount) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs text-[#64748b]">
              <span>{advisorsFromQuotes.length} colaboradores comerciales</span>
              <button 
                type="button" 
                onClick={() => setShowAuditModal(true)}
                className="text-[#2563eb] hover:underline font-semibold cursor-pointer"
              >
                Auditar bitácora
              </button>
            </div>
          </div>

          {/* Card 2: Atenciones por Asesora Digital */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                  Atenciones por Asesora Digital
                </h3>
                <p className="text-xs text-[#64748b]">
                  Capacidad operativa y balance de carga del equipo digital Coti-CAFI
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 bg-[#eff6ff] text-[#2563eb] rounded">
                5 Asesoras
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {digitalAdvisorStats.map((adv) => {
                const maxAtenciones = Math.max(...digitalAdvisorStats.map(d => d.atenciones), 1);
                const barWidth = activeQuotes.length > 0 ? (adv.atenciones / maxAtenciones) * 100 : 0;
                return (
                  <div key={adv.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#2563eb]"></span>
                        <span className="font-medium text-[#0b1c30]">{adv.nombre}</span>
                      </div>
                      <span className="tabular-nums font-semibold text-[#334155]">
                        {adv.atenciones} atenciones · <span className="text-[#64748b] font-normal">{adv.porcentaje.toFixed(1)}%</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#f1f5f9] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2563eb] rounded-full transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-between text-xs">
              <span className="text-[#64748b]">
                Capacidad digital activa: <strong className="text-[#0b1c30]">5 Asesoras configuradas</strong>
              </span>
              <span className="flex items-center gap-1 text-[#059669] font-medium bg-[#ecfdf5] px-2 py-0.5 rounded">
                <CheckCircle2 className="w-3 h-3" />
                100% En Línea
              </span>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Cotizaciones por Categoría */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                  Cotizaciones por Categoría
                </h3>
                <p className="text-xs text-[#64748b]">
                  Distribución absoluta del volumen vehicular consolidado
                </p>
              </div>
              <span className="text-xs font-semibold text-[#64748b] bg-[#f1f5f9] px-2 py-0.5 rounded">
                N = {activeQuotes.length}
              </span>
            </div>

            {/* Custom Bar Chart */}
            <div className="h-52 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#e2e8f0]">
              {dynamicCategoryVolumes.map((item) => {
                const maxCatCount = Math.max(...dynamicCategoryVolumes.map(c => c.count), 1);
                const heightPercent = activeQuotes.length > 0 && item.count > 0 
                  ? Math.max(14, (item.count / maxCatCount) * 100) 
                  : 4;
                return (
                  <div 
                    key={item.name} 
                    onClick={() => {
                      setSelectedCategory(item.name as VehicleCategory);
                      showToast(`Filtrando por categoría: ${item.name}`);
                    }}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer group"
                  >
                    <span className="text-xs font-bold tabular-nums text-[#0b1c30] group-hover:text-[#2563eb]">
                      {item.count}
                    </span>
                    <div
                      className="w-full max-w-[48px] rounded-t transition-all duration-300 group-hover:scale-105 shadow-sm"
                      style={{
                        height: `${heightPercent}%`,
                        backgroundColor: item.count > 0 ? item.color : '#e2e8f0'
                      }}
                      title={`${item.name}: ${item.count} cotizaciones (${item.pct})`}
                    ></div>
                    <span className="text-[11px] font-medium text-[#475569] truncate w-full text-center group-hover:font-bold">
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[#64748b] pt-1">
              {dynamicCategoryVolumes.map((item) => (
                <button 
                  key={item.name} 
                  type="button"
                  onClick={() => setSelectedCategory(item.name as VehicleCategory)}
                  className="flex items-center gap-1.5 hover:text-[#0b1c30] cursor-pointer"
                >
                  <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name} ({item.pct})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chart 2: Evolución Mensual por Categoría */}
          <div className="bg-white border border-[#e2e8f0] rounded-lg p-5 shadow-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                  Evolución Mensual por Categoría
                </h3>
                <p className="text-xs text-[#64748b]">
                  Histórico Abril — Septiembre 2026 (Segmentado)
                </p>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#eff6ff] text-[#2563eb] rounded flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {activeQuotes.length > 0 ? 'En proceso' : 'Sin datos'}
              </span>
            </div>

            {/* Stacked Bars */}
            <div className="h-52 flex items-end justify-between gap-4 pt-6 pb-2 border-b border-[#e2e8f0]">
              {['Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre'].map((mes) => {
                const totalMonth = mes === 'Septiembre' ? activeQuotes.length : 0;
                return (
                  <div key={mes} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <span className="text-xs font-bold tabular-nums text-[#0b1c30]">
                      {totalMonth}
                    </span>
                    <div className="w-full max-w-[42px] h-[85%] flex flex-col-reverse rounded-t overflow-hidden shadow-sm bg-[#f8fafc]">
                      {totalMonth > 0 ? (
                        <div style={{ height: '100%', backgroundColor: '#2563EB' }} title={`Septiembre: ${totalMonth} cotizaciones`}></div>
                      ) : (
                        <div style={{ height: '4px', backgroundColor: '#e2e8f0' }} title="0 cotizaciones"></div>
                      )}
                    </div>
                    <span className="text-xs font-semibold text-[#475569]">{mes}</span>
                  </div>
                );
              })}
            </div>

            {/* Summary notes */}
            <div className="flex items-center justify-between text-xs text-[#64748b] pt-1">
              <span>Periodo activo: <strong className="text-[#0b1c30]">Septiembre 2026</strong> ({activeQuotes.length} registros)</span>
              <span className="text-[#2563eb] font-medium">{activeQuotes.length > 0 ? 'Procesando en vivo' : 'Listo para ingesta'}</span>
            </div>
          </div>
        </div>

        {/* Detalle Individual de Cotizaciones (Table) */}
        <div className="bg-white border border-[#e2e8f0] rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-[#f1f5f9] flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                Detalle Individual de Cotizaciones Coti-CAFI
              </h3>
              <p className="text-xs text-[#64748b]">
                {filteredQuotes.length} registros encontrados en el periodo actual
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Buscar folio, asesor, asesora..."
                  className="pl-8 pr-3 py-1.5 bg-[#f8fafc] border border-[#cbd5e1] rounded text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#0b2545] w-60"
                />
              </div>

              {/* Filters */}
              <button
                type="button"
                onClick={() => setShowAdvancedFiltersModal(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 border rounded text-xs font-medium transition-colors cursor-pointer ${
                  minConfidence > 0 || priceFilter !== 'all'
                    ? 'bg-[#eff6ff] border-[#2563eb] text-[#2563eb]'
                    : 'bg-white border-[#cbd5e1] text-[#334155] hover:bg-[#f8fafc]'
                }`}
              >
                <Filter className="w-3.5 h-3.5 text-[#64748b]" />
                <span>Filtros {minConfidence > 0 || priceFilter !== 'all' ? '(Activos)' : ''}</span>
              </button>

              {/* Columns */}
              <button
                type="button"
                onClick={() => setShowColumnsModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#cbd5e1] rounded text-xs font-medium text-[#334155] hover:bg-[#f8fafc] transition-colors cursor-pointer"
              >
                <Columns3 className="w-3.5 h-3.5 text-[#64748b]" />
                <span>Columnas</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#e2e8f0] bg-[#f8fafc] text-[11px] font-semibold text-[#64748b] uppercase tracking-wider">
                  {visibleColumns.folio && <th className="py-3 px-4">Folio</th>}
                  {visibleColumns.fechaHora && <th className="py-3 px-4">Fecha / Hora</th>}
                  {visibleColumns.solicitante && <th className="py-3 px-4">Solicitante (Asesor)</th>}
                  {visibleColumns.atencion && <th className="py-3 px-4">Atención (Digital)</th>}
                  {visibleColumns.categoria && <th className="py-3 px-4">Categoría</th>}
                  {visibleColumns.archivo && <th className="py-3 px-4 text-center">Acciones / Archivo</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9] text-xs">
                {paginatedQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-[#64748b]">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <FileText className="w-8 h-8 text-[#94a3b8]" />
                        <span className="font-semibold text-sm text-[#0b1c30]">
                          No hay cotizaciones registradas en Coti-CAFI
                        </span>
                        <span className="text-xs text-[#64748b]">
                          Todos los datos de ejemplo fueron removidos. Puedes iniciar cargando una nueva cotización en el módulo OCR.
                        </span>
                        {onNavigateToUpload && (
                          <button
                            type="button"
                            onClick={onNavigateToUpload}
                            className="mt-2 px-4 py-2 bg-[#001026] text-white rounded text-xs font-semibold hover:bg-[#134074] transition-colors cursor-pointer"
                          >
                            Ir a Cargar Cotización
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedQuotes.map((quote) => (
                    <tr key={quote.id} className="hover:bg-[#f8fafc] transition-colors">
                      {/* Folio */}
                      {visibleColumns.folio && (
                        <td className="py-3 px-4 font-mono-code font-bold text-[#0b1c30]">
                          <button 
                            type="button" 
                            onClick={() => setSelectedQuoteForInspect(quote)}
                            className="hover:text-[#2563eb] hover:underline cursor-pointer"
                          >
                            {quote.folio}
                          </button>
                        </td>
                      )}

                      {/* Fecha / Hora */}
                      {visibleColumns.fechaHora && (
                        <td className="py-3 px-4 text-[#475569] tabular-nums">
                          <div>{quote.fechaHora.split(' ')[0]}</div>
                          <div className="text-[11px] text-[#94a3b8]">{quote.fechaHora.split(' ')[1]}</div>
                        </td>
                      )}

                      {/* Asesor */}
                      {visibleColumns.solicitante && (
                        <td className="py-3 px-4 font-medium text-[#0b1c30]">
                          {quote.solicitante}
                        </td>
                      )}

                      {/* Asesora Digital */}
                      {visibleColumns.atencion && (
                        <td className="py-3 px-4 text-[#334155]">
                          {quote.atencion}
                        </td>
                      )}

                      {/* Categoría */}
                      {visibleColumns.categoria && (
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${getCategoryBadgeClass(quote.categoria)}`}>
                            {quote.categoria}
                          </span>
                        </td>
                      )}

                      {/* Archivo / Acciones */}
                      {visibleColumns.archivo && (
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1 justify-center">
                            <button
                              type="button"
                              onClick={() => setSelectedQuoteForInspect(quote)}
                              className="inline-flex items-center justify-center p-1.5 rounded hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0b1c30] transition-colors cursor-pointer"
                              title={`Inspeccionar expediente de ${quote.folio}`}
                            >
                              <FileText className="w-4 h-4 text-[#dc2626]" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingQuote({ ...quote });
                              }}
                              className="inline-flex items-center justify-center p-1.5 rounded hover:bg-blue-50 text-slate-400 hover:text-[#2563eb] transition-colors cursor-pointer"
                              title={`Editar cotización ${quote.folio}`}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteQuote && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDeleteQuote(quote.id);
                                  showToast(`Cotización ${quote.folio} eliminada.`);
                                }}
                                className="inline-flex items-center justify-center p-1.5 rounded hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                                title={`Eliminar ${quote.folio}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-[#f1f5f9] flex flex-wrap items-center justify-between gap-4 text-xs text-[#64748b]">
            <div className="flex items-center gap-2">
              <span>Filas por página:</span>
              <select 
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#cbd5e1] rounded px-2 py-1 text-xs text-[#334155] focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div>
              Mostrando <strong className="text-[#0b1c30]">{filteredQuotes.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, filteredQuotes.length)}</strong> de <strong className="text-[#0b1c30]">{filteredQuotes.length}</strong> registros
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#0b1c30] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                title="Primera página"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1 rounded hover:bg-[#f1f5f9] text-[#94a3b8] hover:text-[#0b1c30] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                title="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Page buttons */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                const isSelected = pageNum === currentPage;
                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-7 h-7 rounded font-semibold flex items-center justify-center cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#001026] text-white' : 'hover:bg-[#f1f5f9] text-[#475569]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && (
                <>
                  <span className="px-1 text-[#94a3b8]">...</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    className={`w-7 h-7 rounded font-semibold flex items-center justify-center cursor-pointer ${
                      currentPage === totalPages ? 'bg-[#001026] text-white' : 'hover:bg-[#f1f5f9] text-[#475569]'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-[#f1f5f9] text-[#475569] hover:text-[#0b1c30] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                title="Página siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="p-1 rounded hover:bg-[#f1f5f9] text-[#475569] hover:text-[#0b1c30] disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
                title="Última página"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right AI Copilot Panel */}
      {isCopilotVisible ? (
        <CopilotPanel onClose={() => setIsCopilotVisible(false)} />
      ) : (
        <div className="p-3 bg-white border-l border-[#e2e8f0] flex flex-col items-center">
          <button
            type="button"
            onClick={() => setIsCopilotVisible(true)}
            className="p-2 rounded-lg bg-[#001026] text-white hover:bg-[#134074] shadow-md transition-colors"
            title="Abrir Coti-CAFI Copilot"
          >
            <Sparkles className="w-4 h-4 text-[#38bdf8]" />
          </button>
        </div>
      )}

      {/* Floating Global Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#001026] text-white px-4 py-2.5 rounded-lg shadow-2xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <Check className="w-4 h-4 text-[#38bdf8]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modal: All 38 Advisors */}
      {showAllAdvisorsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95 flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#001026] text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                    Directorio Consolidado de Asesores ({advisorsFromQuotes.length}) — Coti-CAFI
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    Ranking de asesores comerciales por volumen de cotizaciones procesadas
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAllAdvisorsModal(false)}
                className="p-1 rounded text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-[#f1f5f9]">
              <div className="relative">
                <Search className="w-4 h-4 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={advisorSearchQuery}
                  onChange={(e) => setAdvisorSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre de asesor o sucursal..."
                  className="w-full pl-9 pr-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded text-xs text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#001026]"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-4 flex-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-[#64748b] text-[11px] uppercase">
                    <th className="py-2 px-3"># Pos</th>
                    <th className="py-2 px-3">Asesor Solicitante</th>
                    <th className="py-2 px-3">Sucursal</th>
                    <th className="py-2 px-3 text-right">Cotizaciones</th>
                    <th className="py-2 px-3 text-right">Participación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredAdvisorsModal.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-xs text-[#64748b]">
                        No hay asesores comerciales registrados actualmente en el sistema.
                      </td>
                    </tr>
                  ) : (
                    filteredAdvisorsModal.map((adv, idx) => (
                      <tr 
                        key={adv.id} 
                        className="hover:bg-[#f8fafc] cursor-pointer"
                        onClick={() => {
                          setSelectedAdvisor(adv.nombre);
                          setShowAllAdvisorsModal(false);
                          showToast(`Filtro aplicado: ${adv.nombre}`);
                        }}
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-[#64748b]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-[#0b1c30]">
                          {adv.nombre}
                        </td>
                        <td className="py-2.5 px-3 text-[#475569]">
                          {adv.sucursal}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-[#0b1c30] tabular-nums">
                          {adv.cotizaciones}
                        </td>
                        <td className="py-2.5 px-3 text-right text-[#2563eb] font-semibold tabular-nums">
                          {adv.porcentaje.toFixed(1)}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-t border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
              <span className="text-xs text-[#64748b]">
                Total de asesores listados: {filteredAdvisorsModal.length}
              </span>
              <button
                type="button"
                onClick={() => handleDownloadCSV('asesores')}
                className="px-3 py-1.5 bg-[#001026] text-white rounded text-xs font-semibold hover:bg-[#134074] transition-colors"
              >
                Exportar Directorio (.CSV)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Audit Log */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#059669]" />
                <div>
                  <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                    Bitácora de Auditoría de Cargas y Asignaciones Coti-CAFI
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    Registro inmutable de transacciones OCR e ingesta vehicular
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="p-1 rounded text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#e2e8f0] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs max-h-96 overflow-y-auto">
              {[
                { time: '14/09/2026 14:28:11', event: 'Validación OCR aprobada', folio: 'COT-2026-8891', user: 'Lourdes Molina', ip: '189.201.42.10', status: 'Verificado' },
                { time: '14/09/2026 14:15:02', event: 'Ingesta de documento OCR', folio: 'COT-2026-8890', user: 'Karina Gutiérrez', ip: '189.201.42.12', status: 'Exitoso' },
                { time: '14/09/2026 13:50:44', event: 'Ajuste manual de campo Folio', folio: 'COT-2026-8887', user: 'Ángeles Sánchez', ip: '187.189.55.8', status: 'Calibrado' },
                { time: '14/09/2026 13:22:19', event: 'Clasificación Seminuevos confirmada', folio: 'COT-2026-8884', user: 'Karely Carpio', ip: '189.201.42.15', status: 'Verificado' },
                { time: '14/09/2026 12:40:05', event: 'Generación de Proyección 2026', folio: 'SYS-ARIMA-26', user: 'Coti-CAFI Copilot AI', ip: 'Interno', status: 'Completado' },
              ].map((log, i) => (
                <div key={i} className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-[#0b1c30]">
                      <span>{log.event}</span>
                      <span className="font-mono text-[10px] text-[#2563eb] bg-[#eff6ff] px-1.5 py-0.5 rounded">
                        {log.folio}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748b] mt-0.5">
                      {log.time} • Operador: {log.user} ({log.ip})
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ecfdf5] text-[#047857]">
                    {log.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-[#f1f5f9] flex justify-end bg-[#f8fafc]">
              <button
                type="button"
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 bg-[#001026] text-white rounded text-xs font-bold hover:bg-[#134074]"
              >
                Cerrar Bitácora
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Advanced Filters */}
      {showAdvancedFiltersModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#2563eb]" />
                <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                  Filtros Avanzados de Cotizaciones
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAdvancedFiltersModal(false)}
                className="p-1 rounded text-[#94a3b8] hover:text-[#0b1c30] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">
                  Nivel Mínimo de Confianza OCR: {minConfidence}%
                </label>
                <input
                  type="range"
                  min={0}
                  max={95}
                  step={5}
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(Number(e.target.value))}
                  className="w-full accent-[#001026]"
                />
                <div className="flex justify-between text-[10px] text-[#64748b]">
                  <span>0% (Todos)</span>
                  <span>75% (Aceptable)</span>
                  <span>95% (Máxima)</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">
                  Rango de Monto Cotizado
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriceFilter('all')}
                    className={`py-1.5 px-2 rounded border text-center font-medium ${
                      priceFilter === 'all' ? 'bg-[#001026] text-white border-[#001026]' : 'bg-[#f8fafc] text-[#334155] border-[#cbd5e1]'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceFilter('under300k')}
                    className={`py-1.5 px-2 rounded border text-center font-medium ${
                      priceFilter === 'under300k' ? 'bg-[#001026] text-white border-[#001026]' : 'bg-[#f8fafc] text-[#334155] border-[#cbd5e1]'
                    }`}
                  >
                    &lt; $300k MXN
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceFilter('above300k')}
                    className={`py-1.5 px-2 rounded border text-center font-medium ${
                      priceFilter === 'above300k' ? 'bg-[#001026] text-white border-[#001026]' : 'bg-[#f8fafc] text-[#334155] border-[#cbd5e1]'
                    }`}
                  >
                    &ge; $300k MXN
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded text-[11px] text-[#64748b]">
                Cotizaciones resultantes con estos filtros: <strong className="text-[#0b1c30]">{filteredQuotes.length}</strong>
              </div>
            </div>

            <div className="p-4 border-t border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
              <button
                type="button"
                onClick={() => {
                  setMinConfidence(0);
                  setPriceFilter('all');
                  showToast('Filtros avanzados restablecidos.');
                }}
                className="text-xs text-[#dc2626] hover:underline font-semibold"
              >
                Limpiar Filtros
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAdvancedFiltersModal(false);
                  showToast('Filtros aplicados correctamente.');
                }}
                className="px-4 py-2 bg-[#001026] text-white rounded text-xs font-bold hover:bg-[#134074]"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Columns Config */}
      {showColumnsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xs w-full overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95">
            <div className="p-3 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <Columns3 className="w-4 h-4 text-[#2563eb]" />
                <h3 className="font-display font-bold text-xs text-[#0b1c30]">
                  Configurar Columnas Visibles
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowColumnsModal(false)}
                className="p-1 rounded text-[#94a3b8] hover:text-[#0b1c30]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 space-y-2.5 text-xs">
              {Object.entries(visibleColumns).map(([colKey, isVis]) => (
                <label key={colKey} className="flex items-center gap-2 cursor-pointer font-medium text-[#334155]">
                  <input
                    type="checkbox"
                    checked={isVis}
                    onChange={(e) => setVisibleColumns(prev => ({ ...prev, [colKey]: e.target.checked }))}
                    className="rounded border-[#cbd5e1] text-[#001026]"
                  />
                  <span className="capitalize">{colKey === 'solicitante' ? 'Solicitante (Asesor)' : colKey === 'atencion' ? 'Atención (Digital)' : colKey}</span>
                </label>
              ))}
            </div>

            <div className="p-3 border-t border-[#f1f5f9] flex justify-end bg-[#f8fafc]">
              <button
                type="button"
                onClick={() => setShowColumnsModal(false)}
                className="px-3 py-1.5 bg-[#001026] text-white rounded text-xs font-bold"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Inspect Quote Voucher */}
      {selectedQuoteForInspect && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#dc2626]" />
                <div>
                  <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                    Expediente Digital Coti-CAFI: {selectedQuoteForInspect.folio}
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    Archivo: {selectedQuoteForInspect.archivoNombre}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuoteForInspect(null)}
                className="p-1 rounded text-[#94a3b8] hover:text-[#0b1c30]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg">
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase">Solicitante:</span>
                  <div className="font-bold text-[#0b1c30]">{selectedQuoteForInspect.solicitante}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase">Atención Digital:</span>
                  <div className="font-bold text-[#0b1c30]">{selectedQuoteForInspect.atencion}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase">Fecha y Hora:</span>
                  <div className="font-medium text-[#0b1c30]">{selectedQuoteForInspect.fechaHora}</div>
                </div>
                <div>
                  <span className="text-[10px] text-[#64748b] uppercase">Confianza OCR:</span>
                  <div className="font-bold text-[#059669]">{selectedQuoteForInspect.confianzaOcr}% (Calibrado)</div>
                </div>
              </div>

              <div className="border border-[#e2e8f0] rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#64748b]">Categoría Vehicular:</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${getCategoryBadgeClass(selectedQuoteForInspect.categoria)}`}>
                    {selectedQuoteForInspect.categoria}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t border-[#f1f5f9] pt-2">
                  <span className="text-[#64748b]">Monto Total Cotizado:</span>
                  <span className="font-display font-black text-sm text-[#001026]">
                    ${selectedQuoteForInspect.montoTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#f1f5f9] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingQuote({ ...selectedQuoteForInspect });
                  }}
                  className="px-3 py-1.5 bg-[#001026] text-white hover:bg-[#134074] rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast(`Descargando comprobante ${selectedQuoteForInspect.folio}...`);
                    setTimeout(() => {
                      const blob = new Blob([`Cotizacion Coti-CAFI\nFolio: ${selectedQuoteForInspect.folio}\nAsesor: ${selectedQuoteForInspect.solicitante}\nTotal: $${selectedQuoteForInspect.montoTotal} MXN`], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `${selectedQuoteForInspect.folio}.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                    }, 400);
                  }}
                  className="px-3 py-1.5 bg-white border border-[#cbd5e1] text-[#334155] rounded text-xs font-semibold hover:bg-[#f1f5f9] flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar Copia</span>
                </button>
                {onDeleteQuote && (
                  <button
                    type="button"
                    onClick={() => {
                      const folio = selectedQuoteForInspect.folio;
                      onDeleteQuote(selectedQuoteForInspect.id);
                      setSelectedQuoteForInspect(null);
                      showToast(`Cotización ${folio} eliminada.`);
                    }}
                    className="px-3 py-1.5 border border-red-200 text-red-600 hover:bg-red-50 rounded text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </button>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedQuoteForInspect(null)}
                className="px-4 py-2 bg-[#f1f5f9] text-[#0b1c30] border border-[#cbd5e1] rounded text-xs font-bold hover:bg-[#e2e8f0] cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Edit Quote */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95 flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#001026] text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-sky-400">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-white">
                    Editar Cotización: {editingQuote.folio}
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Modifica los campos del expediente y guarda los cambios
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingQuote(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuoteSubmit} className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                    Folio de Cotización
                  </label>
                  <input
                    type="text"
                    required
                    value={editingQuote.folio}
                    onChange={(e) => handleQuoteFieldChange('folio', e.target.value)}
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg font-mono font-bold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#2563eb] outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                    Fecha y Hora
                  </label>
                  <input
                    type="text"
                    required
                    value={editingQuote.fechaHora}
                    onChange={(e) => handleQuoteFieldChange('fechaHora', e.target.value)}
                    placeholder="DD/MM/AAAA HH:MM"
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs text-[#0f172a] focus:ring-2 focus:ring-[#2563eb] outline-hidden bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                    Solicitante (Asesor de Ventas)
                  </label>
                  <input
                    type="text"
                    required
                    value={editingQuote.solicitante}
                    onChange={(e) => handleQuoteFieldChange('solicitante', e.target.value)}
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs text-[#0f172a] focus:ring-2 focus:ring-[#2563eb] outline-hidden bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                    Atención (Asesora Digital)
                  </label>
                  <select
                    value={editingQuote.atencion}
                    onChange={(e) => handleQuoteFieldChange('atencion', e.target.value)}
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs text-[#0f172a] focus:ring-2 focus:ring-[#2563eb] outline-hidden bg-white"
                  >
                    {DIGITAL_ADVISOR_NAMES.map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                    Categoría de Flota
                  </label>
                  <select
                    value={editingQuote.categoria}
                    onChange={(e) => handleQuoteFieldChange('categoria', e.target.value as any)}
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs text-[#0f172a] focus:ring-2 focus:ring-[#2563eb] outline-hidden bg-white"
                  >
                    <option value="Nuevos">Nuevos</option>
                    <option value="Seminuevos">Seminuevos</option>
                    <option value="Sprinter">Sprinter</option>
                    <option value="Chofer App">Chofer App</option>
                    <option value="Camiones">Camiones</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                    Monto Total Cotizado (MXN)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingQuote.montoTotal ?? 0}
                    onChange={(e) => handleQuoteFieldChange('montoTotal', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg font-bold text-xs text-[#0f172a] focus:ring-2 focus:ring-[#2563eb] outline-hidden bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                  Nombre del Archivo Digital
                </label>
                <input
                  type="text"
                  value={editingQuote.archivoNombre}
                  onChange={(e) => handleQuoteFieldChange('archivoNombre', e.target.value)}
                  className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs text-[#0f172a] focus:ring-2 focus:ring-[#2563eb] outline-hidden bg-white"
                />
              </div>

              <div className="pt-4 border-t border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc] -mx-5 -mb-5 p-4 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  className="px-4 py-2 border border-[#cbd5e1] hover:bg-white text-[#475569] rounded-lg font-semibold transition-colors cursor-pointer text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#001026] hover:bg-[#134074] text-white rounded-lg font-bold transition-colors cursor-pointer text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5 text-sky-400" />
                  <span>Guardar Cambios de Cotización</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

