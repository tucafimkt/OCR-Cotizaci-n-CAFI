import React from 'react';
import { MappableField } from '../types';

interface CafiQuoteDocumentProps {
  fields: MappableField[];
  activeFieldId?: string;
  onFieldClick?: (fieldId: string) => void;
  showBoundingBoxes?: boolean;
  uploadedImageUrl?: string;
  viewMode?: 'cafi_template' | 'scanned_image';
  isScanning?: boolean;
  scanProgress?: number;
}

export const CafiQuoteDocument: React.FC<CafiQuoteDocumentProps> = ({
  fields,
  activeFieldId,
  onFieldClick,
  showBoundingBoxes = true,
  uploadedImageUrl,
  viewMode = 'cafi_template',
  isScanning = false,
  scanProgress = 100
}) => {
  const getField = (id: string) => fields.find(f => f.id === id);

  // Dynamic extracted values
  const fechaEmision = getField('fecha_emision')?.value || '10/09/2026 15:45';
  const vigenciaCotizacion = getField('vigencia_cotizacion')?.value || 'sep-26';
  const asesorLinea = getField('asesor_linea')?.value || 'NUEVOS';
  const atencionAsesora = getField('atencion_asesora')?.value || 'Lourdes Molina (LULÚ)';
  const emailContacto = getField('email_contacto')?.value || 'coordinador.digital@tucafi.com • Tel. (967) 674 05 39 Ext.435';
  
  const tipoUnidad = getField('tipo_unidad')?.value || 'CT CHEVROLET AVEO HB LT PLUS C';
  const modeloAnio = getField('modelo_anio')?.value || '2026';
  const precioStr = getField('precio_lista')?.value || '$378,900';
  const accesorios = getField('accesorios')?.value || '(Ninguno especificado)';
  const montoSeguroStr = getField('monto_seguro')?.value || '$21,000.00';
  const tipoSeguro = getField('tipo_seguro')?.value || 'AMPLIA QUALITAS';
  const usoUnidad = getField('uso_unidad')?.value || 'PARTICULAR';
  const tipoCliente = getField('tipo_cliente')?.value || 'FÍSICA';
  const estadoCp = getField('estado_cp')?.value || 'VERACRUZ (C.P. 95400)';
  const aperturaCredito = getField('apertura_credito')?.value || '$0.00';
  const planFinanciero = getField('plan_financiero')?.value || 'Plan Tradicional';
  const bonificacionPago = getField('bonificacion_pago')?.value || 'NOTA: Al pagar puntualmente su mensualidad, se le bonifica $100.00 en su pago';

  // Dynamic price parsing & financial calculation
  const precioNum = parseFloat(precioStr.replace(/[^0-9.]/g, '')) || 378900;
  const seguroNum = parseFloat(montoSeguroStr.replace(/[^0-9.]/g, '')) || 21000;
  const engancheNum = Math.round(precioNum * 0.25);
  const engancheFmt = `$${engancheNum.toLocaleString('en-US')}`;

  const saldo = Math.max(0, precioNum - engancheNum);
  const pay72Fin = Math.round((saldo + seguroNum * 1.55) / 72 * 1.84);
  const pay72Cont = Math.round(saldo / 72 * 1.84);

  const pay60Fin = Math.round((saldo + seguroNum * 1.45) / 60 * 1.76);
  const pay60Cont = Math.round(saldo / 60 * 1.76);

  const pay48Fin = Math.round((saldo + seguroNum * 1.35) / 48 * 1.66);
  const pay48Cont = Math.round(saldo / 48 * 1.66);

  const pay36Fin = Math.round((saldo + seguroNum * 1.25) / 36 * 1.54);
  const pay36Cont = Math.round(saldo / 36 * 1.54);

  const pay24Fin = Math.round((saldo + seguroNum * 1.15) / 24 * 1.40);
  const pay24Cont = Math.round(saldo / 24 * 1.40);

  // Extract signature display
  let signatureName = atencionAsesora;
  const matchNick = atencionAsesora.match(/\(([^)]+)\)/);
  if (matchNick && matchNick[1]) {
    signatureName = matchNick[1];
  } else {
    signatureName = atencionAsesora.split(' ')[0] || 'LULÚ';
  }

  const renderBoundingWrapper = (
    fieldId: string,
    children: React.ReactNode,
    extraClass = ''
  ) => {
    const field = getField(fieldId);
    if (!field) return <>{children}</>;

    const isEnabled = field.enabled;
    const isActive = activeFieldId === fieldId;

    if (!showBoundingBoxes) {
      return (
        <div
          onClick={() => onFieldClick?.(fieldId)}
          className={`cursor-pointer transition-colors ${extraClass} ${isActive ? 'bg-blue-50/80 ring-2 ring-blue-500 rounded px-1' : ''}`}
        >
          {children}
        </div>
      );
    }

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          onFieldClick?.(fieldId);
        }}
        title={`${field.label} • ${field.confidence}% Confianza • ${isEnabled ? 'Mapeado a: ' + field.targetColumn : 'No mapeado (clic para activar)'}`}
        className={`relative group cursor-pointer transition-all duration-150 rounded ${extraClass} ${
          isActive
            ? 'ring-2 ring-blue-600 bg-blue-50/90 shadow-sm z-20'
            : isEnabled
            ? 'hover:ring-1 hover:ring-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/70 border border-emerald-400/70'
            : 'hover:ring-1 hover:ring-slate-400 border border-dashed border-slate-300 opacity-80 hover:opacity-100'
        }`}
      >
        {children}

        {/* OCR Confidence & Target Tag */}
        {isEnabled && (
          <span className={`absolute -top-3.5 right-1 text-[8px] font-mono font-bold px-1 py-0.2 rounded shadow-2xs pointer-events-none transition-opacity uppercase z-10 ${
            isActive
              ? 'bg-blue-600 text-white opacity-100'
              : 'bg-emerald-700 text-white opacity-0 group-hover:opacity-100'
          }`}>
            {field.confidence}% • {field.targetColumn}
          </span>
        )}

        {!isEnabled && (
          <span className="absolute -top-3.5 right-1 text-[8px] font-mono font-medium px-1 py-0.2 rounded shadow-2xs pointer-events-none bg-slate-500 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
            Inactivo
          </span>
        )}
      </div>
    );
  };

  // If user selected scanned image view mode and uploaded an image
  if (viewMode === 'scanned_image' && uploadedImageUrl) {
    return (
      <div className="w-full max-w-[840px] bg-white border border-[#cbd5e1] shadow-xl rounded-sm p-4 relative overflow-hidden flex flex-col items-center">
        {isScanning && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-30 flex flex-col items-center justify-center text-white">
            <div className="w-48 h-1.5 bg-white/30 rounded-full overflow-hidden mb-3">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            <span className="text-xs font-bold tracking-wide uppercase">Escaneando Cotización... {scanProgress}%</span>
            <span className="text-[11px] text-cyan-200 mt-1">Detectando membrete CAFI y extrayendo cuadrícula</span>
          </div>
        )}

        <div className="relative w-full max-h-[800px] overflow-auto flex justify-center bg-slate-100 rounded">
          <img 
            src={uploadedImageUrl} 
            alt="Cotización Escaneada" 
            className="max-w-full h-auto object-contain rounded shadow-sm"
          />

          {/* Interactive overlay points on the scanned image */}
          {showBoundingBoxes && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-[8%] left-[10%] pointer-events-auto">
                {renderBoundingWrapper('tipo_unidad', <span className="px-2 py-1 text-xs bg-emerald-500/20 border border-emerald-500 text-emerald-950 font-bold rounded">{tipoUnidad}</span>)}
              </div>
              <div className="absolute top-[16%] right-[8%] pointer-events-auto">
                {renderBoundingWrapper('precio_lista', <span className="px-2 py-1 text-xs bg-emerald-500/20 border border-emerald-500 text-emerald-950 font-bold rounded">{precioStr}</span>)}
              </div>
              <div className="absolute top-[22%] right-[8%] pointer-events-auto">
                {renderBoundingWrapper('asesor_linea', <span className="px-2 py-1 text-xs bg-yellow-400/80 text-black font-extrabold rounded">{asesorLinea}</span>)}
              </div>
              <div className="absolute bottom-[20%] left-[10%] right-[10%] pointer-events-auto">
                {renderBoundingWrapper('plan_financiero', <span className="px-2 py-1 text-xs bg-blue-500/20 border border-blue-500 text-blue-950 font-bold rounded">Tabla Financiera 72m: ${pay72Fin.toLocaleString('en-US')}</span>)}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[840px] bg-white border border-[#cbd5e1] shadow-xl rounded-sm p-7 text-[#000000] font-sans text-xs select-none relative overflow-hidden">
      {/* Laser Scanning Animation Overlay */}
      {isScanning && (
        <div className="absolute inset-0 bg-blue-950/20 backdrop-blur-[1px] pointer-events-none z-30 flex flex-col justify-between">
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#06b6d4] animate-pulse" />
          <div className="bg-[#001026]/90 text-white mx-auto my-auto px-5 py-3 rounded-xl border border-cyan-400/60 shadow-2xl flex flex-col items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="text-xs font-bold tracking-wide">EXTRACCIÓN ÓPTICA OCR EN CURSO</span>
            </div>
            <div className="w-44 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${scanProgress}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-cyan-200">
              {scanProgress < 40 ? 'Detectando membrete y folio...' : scanProgress < 80 ? 'Extrayendo tabla de amortización...' : 'Completando mapeo multirred...'}
            </span>
          </div>
          <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#06b6d4] animate-pulse" />
        </div>
      )}

      {/* Registration Marks / Escáner Fiducials */}
      <div className="absolute top-2 left-2 text-[#94a3b8] font-mono text-[9px] pointer-events-none">⌜ CAFI-SCAN-1</div>
      <div className="absolute top-2 right-2 text-[#94a3b8] font-mono text-[9px] pointer-events-none">⌝</div>
      <div className="absolute bottom-2 left-2 text-[#94a3b8] font-mono text-[9px] pointer-events-none">⌞</div>
      <div className="absolute bottom-2 right-2 text-[#94a3b8] font-mono text-[9px] pointer-events-none">⌟ REF: COTI-CAFI-2026</div>

      {/* TOP HEADER SECTION */}
      <div className="flex items-start justify-between pb-3">
        {/* Logo and Contact info */}
        <div>
          <div className="flex items-center gap-2">
            {/* CAFI Hexagonal Brand Icon */}
            <svg className="w-10 h-10 shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polygon points="50,8 70,22 58,36 38,22" fill="#E85D04" />
              <polygon points="76,26 92,48 76,58 64,40" fill="#DC2F02" />
              <polygon points="76,64 68,88 50,78 54,58" fill="#4361EE" />
              <polygon points="46,80 26,88 22,66 38,62" fill="#3A0CA3" />
              <polygon points="18,60 8,38 24,30 32,48" fill="#1F2937" />
              <polygon points="26,24 46,14 42,34 26,38" fill="#F77F00" />
            </svg>
            <div>
              <div className="font-extrabold text-2xl tracking-tighter leading-none text-black font-sans">
                cafi
              </div>
              <div className="text-[8.5px] font-bold tracking-wider text-black uppercase mt-0.5">
                TU CASA FINANCIERA
              </div>
            </div>
          </div>

          {/* Contact subheader */}
          {renderBoundingWrapper(
            'email_contacto',
            <div className="text-[10px] text-black mt-2 font-normal">
              E-mail: <span className="underline">{emailContacto.split('•')[0] || 'coordinador.digital@tucafi.com'}</span> &nbsp;{emailContacto.includes('•') ? emailContacto.split('•')[1] : 'Tel. (967) 674 05 39 Ext.435'}
            </div>,
            'inline-block mt-1'
          )}
        </div>

        {/* Center Document Title */}
        <div className="pt-2 text-center">
          <h1 className="font-sans font-bold text-base tracking-[0.25em] text-black uppercase">
            C O T I Z A C I O N
          </h1>
        </div>

        {/* Right Metadata Block */}
        <div className="text-[11px] space-y-1 text-right min-w-[210px]">
          {renderBoundingWrapper(
            'fecha_emision',
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-black">Fecha:</span>
              <span className="tabular-nums font-medium text-black">{fechaEmision}</span>
            </div>,
            'p-0.5'
          )}

          {renderBoundingWrapper(
            'vigencia_cotizacion',
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-black">Vigencia Cotizacion:</span>
              <span className="font-medium text-black">{vigenciaCotizacion}</span>
            </div>,
            'p-0.5'
          )}

          {renderBoundingWrapper(
            'asesor_linea',
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-black">Asesor:</span>
              <span className="bg-[#FFFF00] text-black font-extrabold px-3 py-0.5 text-xs inline-block tracking-wide shadow-2xs uppercase">
                {asesorLinea}
              </span>
            </div>,
            'p-0.5'
          )}

          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-black">Móvil:</span>
            <span className="text-black font-medium">N/A</span>
          </div>
        </div>
      </div>

      {/* PARAMETERS / ESPECIFICACIONES GRID */}
      <div className="mt-4 space-y-1 text-[11px] max-w-[540px]">
        {renderBoundingWrapper(
          'tipo_unidad',
          <div className="flex items-start">
            <span className="w-36 font-bold text-black shrink-0">Tipo de Unidad:</span>
            <span className="font-bold text-black">{tipoUnidad}</span>
          </div>,
          'p-0.5'
        )}

        {renderBoundingWrapper(
          'modelo_anio',
          <div className="flex items-start">
            <span className="w-36 font-bold text-black shrink-0">Modelo:</span>
            <span className="font-bold text-black tabular-nums">{modeloAnio}</span>
          </div>,
          'p-0.5'
        )}

        {renderBoundingWrapper(
          'precio_lista',
          <div className="flex items-start">
            <span className="w-36 font-bold text-black shrink-0">Precio:</span>
            <span className="font-bold text-black tabular-nums">{precioStr}</span>
          </div>,
          'p-0.5'
        )}

        {renderBoundingWrapper(
          'accesorios',
          <div className="flex items-start">
            <span className="w-36 font-bold text-black shrink-0">Accesorios:</span>
            <span className="text-slate-600 font-normal">{accesorios}</span>
          </div>,
          'p-0.5'
        )}

        {renderBoundingWrapper(
          'monto_seguro',
          <div className="flex items-start">
            <span className="w-36 font-bold text-black shrink-0">Monto de seguro:</span>
            <span className="font-bold text-black tabular-nums">{montoSeguroStr}</span>
          </div>,
          'p-0.5'
        )}

        {renderBoundingWrapper(
          'tipo_seguro',
          <div className="flex items-start">
            <span className="w-36 font-bold text-black shrink-0">Tipo de Seguro:</span>
            <span className="font-bold text-black">{tipoSeguro}</span>
          </div>,
          'p-0.5'
        )}

        {renderBoundingWrapper(
          'uso_unidad',
          <div className="flex items-start">
            <span className="w-36 font-bold text-black shrink-0">Uso:</span>
            <span className="font-bold text-black">{usoUnidad}</span>
          </div>,
          'p-0.5'
        )}

        {renderBoundingWrapper(
          'tipo_cliente',
          <div className="flex items-start">
            <span className="w-36 font-bold text-black shrink-0">Tipo de Cliente:</span>
            <span className="font-bold text-black">{tipoCliente}</span>
          </div>,
          'p-0.5'
        )}

        {renderBoundingWrapper(
          'estado_cp',
          <div className="flex items-start">
            <span className="w-36 font-bold text-black shrink-0">Estado:</span>
            <span className="font-bold text-black">{estadoCp}</span>
          </div>,
          'p-0.5'
        )}

        {renderBoundingWrapper(
          'apertura_credito',
          <div className="flex items-start">
            <span className="w-36 font-bold text-black shrink-0">Apertura de Crédito:</span>
            <span className="font-bold text-black tabular-nums">{aperturaCredito}</span>
          </div>,
          'p-0.5'
        )}
      </div>

      {/* PLAN TRADICIONAL & CD SUBTITLE */}
      <div className="mt-5 flex items-center justify-between text-xs font-bold text-black">
        {renderBoundingWrapper(
          'plan_financiero',
          <span>{planFinanciero}</span>,
          'inline-block px-1'
        )}
        <span>Cd</span>
      </div>

      {/* FINANCIAL TABLE */}
      <div className="mt-1 border border-black overflow-hidden">
        <table className="w-full text-center border-collapse text-[11px]">
          <thead>
            {/* Top Black Header */}
            <tr className="bg-black text-white font-bold leading-tight">
              <th rowSpan={2} className="border-r border-white/60 py-2 px-2 text-center align-middle font-bold">
                Plazo<br />Meses
              </th>
              <th rowSpan={2} className="border-r border-white/60 py-2 px-2 text-center align-middle font-bold">
                {renderBoundingWrapper(
                  'enganche_porcentaje',
                  <span>Enganche</span>,
                  'text-white'
                )}
              </th>
              <th colSpan={3} className="border-r border-white/60 py-1.5 px-2 text-center border-b border-white/60 font-bold">
                Con Seguro Financiado
              </th>
              <th colSpan={2} className="py-1.5 px-2 text-center border-b border-white/60 font-bold">
                Con Seguro de Contado
              </th>
            </tr>
            {/* Sub-header row */}
            <tr className="bg-black text-white font-bold text-[10px] leading-tight">
              <th className="border-r border-white/60 py-1.5 px-1 font-bold">Monto Enganche</th>
              <th className="border-r border-white/60 py-1.5 px-1 font-bold">Pago Mensual</th>
              <th className="border-r border-white/60 py-1.5 px-1 font-bold">Asegurado</th>
              <th className="border-r border-white/60 py-1.5 px-1 font-bold">Monto Enganche</th>
              <th className="py-1.5 px-1 font-bold">Pago Mensual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/30 font-medium">
            {/* Row 1: 72 Meses */}
            <tr className="bg-[#EAEAEA] hover:bg-blue-50 transition-colors">
              <td className="py-1 px-2 font-bold border-r border-black/30">72</td>
              <td className="py-1 px-2 border-r border-black/30">25%</td>
              <td className="py-1 px-2 border-r border-black/30 tabular-nums">{engancheFmt}</td>
              <td className="py-1 px-2 border-r border-black/30 font-bold tabular-nums">
                {renderBoundingWrapper('mensualidad_72', <span>${pay72Fin.toLocaleString('en-US')}</span>, 'inline-block')}
              </td>
              <td className="py-1 px-2 border-r border-black/30">12 Meses</td>
              <td className="py-1 px-2 border-r border-black/30 tabular-nums">{engancheFmt}</td>
              <td className="py-1 px-2 font-bold tabular-nums">${pay72Cont.toLocaleString('en-US')}</td>
            </tr>

            {/* Row 2: 60 Meses */}
            <tr className="bg-white hover:bg-blue-50 transition-colors">
              <td className="py-1 px-2 font-bold border-r border-black/30">60</td>
              <td className="py-1 px-2 border-r border-black/30">25%</td>
              <td className="py-1 px-2 border-r border-black/30 tabular-nums">{engancheFmt}</td>
              <td className="py-1 px-2 border-r border-black/30 font-bold tabular-nums">
                {renderBoundingWrapper('mensualidad_60', <span>${pay60Fin.toLocaleString('en-US')}</span>, 'inline-block')}
              </td>
              <td className="py-1 px-2 border-r border-black/30">12 Meses</td>
              <td className="py-1 px-2 border-r border-black/30 tabular-nums">{engancheFmt}</td>
              <td className="py-1 px-2 font-bold tabular-nums">${pay60Cont.toLocaleString('en-US')}</td>
            </tr>

            {/* Row 3: 48 Meses */}
            <tr className="bg-[#EAEAEA] hover:bg-blue-50 transition-colors">
              <td className="py-1 px-2 font-bold border-r border-black/30">48</td>
              <td className="py-1 px-2 border-r border-black/30">25%</td>
              <td className="py-1 px-2 border-r border-black/30 tabular-nums">{engancheFmt}</td>
              <td className="py-1 px-2 border-r border-black/30 font-bold tabular-nums">
                {renderBoundingWrapper('mensualidad_48', <span>${pay48Fin.toLocaleString('en-US')}</span>, 'inline-block')}
              </td>
              <td className="py-1 px-2 border-r border-black/30">12 Meses</td>
              <td className="py-1 px-2 border-r border-black/30 tabular-nums">{engancheFmt}</td>
              <td className="py-1 px-2 font-bold tabular-nums">${pay48Cont.toLocaleString('en-US')}</td>
            </tr>

            {/* Row 4: 36 Meses */}
            <tr className="bg-white hover:bg-blue-50 transition-colors">
              <td className="py-1 px-2 font-bold border-r border-black/30">36</td>
              <td className="py-1 px-2 border-r border-black/30">25%</td>
              <td className="py-1 px-2 border-r border-black/30 tabular-nums">{engancheFmt}</td>
              <td className="py-1 px-2 border-r border-black/30 font-bold tabular-nums">
                {renderBoundingWrapper('mensualidad_36', <span>${pay36Fin.toLocaleString('en-US')}</span>, 'inline-block')}
              </td>
              <td className="py-1 px-2 border-r border-black/30">12 Meses</td>
              <td className="py-1 px-2 border-r border-black/30 tabular-nums">{engancheFmt}</td>
              <td className="py-1 px-2 font-bold tabular-nums">${pay36Cont.toLocaleString('en-US')}</td>
            </tr>

            {/* Row 5: 24 Meses */}
            <tr className="bg-[#EAEAEA] hover:bg-blue-50 transition-colors">
              <td className="py-1 px-2 font-bold border-r border-black/30">24</td>
              <td className="py-1 px-2 border-r border-black/30">25%</td>
              <td className="py-1 px-2 border-r border-black/30 tabular-nums">{engancheFmt}</td>
              <td className="py-1 px-2 border-r border-black/30 font-bold tabular-nums">
                {renderBoundingWrapper('mensualidad_24', <span>${pay24Fin.toLocaleString('en-US')}</span>, 'inline-block')}
              </td>
              <td className="py-1 px-2 border-r border-black/30">12 Meses</td>
              <td className="py-1 px-2 border-r border-black/30 tabular-nums">{engancheFmt}</td>
              <td className="py-1 px-2 font-bold tabular-nums">${pay24Cont.toLocaleString('en-US')}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* FOOTER NOTE & SIGNATURE */}
      <div className="mt-4 flex items-end justify-between">
        {/* Left Note */}
        {renderBoundingWrapper(
          'bonificacion_pago',
          <div className="font-bold text-[11px] text-black max-w-lg">
            {bonificacionPago}
          </div>,
          'p-0.5'
        )}

        {/* Right Signature Initial */}
        {renderBoundingWrapper(
          'atencion_asesora',
          <div className="text-right">
            <span className="font-extrabold text-sm tracking-wider text-black font-sans uppercase">
              {signatureName}
            </span>
          </div>,
          'p-0.5'
        )}
      </div>
    </div>
  );
};
