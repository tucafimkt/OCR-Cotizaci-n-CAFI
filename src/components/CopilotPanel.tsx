import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  PanelRightClose, 
  TrendingUp, 
  Lightbulb, 
  FileSpreadsheet, 
  FileText, 
  ThumbsUp, 
  ThumbsDown, 
  Send,
  Wand2,
  BarChart3,
  AlertTriangle,
  X,
  Check,
  Download,
  Users
} from 'lucide-react';
import { CopilotMessage } from '../types';
import { initialCopilotMessages } from '../data/mockData';

interface CopilotPanelProps {
  onClose?: () => void;
}

export const CopilotPanel: React.FC<CopilotPanelProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<CopilotMessage[]>(() => {
    try {
      const saved = localStorage.getItem('cafi_copilot_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return initialCopilotMessages;
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<string, 'up' | 'down'>>({});
  const [showTabularBreakdown, setShowTabularBreakdown] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('cafi_copilot_chat', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: `Tú · ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      text
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      let botResponse: CopilotMessage;
      const lower = text.toLowerCase().trim();

      if (lower.includes('/pronostico') || lower.includes('/pronóstico') || lower.includes('pronóstico') || lower.includes('pronostico') || lower.includes('forecast')) {
        botResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          timestamp: 'Coti-CAFI Copilot · IA Predictiva 2026',
          text: 'Proyección consolidada para el cierre del ejercicio 2026 en Coti-CAFI: Con base en la serie histórica y el comportamiento de solicitudes digitales, se proyecta alcanzar un acumulado de 7,850 cotizaciones aprobadas vía OCR con un índice de dictamen favorable estimado en 71.8%.',
          isForecastCard: true,
          forecastData: {
            periodo: 'Cierre Fiscal 2026',
            confianza: '95%',
            totalEst: '7,850 cotizaciones',
            crecimiento: '+28.4% YoY',
            drivers: 'Seminuevos Certificados, Aveo 2026 y Sprinter',
            recomendacion: 'Optimizar la validación OCR de recibos de nómina y comprobantes digitales para acelerar el dictamen crediticio de las 5 asesoras.'
          }
        };
      } else if (lower.includes('/cotizaciones') || lower.includes('/cotizacion') || lower.includes('cotizaciones') || lower.includes('cotización') || lower.includes('cotizacion')) {
        botResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          timestamp: 'Coti-CAFI Copilot · Compilador 2026',
          text: 'Módulo de Cotizaciones Coti-CAFI 2026:\n\n• Motor Multimodal OCR: Extracción inteligente con 99.2% de confianza media en folios, precios de lista, garantías y subtotales.\n• Segmentos Analizados: Nuevos (ej. Chevrolet Aveo HB LT Plus 2026), Seminuevos multimarca, Sprinter, Chofer App y Camiones pesados.\n• Ingesta Activa: Arrastra cualquier archivo JPEG, PNG o PDF al cotizador para su procesamiento instantáneo y mapeo automático.',
        };
      } else if (lower.includes('/asesores') || lower.includes('asesores') || lower.includes('asesoras') || lower.includes('/asesoras')) {
        botResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          timestamp: 'Coti-CAFI Copilot · Gestión de Asesores',
          text: 'Distribución y Estado del Equipo de Asesoras Digitales:\n\n1. Lourdes Molina — Canal Digital Nuevos (Coordinación principal)\n2. Karina Gutiérrez — Gestión de Financiamiento y Procesamiento OCR\n3. Ángeles Sánchez — Supervisión y Cotizaciones Multimarca\n4. Karely Carpio — Seminuevos Certificados y Atención Personalizada\n5. Eleydi Ruiz — Atención Inmediata y Conversión de Prospectos\n\nBalance Operativo: La carga se encuentra distribuida equitativamente entre las 5 asesoras, manteniendo tiempos de respuesta por debajo de los 4 minutos.',
        };
      } else if (lower.includes('seminuevos')) {
        botResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          timestamp: 'Coti-CAFI Copilot · IA Predictiva 2026',
          text: 'Análisis de Seminuevos 2026: La categoría registra una alta tasa de cierre de 42.1%. El 86% de las solicitudes corresponden a unidades compactas y SUVs con ticket promedio de $295,000 MXN.',
          isForecastCard: true,
          forecastData: {
            periodo: 'Cierre Proyectado 2026',
            confianza: '96%',
            totalEst: '2,950 unidades',
            crecimiento: '+19.5% vs 2025',
            drivers: 'VW Vento, Taos, Jetta y Aveo',
            recomendacion: 'Reforzar inventario de seminuevos certificados en sucursales Norte y Centro para absorber la demanda proyectada.'
          }
        };
      } else {
        botResponse = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          timestamp: 'Coti-CAFI Copilot · IA Operativa 2026',
          text: `He analizado tu consulta sobre "${text}". Puedes utilizar los comandos rápidos del sistema para consultar información clave: /pronósticos (proyección de cierre 2026), /cotizaciones (estado del compilador y categorías) o /asesores (monitoreo de las 5 asesoras digitales).`,
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setIsTyping(false);
    }, 700);
  };

  const handleFeedback = (msgId: string, type: 'up' | 'down') => {
    setFeedbackState(prev => ({ ...prev, [msgId]: type }));
    showToast(type === 'up' ? '¡Gracias por valorar positivamente la respuesta!' : 'Gracias por el reporte. Calibraremos el modelo predictivo.');
  };

  const handleExportPPTX = () => {
    const blob = new Blob(['PK\x03\x04... Presentación Coti-CAFI 2026'], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Coti-CAFI_Pronostico_2026_${new Date().toISOString().slice(0, 10)}.pptx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('¡Presentación PPTX 2026 descargada con éxito!');
  };

  const handleResetChat = () => {
    setMessages(initialCopilotMessages);
    try {
      localStorage.removeItem('cafi_copilot_chat');
    } catch {}
    showToast('Conversación con Coti-CAFI Copilot reiniciada.');
  };

  return (
    <>
      <div className="w-[380px] bg-white border-l border-[#e2e8f0] flex flex-col h-full shrink-0 relative">
        {/* Header */}
        <div className="p-4 border-b border-[#f1f5f9]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0b2545] text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-[#38bdf8]" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                    Coti-CAFI Copilot
                  </h3>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#ecfdf5] text-[#059669]">
                    v4.2 Activo
                  </span>
                </div>
                <p className="text-[11px] text-[#64748b]">
                  Analista de datos y pronósticos de cotizaciones
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[#94a3b8]">
              <button
                type="button"
                onClick={handleResetChat}
                className="p-1 hover:text-[#0b1c30] rounded hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                title="Reiniciar conversación"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 hover:text-[#0b1c30] rounded hover:bg-[#f1f5f9] transition-colors cursor-pointer"
                  title="Minimizar panel"
                >
                  <PanelRightClose className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Consultas Rápidas */}
          <div className="mt-3 pt-3 border-t border-[#f8fafc]">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#64748b] mb-1.5">
              <span>COMANDOS DISPONIBLES</span>
              <span className="text-[10px] text-[#2563eb] font-semibold">
                Copilot IA 2026
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSend('/pronósticos')}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#eff6ff] hover:bg-[#dbeafe] text-[#1d4ed8] font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-[#bfdbfe]"
                title="Ejecutar comando /pronósticos"
              >
                <TrendingUp className="w-3.5 h-3.5 text-[#2563eb]" />
                <span className="font-mono">/pronósticos</span>
              </button>
              <button
                type="button"
                onClick={() => handleSend('/cotizaciones')}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#15803d] font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-[#bbf7d0]"
                title="Ejecutar comando /cotizaciones"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#16a34a]" />
                <span className="font-mono">/cotizaciones</span>
              </button>
              <button
                type="button"
                onClick={() => handleSend('/asesores')}
                className="text-[11px] px-2.5 py-1.5 rounded-lg bg-[#faf5ff] hover:bg-[#f3e8ff] text-[#7e22ce] font-medium flex items-center gap-1.5 transition-colors cursor-pointer border border-[#e9d5ff]"
                title="Ejecutar comando /asesores"
              >
                <Users className="w-3.5 h-3.5 text-[#9333ea]" />
                <span className="font-mono">/asesores</span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-1.5">
              {/* User message */}
              {msg.sender === 'user' && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-[#94a3b8] mb-1">{msg.timestamp}</span>
                  <div className="bg-[#001026] text-white p-3 rounded-xl rounded-tr-none max-w-[90%] leading-relaxed shadow-sm">
                    {msg.text}
                  </div>
                </div>
              )}

              {/* Assistant message */}
              {msg.sender === 'assistant' && (
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 rounded bg-[#0b2545] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles className="w-3 h-3 text-[#38bdf8]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[#334155] leading-relaxed whitespace-pre-line">
                        {msg.text}
                      </p>

                      {/* Predictive Card if present */}
                      {msg.isForecastCard && msg.forecastData && (
                        <div className="mt-3 bg-[#f8fafc] border border-[#e2e8f0] rounded-lg p-3 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0b1c30]">
                              <TrendingUp className="w-3.5 h-3.5 text-[#2563eb]" />
                              <span>Pronóstico {msg.forecastData.periodo}</span>
                            </div>
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-[#ecfdf5] text-[#059669] rounded">
                              Confianza {msg.forecastData.confianza}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between pt-1">
                            <div className="text-xl font-display font-bold text-[#0b1c30]">
                              {msg.forecastData.totalEst} <span className="text-xs font-normal text-[#64748b]">cotizaciones est.</span>
                            </div>
                            <span className="text-xs font-semibold text-[#059669] flex items-center gap-0.5">
                              {msg.forecastData.crecimiento}
                            </span>
                          </div>

                          {/* Progress drivers */}
                          <div>
                            <div className="flex justify-between text-[10px] text-[#64748b] mb-1">
                              <span>Drivers principales (68% volumen)</span>
                              <span className="font-medium text-[#0b1c30]">{msg.forecastData.drivers}</span>
                            </div>
                            <div className="w-full h-1.5 bg-[#e2e8f0] rounded-full overflow-hidden flex">
                              <div className="h-full bg-[#2563eb] w-[45%]"></div>
                              <div className="h-full bg-[#10b981] w-[25%]"></div>
                              <div className="h-full bg-[#6366f1] w-[15%]"></div>
                            </div>
                          </div>

                          {/* Tactical Recommendation Box */}
                          <div className="p-2.5 bg-[#fffbeb] border border-[#fde68a] rounded text-[11px] text-[#92400e] flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-[#d97706] shrink-0 mt-0.5" />
                            <div className="leading-snug">
                              <span className="font-semibold text-[#b45309]">Recomendación táctica: </span>
                              {msg.forecastData.recomendacion}
                            </div>
                          </div>

                          {/* Actions in card */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={handleExportPPTX}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded text-[11px] font-medium text-[#334155] transition-colors cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-[#64748b]" />
                              <span>Exportar a PPTX</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowTabularBreakdown(true)}
                              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] rounded text-[11px] font-medium text-[#334155] transition-colors cursor-pointer"
                            >
                              <FileSpreadsheet className="w-3 h-3 text-[#64748b]" />
                              <span>Ver desglose tabular</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Footer signature & feedback */}
                      <div className="flex items-center justify-between mt-2 pt-1 text-[10px] text-[#94a3b8]">
                        <span>{msg.timestamp}</span>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button" 
                            onClick={() => handleFeedback(msg.id, 'up')}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              feedbackState[msg.id] === 'up' ? 'text-[#059669] bg-[#ecfdf5]' : 'hover:text-[#0b1c30]'
                            }`}
                            title="Respuesta útil"
                          >
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button 
                            type="button" 
                            onClick={() => handleFeedback(msg.id, 'down')}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              feedbackState[msg.id] === 'down' ? 'text-[#dc2626] bg-[#fef2f2]' : 'hover:text-[#0b1c30]'
                            }`}
                            title="Respuesta inexacta"
                          >
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-2 text-xs text-[#64748b]">
              <div className="w-6 h-6 rounded bg-[#0b2545] text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-3 h-3 text-[#38bdf8] animate-spin" />
              </div>
              <span>Coti-CAFI Copilot está analizando los datos 2026...</span>
            </div>
          )}
        </div>

        {/* Input / Command bar */}
        <div className="p-3 border-t border-[#f1f5f9] bg-white">
          <div className="flex items-center justify-between text-[10px] text-[#94a3b8] mb-1.5 px-1">
            <span className="flex items-center gap-1">
              <span>Comandos:</span>
              <button 
                type="button" 
                onClick={() => handleSend('/pronósticos')} 
                className="font-mono text-[#2563eb] hover:underline cursor-pointer font-semibold"
              >
                /pronósticos
              </button>
              <span>·</span>
              <button 
                type="button" 
                onClick={() => handleSend('/cotizaciones')} 
                className="font-mono text-[#16a34a] hover:underline cursor-pointer font-semibold"
              >
                /cotizaciones
              </button>
              <span>·</span>
              <button 
                type="button" 
                onClick={() => handleSend('/asesores')} 
                className="font-mono text-[#9333ea] hover:underline cursor-pointer font-semibold"
              >
                /asesores
              </button>
            </span>
            <span className="flex items-center gap-1 text-[#059669]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]"></span>
              En línea
            </span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe /pronósticos, /cotizaciones o /asesores..."
              className="w-full bg-[#f8fafc] border border-[#cbd5e1] rounded-md pl-3 pr-10 py-2 text-xs text-[#0f172a] placeholder-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-[#0b2545] focus:border-[#0b2545]"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className={`absolute right-1.5 p-1.5 rounded text-white transition-colors cursor-pointer ${
                inputValue.trim() ? 'bg-[#001026] hover:bg-[#134074]' : 'bg-[#cbd5e1] cursor-not-allowed'
              }`}
              aria-label="Enviar mensaje"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="absolute bottom-16 left-4 right-4 bg-[#001026] text-white p-2.5 rounded-lg shadow-lg text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 z-20">
            <Check className="w-4 h-4 text-[#38bdf8] shrink-0" />
            <span className="leading-tight">{toastMessage}</span>
          </div>
        )}
      </div>

      {/* Modal: Tabular Breakdown of Projections */}
      {showTabularBreakdown && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-[#cbd5e1] animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#e2e8f0] flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-[#2563eb] text-white flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-sm text-[#0b1c30]">
                    Desglose Tabular Predictivo Coti-CAFI (Cierre 2026)
                  </h3>
                  <p className="text-[11px] text-[#64748b]">
                    Modelo ARIMA (p=2, d=1, q=1) con intervalo de confianza del 95%
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTabularBreakdown(false)}
                className="p-1 rounded text-[#94a3b8] hover:text-[#0b1c30] hover:bg-[#e2e8f0] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#cbd5e1] bg-[#f8fafc] text-[#475569] text-[11px]">
                    <th className="p-2 font-bold">Mes / Periodo</th>
                    <th className="p-2 font-bold">Seminuevos</th>
                    <th className="p-2 font-bold">Nuevos</th>
                    <th className="p-2 font-bold">Sprinter</th>
                    <th className="p-2 font-bold">Chofer App</th>
                    <th className="p-2 font-bold">Camiones</th>
                    <th className="p-2 font-bold text-right">Total Est.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0] text-[#0f172a]">
                  <tr className="hover:bg-[#f1f5f9]/50">
                    <td className="p-2 font-medium">Septiembre 2026 (Real)</td>
                    <td className="p-2">724</td>
                    <td className="p-2">482</td>
                    <td className="p-2">265</td>
                    <td className="p-2">198</td>
                    <td className="p-2">118</td>
                    <td className="p-2 font-bold text-right">1,787</td>
                  </tr>
                  <tr className="hover:bg-[#eff6ff]/50 bg-[#eff6ff]/20">
                    <td className="p-2 font-semibold text-[#2563eb]">Octubre 2026 (Proy.)</td>
                    <td className="p-2 font-semibold text-[#2563eb]">790</td>
                    <td className="p-2">520</td>
                    <td className="p-2">290</td>
                    <td className="p-2">220</td>
                    <td className="p-2">130</td>
                    <td className="p-2 font-bold text-right text-[#2563eb]">1,950</td>
                  </tr>
                  <tr className="hover:bg-[#eff6ff]/50 bg-[#eff6ff]/20">
                    <td className="p-2 font-semibold text-[#2563eb]">Noviembre 2026 (Proy.)</td>
                    <td className="p-2 font-semibold text-[#2563eb]">840</td>
                    <td className="p-2">560</td>
                    <td className="p-2">320</td>
                    <td className="p-2">250</td>
                    <td className="p-2">140</td>
                    <td className="p-2 font-bold text-right text-[#2563eb]">2,110</td>
                  </tr>
                  <tr className="hover:bg-[#eff6ff]/50 bg-[#eff6ff]/20">
                    <td className="p-2 font-semibold text-[#2563eb]">Diciembre 2026 (Proy.)</td>
                    <td className="p-2 font-semibold text-[#2563eb]">920</td>
                    <td className="p-2">610</td>
                    <td className="p-2">350</td>
                    <td className="p-2">270</td>
                    <td className="p-2">150</td>
                    <td className="p-2 font-bold text-right text-[#2563eb]">2,300</td>
                  </tr>
                  <tr className="bg-[#f8fafc] font-bold border-t-2 border-[#cbd5e1]">
                    <td className="p-2">Total Ejercicio 2026 Consolidado</td>
                    <td className="p-2 text-[#2563eb]">2,950</td>
                    <td className="p-2">1,980</td>
                    <td className="p-2">1,225</td>
                    <td className="p-2">938</td>
                    <td className="p-2">538</td>
                    <td className="p-2 text-right text-[#001026] text-sm font-display font-black">7,850</td>
                  </tr>
                </tbody>
              </table>

              <div className="p-3 bg-[#f8fafc] border border-[#e2e8f0] rounded text-[11px] text-[#64748b] flex items-center justify-between">
                <span>Variables exógenas consideradas: Temporada de aguinaldos, renovación de flota fiscal y disponibilidad de inventario.</span>
              </div>
            </div>

            <div className="p-4 border-t border-[#f1f5f9] flex items-center justify-end gap-2 bg-[#f8fafc]">
              <button
                type="button"
                onClick={handleExportPPTX}
                className="px-3 py-2 bg-white hover:bg-[#f1f5f9] border border-[#cbd5e1] text-[#334155] rounded font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar en PPTX</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTabularBreakdown(false)}
                className="px-4 py-2 bg-[#001026] hover:bg-[#134074] text-white rounded font-bold text-xs transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

