import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  Sparkles, 
  Bell, 
  ChevronDown, 
  Grid, 
  Check, 
  FileSpreadsheet, 
  FileText, 
  Presentation, 
  User, 
  LogOut, 
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Save,
  Building2,
  Mail,
  Phone,
  Shield,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';
import { QuoteRecord, UserProfile } from '../types';


interface HeaderProps {
  currentDateRange?: string;
  onDateRangeChange?: (range: string) => void;
  onExportClick?: () => void;
  quotes?: QuoteRecord[];
  onToggleCopilot?: () => void;
  isCopilotOpen?: boolean;
  onLogout?: () => void;
  userProfile?: UserProfile;
  onUpdateProfile?: (profile: UserProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateRange = 'Septiembre 2026',
  onDateRangeChange,
  onExportClick,
  quotes = [],
  onToggleCopilot,
  isCopilotOpen = true,
  onLogout,
  userProfile: propUserProfile,
  onUpdateProfile
}) => {
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [exportToast, setExportToast] = useState<string | null>(null);

  const DEFAULT_USER_PROFILE: UserProfile = {
    nombre: 'Administrador CAFI',
    cargo: 'Gerente de Operaciones y Analítica',
    correo: 'tucafi.mkt@gmail.com',
    departamento: 'Operaciones y Analítica',
    concesionaria: 'Operaciones y Analítica',
    telefono: '(967) 674 05 39 Ext. 435',
    rol: 'Admin Coti-CAFI',
    avatarUrl: ''
  };

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    if (propUserProfile) return propUserProfile;
    try {
      const saved = localStorage.getItem('cafi_user_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.nombre && (parsed.nombre.includes('Sofía') || parsed.nombre.includes('Sofia'))) {
          return DEFAULT_USER_PROFILE;
        }
        return { ...DEFAULT_USER_PROFILE, ...parsed };
      }
    } catch {
      // fallback
    }
    return DEFAULT_USER_PROFILE;
  });

  useEffect(() => {
    if (propUserProfile) {
      setUserProfile(propUserProfile);
    }
  }, [propUserProfile]);

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempProfile, setTempProfile] = useState<UserProfile>(userProfile);
  const profileAvatarInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    if (!name || !name.trim()) return 'CA';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const handleOpenProfileModal = () => {
    setTempProfile({ ...userProfile });
    setIsEditingProfile(false);
    setShowProfileModal(true);
  };

  const handleSaveProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setUserProfile(tempProfile);
    if (onUpdateProfile) {
      onUpdateProfile(tempProfile);
    } else {
      try {
        localStorage.setItem('cafi_user_profile', JSON.stringify(tempProfile));
        const authSession = localStorage.getItem('cafi_auth_session');
        if (authSession) {
          try {
            const parsed = JSON.parse(authSession);
            if (parsed?.user) {
              parsed.user = { ...parsed.user, ...tempProfile };
              localStorage.setItem('cafi_auth_session', JSON.stringify(parsed));
            }
          } catch {}
        }
      } catch (err) {
        console.error('Error guardando perfil:', err);
      }
    }
    setIsEditingProfile(false);
    setExportToast('¡Perfil y datos guardados con éxito!');
    setTimeout(() => setExportToast(null), 3000);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = event.target?.result as string;
        if (res) {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 320;
            let w = img.width;
            let h = img.height;
            if (w > h) {
              if (w > maxDim) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              }
            } else {
              if (h > maxDim) {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, w, h);
              const optimized = canvas.toDataURL('image/jpeg', 0.88);
              setTempProfile(prev => {
                const updated = { ...prev, avatarUrl: optimized };
                try {
                  localStorage.setItem('cafi_user_profile', JSON.stringify(updated));
                } catch {}
                return updated;
              });
              setUserProfile(prev => {
                const updated = { ...prev, avatarUrl: optimized };
                if (onUpdateProfile) {
                  onUpdateProfile(updated);
                } else {
                  try {
                    localStorage.setItem('cafi_user_profile', JSON.stringify(updated));
                    const authSession = localStorage.getItem('cafi_auth_session');
                    if (authSession) {
                      try {
                        const parsed = JSON.parse(authSession);
                        if (parsed?.user) {
                          parsed.user.avatarUrl = optimized;
                          localStorage.setItem('cafi_auth_session', JSON.stringify(parsed));
                        }
                      } catch {}
                    }
                  } catch {}
                }
                return updated;
              });
              setExportToast('¡Foto de perfil actualizada y guardada!');
              setTimeout(() => setExportToast(null), 2500);
            }
          };
          img.src = res;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const [notifications, setNotifications] = useState([
    {
      id: 'n1',
      title: 'Sistema Coti-CAFI en línea y preparado para ingesta OCR 2026',
      time: 'Hace un momento',
      read: false,
      type: 'success'
    },
    {
      id: 'n2',
      title: '5 Asesoras digitales activas: Lourdes, Karina, Ángeles, Karely y Eleydi',
      time: 'Hace 5 min',
      read: false,
      type: 'info'
    }
  ]);

  const dateOptions = [
    'Hoy',
    'Últimos 7 días',
    'Últimos 30 días',
    'Septiembre 2026',
    'Agosto 2026',
    'Julio 2026',
    'Tercer Trimestre (Q3 2026)',
    'Año Fiscal 2026'
  ];

  const handleSelectDate = (range: string) => {
    if (onDateRangeChange) {
      onDateRangeChange(range);
    }
    setShowDateDropdown(false);
  };

  const handleExportCSV = () => {
    setShowExportDropdown(false);
    // Generate real CSV from quotes data
    const headers = ['ID', 'Folio', 'FechaHora', 'Solicitante', 'Atencion', 'Categoria', 'MontoTotal', 'ConfianzaOCR', 'Archivo'];
    const rows = quotes.map(q => [
      q.id,
      q.folio,
      q.fechaHora,
      `"${q.solicitante.replace(/"/g, '""')}"`,
      `"${q.atencion.replace(/"/g, '""')}"`,
      q.categoria,
      q.montoTotal,
      `${q.confianzaOcr}%`,
      q.archivoNombre
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Coti-CAFI_Reporte_Cotizaciones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportToast('¡Reporte en formato CSV generado y descargado con éxito!');
    setTimeout(() => setExportToast(null), 3000);
  };

  const handleExportPDF = () => {
    setShowExportDropdown(false);
    setExportToast('Generando reporte ejecutivo en PDF para Coti-CAFI...');
    setTimeout(() => {
      window.print();
      setExportToast(null);
    }, 600);
  };

  const handleExportPPTX = () => {
    setShowExportDropdown(false);
    setExportToast('Generando presentación ejecutiva (PPTX) con proyecciones IA...');
    setTimeout(() => {
      // Simulate file download
      const blob = new Blob(['PK\x03\x04... Presentación Coti-CAFI'], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Coti-CAFI_Presentacion_Ejecutiva_${new Date().toISOString().slice(0, 10)}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportToast('¡Presentación PPTX descargada exitosamente!');
      setTimeout(() => setExportToast(null), 2500);
    }, 700);
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <header className="h-16 bg-white border-b border-[#e2e8f0] px-6 flex items-center justify-between shrink-0 relative z-30">
        {/* Breadcrumb & Context */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#f1f5f9] border border-[#e2e8f0] flex items-center justify-center text-[#0b2545]">
            <Grid className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="font-semibold text-[#0b1c30]">Coti-CAFI</span>
            <span className="text-[#94a3b8]">/</span>
            <span className="text-[#475569] font-medium">Gestión de Cotizaciones OCR</span>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Date Filter Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowDateDropdown(!showDateDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded text-xs font-medium text-[#334155] transition-colors cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-[#64748b]" />
              <span>{currentDateRange}</span>
              <ChevronDown className="w-3 h-3 text-[#94a3b8]" />
            </button>

            {showDateDropdown && (
              <div className="absolute right-0 mt-1 w-52 bg-white border border-[#cbd5e1] rounded-lg shadow-lg py-1 z-40 text-xs animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider border-b border-[#f1f5f9]">
                  Seleccionar Periodo
                </div>
                {dateOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectDate(opt)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-[#f1f5f9] transition-colors ${
                      currentDateRange === opt ? 'font-bold text-[#001026] bg-[#f8fafc]' : 'text-[#334155]'
                    }`}
                  >
                    <span>{opt}</span>
                    {currentDateRange === opt && <Check className="w-3.5 h-3.5 text-[#2563eb]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Button Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportDropdown(!showExportDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] rounded text-xs font-medium text-[#334155] transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#64748b]" />
              <span>Exportar</span>
              <ChevronDown className="w-3 h-3 text-[#94a3b8]" />
            </button>

            {showExportDropdown && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-[#cbd5e1] rounded-lg shadow-lg py-1 z-40 text-xs animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider border-b border-[#f1f5f9]">
                  Formatos de Exportación
                </div>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-[#f1f5f9] text-[#0f172a] transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#059669]" />
                  <div>
                    <div className="font-semibold">Descargar CSV / Excel</div>
                    <div className="text-[10px] text-[#64748b]">Todas las cotizaciones filtradas</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-[#f1f5f9] text-[#0f172a] transition-colors border-t border-[#f1f5f9]"
                >
                  <FileText className="w-4 h-4 text-[#dc2626]" />
                  <div>
                    <div className="font-semibold">Informe Ejecutivo (PDF)</div>
                    <div className="text-[10px] text-[#64748b]">Impresión / Documento formal</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={handleExportPPTX}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-2.5 hover:bg-[#f1f5f9] text-[#0f172a] transition-colors border-t border-[#f1f5f9]"
                >
                  <Presentation className="w-4 h-4 text-[#d97706]" />
                  <div>
                    <div className="font-semibold">Presentación Ejecutiva (PPTX)</div>
                    <div className="text-[10px] text-[#64748b]">Slides con proyecciones y KPI</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* AI Copilot Status Badge (Interactive toggle) */}
          <button
            type="button"
            onClick={onToggleCopilot}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer border ${
              isCopilotOpen 
                ? 'bg-[#ecfdf5] border-[#a7f3d0] text-[#047857]' 
                : 'bg-[#f1f5f9] border-[#cbd5e1] text-[#475569] hover:bg-[#e2e8f0]'
            }`}
            title="Haz clic para mostrar u ocultar el panel Copilot IA"
          >
            <span className={`w-2 h-2 rounded-full ${isCopilotOpen ? 'bg-[#10b981] animate-pulse' : 'bg-[#94a3b8]'}`}></span>
            <Sparkles className={`w-3.5 h-3.5 ${isCopilotOpen ? 'text-[#10b981]' : 'text-[#64748b]'}`} />
            <span>{isCopilotOpen ? 'Copilot IA Activo' : 'Copilot Oculto'}</span>
          </button>

          {/* Notification Bell Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-8 h-8 rounded-full hover:bg-[#f1f5f9] flex items-center justify-center text-[#64748b] transition-colors relative cursor-pointer"
              aria-label="Notificaciones"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#dc2626] rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#cbd5e1] rounded-xl shadow-xl py-2 z-40 text-xs animate-in fade-in zoom-in-95">
                <div className="px-4 py-2 flex items-center justify-between border-b border-[#f1f5f9]">
                  <div className="font-display font-bold text-sm text-[#0b1c30]">Notificaciones</div>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllAsRead}
                      className="text-[11px] text-[#2563eb] hover:underline font-semibold"
                    >
                      Marcar leídas
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#f1f5f9]">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 hover:bg-[#f8fafc] transition-colors ${notif.read ? 'opacity-70' : 'bg-[#eff6ff]/30'}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {notif.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />}
                        {notif.type === 'warning' && <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />}
                        {notif.type === 'info' && <Sparkles className="w-4 h-4 text-[#2563eb] shrink-0 mt-0.5" />}
                        <div className="flex-1">
                          <p className="text-xs font-medium text-[#0f172a] leading-snug">{notif.title}</p>
                          <span className="text-[10px] text-[#94a3b8] flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            {notif.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2 border-t border-[#f1f5f9] text-center">
                  <button
                    type="button"
                    onClick={() => setShowNotifications(false)}
                    className="text-[11px] text-[#64748b] hover:text-[#0b1c30] font-medium"
                  >
                    Cerrar notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile (Clickable modal) */}
          <button
            type="button"
            onClick={handleOpenProfileModal}
            className="flex items-center gap-2.5 pl-2 border-l border-[#e2e8f0] cursor-pointer hover:opacity-85 transition-opacity"
            title="Ver y editar perfil de usuario"
          >
            <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-[#cbd5e1] bg-gradient-to-tr from-[#001026] to-[#2563eb] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
              {userProfile.avatarUrl ? (
                <img
                  src={userProfile.avatarUrl}
                  alt={userProfile.nombre}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{getInitials(userProfile.nombre)}</span>
              )}
            </div>
            <div className="text-left hidden sm:block max-w-[135px]">
              <div className="text-xs font-semibold text-[#0b1c30] leading-tight truncate">
                {userProfile.nombre || 'Mi Perfil'}
              </div>
              <div className="text-[10px] text-[#64748b] leading-tight truncate">
                {userProfile.cargo || 'Asignar puesto'}
              </div>
            </div>
          </button>
        </div>
      </header>

      {/* Toast alert */}
      {exportToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#001026] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-[#38bdf8]" />
          <span>{exportToast}</span>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="bg-gradient-to-br from-[#001026] to-[#0b2545] p-6 text-white text-center relative">
              <button
                type="button"
                onClick={() => setShowProfileModal(false)}
                className="absolute top-3 right-3 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
                title="Cerrar"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative inline-block mb-3">
                <div className="w-20 h-20 rounded-full mx-auto overflow-hidden ring-4 ring-white/20 shadow-md bg-gradient-to-tr from-[#001026] to-[#2563eb] text-white flex items-center justify-center text-xl font-bold">
                  {(isEditingProfile ? tempProfile.avatarUrl : userProfile.avatarUrl) ? (
                    <img
                      src={isEditingProfile ? tempProfile.avatarUrl : userProfile.avatarUrl}
                      alt={isEditingProfile ? tempProfile.nombre : userProfile.nombre}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span>{getInitials(isEditingProfile ? tempProfile.nombre : userProfile.nombre)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => profileAvatarInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-md border-2 border-[#001026] transition-transform hover:scale-105 cursor-pointer"
                  title="Subir o cambiar foto de perfil"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <input
                ref={profileAvatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarFileUpload}
              />

              <h3 className="font-display font-bold text-lg text-white">
                {isEditingProfile ? (tempProfile.nombre || 'Nuevo Perfil') : userProfile.nombre}
              </h3>
              <p className="text-xs text-sky-200 mt-0.5">
                {isEditingProfile ? (tempProfile.cargo || 'Puesto / Rol') : userProfile.cargo}
              </p>
              <span className="inline-block mt-2.5 px-3 py-0.5 rounded-full text-[11px] font-bold bg-[#2563eb] text-white shadow-2xs">
                {isEditingProfile ? tempProfile.rol : userProfile.rol}
              </span>
            </div>

            {/* Modal Body */}
            {isEditingProfile ? (
              /* Edit Mode Form */
              <form onSubmit={handleSaveProfile} className="p-5 space-y-3.5 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={tempProfile.nombre}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej. Juan Pérez"
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-sm focus:ring-2 focus:ring-[#2563eb] focus:border-[#2563eb] text-[#0f172a] bg-white outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Puesto / Cargo
                    </label>
                    <input
                      type="text"
                      required
                      value={tempProfile.cargo}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, cargo: e.target.value }))}
                      placeholder="Ej. Gerente de Operaciones"
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs focus:ring-2 focus:ring-[#2563eb] text-[#0f172a] bg-white outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Rol en Coti-CAFI
                    </label>
                    <select
                      value={tempProfile.rol}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, rol: e.target.value }))}
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs focus:ring-2 focus:ring-[#2563eb] text-[#0f172a] bg-white outline-hidden"
                    >
                      <option value="Admin Coti-CAFI">Admin Coti-CAFI</option>
                      <option value="Gerente de Operaciones">Gerente de Operaciones</option>
                      <option value="Supervisor Digital">Supervisor Digital</option>
                      <option value="Asesor Digital">Asesor Digital</option>
                      <option value="Analista de Ventas">Analista de Ventas</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={tempProfile.correo}
                    onChange={(e) => setTempProfile(prev => ({ ...prev, correo: e.target.value }))}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs focus:ring-2 focus:ring-[#2563eb] text-[#0f172a] bg-white outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Departamento
                    </label>
                    <input
                      type="text"
                      value={tempProfile.departamento || tempProfile.concesionaria}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, departamento: e.target.value, concesionaria: e.target.value }))}
                      placeholder="Ej. Operaciones y Analítica"
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs focus:ring-2 focus:ring-[#2563eb] text-[#0f172a] bg-white outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-[#475569] mb-1">
                      Teléfono / Extensión
                    </label>
                    <input
                      type="text"
                      value={tempProfile.telefono}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, telefono: e.target.value }))}
                      placeholder="Ej. (967) 674 05 39"
                      className="w-full px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs focus:ring-2 focus:ring-[#2563eb] text-[#0f172a] bg-white outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-semibold text-[#475569]">
                      URL de Foto de Perfil (Opcional)
                    </label>
                    {tempProfile.avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setTempProfile(prev => ({ ...prev, avatarUrl: '' }))}
                        className="text-[10px] text-red-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Quitar foto</span>
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={tempProfile.avatarUrl || ''}
                      onChange={(e) => setTempProfile(prev => ({ ...prev, avatarUrl: e.target.value }))}
                      placeholder="https://... o sube un archivo con el botón de cámara"
                      className="flex-1 px-3 py-2 border border-[#cbd5e1] rounded-lg text-xs focus:ring-2 focus:ring-[#2563eb] text-[#0f172a] bg-white outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => profileAvatarInputRef.current?.click()}
                      className="px-2.5 py-2 border border-[#cbd5e1] hover:bg-[#f1f5f9] rounded-lg text-xs font-semibold text-[#475569] flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Subir</span>
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f1f5f9] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTempProfile({ ...userProfile });
                      setIsEditingProfile(false);
                    }}
                    className="flex-1 py-2 px-3 border border-[#cbd5e1] hover:bg-[#f8fafc] text-[#475569] rounded-lg font-semibold transition-colors cursor-pointer text-xs"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-lg font-semibold transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            ) : (
              /* View Mode */
              <div className="p-5 space-y-3.5 text-xs">
                <div className="divide-y divide-[#f1f5f9]">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#64748b] flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#94a3b8]" />
                      Correo:
                    </span>
                    <span className="font-semibold text-[#0b1c30]">{userProfile.correo}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#64748b] flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-[#94a3b8]" />
                      Departamento:
                    </span>
                    <span className="font-semibold text-[#0b1c30]">{userProfile.departamento || userProfile.concesionaria}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#64748b] flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#94a3b8]" />
                      Teléfono:
                    </span>
                    <span className="font-semibold text-[#0b1c30]">{userProfile.telefono}</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#64748b] flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-[#94a3b8]" />
                      Nivel de Permisos:
                    </span>
                    <span className="font-semibold text-[#059669]">Nivel 3 (Acceso Total OCR)</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-[#64748b] flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#94a3b8]" />
                      Último acceso:
                    </span>
                    <span className="font-medium text-[#0b1c30]">Hoy a las 16:40</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#f1f5f9] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTempProfile({ ...userProfile });
                      setIsEditingProfile(true);
                    }}
                    className="flex-1 py-2 px-3 bg-[#001026] hover:bg-[#134074] text-white rounded-lg font-semibold transition-colors cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Editar Perfil</span>
                  </button>
                  {onLogout && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileModal(false);
                        onLogout();
                      }}
                      className="py-2 px-3 border border-red-200 hover:bg-red-50 text-red-600 rounded-lg font-semibold transition-colors cursor-pointer text-xs flex items-center gap-1"
                      title="Cerrar sesión y salir al módulo de autenticación"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Salir</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="py-2 px-3 border border-[#cbd5e1] hover:bg-[#f1f5f9] text-[#475569] rounded-lg font-semibold transition-colors cursor-pointer text-xs"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};


