import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Key, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  Smartphone, 
  Sparkles,
  Clock,
  RefreshCw,
  X
} from 'lucide-react';
import { RecaptchaWidget } from './RecaptchaWidget';
import { AuthUser } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (user: AuthUser) => void;
  defaultEmail?: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ 
  onLoginSuccess,
  defaultEmail = 'tucafi.mkt@gmail.com'
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login Form State
  const [loginEmail, setLoginEmail] = useState(defaultEmail);
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regRole, setRegRole] = useState('Gerente de Operaciones');
  const [regAgency, setRegAgency] = useState('Operaciones y Analítica');
  const [regCorpKey, setRegCorpKey] = useState('CAFI-2026-SECURE');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Security & Recaptcha State
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Brute Force Lockout System
  const [failedAttempts, setFailedAttempts] = useState<number>(0);
  const [lockoutTime, setLockoutTime] = useState<number>(0);

  // Two-Factor Authentication (2FA) State
  const [step2FA, setStep2FA] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState(['', '', '', '', '', '']);
  const [twoFactorTimer, setTwoFactorTimer] = useState(60);
  const [pendingUser, setPendingUser] = useState<AuthUser | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Password Recovery Modal
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  // Handle brute-force countdown
  useEffect(() => {
    let timer: any;
    if (lockoutTime > 0) {
      timer = setInterval(() => {
        setLockoutTime((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setFormError(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutTime]);

  // Handle 2FA countdown
  useEffect(() => {
    let timer: any;
    if (step2FA && twoFactorTimer > 0) {
      timer = setInterval(() => {
        setTwoFactorTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step2FA, twoFactorTimer]);

  // Evaluate Password Strength
  const evaluatePassword = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    if (checks.length) score += 20;
    if (checks.upper) score += 20;
    if (checks.lower) score += 20;
    if (checks.number) score += 20;
    if (checks.special) score += 20;

    let label = 'Muy Débil';
    let color = 'bg-red-500';
    let textColor = 'text-red-600';

    if (score >= 100) {
      label = 'Excelente / Blindada';
      color = 'bg-emerald-500';
      textColor = 'text-emerald-700';
    } else if (score >= 80) {
      label = 'Fuerte';
      color = 'bg-emerald-500';
      textColor = 'text-emerald-600';
    } else if (score >= 60) {
      label = 'Aceptable';
      color = 'bg-amber-500';
      textColor = 'text-amber-600';
    } else if (score >= 40) {
      label = 'Débil';
      color = 'bg-orange-500';
      textColor = 'text-orange-600';
    }

    return { score, checks, label, color, textColor };
  };

  const passwordEvaluation = evaluatePassword(mode === 'register' ? regPassword : loginPassword);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (lockoutTime > 0) {
      setFormError(`Acceso bloqueado por protección de fuerza bruta. Espera ${lockoutTime} segundos.`);
      return;
    }

    if (!recaptchaToken) {
      setFormError('Por favor verifica el reCAPTCHA ("No soy un robot") para continuar.');
      return;
    }

    if (!loginEmail || !loginPassword) {
      setFormError('Ingresa tu correo y contraseña.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const isDemo = loginEmail.toLowerCase() === defaultEmail.toLowerCase() && loginPassword.length >= 6;
      const isGeneric = loginEmail.includes('@') && loginPassword.length >= 6;

      if (!isDemo && !isGeneric) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        setRecaptchaToken(null);

        if (nextAttempts >= 5) {
          setLockoutTime(30);
          setFormError('Demasiados intentos fallidos. Por seguridad, el sistema se ha bloqueado durante 30 segundos.');
        } else {
          setFormError(`Credenciales incorrectas. Advertencia de seguridad: ${5 - nextAttempts} intentos restantes.`);
        }
        return;
      }

      setFailedAttempts(0);

      const user: AuthUser = {
        id: 'usr_' + Date.now(),
        nombre: loginEmail === defaultEmail ? 'Administrador CAFI' : loginEmail.split('@')[0].toUpperCase(),
        correo: loginEmail,
        cargo: 'Gerente de Operaciones y Analítica',
        concesionaria: 'Grupo Premier Automotriz',
        rol: 'Admin Coti-CAFI',
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setPendingUser(user);
      setStep2FA(true);
      setTwoFactorTimer(60);
    }, 700);
  };

  // Handle Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!recaptchaToken) {
      setFormError('Por favor verifica el reCAPTCHA ("No soy un robot") para verificar tu identidad.');
      return;
    }

    if (passwordEvaluation.score < 80) {
      setFormError('La contraseña no cumple con la política de seguridad mínima requerida (mínimo 8 caracteres, mayúsculas, números y símbolos).');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setFormError('Las contraseñas ingresadas no coinciden.');
      return;
    }

    if (regCorpKey.trim() !== 'CAFI-2026-SECURE') {
      setFormError('La Llave Corporativa de Seguridad es inválida. Consulta con el Administrador de Sistemas CAFI.');
      return;
    }

    if (!acceptTerms) {
      setFormError('Debes aceptar las políticas de confidencialidad de la información corporativa.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      const newUser: AuthUser = {
        id: 'usr_' + Date.now(),
        nombre: regName.trim(),
        correo: regEmail.trim(),
        cargo: regRole,
        departamento: regAgency,
        concesionaria: regAgency,
        rol: 'Admin Coti-CAFI',
        lastLogin: 'Recién registrado'
      };

      setPendingUser(newUser);
      setStep2FA(true);
      setTwoFactorTimer(60);
    }, 800);
  };

  // 2FA Code Input Handler
  const handle2FAChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...twoFactorCode];
    newCode[index] = value.slice(-1);
    setTwoFactorCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handle2FAKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !twoFactorCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    const code = twoFactorCode.join('');
    if (code.length < 6) {
      setFormError('Ingresa el código completo de 6 dígitos.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (pendingUser) {
        try {
          localStorage.setItem('cafi_auth_session', JSON.stringify({
            user: pendingUser,
            token: 'jwt_sec_cafi_' + Date.now(),
            expiresAt: Date.now() + 8 * 3600 * 1000
          }));
          localStorage.setItem('cafi_user_profile', JSON.stringify({
            nombre: pendingUser.nombre,
            cargo: pendingUser.cargo,
            correo: pendingUser.correo,
            departamento: pendingUser.departamento || pendingUser.concesionaria,
            concesionaria: pendingUser.concesionaria || pendingUser.departamento,
            telefono: '(967) 674 05 39 Ext. 435',
            rol: pendingUser.rol
          }));
        } catch (err) {
          console.error(err);
        }

        onLoginSuccess(pendingUser);
      }
    }, 600);
  };

  // Demo Credentials Autofill
  const handleAutofillDemo = () => {
    setMode('login');
    setLoginEmail('tucafi.mkt@gmail.com');
    setLoginPassword('Cafi2026@Seguro!');
    setRecaptchaToken('recaptcha_demo_' + Date.now());
    setFormError(null);
  };

  return (
    <div className="min-h-screen w-full bg-[#f4f6fb] text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-sky-200/30 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
      </div>

      {/* Top Clean Navigation Header */}
      <div className="relative z-10 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#0b2545] flex items-center justify-center shadow-xs">
            <ShieldCheck className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <span className="font-display font-bold text-sm tracking-tight text-[#0b2545]">
              Coti-CAFI <span className="text-blue-600">Intelligence 2026</span>
            </span>
            <span className="hidden md:inline-block ml-2 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Acceso Institucional
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Portal Seguro SSL 256-bit
          </span>
        </div>
      </div>

      {/* Main Single-Column Centered Auth Card (Light Theme) */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-6 sm:p-8">
          
          {/* Header Brand */}
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0b2545] to-[#1e40af] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <ShieldCheck className="w-6 h-6 text-sky-300" />
            </div>
            <h2 className="text-xl font-bold text-[#0b2545] tracking-tight">
              Coti-CAFI Intelligence
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Plataforma Analítica y Cotizador Automotriz 2026
            </p>
          </div>

          {/* 2FA Step View */}
          {step2FA ? (
            <div className="w-full animate-in fade-in zoom-in-95 duration-200">
              <div className="text-center mb-5">
                <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto mb-2.5">
                  <Smartphone className="w-5 h-5 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Verificación en Dos Pasos (2FA)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ingresa el código de seguridad de 6 dígitos enviado a:
                </p>
                <span className="text-xs font-semibold text-blue-600 font-mono">
                  {pendingUser?.correo}
                </span>
              </div>

              {formError && (
                <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleVerify2FA} className="space-y-4">
                {/* 6-Digit PIN input boxes */}
                <div className="flex justify-center gap-2 sm:gap-2.5">
                  {twoFactorCode.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handle2FAChange(idx, e.target.value)}
                      onKeyDown={(e) => handle2FAKeyDown(idx, e)}
                      className="w-10 h-12 sm:w-11 sm:h-12 text-center text-xl font-bold font-mono bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 rounded-lg text-slate-900 outline-none transition-all shadow-inner"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>
                    {twoFactorTimer > 0 ? (
                      <span className="flex items-center gap-1 font-mono text-slate-500">
                        <Clock className="w-3 h-3" />
                        Reenviar en {twoFactorTimer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setTwoFactorTimer(60)}
                        className="text-blue-600 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Reenviar código
                      </button>
                    )}
                  </span>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep2FA(false)}
                    className="py-2.5 px-3.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2.5 px-4 bg-[#0b2545] hover:bg-[#134074] text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-sky-400" />
                        <span>Verificar y Acceder</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Login / Register Standard View */
            <div>
              {/* Segmented Tab Switcher (Light Theme) */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setFormError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-white text-[#0b2545] shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 text-blue-600" />
                  <span>Iniciar Sesión</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setFormError(null);
                  }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-white text-[#0b2545] shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                  <span>Registro Corporativo</span>
                </button>
              </div>

              {/* Lockout Warning Banner */}
              {lockoutTime > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
                  <div>
                    <p className="font-bold">Acceso Bloqueado Temporalmente</p>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Protección contra fuerza bruta activa. Espera: <strong className="font-mono text-amber-950 text-sm">{lockoutTime}s</strong>
                    </p>
                  </div>
                </div>
              )}

              {/* Form Error Banner */}
              {formError && lockoutTime === 0 && (
                <div className="mb-4 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Form: LOGIN MODE */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                      Correo Institucional
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        disabled={lockoutTime > 0}
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="tucafi.mkt@gmail.com"
                        className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[11px] font-semibold text-slate-700">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowRecoveryModal(true)}
                        className="text-[10px] text-blue-600 hover:underline font-medium cursor-pointer"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        required
                        disabled={lockoutTime > 0}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-9 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none disabled:opacity-50 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white"
                      />
                      <span>Mantener sesión segura (8 hrs)</span>
                    </label>
                  </div>

                  {/* Google reCAPTCHA v2 Component */}
                  <div className="pt-1 pb-1">
                    <RecaptchaWidget
                      onVerify={setRecaptchaToken}
                      isVerified={!!recaptchaToken}
                      disabled={lockoutTime > 0}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || lockoutTime > 0}
                    className="w-full py-2.5 px-4 bg-[#0b2545] hover:bg-[#134074] text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4" />
                        <span>Iniciar Sesión Segura</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 text-sky-300" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Form: REGISTER MODE */}
              {mode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nombre Completo
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="Ej. Ing. Roberto Mendoza"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Correo Institucional
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        placeholder="usuario@tucafi.com"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Puesto / Rol
                      </label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:border-blue-600 outline-none"
                      >
                        <option value="Gerente de Operaciones">Gerente de Operaciones</option>
                        <option value="Supervisor Digital">Supervisor Digital</option>
                        <option value="Asesor Digital">Asesor Digital</option>
                        <option value="Analista de Crédito">Analista de Crédito</option>
                        <option value="Admin Coti-CAFI">Admin Coti-CAFI</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Departamento
                      </label>
                      <input
                        type="text"
                        required
                        value={regAgency}
                        onChange={(e) => setRegAgency(e.target.value)}
                        placeholder="Ej. Operaciones y Analítica"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Llave Corporativa
                      </label>
                      <input
                        type="text"
                        required
                        value={regCorpKey}
                        onChange={(e) => setRegCorpKey(e.target.value)}
                        placeholder="CAFI-2026-SECURE"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono text-blue-700 placeholder-slate-400 focus:border-blue-600 outline-none font-semibold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Contraseña Robusta
                    </label>
                    <div className="relative">
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="Mín. 8 caracteres con mayúscula, número y símbolo"
                        className="w-full px-3 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {/* Real-Time Password Strength Meter */}
                    {regPassword.length > 0 && (
                      <div className="mt-2 space-y-1.5 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="text-slate-500">Fortaleza:</span>
                          <span className={`font-bold ${passwordEvaluation.textColor}`}>
                            {passwordEvaluation.label} ({passwordEvaluation.score}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${passwordEvaluation.color} transition-all duration-300`}
                            style={{ width: `${passwordEvaluation.score}%` }}
                          ></div>
                        </div>

                        {/* Check items */}
                        <div className="grid grid-cols-2 gap-1 pt-1 text-[10px]">
                          <span className={`flex items-center gap-1 ${passwordEvaluation.checks.length ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                            <Check className="w-3 h-3" /> Mín. 8 caracteres
                          </span>
                          <span className={`flex items-center gap-1 ${passwordEvaluation.checks.upper ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                            <Check className="w-3 h-3" /> 1 Mayúscula
                          </span>
                          <span className={`flex items-center gap-1 ${passwordEvaluation.checks.number ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                            <Check className="w-3 h-3" /> 1 Número
                          </span>
                          <span className={`flex items-center gap-1 ${passwordEvaluation.checks.special ? 'text-emerald-600 font-medium' : 'text-slate-400'}`}>
                            <Check className="w-3 h-3" /> 1 Símbolo (@, $, !)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Confirmar Contraseña
                    </label>
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      value={regConfirmPassword}
                      onChange={(e) => setRegConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      className={`w-full px-3 py-2 bg-white border rounded-lg text-xs text-slate-900 placeholder-slate-400 outline-none font-mono ${
                        regConfirmPassword && regConfirmPassword !== regPassword 
                          ? 'border-red-400 focus:border-red-500' 
                          : 'border-slate-300 focus:border-blue-600'
                      }`}
                    />
                    {regConfirmPassword && regConfirmPassword !== regPassword && (
                      <span className="text-[10px] text-red-500 mt-1 block">
                        Las contraseñas no coinciden
                      </span>
                    )}
                  </div>

                  {/* Terms Checkbox */}
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600 pt-1">
                    <input
                      type="checkbox"
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 bg-white mt-0.5"
                    />
                    <span className="text-[11px] leading-tight">
                      Acepto las políticas de confidencialidad y términos de uso corporativo Coti-CAFI.
                    </span>
                  </label>

                  {/* Google reCAPTCHA v2 Component */}
                  <div className="pt-1">
                    <RecaptchaWidget
                      onVerify={setRecaptchaToken}
                      isVerified={!!recaptchaToken}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 bg-[#0b2545] hover:bg-[#134074] text-white rounded-lg text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4" />
                        <span>Completar Registro Corporativo</span>
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Clean Footer Notice */}
      <div className="relative z-10 py-3 px-6 text-center text-[11px] text-slate-500 border-t border-slate-200 bg-white/70">
        <span>
          © 2026 Coti-CAFI Intelligence · Acceso corporativo para personal y asesores autorizados.
        </span>
      </div>

      {/* Modal: Recuperar Contraseña (Light Theme) */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 text-slate-800 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              type="button"
              onClick={() => {
                setShowRecoveryModal(false);
                setRecoverySent(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-5">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-2 border border-blue-200">
                <Key className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0b2545]">Recuperación de Contraseña</h3>
              <p className="text-xs text-slate-500 mt-1">
                Ingresa tu correo institucional registrado para recibir un enlace de restablecimiento.
              </p>
            </div>

            {recoverySent ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs text-center space-y-3">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                <p className="font-semibold">Instrucciones enviadas con éxito</p>
                <p className="text-[11px] text-emerald-700">
                  Hemos enviado un token de restablecimiento a <strong className="text-emerald-950 font-mono">{recoveryEmail || defaultEmail}</strong> válido por 15 minutos.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setShowRecoveryModal(false);
                    setRecoverySent(false);
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold text-xs transition-colors cursor-pointer"
                >
                  Regresar al Inicio de Sesión
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!recoveryEmail) return;
                  setRecoverySent(true);
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="tucafi.mkt@gmail.com"
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:border-blue-600 outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRecoveryModal(false)}
                    className="flex-1 py-2 px-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 bg-[#0b2545] hover:bg-[#134074] text-white rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Enviar Enlace</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
