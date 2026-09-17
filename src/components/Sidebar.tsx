import React, { useState } from 'react';
import { LayoutDashboard, FileUp, Settings, HelpCircle, X, Check, Mail, Shield, Sliders, Bell, Database, LogOut } from 'lucide-react';
import { Screen } from '../types';

interface SidebarProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  pendingCount?: number;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentScreen, onNavigate, pendingCount = 4, onLogout }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);

  // Settings form state with localStorage persistence
  const [ocrSensitivity, setOcrSensitivity] = useState(() => {
    try {
      const saved = localStorage.getItem('cafi_system_settings');
      if (saved) return JSON.parse(saved).ocrSensitivity || 'alta';
    } catch {}
    return 'alta';
  });
  const [minConfidenceThreshold, setMinConfidenceThreshold] = useState(() => {
    try {
      const saved = localStorage.getItem('cafi_system_settings');
      if (saved) return JSON.parse(saved).minConfidenceThreshold ?? 75;
    } catch {}
    return 75;
  });
  const [autoApproveHighConfidence, setAutoApproveHighConfidence] = useState(() => {
    try {
      const saved = localStorage.getItem('cafi_system_settings');
      if (saved) return JSON.parse(saved).autoApproveHighConfidence ?? true;
    } catch {}
    return true;
  });
  const [notificationEmail, setNotificationEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('cafi_system_settings');
      if (saved) return JSON.parse(saved).notificationEmail || 'tucafi.mkt@gmail.com';
    } catch {}
    return 'tucafi.mkt@gmail.com';
  });
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  // Support form state
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSentToast, setSupportSentToast] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('cafi_system_settings', JSON.stringify({
        ocrSensitivity,
        minConfidenceThreshold,
        autoApproveHighConfidence,
        notificationEmail,
        updatedAt: new Date().toISOString()
      }));
    } catch (err) {
      console.error('Error guardando ajustes:', err);
    }
    setSettingsSavedToast(true);
    setTimeout(() => {
      setSettingsSavedToast(false);
      setShowSettingsModal(false);
    }, 1200);
  };

  const handleSendSupport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportSubject || !supportMessage) return;
    setSupportSentToast(true);
    setTimeout(() => {
      setSupportSentToast(false);
      setSupportSubject('');
      setSupportMessage('');
      setShowSupportModal(false);
    }, 1400);
  };

  return (
    <>
      <aside className="w-64 bg-white border-r border-[#e2e8f0] flex flex-col justify-between shrink-0 select-none">
        {/* Brand Header */}
        <div>
          <div className="p-4 border-b border-[#f1f5f9] flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0b2545] to-[#134074] flex items-center justify-center shadow-sm">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-display font-bold text-base tracking-tight text-[#0b1c30]">
                <span>Coti-CAFI</span>
              </div>
              <div className="text-[10px] tracking-wider uppercase font-semibold text-[#64748b]">
                INTELLIGENCE
              </div>
            </div>
          </div>

          {/* Section: PLATAFORMA */}
          <div className="px-3 pt-5">
            <div className="px-3 pb-2 text-[11px] font-semibold text-[#94a3b8] uppercase tracking-wider">
              Plataforma
            </div>
            <nav className="space-y-1">
              {/* Cargar Cotización */}
              <a
                href="#cargar-cotizacion"
                data-path="cargar-cotizacion"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('ocr-upload');
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  currentScreen === 'ocr-upload'
                    ? 'bg-[#001026] text-white shadow-sm'
                    : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileUp className={`w-4 h-4 ${currentScreen === 'ocr-upload' ? 'text-white' : 'text-[#64748b]'}`} />
                  <span>Cargar cotización</span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    currentScreen === 'ocr-upload'
                      ? 'bg-[#2563eb] text-white'
                      : pendingCount > 0
                        ? 'bg-[#dbeafe] text-[#1d4ed8]'
                        : 'bg-[#f1f5f9] text-[#94a3b8]'
                  }`}
                >
                  {pendingCount}
                </span>
              </a>

              {/* Dashboard */}
              <a
                href="#dashboard"
                data-path="dashboard"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('dashboard');
                }}
                className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-all ${
                  currentScreen === 'dashboard'
                    ? 'bg-[#001026] text-white shadow-sm'
                    : 'text-[#475569] hover:bg-[#f1f5f9] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className={`w-4 h-4 ${currentScreen === 'dashboard' ? 'text-white' : 'text-[#64748b]'}`} />
                  <span>Dashboard</span>
                </div>
              </a>
            </nav>
          </div>
        </div>

        {/* Footer Info */}
        <div className="p-3 border-t border-[#f1f5f9] space-y-2">
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#475569] bg-[#f8fafc] rounded border border-[#e2e8f0]/60">
            <span className="w-2 h-2 rounded-full bg-[#0ea5e9] animate-pulse"></span>
            <span className="font-mono-code text-[11px] font-medium text-[#0f172a]">Motor OCR v2.4</span>
            <span className="ml-auto text-[10px] text-[#059669] font-medium">Activo</span>
          </div>
          <div className="flex items-center justify-between px-2 pt-1 text-xs text-[#64748b]">
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-1.5 hover:text-[#0b1c30] transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-[#f1f5f9]"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Ajustes</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSupportModal(true)}
              className="flex items-center gap-1.5 hover:text-[#0b1c30] transition-colors cursor-pointer py-1 px-1.5 rounded hover:bg-[#f1f5f9]"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Soporte</span>
            </button>
          </div>
          {onLogout && (
            <div className="pt-1 px-1">
              <button
                type="button"
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Modal: Ajustes Coti-CAFI */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#001026] text-white flex items-center justify-center">
                  <Sliders className="w-4 h-4 text-[#38bdf8]" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#0b1c30]">Ajustes del Sistema Coti-CAFI</h3>
                  <p className="text-[11px] text-[#64748b]">Configuración del motor de ingesta y umbrales OCR</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSettingsModal(false)}
                className="p-1 rounded text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#e2e8f0] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">
                  Sensibilidad de Detección OCR
                </label>
                <select
                  value={ocrSensitivity}
                  onChange={(e) => setOcrSensitivity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded text-xs text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#001026]"
                >
                  <option value="ultra">Ultra Alta (Segmentación sub-pixel y reconocimiento de ruido)</option>
                  <option value="alta">Alta (Recomendada para PDFs escaneados y fotos de cámara)</option>
                  <option value="estandar">Estándar (Mayor velocidad de procesamiento)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-[#0b1c30]">
                    Umbral Mínimo de Confianza para Auto-Aprobación
                  </label>
                  <span className="font-mono font-bold text-[#2563eb]">{minConfidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  value={minConfidenceThreshold}
                  onChange={(e) => setMinConfidenceThreshold(Number(e.target.value))}
                  className="w-full accent-[#001026] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#94a3b8] mt-1">
                  <span>50% (Permisivo)</span>
                  <span>75% (Equilibrado)</span>
                  <span>95% (Estricto)</span>
                </div>
              </div>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoApproveHighConfidence}
                    onChange={(e) => setAutoApproveHighConfidence(e.target.checked)}
                    className="rounded border-[#cbd5e1] text-[#001026] focus:ring-[#001026]"
                  />
                  <span className="font-medium text-[#334155]">
                    Aprobar automáticamente documentos con confianza superior al 95%
                  </span>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">
                  Correo Electrónico para Alertas y Reportes Diarios
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#94a3b8] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={notificationEmail}
                    onChange={(e) => setNotificationEmail(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded text-xs text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#001026]"
                  />
                </div>
              </div>

              {settingsSavedToast && (
                <div className="p-2.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded text-xs text-[#065f46] font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  <span>Configuración guardada correctamente en Coti-CAFI.</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSettingsModal(false)}
                  className="px-3 py-2 bg-white border border-[#cbd5e1] text-[#475569] rounded font-semibold hover:bg-[#f8fafc] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#001026] hover:bg-[#134074] text-white rounded font-bold shadow transition-colors"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Soporte Coti-CAFI */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#2563eb] text-white flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#0b1c30]">Mesa de Soporte Coti-CAFI</h3>
                  <p className="text-[11px] text-[#64748b]">Atención técnica especializada para concesionarias y analistas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportModal(false)}
                className="p-1 rounded text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#e2e8f0] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendSupport} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-[#eff6ff] border border-[#bfdbfe] rounded-lg text-[#1e40af] text-[11px] leading-relaxed">
                <strong>Canal directo:</strong> ¿Tienes alguna duda con el escaneo de cotizaciones o calibración de folios? Escríbenos directamente a <span className="font-semibold underline">tucafi.mkt@gmail.com</span> o envía un ticket a través de este formulario.
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">
                  Asunto del Ticket
                </label>
                <input
                  type="text"
                  placeholder="Ej: Inconsistencia al leer membrete de cotización Sprinter..."
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded text-xs text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#001026]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">
                  Descripción o Folio afectado
                </label>
                <textarea
                  rows={4}
                  placeholder="Describe detalladamente el problema o el folio del documento..."
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#cbd5e1] rounded text-xs text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-[#001026]"
                />
              </div>

              {supportSentToast && (
                <div className="p-2.5 bg-[#ecfdf5] border border-[#a7f3d0] rounded text-xs text-[#065f46] font-medium flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#10b981]" />
                  <span>Ticket enviado a soporte técnico de Coti-CAFI. Te responderemos a la brevedad.</span>
                </div>
              )}

              <div className="pt-3 border-t border-[#f1f5f9] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSupportModal(false)}
                  className="px-3 py-2 bg-white border border-[#cbd5e1] text-[#475569] rounded font-semibold hover:bg-[#f8fafc] transition-colors"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded font-bold shadow transition-colors"
                >
                  Enviar Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

